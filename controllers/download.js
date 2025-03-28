require('dotenv').config();
const Expense = require('../models/Expense');
const User = require('../models/User');
const Downloads = require('../models/downloads');

const { v1: uuidv1 } = require('uuid');
const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');

exports.getDownloads = async (req, res, next) => {
  try {
    const email = req.user.email;
    const downloads = await Downloads.find({ signupEmail: email });

    res.status(200).json({ downloads });
  } catch (err) {
    console.error('Error fetching downloads:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.downloadExpenses = async (req, res, next) => {
  try {
    console.log("Processing download request...");

    const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;

    if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_ACCOUNT_KEY) {
      return res.status(500).json({ success: false, message: 'Azure storage account name or key is missing.' });
    }

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

    // Fetch expenses from MongoDB
    const email = req.user.email;
    const expenses = await Expense.find({ signupEmail: email }).lean(); // Convert documents to plain objects

    if (expenses.length === 0) {
      return res.status(404).json({ success: false, message: 'No expenses found to download.' });
    }

    // Convert data to HTML table
    const htmlData = convertToHTMLTable(expenses);

    // Upload HTML file to Azure Blob Storage
    const uploadBlobResponse = await blockBlobClient.upload(htmlData, Buffer.byteLength(htmlData));
    console.log('HTML file uploaded successfully:', uploadBlobResponse.requestId);

    // Generate SAS token for secure access
    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"), // Read-only permission
      startsOn: new Date(),
      expiresOn: new Date(Date.now() + 3600 * 1000) // 1 hour expiry
    }, credential).toString();

    const fileUrl = `${blockBlobClient.url}?${sasToken}`;

    // Save the download record in MongoDB
    await Downloads.create({ url: fileUrl, signupEmail: email });

    res.status(201).json({ fileUrl, success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
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
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
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

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ signupEmail: req.user.email });

    res.status(200).json({ expenses, success: true });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
