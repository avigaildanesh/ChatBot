const Doctor = require('../models/doctorModel');
const bcrypt = require('bcrypt');

exports.registerDoctor = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const existing = await Doctor.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hash = await bcrypt.hash(password, 10);
    const doctor = new Doctor({ username, password: hash, email });
    await doctor.save();

    res.status(201).json({ message: 'Doctor registered' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.loginDoctor = async (req, res) => {
  const { username, password } = req.body;
  try {
    const doctor = await Doctor.findOne({ username });
    if (!doctor) return res.status(400).json({ error: 'Doctor not found' });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


