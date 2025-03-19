from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import datetime
import random
import jwt
import os

app = FastAPI()

SECRET_KEY = os.getenv("OPERIA_SECRET", "operia_secret")

users = {"testuser": "password"}  # Utilisateur de test
chat_history = []
responses = [
    "Bonjour ! Comment puis-je vous aider ?",
    "Je suis OperIA, votre assistant IA.",
    "Pouvez-vous préciser votre question ?"
]

class LoginData(BaseModel):
    username: str
    password: str

class ChatMessage(BaseModel):
    user: str
    message: str

@app.post("/login")
def login(data: LoginData):
    if data.username in users and users[data.username] == data.password:
        token = jwt.encode({"sub": data.username, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, SECRET_KEY, algorithm="HS256")
        return {"token": token}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/chat")
def chat(msg: ChatMessage):
    response = random.choice(responses)
    chat_history.append({"user": msg.user, "message": msg.message, "bot_response": response})
    return {"user": msg.user, "message": msg.message, "bot_response": response}

@app.get("/history")
def history():
    return chat_history
