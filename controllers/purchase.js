const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const User = require('../models/User');
const Order = require('../models/orders'); // Updated to use Mongoose model
const mongoose = require('mongoose');

const purchasepremium = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 250000; // Amount in smallest currency unit (e.g., paise for INR)

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                console.error("Razorpay Order Creation Error:", err);
                return res.status(500).json({ error: "Failed to create Razorpay order" });
            }

            try {
                // Save the order details in MongoDB
                const newOrder = new Order({
                    userId: req.user._id,
                    orderid: order.id,
                    status: 'PENDING',
                });
                await newOrder.save();

                return res.status(201).json({ order, key_id: rzp.key_id });
            } catch (error) {
                console.error("Error saving order to database:", error);
                return res.status(500).json({ error: 'Failed to save order in the database' });
            }
        });
    } catch (error) {
        console.error("Error in purchasepremium:", error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

function generateAccessToken(email, isPremium) {
    return jwt.sign({ email, isPremium }, '8hy98h9yu89y98yn89y98y89');
}

const updateTransactionStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { payment_id, order_id } = req.body;

        // Find the order by order_id
        const order = await Order.findOne({ orderid: order_id }).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Update the order with payment details and status
        order.paymentid = payment_id;
        order.status = 'SUCCESSFUL';
        await order.save({ session });

        // Update the user to premium status
        if (req.user) {
            await User.updateOne(
                { _id: req.user._id },
                { isPremium: true },
                { session }
            );

            await session.commitTransaction();
            return res.status(202).json({ 
                success: true, 
                message: "Transaction Successful", 
                token: generateAccessToken(req.user.email, true) 
            });
        } else {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "User not found in request" });
        }
    } catch (err) {
        await session.abortTransaction();
        console.error('Error updating transaction status:', err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        session.endSession();
    }
};

const isPremium = async (req, res) => {
    try {
        console.log("Checking if user is premium...");
        const user = await User.findOne({ email: req.user.email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ isPremium: user.isPremium });
    } catch (error) {
        console.error("Error in isPremium:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        // Aggregate users and sort by total in descending order
        const leaderboardData = await User.find({}, 'email username total')
            .sort({ total: -1 })
            .exec();

        res.status(200).json({ success: true, leaderboard: leaderboardData });
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = { purchasepremium, updateTransactionStatus, isPremium, getLeaderboard };
