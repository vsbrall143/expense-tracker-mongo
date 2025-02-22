const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('expense', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },

  day: {
    type: Sequelize.STRING,
    allowNull: false
  },

  month: {
    type: Sequelize.STRING,
    allowNull: false
  },

  year: {
    type: Sequelize.STRING,
    allowNull: false
  },

  credit: {
    type: Sequelize.STRING,
    allowNull: false
  },
  debit: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
 
});

module.exports = User;
