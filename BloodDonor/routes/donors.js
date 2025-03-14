const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all donors
router.get('/', async (req, res) => {
    try {
        const donors = await User.find({ isDonor: true })
            .select('-password')
            .sort({ lastDonation: -1 });
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching donors', error: error.message });
    }
});

// Get donors by blood type
router.get('/blood-type/:bloodType', async (req, res) => {
    try {
        const donors = await User.find({
            isDonor: true,
            bloodType: req.params.bloodType
        }).select('-password');
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching donors', error: error.message });
    }
});

// Get donors by location
router.get('/location/:location', async (req, res) => {
    try {
        const donors = await User.find({
            isDonor: true,
            location: { $regex: req.params.location, $options: 'i' }
        }).select('-password');
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching donors', error: error.message });
    }
});

// Register as a donor
router.post('/register', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isDonor = true;
        await user.save();

        res.json({ message: 'Successfully registered as a donor', user });
    } catch (error) {
        res.status(500).json({ message: 'Error registering as donor', error: error.message });
    }
});

// Update last donation date
router.put('/donation-date', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.lastDonation = new Date();
        await user.save();

        res.json({ message: 'Donation date updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating donation date', error: error.message });
    }
});

module.exports = router; 