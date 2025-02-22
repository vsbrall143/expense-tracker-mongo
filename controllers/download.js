require('dotenv').config();
const Expense=require('../models/User')
const signup=require('../models/SignupUser')
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
// const { Op } = require('sequelize');
const sequelize=require('../util/database'); 
const Downloads=require('../models/downloads');
// const { v1: uuidv1} = require('uuid');
// const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require('@azure/storage-blob');
 

require('dotenv').config();
 
  
const { v1: uuidv1 } = require('uuid');
const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
 


exports.getDownloads = async(req,res,next)=>{
  const email = req.user.email;
  const downloads = await Downloads.findAll({where: {signupEmail: email}});
  res.status(200).json({downloads});
}


exports.downloadExpenses = async (req, res,next) => {
  try {
    console.log("Processing download request...");

    const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_ACCOUNT_KEY) {
      return res.status(500).json({ success: false, message: 'Azure storage account name or key is not defined.' });
    }

    // Use StorageSharedKeyCredential for authentication
    const credential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY);

    const blobServiceClient = new BlobServiceClient(
      `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      credential
    );

    const containerName = 'vsbrallxpensetracker';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    if (!(await containerClient.exists())) {
      await containerClient.create();
      console.log('Azure Blob Container created successfully.');
    }

    const blobName = `expenses-${uuidv1()}.html`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Fetch data from the database
 
    const expensesRaw = await req.user.getExpenses(); // Assuming this fetches Sequelize model instances
    const expenses = expensesRaw.map(expense => expense.get({ plain: true })); // Convert to plain objects

    // Convert data to HTML table
    const htmlData = convertToHTMLTable(expenses);

    // Upload the HTML file to Azure Blob
    const uploadBlobResponse = await blockBlobClient.upload(htmlData, Buffer.byteLength(htmlData));
    console.log('HTML file uploaded successfully:', uploadBlobResponse.requestId);

    // Generate SAS token
    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"), // Read-only permission
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000) // 1 hour expiry
    }, credential).toString();

    // File URL with SAS token
    const fileUrl = `${blockBlobClient.url}?${sasToken}`;

    const email=req.user.email;

    const data = await Downloads.create({url:fileUrl,signupEmail:email});

    res.status(201).json({ fileUrl, success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err, success: false, message: 'Something went wrong.' });
  }
};

function convertToHTMLTable(data) {
  if (!data || data.length === 0) return '<p>No data available</p>';

  const headers = Object.keys(data[0]).map(key => `<th>${key}</th>`).join('');
  const rows = data.map(item =>
    `<tr>${Object.values(item).map(value => `<td>${value}</td>`).join('')}</tr>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1px solid black;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <h2>Expenses Report</h2>
      <table>
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `;
}

 
  const getexpenses = (req, res)=> {

    req.user.getExpenses().then(expenses => {
        return res.status(200).json({expenses, success: true})
    })
    .catch(err => {
        return res.status(402).json({ error: err, success: false})
    })
}