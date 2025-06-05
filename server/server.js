// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

mongoose.connect('mongodb://localhost:27017/appointments', {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);

app.use('/api', bookingRoutes);
const doctorRoutes = require('./routes/doctorRoutes');
app.use('/api/doctor', doctorRoutes);

// Start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
