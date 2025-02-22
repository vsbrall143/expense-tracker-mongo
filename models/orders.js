const Sequelize = require('sequelize');
const sequelize = require('../util/database'); // Corrected the path reference

// Define the Order model with appropriate fields
const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    paymentid: {
        type: Sequelize.STRING,
                                 // Payment ID may be null initially for pending orders
    },
    orderid: {
        type: Sequelize.STRING,
 
    },
    status: {
        type: Sequelize.STRING,
 
    }
});

module.exports = Order;
