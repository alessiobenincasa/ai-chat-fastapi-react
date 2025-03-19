from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
import os
from dotenv import load_dotenv
import re
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Load environment variables
load_dotenv()

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./chat.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Database Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    messages = relationship("Message", back_populates="user")
    failed_attempts = Column(Integer, default=0)
    last_failed_attempt = Column(DateTime)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="messages")

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    password: str = Field(..., min_length=8)

    @validator('username')
    def username_alphanumeric(cls, v):
        if not re.match(r'^[a-zA-Z0-9_-]{3,50}$', v):
            raise ValueError('Username must be between 3 and 50 characters and contain only letters, numbers, underscores, and hyphens')
        return v

    @validator('password')
    def password_strength(cls, v):
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$', v):
            raise ValueError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character')
        return v

    @validator('email')
    def email_valid(cls, v):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError('Invalid email format')
        
        # Vérifier les domaines autorisés
        allowed_domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
        domain = v.split('@')[1].lower()
        if domain not in allowed_domains:
            raise ValueError(f'Email domain must be one of: {", ".join(allowed_domains)}')
        return v

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    content: str
    timestamp: datetime
    user_id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monter les fichiers statiques du frontend
# app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")

# Helper functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# Endpoints
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Vérifier si le nom d'utilisateur existe déjà
        if db.query(User).filter(User.username == user.username).first():
            raise HTTPException(
                status_code=400,
                detail="Username already registered"
            )
        
        # Vérifier si l'email existe déjà
        if db.query(User).filter(User.email == user.email).first():
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Hasher le mot de passe
        hashed_password = pwd_context.hash(user.password)
        
        # Créer l'utilisateur
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        
        try:
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            # Retourner une réponse de succès
            return UserResponse(
                id=db_user.id,
                username=db_user.username,
                email=db_user.email
            )
            
        except Exception as db_error:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {str(db_error)}"
            )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

# Ajouter un système de limitation des tentatives de connexion
class LoginAttempt:
    def __init__(self):
        self.attempts = {}

login_attempts = LoginAttempt()

@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Vérifier si l'IP est bloquée
    client_ip = "client_ip"  # Dans un vrai système, récupérer l'IP du client
    if client_ip in login_attempts.attempts:
        if login_attempts.attempts[client_ip]["count"] >= 5:
            if datetime.utcnow() < login_attempts.attempts[client_ip]["blocked_until"]:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many failed attempts. Try again later."
                )
            login_attempts.attempts[client_ip]["count"] = 0

    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        # Incrémenter le compteur d'échecs
        if client_ip not in login_attempts.attempts:
            login_attempts.attempts[client_ip] = {"count": 1, "blocked_until": None}
        else:
            login_attempts.attempts[client_ip]["count"] += 1
            if login_attempts.attempts[client_ip]["count"] >= 5:
                login_attempts.attempts[client_ip]["blocked_until"] = datetime.utcnow() + timedelta(minutes=15)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Réinitialiser le compteur d'échecs après une connexion réussie
    if client_ip in login_attempts.attempts:
        login_attempts.attempts[client_ip]["count"] = 0

    # Créer le token avec une durée de validité plus courte
    access_token_expires = timedelta(minutes=15)  # Réduit à 15 minutes
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/chat", response_model=MessageResponse)
async def chat(
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Mock AI response (replace with actual AI integration)
    ai_response = f"AI response to: {message.content}"
    
    # Save user message
    db_message = Message(content=message.content, user_id=current_user.id)
    db.add(db_message)
    
    # Save AI response
    db_ai_message = Message(content=ai_response, user_id=current_user.id)
    db.add(db_ai_message)
    
    db.commit()
    db.refresh(db_message)
    return db_message

@app.get("/messages", response_model=List[MessageResponse])
async def get_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(Message).filter(Message.user_id == current_user.id).all()
    return messages

@app.get("/")
async def root():
    return RedirectResponse(url="/login")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Rediriger vers le serveur de développement Vite pendant le développement
    return RedirectResponse(url="http://localhost:5173") 