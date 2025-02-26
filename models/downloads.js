const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
    url: { type: String, required: true },
    signupEmail: { type: String, required: true }
});

// Check if model already exists before defining it
const Download = mongoose.models.Download || mongoose.model('Download', downloadSchema);

module.exports = Download;
