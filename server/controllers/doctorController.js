const Doctor = require('../models/doctorModel');
const bcrypt = require('bcryptjs');

exports.registerDoctor = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingDoctors = await Doctor.find();
    if (existingDoctors.length > 0) {
      return res.status(403).json({ error: 'Doctor already exists' });
    }

    const existing = await Doctor.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = new Doctor({ username, password: hashedPassword });
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
