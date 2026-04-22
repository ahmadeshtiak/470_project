import express from 'express';
import SwapRequest from '../models/SwapRequest.js';
import { auth } from '../middleware/auth.js';
import Car from '../models/Car.js';
import Part from '../models/Part.js';

const router = express.Router();

// Create a new swap request
router.post('/create', auth, async (req, res) => {
    try {
        const { receiver, initiatorItem, initiatorItemType, receiverItem, receiverItemType, message } = req.body;

        // Validate required fields
        if (!receiver || !initiatorItem || !initiatorItemType || !receiverItem || !receiverItemType) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Validate item types
        if (!['car', 'part'].includes(initiatorItemType) || !['car', 'part'].includes(receiverItemType)) {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        // Check if user is not trying to swap with themselves
        if (req.userId === receiver) {
            return res.status(400).json({ message: 'Cannot create swap request with yourself' });
        }

        // Check if a pending request already exists between these users for these items
        const existingRequest = await SwapRequest.findOne({
            initiator: req.userId,
            receiver,
            initiatorItem,
            receiverItem,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'A pending swap request already exists for these items' });
        }

        const swapRequest = new SwapRequest({
            initiator: req.userId,
            receiver,
            initiatorItem,
            initiatorItemType,
            receiverItem,
            receiverItemType,
            message
        });

        await swapRequest.save();

        // Populate the response with user details
        await swapRequest.populate('initiator', 'username email');
        await swapRequest.populate('receiver', 'username email');

        res.status(201).json({
            message: 'Swap request created successfully',
            swapRequest
        });
    } catch (error) {
        console.error('Error creating swap request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get swap requests for the current user (both sent and received)
router.get('/my-requests', auth, async (req, res) => {
    try {
        const requests = await SwapRequest.find({
            $or: [
                { initiator: req.userId },
                { receiver: req.userId }
            ]
        })
            .populate('initiator', 'username email')
            .populate('receiver', 'username email')
            .sort({ createdAt: -1 });

        // Populate items based on type
        for (let request of requests) {
            if (request.initiatorItemType === 'car') {
                const item = await Car.findById(request.initiatorItem).select('model brand year price images');
                request.initiatorItem = item;
            } else {
                const item = await Part.findById(request.initiatorItem).select('name title price images');
                request.initiatorItem = item;
            }

            if (request.receiverItemType === 'car') {
                const item = await Car.findById(request.receiverItem).select('model brand year price images');
                request.receiverItem = item;
            } else {
                const item = await Part.findById(request.receiverItem).select('name title price images');
                request.receiverItem = item;
            }
        }

        res.json(requests);
    } catch (error) {
        console.error('Error fetching swap requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update swap request status (accept/reject)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const swapRequest = await SwapRequest.findById(id);

        if (!swapRequest) {
            return res.status(404).json({ message: 'Swap request not found' });
        }

        // Only the receiver can update the status
        if (swapRequest.receiver.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this request' });
        }

        if (swapRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Request has already been processed' });
        }

        swapRequest.status = status;
        await swapRequest.save();

        // Populate the response
        await swapRequest.populate('initiator', 'username email');
        await swapRequest.populate('receiver', 'username email');

        res.json({
            message: `Swap request ${status}`,
            swapRequest
        });
    } catch (error) {
        console.error('Error updating swap request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending requests received by the current user
router.get('/pending', auth, async (req, res) => {
    try {
        const requests = await SwapRequest.find({
            receiver: req.userId,
            status: 'pending'
        })
            .populate('initiator', 'username email')
            .populate('receiver', 'username email')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;