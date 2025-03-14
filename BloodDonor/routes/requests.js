const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create new blood request
router.post('/', auth, async (req, res) => {
    try {
        const { bloodType, urgency, location, message } = req.body;
        const request = new BloodRequest({
            requester: req.user.id,
            bloodType,
            urgency,
            location,
            message
        });

        await request.save();
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error creating request', error: error.message });
    }
});

// Get all blood requests
router.get('/', async (req, res) => {
    try {
        const requests = await BloodRequest.find()
            .populate('requester', 'fullName email phoneNumber')
            .populate('matchedDonor', 'fullName email phoneNumber')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
});

// Get requests by blood type
router.get('/blood-type/:bloodType', async (req, res) => {
    try {
        const requests = await BloodRequest.find({
            bloodType: req.params.bloodType,
            status: 'pending'
        })
        .populate('requester', 'fullName email phoneNumber')
        .sort({ urgency: -1, createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
});

// Get requests by location
router.get('/location/:location', async (req, res) => {
    try {
        const requests = await BloodRequest.find({
            location: { $regex: req.params.location, $options: 'i' },
            status: 'pending'
        })
        .populate('requester', 'fullName email phoneNumber')
        .sort({ urgency: -1, createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
});

// Accept blood request
router.put('/:id/accept', auth, async (req, res) => {
    try {
        const request = await BloodRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request is no longer pending' });
        }

        request.status = 'accepted';
        request.matchedDonor = req.user.id;
        await request.save();

        res.json({ message: 'Request accepted successfully', request });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting request', error: error.message });
    }
});

// Complete blood request
router.put('/:id/complete', auth, async (req, res) => {
    try {
        const request = await BloodRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'accepted') {
            return res.status(400).json({ message: 'Request must be accepted first' });
        }

        request.status = 'completed';
        await request.save();

        // Update donor's last donation date
        const donor = await User.findById(request.matchedDonor);
        if (donor) {
            donor.lastDonation = new Date();
            await donor.save();
        }

        res.json({ message: 'Request completed successfully', request });
    } catch (error) {
        res.status(500).json({ message: 'Error completing request', error: error.message });
    }
});

// Cancel blood request
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const request = await BloodRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status === 'completed') {
            return res.status(400).json({ message: 'Cannot cancel completed request' });
        }

        request.status = 'cancelled';
        await request.save();

        res.json({ message: 'Request cancelled successfully', request });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling request', error: error.message });
    }
});

module.exports = router; 