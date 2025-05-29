// src/components/Header.jsx
import React from 'react';
import { Box } from '@mui/material';
import logo from '../assets/appointment_logo.png';

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="Appointment Scheduling Logo"
        sx={{ height: 60, mr: 2 }}
      />
      <Box
        component="h1"
        sx={{ fontSize: '1.5rem', fontWeight: 'bold', m: 0 }}
      >
        Appointment Scheduler
      </Box>
    </Box>
  );
}
