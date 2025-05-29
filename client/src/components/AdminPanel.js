import React, { useState } from 'react';
import {
  Box, Button, Chip, Collapse, Grid,
  Paper, Stack, TextField, Typography
} from '@mui/material';
import { styled } from '@mui/system';
import { addAvailableSlots, setAdminAuth } from '../api';
import DeleteIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: '32px',
  borderRadius: '20px',
  boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '400px', // ✅ רוחב מקסימלי ברור
  backgroundColor: '#fff',
  marginTop: '40px',
  marginBottom: '40px',
  marginLeft: 'auto',
  marginRight: 'auto', // ✅ לא דוחף ימינה
  boxSizing: 'border-box',
}));

const generateTimeOptions = () => {
  const result = [];
  for (let h = 8; h <= 15; h++) {
    result.push(`${String(h).padStart(2, '0')}:00`);
    result.push(`${String(h).padStart(2, '0')}:30`);
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

  setAdminAuth('admin', 'passadmin');

  const isValidTimeFormat = (timeStr) => {
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(timeStr)) return false;
    const [h, m] = timeStr.split(':').map(Number);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  };

  const toggleTime = (time) => {
    setSelectedTimes(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const addManualTime = () => {
    if (!isValidTimeFormat(manualTime)) {
      setErrorText('Invalid time format (HH:MM)');
      return;
    }
    if (!selectedTimes.includes(manualTime)) {
      setSelectedTimes(prev => [...prev, manualTime]);
    }
    setManualTime('');
    setErrorText('');
  };

  const selectAllTimes = () => {
    setSelectedTimes([...new Set([...selectedTimes, ...TIME_OPTIONS])]);
  };

  const clearAllTimes = () => {
    setSelectedTimes([]);
  };

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
    try {
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


  const addRange = () => {
    if (!isValidTimeFormat(rangeStart) || !isValidTimeFormat(rangeEnd) || rangeStep <= 0) {
      setErrorText('Invalid range input');
      return;
    }

    const [sh, sm] = rangeStart.split(':').map(Number);
    const [eh, em] = rangeEnd.split(':').map(Number);

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    if (start >= end) {
      setErrorText('Start must be before end');
      return;
    }

    const newTimes = [];
    for (let t = start; t < end; t += Number(rangeStep)) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      if (!selectedTimes.includes(timeStr)) newTimes.push(timeStr);
    }

    setSelectedTimes(prev => [...prev, ...newTimes]);
    setErrorText('');
  };

  return (
    <StyledCard>
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        align="center"
        fontWeight="bold"
      >
        Add Slots
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={e => setDate(e.target.value)}
          inputProps={{
            min: new Date().toISOString().split('T')[0],
            style: { textAlign: 'left' } // 👈 align text to left
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
                  sx={{ width: '100%' }}
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
          <Button variant="outlined" onClick={addRange}>Add Range</Button>
        </Stack>

        {selectedTimes.length > 0 && (
          <>
            <Typography variant="subtitle2">Selected times:</Typography>
            <Stack direction="row" flexWrap="wrap" spacing={1}>
              {selectedTimes.map((time, i) => (
                <Chip
                  key={i}
                  label={time}
                  onDelete={() => toggleTime(time)}
                  deleteIcon={<DeleteIcon />}
                />
              ))}
            </Stack>
          </>
        )}

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
