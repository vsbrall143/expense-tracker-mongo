require('dotenv').config(); // Load environment variables from .env file
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const Expense = require('./models/Expense');
const User = require('./models/User');
const Order = require('./models/orders');
const Forgot = require('./models/Forgot');
const Downloads = require('./models/downloads');
const userroutes = require('./routes/user');

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(userroutes);

mongoose
  .connect(
    'mongodb+srv://vsbrall143:W0W2B89XycbaI7Tv@server.gwe8o.mongodb.net/?retryWrites=true&w=majority&appName=server'
  )
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
