const Sequelize = require('sequelize');
const sequelize = require('../util/database'); // Corrected the path reference

// Define the Order model with appropriate fields
const Download = sequelize.define('download', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    url: {
        type: Sequelize.STRING,
                                 // Payment ID may be null initially for pending orders
    }

});

module.exports = Download;
