import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import ChatWindow from './components/ChatWindow';
import AdminPanel from './components/AdminPanel';
import Logo from './image.png';

export default function App() {
  const [isAdmin, setIsAdmin]         = useState(false);
  const [showLoginForm, setShowLogin] = useState(false);
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [errorMsg, setErrorMsg]       = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'passadmin') {
      setIsAdmin(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Bad credentials');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflowX: 'hidden', // מניעת גלילה אופקית
      }}
    >
      {/* צד שמאל - צ'אט */}
      <Box
        sx={{
          flexBasis: '65%',
          backgroundColor: '#f5f5f5',
          overflowY: 'auto',
          p: 2,
        }}
      >
        <ChatWindow />
      </Box>

      {/* צד ימין - אדמין */}
      <Box
        sx={{
          flexBasis: '35%',
          maxWidth: '500px', // הגבלה במקרה של מסכים רחבים מאוד
          backgroundColor: 'white',
          borderLeft: '1px solid rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          overflowY: 'auto',
        }}
      >
        {/* לוגו */}
        <Box sx={{ mb: 2 }}>
          <img src={Logo} alt="Logo" style={{ maxWidth: '100%', height: 100 }} />
        </Box>

        {/* טופס התחברות / פאנל */}
        {!isAdmin ? (
          showLoginForm ? (
            <Paper sx={{ p: 2, width: '100%' }} elevation={3}>
              <Typography variant="h6" gutterBottom>
                Admin Login
              </Typography>
              <TextField
                label="Username"
                fullWidth
                margin="dense"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="dense"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {errorMsg && (
                <Typography color="error" variant="body2" mt={1}>
                  {errorMsg}
                </Typography>
              )}
              <Box mt={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleLogin}
                >
                  LOGIN
                </Button>
              </Box>
            </Paper>
          ) : (
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setShowLogin(true)}
            >
              Admin Login
            </Button>
          )
        ) : (
          <AdminPanel />
        )}
      </Box>
    </Box>
  );
}
