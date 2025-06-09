import React, { useState } from 'react';
import {
  Box, Button, Paper, TextField, Typography
} from '@mui/material';
import ChatWindow from './components/ChatWindow';
import AdminPanel from './components/AdminPanel';
import { doctorLogin, doctorRegister } from './api/doctor';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginForm, setShowLogin] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    try {
      // doctorRegister and  doctorLogin in doctor API
      const fn = registerMode ? doctorRegister : doctorLogin;
      const res = registerMode
        ? await fn(username, password, email)
        : await fn(username, password);

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setIsAdmin(true);
        setErrorMsg('');
      }
    } catch (err) {
      setErrorMsg('Server error');
    }
  };
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ flexBasis: '65%', backgroundColor: '#f5f5f5', overflowY: 'auto', p: 2 }}>
        <ChatWindow />
      </Box>

      <Box sx={{
        flexBasis: '35%', maxWidth: '500px', backgroundColor: 'white',
        borderLeft: '1px solid rgba(0,0,0,0.12)', display: 'flex',
        flexDirection: 'column', alignItems: 'center', p: 2, overflowY: 'auto'
      }}>
        <Box sx={{ mb: 2 }}>
          <img src="/image.png" alt="Logo" style={{ maxWidth: '100%', height: 100 }} />
        </Box>

        {!isAdmin ? (
          showLoginForm ? (
              <Paper
                sx={{
                  p: 3,
                  width: '100%',
                  maxWidth: '450px', 
                  mx: 'auto',       
                  boxSizing: 'border-box',
                }}
                elevation={3}
              >
              <Typography variant="h6" gutterBottom>
                {registerMode ? 'Doctor Registration' : 'Doctor Login'}
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
              {registerMode && (
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  margin="dense"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              )}

              {errorMsg && (
                <Typography color="error" variant="body2" mt={1}>{errorMsg}</Typography>
              )}
              <Box mt={2}>
                <Button variant="contained" fullWidth onClick={handleSubmit}>
                  {registerMode ? 'Register' : 'Login'}
                </Button>
                <Button variant="text" fullWidth onClick={() => setRegisterMode(!registerMode)}>
                  {registerMode ? 'Already have an account? Login' : 'Create a new account'}
                </Button>
              </Box>
            </Paper>
          ) : (
            <Button variant="outlined" fullWidth onClick={() => setShowLogin(true)}>
              Doctor Login
            </Button>
          )
        ) : (
          <AdminPanel />
        )}
      </Box>
    </Box>
  );
}
