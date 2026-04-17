const User = require('../models/User');

exports.activatePolicy = async (req, res) => {
  try {
    const { userId } = req.body;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7); // 7 day policy by default

    const user = await User.findByIdAndUpdate(
      userId, 
      { policyActive: true, policyStartDate: startDate, policyEndDate: endDate },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
