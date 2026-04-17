const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, phone, password, city, weeklyIncome } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ 
      name, 
      phone, 
      password: hashedPassword, 
      city, 
      weeklyIncome 
    });
    await user.save();
    
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Fetch user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Login user via phone and password
exports.loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Check for user
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: 'User not found with this phone number' });
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
