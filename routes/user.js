const path = require('path');

const express = require('express');

const userController = require('../controllers/user');
const purchaseController = require('../controllers/purchase');
const passwordController = require('../controllers/password');

const router = express.Router();
 
const auth= require('../middleware/auth')

const downloadController = require('../controllers/download')
 
router.get('/purchase/premiummembership',auth.au, purchaseController.purchasepremium);
 
router.post('/purchase/updatetransactionstatus',auth.au, purchaseController.updateTransactionStatus);

router.get('/purchase/isPremium',auth.au, purchaseController.isPremium);

router.get('/purchase/leaderboard',auth.au, purchaseController.getLeaderboard);

router.post('/password/forgotpassword', passwordController.forgotPassword);

router.get('/password/resetpassword/:uuid',passwordController.resetPassword);

router.get('/password/updatepassword/:resetpasswordid', passwordController.updatePassword);


router.get('/download', auth.au, downloadController.downloadExpenses)

router.get('/get-downloads', auth.au, downloadController.getDownloads)

router.post('/user/add-user',auth.au, userController.postUser) //middle ware auth.au is added to add retrieve email id form header and add it to request for easy working in controllers

router.get('/user/get-expenses/:year' ,auth.au, userController.getYearExpenses)//email is added in header because it can be added to both get and post requests

router.get('/user/get-expenses/:month/:year/:rows' ,auth.au, userController.getMonthExpenses)

router.delete('/user/delete-expenses/:id' ,auth.au, userController.deleteMonthExpense)

router.get('/user/get-expense/:day/:month/:year',auth.au, userController.getExpense)  //req will go to authentication middle ware then to admin controller if sucessful
  
router.post('/user/signup', userController.postSignup)

router.post('/user/login', userController.postLogin)
 

module.exports = router;
