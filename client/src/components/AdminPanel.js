import React, { useState } from 'react';
import {
  Box, Button, Chip, Collapse, Grid,
  Paper, Stack, TextField, Typography
} from '@mui/material';
import { styled } from '@mui/system';
import { addAvailableSlots } from '../api';
import DeleteIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// the add slots card style
const StyledCard = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '20px',
  boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
  maxWidth: '450px', 
  marginTop: '10px',
  boxSizing: 'border-box',
}));

// Pick from predefined hours
const generateTimeOptions = () => {
  const result = [];
  for (let h = 8; h <= 15; h++) {
    // padStart ensures two digit format
    result.push(`${String(h).padStart(2, '0')}:00`); // 08:00
    result.push(`${String(h).padStart(2, '0')}:30`); // 08:30
  }
  return result;
};

const TIME_OPTIONS = generateTimeOptions();

export default function AdminPanel() {
  const [date, setDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [showTimeList, setShowTimeList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeStep, setRangeStep] = useState(30);

  // Validate time format HH:MM
  const isValidTimeFormat = (timeStr) => {
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(timeStr)) return false;
    const [h, m] = timeStr.split(':').map(Number);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  };

  // add hours to selected times (if they are not already selected)
  const toggleTime = (time) => {
    setSelectedTimes(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };


  // add manual time to selected times (if it is valid and not already selected)
  const addManualTime = () => {
    if (!isValidTimeFormat(manualTime)) {
      setErrorText('Invalid time format (HH:MM)');
      return;
    }
    if (!selectedTimes.includes(manualTime)) {
      setSelectedTimes(prev => [...prev, manualTime]);
    }
    setManualTime(''); // clear input after adding
    setErrorText('');
  };

  // select all button
  const selectAllTimes = () => {
    setSelectedTimes([...new Set([...selectedTimes, ...TIME_OPTIONS])]);
  };
  // clear all button
  const clearAllTimes = () => {
    setSelectedTimes([]);
  };

  
  const addRange = () => {
    //
    if (!isValidTimeFormat(rangeStart) || !isValidTimeFormat(rangeEnd) || rangeStep <= 0) {
      setErrorText('Invalid range input');
      return;
    }

    // start hour, end hour and start minute, end minute
    const [sh, sm] = rangeStart.split(':').map(Number);
    const [eh, em] = rangeEnd.split(':').map(Number);

    const start = sh * 60 + sm; // convert to minutes
    const end = eh * 60 + em; // convert to minutes

    // Validate range so that start hour is before end
    if (start >= end) {
      setErrorText('Start must be before end');
      return;
    }

    const newTimes = [];
    // range step is 30 minutes for example
    for (let t = start; t < end; t += Number(rangeStep)) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; // format as HH:MM
      if (!selectedTimes.includes(timeStr)) newTimes.push(timeStr);
    }

    // add the range times to selected times
    setSelectedTimes(prev => [...prev, ...newTimes]);
    setErrorText('');
  };

  // on click at save slots button
  const handleSubmit = async () => {
    if (!date) {
      setErrorText('Please select a date.');
      return;
    }

    if (selectedTimes.length === 0) {
      setErrorText('Please select at least one time.');
      return;
    }

    setLoading(true);

    // add the slots to the server
    try {
      // send date and selected times to the server
      await addAvailableSlots({ date, times: selectedTimes });

      setDate('');
      setSelectedTimes([]);
      setManualTime('');
      setShowTimeList(false);
      setErrorText('');
      setRangeStart('');
      setRangeEnd('');
      setRangeStep(30);
      alert('Slots saved!');
    } catch (e) {
      setErrorText(e.response?.data?.error || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledCard>
      
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        fontWeight="bold"
        color='primary'
      >
        Add Slots
      </Typography> 

      <Stack spacing={3}>
        <TextField
          label="Date"
          type="date"
          fullWidth
          value={date}
          onChange={e => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }} 
          inputProps={{
            // set the min date to today
            //"2025-06-09T07:34:00.000Z".split('T')[0] takes the date
            min: new Date().toISOString().split('T')[0],
            style: { textAlign: 'left' }
          }}
        />
        
        <Stack direction="row" spacing={1}>
          <TextField
            label="Add Time (HH:MM)"
            placeholder="e.g. 18:30"
            value={manualTime}
            onChange={e => setManualTime(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addManualTime()}
            fullWidth
          />
          <Button variant="outlined" onClick={addManualTime}>Add</Button>
        </Stack>

        <Button
          variant="outlined"
          onClick={() => setShowTimeList(prev => !prev)}
          endIcon={showTimeList ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {showTimeList ? 'Hide Quick Times' : 'Pick from predefined hours'}
        </Button>

        <Collapse in={showTimeList}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Button size="small" onClick={selectAllTimes}>Select All</Button>
            <Button size="small" onClick={clearAllTimes}>Clear All</Button>
          </Box>

          <Grid container spacing={1}>
            {TIME_OPTIONS.map(time => (
              <Grid item xs={6} key={time}>
                <Chip
                  label={time}
                  variant={selectedTimes.includes(time) ? 'filled' : 'outlined'}
                  color={selectedTimes.includes(time) ? 'primary' : 'default'}
                  onClick={() => toggleTime(time)}
                />
              </Grid>
            ))}
          </Grid>
        </Collapse>

        <Typography variant="subtitle2">Add Range:</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            label="From (HH:MM)"
            value={rangeStart}
            onChange={e => setRangeStart(e.target.value)}
            size="small"
          />
          <TextField
            label="To (HH:MM)"
            value={rangeEnd}
            onChange={e => setRangeEnd(e.target.value)}
            size="small"
          />
          <TextField
            label="Step (min)"
            type="number"
            value={rangeStep}
            onChange={e => setRangeStep(e.target.value)}
            size="small"
          />
          <Button
            variant="outlined"
            onClick={addRange}
            sx={{
              flexShrink: 0,   
            }}
          >
            Add Range
          </Button>
        </Stack>

        <Grid container spacing={1}>
          {selectedTimes.map((time, i) => (
            <Grid key={i}>
              <Chip
                label={time}
                onDelete={() => toggleTime(time)}
                deleteIcon={<DeleteIcon />}
              />
            </Grid>
          ))}
        </Grid>       

        {errorText && (
          <Typography color="error" variant="body2">{errorText}</Typography>
        )}

        <Box textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save Slots'}
          </Button>
        </Box>
      </Stack>
    </StyledCard>
  );
}
