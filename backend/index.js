const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const policyRoutes = require('./routes/policyRoutes');
const claimRoutes = require('./routes/claimRoutes');
const crowdRoutes = require('./routes/crowdRoutes');
const routingRoutes = require('./routes/routingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Set up MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', userRoutes);               // /api/register, /api/user/:id
app.use('/api/premium', premiumRoutes);    // /api/premium/:city
app.use('/api/policy', policyRoutes);      // /api/policy/activate
app.use('/api/claims', claimRoutes);       // /api/claims/report
app.use('/api/crowd', crowdRoutes);        // /api/crowd/verify
app.use('/api/routing', routingRoutes);    // /api/routing/smart-route
app.use('/admin', adminRoutes);            // /admin/stats | /admin/predict | /admin/risk-map | /admin/fraud

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
