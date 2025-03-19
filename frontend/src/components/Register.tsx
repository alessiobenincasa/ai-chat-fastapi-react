import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper,
  Link,
  FormHelperText
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      password: ''
    };
    
    if (username.length < 3 || username.length > 50) {
      errors.username = 'Username must be between 3 and 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const allowedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    if (!emailPattern.test(email)) {
      errors.email = 'Invalid email format';
    } else {
      const domain = email.split('@')[1].toLowerCase();
      if (!allowedDomains.includes(domain)) {
        errors.email = `Email domain must be one of: ${allowedDomains.join(', ')}`;
      }
    }

    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.password = 'Password must contain at least one special character (@$!%*?&)';
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/register', {
        username,
        email,
        password,
      });
      
      alert('Account created successfully! Please login.');
      navigate('/login');
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      
      if (err.response?.status === 422) {
        const validationErrors = err.response.data?.detail;
        if (Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map((error: any) => error.msg).join('\n');
          setError(errorMessages);
        }
      }
    }
  };

  return (
    <Box sx={{ 
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    }}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Account
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!formErrors.username}
              helperText={formErrors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            <FormHelperText>
              Password must contain at least 8 characters, one uppercase letter,
              one lowercase letter, one number and one special character (@$!%*?&)
            </FormHelperText>
            {error && (
              <Typography color="error" align="center" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2196F3 60%, #21CBF3 90%)',
                }
              }}
            >
              Sign Up
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 