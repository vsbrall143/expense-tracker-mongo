const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    paymentid: { type: String, default: null },
    orderid: { type: String, required: true },
    status: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to User
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
