const User=require('../models/User')
const signup=require('../models/SignupUser')
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
// const { Op } = require('sequelize');
const sequelize=require('../util/database'); 
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');

const Expense=require('../models/User')

const Sequelize=require('../util/database'); 

 

exports.deleteMonthExpense = async (req, res, next) => {
  const t = await sequelize.transaction(); // Start a transaction

  try {
    const expenseId = req.params.id; // Assuming the ID is passed in the request URL
    const signupEmail = req.user.email; // Get the user's email from the request

    // Validate the expense ID
    if (!expenseId) {
      return res.status(400).json({ message: "Expense ID not provided" });
    }

    // Find the expense to be deleted
    const expense = await Expense.findOne({
      where: { id: expenseId, signupEmail },
      transaction: t,
    });

    if (!expense) {
      throw new Error("Expense not found.");
    }

    // Find the user
    const user = await signup.findOne({
      where: { email: signupEmail },
      transaction: t,
    });

    if (!user) {
      throw new Error("User not found.");
    }

    // Calculate the new total balance
    const currentTotal = parseFloat(user.total) || 0;
    const expenseImpact = parseFloat(expense.credit) - parseFloat(expense.debit);
    const newTotal = currentTotal - expenseImpact;

    // Delete the expense
    await Expense.destroy({
      where: { id: expenseId, signupEmail },
      transaction: t,
    });

    // Update the user's total balance
    user.total = newTotal;
    await user.save({ transaction: t });

    // Commit the transaction if all operations are successful
    await t.commit();

    res.status(200).json({ message: "Expense deleted successfully", newTotal });
  } catch (error) {
    // Rollback the transaction in case of an error
    await t.rollback();
    console.error("Error deleting expense:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the expense.", error });
  }
};










exports.getMonthExpenses = (req, res, next) => {
  
const ITEMS_PER_PAGE = parseInt(req.params.rows, 10);  
  const page = +req.query.page || 1;
  console.log(page);
  const signupEmail = req.user.email;
  const month = req.params.month;
  const year = req.params.year;
  let totalItems;

  // Count total items for the month and year
  User.count({
    where: { month: month, year: year }
  })
    .then((count) => {
      totalItems = count;

      return User.findAll({
        
        where: { month: month, year: year,signupEmail:signupEmail },
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });
    })
    .then((users) => {
      res.json({
        users: users,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        nextPage: page + 1,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => console.log(err));
};
 

exports.getYearExpenses = async (req, res) => {
  try {
    const year = req.params.year; // Get the year from the request parameters
    const signupEmail=req.user.email;
    // Query the database to get total credit and debit for each month of the given year
    const expenses = await Expense.findAll({
      attributes: [
        'month',
        [Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('credit'), 'FLOAT')), 'totalCredit'],
        [Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('debit'), 'FLOAT')), 'totalDebit'],
      
      ],
      where: { year, signupEmail}, // Filter by the specified year
      group: ['month'], // Group by month
      order: Sequelize.literal("FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')")
    });

    // Format the data for the frontend
    const formattedExpenses = expenses.map((expense) => ({
      month: expense.month,
      totalCredit: parseFloat(expense.dataValues.totalCredit || 0), // Ensure numeric format
      totalDebit: parseFloat(expense.dataValues.totalDebit || 0)
    }));

    // Send the formatted data as a response
    res.status(200).json({ expenses: formattedExpenses, success: true });
  } catch (err) {
    console.error('Error fetching year expenses:', err);
    res.status(500).json({ error: 'An error occurred while fetching expenses.', success: false });
  }
};


// exports.getYearExpenses = async (req, res, next) => {
//   try {
//     // Extract month parameter from the request
//     const year = req.params.year;

//     const email=req.user.email;
//     // Find all users (expenses) with the given month
//     const users = await User.findAll({
//       where: {
//         signupEmail:email,
//         year:year
//       }
//     });

//     // Send the filtered users as a response
//     res.status(200).json({ users });
//   } catch (error) {
//     // Handle errors gracefully
//     console.error("Error fetching month expenses:", error);
//     res.status(500).json({ message: "Failed to fetch expenses for the given month" });
//   }
// };
 


const { Op, Transaction } = require('sequelize'); // Import Op for comparison operators
 

exports.getExpense = async (req, res, next) => {
  try {
    const day = parseInt(req.params.day, 10);  
    const month = req.params.month;  
    const year = parseInt(req.params.year, 10);  
    
    const email=req.user.email;
    // console.log(req.params);
    console.log(day);
    console.log(month);
    console.log(year);

    // Query all expenses for the specified day, month, and year
    const expenses = await User.findAll({
      where: {
        signupEmail:email,
        day: day,
        month: month,
        year: year
      }
    });

    // Query all expenses for days less than 'day' in the same month and year
    const expensesTillDay = await User.findAll({

      where: {
        signupEmail:email,
        day: { [Op.lt]: day},// Fetch days less than the current 'day'

        month: month,
        year: year
      }
    });

    // If no expenses are found for the given day
    if (expenses.length === 0 && expensesTillDay.length === 0) {
      return res.status(404).json({ message: 'No expenses found for the specified date.' });
    }

    // Send both 'expenses' and 'expensesTillDay' in the response
    res.status(200).json({ 
      expenses, 
      expensesTillDay 
    });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'An error occurred while fetching expenses.' });
  }
};



exports.postUser = async (req, res, next) => {
  const { day, month, year, credit = 0, debit = 0, description } = req.body;
  const email = req.user.email;

  // Start the transaction
  const t = await sequelize.transaction();

  try {
    // Create a transaction record
    const data = await User.create(
      {
        day,
        month,
        year,
        credit,
        debit,
        description,
        signupEmail: email,
      },
      { transaction: t }
    );

    // Find the user
    const user = await signup.findOne({ where: { email }, transaction: t });

    if (!user) {
      throw new Error("User not found.");
    }

    // Calculate the new total
    const currentTotal =parseFloat(user.total) || 0;

    console.log(currentTotal,"olddd");
    // Calculate the new total
    const newTotal = currentTotal + (parseFloat(credit) - parseFloat(debit)); // Ensure correct calculation with floats

    console.log(newTotal)
    // Update the user's total balance
    user.total = newTotal;
    await user.save({ transaction: t });

    // Commit the transaction if all operations are successful
    await t.commit();

    // Send success response
    res.status(201).json({ newUserDetails: data });
  } catch (error) {
    // Rollback the transaction in case of an error
    await t.rollback();
    console.error("Transaction failed:", error);
    res.status(500).json({ error: "An error occurred while processing the transaction." });
  }
};


 function generateAccessToken(email,ispremium){

  return jwt.sign({email:email,isPremium:ispremium}, '8hy98h9yu89y98yn89y98y89')
 }


 
 exports.postlogin = async (req, res, next) => {
   try {
     const { email, password } = req.body;
 
     // Check if the user exists in the database
     const user = await signup.findOne({ where: { email } });
 
     if (!user) {
       return res.status(404).json({ message: "User does not exist" });
     }
 
     // Validate password using bcrypt
     const isMatch = await bcrypt.compare(password, user.password);
     if (isMatch) {

      const userr = await signup.findOne({
        where: {email:email}
      });
      const isPremium=userr.isPremium;

       return res.status(200).json({ success: true, message: "User logged in successfully" ,token:generateAccessToken(user.email,isPremium)});
     } else {
       return res.status(400).json({ success: false, message: "Password is incorrect" });
     }
 
   } catch (error) {
     console.error("Error during login:", error);
     res.status(500).json({ message: "An error occurred during login." });
   }   
 };
 


 exports.postsignup = async (req, res, next) => {
  try {
    console.log("Handling signup request...");
    console.log(req.body);

    const { username, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await signup.findOne({ where: { email} });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    bcrypt.hash(password,10,async (err,hash) => {     //10 is for salt rounds more making passwo rd more unique
      console.log(err);
      await signup.create({username,email,password:hash})
      res.status(201).json({message:'sucessfully created new user'})
    })

    // Create a new user if the email is not taken
    // const data = await signup.create({
    //   username,
    //   email,
    //   password,
    // });

    // res.status(201).json({ newSignUpDetails: data });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "An error occurred during signup." });
  }
};


 

exports.downloadExpenses = async (req, res) => {

  try {
 

    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      return res.status(500).json({ success: false, message: 'Azure connection string is not defined.' });
    }
    console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv-------------------------------vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv")
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    const containerName =  'vikasbralllllllqwerty';

    const containerClient = blobServiceClient.getContainerClient(containerName);

    if (!(await containerClient.exists())) {
      const createContainerResponse = await containerClient.create({ access: 'container' });
      console.log('Container created successfully. requestId:', createContainerResponse.requestId);
    }

    const blobName = `expenses-${uuidv1()}.txt`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const data = JSON.stringify(await req.user.getYearExpenses());

    const uploadBlobResponse = await blockBlobClient.upload(data, Buffer.byteLength(data));
    console.log('Blob uploaded successfully. requestId:', uploadBlobResponse.requestId);

    const fileUrl = `${blobServiceClient.url}/${containerName}/${blobName}`;
    res.status(201).json({ fileUrl, success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err, success: false, message: 'Something went wrong.' });
  }
};


// exports.downloadExpenses =  async (req, res) => {

//   try {
//       if(!req.user.ispremiumuser){
//           return res.status(401).json({ success: false, message: 'User is not a premium User'})
//       }
//       const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING; // check this in the task. I have put mine. Never push it to github.
//       // Create the BlobServiceClient object which will be used to create a container client
//       const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

//       // V.V.V.Imp - Guys Create a unique name for the container
//       // Name them your "mailidexpensetracker" as there are other people also using the same storage

//       const containerName = 'prasadyash549yahooexpensetracker'; //this needs to be unique name

//       console.log('\nCreating container...');
//       console.log('\t', containerName);

//       // Get a reference to a container
//       const containerClient = await blobServiceClient.getContainerClient(containerName);

//       //check whether the container already exists or not
//       if(!containerClient.exists()){
//           // Create the container if the container doesnt exist
//           const createContainerResponse = await containerClient.create({ access: 'container'});
//           console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);
//       }
//       // Create a unique name for the blob
//       const blobName = 'expenses' + uuidv1() + '.txt';

//       // Get a block blob client
//       const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//       console.log('\nUploading to Azure storage as blob:\n\t', blobName);

//       // Upload data to the blob as a string
//       const data =  JSON.stringify(await req.user.getYearExpenses());

//       const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
//       console.log("Blob was uploaded successfully. requestId: ", JSON.stringify(uploadBlobResponse));

//       //We send the fileUrl so that the in the frontend we can do a click on this url and download the file
//       const fileUrl = `https://demostoragesharpener.blob.core.windows.net/${containerName}/${blobName}`;
//       res.status(201).json({ fileUrl, success: true}); // Set disposition and send it.
//   } catch(err) {
//       res.status(500).json({ error: err, success: false, message: 'Something went wrong'})
//   }

// };