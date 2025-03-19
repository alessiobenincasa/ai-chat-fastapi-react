import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  content: string;
  timestamp: string;
  user_id: number;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:8000/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (err) {
      setError('Failed to fetch messages');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post('http://localhost:8000/chat', 
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ 
      width: '100vw',
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#f5f5f5',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
      }}>
        <Toolbar>
          <ChatIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            AI Chat Assistant
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            sx={{
              '&:hover': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s',
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        py: 3,
        height: 'calc(100vh - 64px)',
        overflow: 'hidden'
      }}>
        <Paper 
          elevation={6} 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'white',
            height: '100%'
          }}
        >
          <List sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            p: 2,
            bgcolor: '#f8f9fa'
          }}>
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                <ListItem sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  mb: 1
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    maxWidth: '80%'
                  }}>
                    <Avatar 
                      sx={{ 
                        mr: 2,
                        bgcolor: message.content.startsWith('AI:') ? '#2196F3' : '#9c27b0'
                      }}
                    >
                      {message.content.startsWith('AI:') ? 'AI' : 'U'}
                    </Avatar>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: message.content.startsWith('AI:') ? '#e3f2fd' : '#f3e5f5',
                      }}
                    >
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          mt: 1,
                          color: 'text.secondary'
                        }}
                      >
                        {new Date(message.timestamp).toLocaleString()}
                      </Typography>
                    </Paper>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </List>

          {error && (
            <Typography 
              color="error" 
              align="center" 
              sx={{ 
                p: 1,
                bgcolor: '#ffebee'
              }}
            >
              {error}
            </Typography>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              p: 2,
              borderTop: '1px solid #e0e0e0',
              bgcolor: 'white'
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover fieldset': {
                      borderColor: '#2196F3',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!newMessage.trim()}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #2196F3 60%, #21CBF3 90%)',
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s',
                  },
                }}
              >
                <SendIcon />
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Chat; 