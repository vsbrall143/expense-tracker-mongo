const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const SignupUser = sequelize.define('signup', {

  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },

  isPremium:{
    type: Sequelize.BOOLEAN
  },

  total:{
    type: Sequelize.STRING
  }
});

module.exports = SignupUser;
