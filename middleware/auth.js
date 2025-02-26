const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Retrieve token from Authorization header
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, '8hy98h9yu89y98yn89y98y89'); // Secret should be stored securely
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        // Extract email from the payload
        const email = decoded?.email;
        if (!email) {
            return res.status(401).json({ success: false, message: 'Invalid token payload' });
        }

        // Fetch the user from MongoDB using email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication error:', err.message || err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const au = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, '8hy98h9yu89y98yn89y98y89');
        console.log('User Email >>>', decoded.email);

        // Find user in MongoDB
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log('Authenticated User:', user);
        req.user = user;
        next();
    } catch (err) {
        console.error('Authentication Error:', err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = { auth, au };
