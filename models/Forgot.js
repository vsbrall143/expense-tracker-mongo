const mongoose = require('mongoose');

const forgotPasswordSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to User
});

const ForgotPasswordRequest = mongoose.model('ForgotPasswordRequest', forgotPasswordSchema);
module.exports = ForgotPasswordRequest;
