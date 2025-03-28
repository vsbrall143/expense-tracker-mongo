const mongoose = require('mongoose');

const forgotPasswordSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
 signupEmail: { type: String, required: true }
});

const ForgotPasswordRequest = mongoose.model('ForgotPasswordRequest', forgotPasswordSchema);
module.exports = ForgotPasswordRequest;
