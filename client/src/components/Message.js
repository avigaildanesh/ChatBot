import { Box, Typography } from '@mui/material';

const Message = ({ text, sender }) => {
  return (
    <Box
      sx={{
        margin: '5px 0',
        display: 'flex',
        justifyContent: sender === 'bot' ? 'flex-start' : 'flex-end',
        position: 'relative',     // כדי שהzIndex יעבוד כראוי
        zIndex: 20,               // מעל הלוגו
      }}
    >
      <Typography
        sx={{
          backgroundColor: sender === 'bot' ? '#ddd' : '#26c6da',
          color: sender === 'bot' ? 'black' : 'white',
          borderRadius: 2,
          padding: '8px 12px',
          maxWidth: '70%',
          whiteSpace: 'pre-line',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', // מוסיף קצת עומק
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default Message;
