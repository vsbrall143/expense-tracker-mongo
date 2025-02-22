const Sequelize = require('sequelize');
const sequelize = require('../util/database'); // Corrected the path reference
 


// Define the Order model with appropriate fields
const Forgot = sequelize.define('ForgotPasswordRequests', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },

    isActive: {
        type: Sequelize.STRING,
 
    }
});

module.exports = Forgot;
