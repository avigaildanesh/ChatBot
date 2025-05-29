// controllers/userController.js
const mongoose = require('mongoose');
const User = mongoose.model('User', new mongoose.Schema({
  name:  { type: String, required: true },
  phone: { type: String, required: true }
}));

exports.createUser = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name.trim() || !/^\d{2,3}-?\d{6,8}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid name or phone' });
    }
    const user = new User({ name: name.trim(), phone });
    await user.save();
    res.json({ message: 'User saved', userId: user._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};
