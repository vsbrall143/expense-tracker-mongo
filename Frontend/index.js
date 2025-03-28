// Get DOM elements
const dayElement = document.querySelector(".date .day");
const monthElement = document.querySelector(".date .month");
const yearElement = document.querySelector(".date .year");
const weekdayElement = document.querySelector(".date .weekday");
const formatdate = document.querySelector(".date .whole-date");
const form = document.getElementById("exampleForm");

// Add event listener for form submission
const currentDate = new Date();

const year = currentDate.getFullYear(); // Get the year (e.g., 2025)
const month = currentDate.getMonth() + 1; // Get the month (0-based, so add 1)
const day = currentDate.getDate(); // Get the day of the month
const weekdayName = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
}).format(currentDate);
const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
  currentDate
);

// function date(){

//     document.getElementsByClassName("day")[0].innerHTML=day;
//     document.getElementsByClassName("month")[0].innerHTML=monthName;
//     document.getElementsByClassName("year")[0].innerHTML=year;
//     document.getElementsByClassName("weekday")[0].innerHTML=weekdayName;

// }

window.onload = function () {
  isPremium();
  handleMonthChange();
  // handleYearChange();
  handleDateChange();
};

const notyf = new Notyf();

form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the default form submission behavior
  const formData = new FormData(form); // Collect form data
  const inputType = formData.get("inputType"); // Get selected radio button value
  const inputValue1 = formData.get("inputValue1"); // Get input field value
  const inputValue2 = formData.get("inputValue2"); // Get input field value
  // const date = document.getElementsByClassName('whole-date')[0].innerText;  // Get input field value
  const day = document.getElementsByClassName("day")[0].innerText;
  const month = document.getElementsByClassName("month")[0].innerText;
  const year = document.getElementsByClassName("year")[0].innerText;
  var credit = 0;
  var debit = 0;
  if (inputType === "credit") {
    credit = inputValue1;
    console.log(credit);
  } else {
    debit = inputValue1;
    console.log(debit);
  }
  const userDetails = {
    day: day,
    month: month,
    year: year,
    credit: credit,
    debit: debit,
    description: inputValue2,
  };
  console.log(userDetails);

  const token = localStorage.getItem("token");
  axios
    .post("https://expense-tracker-mongo-t8fj.onrender.com/user/add-user", userDetails, {
      headers: { Authorization: token },
    })
    .then((res) => {
      console.log(res);
      notyf.success("EXPENSE ADDED!");
      // displayUsers();
    })
    .catch((err) => console.log(err));

  document.getElementById("inputValue1").value = "";
  document.getElementById("inputValue2").value = "";

  const listItem = document.createElement("li");

  // Create a <div> element with a class name
  const div = document.createElement("div");
  div.id = "cont";
  div.textContent = `date: ${userDetails.day} ${userDetails.month} ${userDetails.year}`;
  const div2 = document.createElement("div");
  div2.textContent = ` credit: ${userDetails.credit}, debit: ${userDetails.debit}, description: ${userDetails.description}`;
  div2.className = "container mt-5>";
  div2.appendChild(div);
  // Create delete button
  const deleteButton = document.createElement("button");
  deleteButton.className = "deleteBtn"; // Add styles to make it circular and red
  // Add an icon inside the button
  const icon = document.createElement("i");
  icon.className = "fas fa-trash"; // Font Awesome class for trash icon
  deleteButton.appendChild(icon);
  // Attach the click event
  deleteButton.onclick = function () {
    deleteItem(user, listItem); // Call the delete function
  };

  const div3 = document.createElement("div");
  div3.className = "del-container";
  div3.appendChild(div2);
  div3.appendChild(deleteButton);
  listItem.appendChild(div3);

  userexpense.appendChild(listItem);

  // Append the <li> to the userexpense element
  document.getElementById("userexpense").appendChild(listItem);
});

function handleOnTap() {
  // this function opens the calender to take input when input calender is tapped in all pages

  document.getElementById("dateInput").focus();
}

// Function to update rows per page
function updateRowsPerPage(value) {
  localStorage.setItem("rows", value);
  let month = monthElement.textContent;
  let year = yearElement.textContent;
  currentPage = 1;
  loadPage(month, year, currentPage);
}

let currentPage = 1;
let lastPage = 1;

const yearr = year;
async function handleMonthChange() {
  document.getElementById("month-list").innerHTML = "";

  const selectedDate = new Date(document.getElementById("dateInput").value);
  var month = selectedDate.toLocaleString("default", { month: "long" });
  var year = selectedDate.getFullYear();

  // Check for invalid date and handle it (optional)
  if (isNaN(year)) {
    month = monthName;
    year = yearr; // Use default year
  }

  yearElement.textContent = year;
  monthElement.textContent = `${month}`;
  month = monthElement.textContent;

  loadPage(month, year, currentPage);
}

async function loadPage(month, year, page) {
  const token = localStorage.getItem("token");
  const rows = localStorage.getItem("rows");
  try {
    const response = await axios.get(
      `https://expense-tracker-mongo-t8fj.onrender.com/user/get-expenses/${month}/${year}/${rows}?page=${page}`,
      {
        headers: { Authorization: token },
      }
    );
    console.log(response.data.expenses[0]);

    const monthList = document.getElementById("month-list");
    monthList.innerHTML = "";

    let credit = 0;
    let debit = 0;

    response.data.expenses.forEach((expense) => {
      credit += Number(expense.credit) || 0; // Convert credit to a number, default to 0 if undefined/null
      debit += Number(expense.debit) || 0; // Convert debit to a number, default to 0 if undefined/null
    });
    let total = credit - debit;

    document.getElementById("amount").innerHTML = total;

    for (let i = 0; i < response.data.expenses.length; i++) {
      const user = response.data.expenses[i];

      // Create list item and populate content
      const listItem = document.createElement("li");
      const div = document.createElement("div");
      div.id = "cont";
      div.textContent = `date: ${user.day} ${user.month} ${user.year}`;
      const div2 = document.createElement("div");
      div2.textContent = ` credit: ${user.credit}, debit: ${user.debit}, description: ${user.description}`;
      div2.className = "container mt-5>";
      div2.appendChild(div);

      // Create delete button
      const deleteButton = document.createElement("button");
      deleteButton.className = "deleteBtn"; // Add styles to make it circular and red
      // Add an icon inside the button
      const icon = document.createElement("i");
      icon.className = "fas fa-trash"; // Font Awesome class for trash icon
      deleteButton.appendChild(icon);
      // Attach the click event
      deleteButton.onclick = function () {
        deleteItem(user, listItem); // Call the delete function
      };

      const div3 = document.createElement("div");
      div3.className = "del-container";
      div3.appendChild(div2);
      div3.appendChild(deleteButton);
      listItem.appendChild(div3);

      monthList.appendChild(listItem);
    }

    currentPage = response.data.currentPage;
    lastPage = response.data.lastPage;

    document.getElementById(
      "pageInfo"
    ).innerText = `Page ${currentPage} of ${lastPage}`;
    document.getElementById("prevBtn").disabled =
      !response.data.hasPreviousPage;
    document.getElementById("nextBtn").disabled = !response.data.hasNextPage;
  } catch (err) {
    console.error(err);
  }
}

// Define the delete function
async function deleteItem(user, listItem) {
  try {
    console.log("delete function started");
    const token = localStorage.getItem("token");
    const id = user._id;
    const response = await axios.delete(
      `https://expense-tracker-mongo-t8fj.onrender.com/user/delete-expenses/${id}`,
      {
        headers: { Authorization: token },
      }
    );
    notyf.success("expense deleted successfully!");
    console.log(`Deleting user:${user.id} ,${user.description}`);
    listItem.remove(); // Remove the list item from the DOM
  } catch (err) {
    console.error(err);
  }
}

function changePage(direction) {
  const token = localStorage.getItem("token");
  let selectedDate = new Date(document.getElementById("dateInput").value);
  // let month = selectedDate.toLocaleString("default", { month: "long" });
  // let year = selectedDate.getFullYear();
  let month = monthElement.textContent;
  let year = yearElement.textContent;
  currentPage += direction;
  loadPage(month, year, currentPage);
}

const y = year;
 

const dayy = day;
const yearrr = year;

async function handleDateChange() {
  const selectedDate = new Date(dateInput.value);
  document.getElementById("userexpense").innerHTML = "";
  // Extract date components
  var day = selectedDate.getDate();
  var month = selectedDate.toLocaleString("default", { month: "long" });
  var year = selectedDate.getFullYear();
  var weekday = selectedDate.toLocaleString("default", { weekday: "long" });

  // Check for invalid date and handle it (optional)
  if (isNaN(year)) {
    day = dayy;
    month = monthName;
    year = yearrr; // Use default values
    weekday = weekdayName;
  }

  dayElement.textContent = day;
  monthElement.textContent = `${month}`;
  yearElement.textContent = year;
  weekdayElement.textContent = weekday;
  month = monthElement.textContent;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `https://expense-tracker-mongo-t8fj.onrender.com/user/get-expense/${day}/${month}/${year}`,
      { headers: { Authorization: token } }
    );

    const expenses = response.data.expenses; // Assumes the API response contains an array of expenses
    const userexpense = document.getElementById("userexpense");
    expensesTillDay = response.data.expensesTillDay;

    userexpense.innerHTML = "";
    let credit = 0;
    let debit = 0;
    // Ensure credit and debit are treated as numbers
    expensesTillDay.forEach((expense) => {
      credit += Number(expense.credit) || 0; // Convert credit to a number, default to 0 if undefined/null
      debit += Number(expense.debit) || 0; // Convert debit to a number, default to 0 if undefined/null
    });
    let total = credit - debit;
    // console.log(total);
    // console.log("hello")
    document.getElementById("amount").innerHTML = total;
    // Loop through each expense and create a list item
    expenses.forEach((user) => {
      // Create a list item
      const listItem = document.createElement("li");

      // Create a <div> element with a class name
      const div = document.createElement("div");
      div.id = "cont";
      div.textContent = `date: ${user.day} ${user.month} ${user.year}`;
      const div2 = document.createElement("div");
      div2.textContent = `credit: ${user.credit}, debit: ${user.debit}, description: ${user.description}`;
      div2.className = "container mt-5>";
      div2.appendChild(div);

      // Append the <li> to the userexpense element

      // Create delete button
      const deleteButton = document.createElement("button");
      deleteButton.className = "deleteBtn"; // Add styles to make it circular and red
      // Add an icon inside the button
      const icon = document.createElement("i");
      icon.className = "fas fa-trash"; // Font Awesome class for trash icon
      deleteButton.appendChild(icon);
      // Attach the click event
      deleteButton.onclick = function () {
        deleteItem(user, listItem); // Call the delete function
      };

      const div3 = document.createElement("div");
      div3.className = "del-container";
      div3.appendChild(div2);
      div3.appendChild(deleteButton);
      listItem.appendChild(div3);

      userexpense.appendChild(listItem);
    });
  } catch (err) {
    console.error(err); // Handle errors from the API call
  }
}

//------------------------------------------------------------------------------------------------------------------

// Add functionality to navigate dates months years

function handleDateNavigation(days) {
  adjustDate(days);
}

function handleMonthNavigation(months) {
  adjustMonth(months);
}

function handleYearNavigation(years) {
  adjustYear(years);
}

function adjustDate(days) {
  const currentDate = new Date(dateInput.value || new Date());
  currentDate.setDate(currentDate.getDate() + days);
  dateInput.value = currentDate.toISOString().split("T")[0]; // Set the input value
  dateInput.dispatchEvent(new Event("change")); // Trigger the change event
}

function adjustMonth(months) {
  const currentDate = new Date(dateInput.value || new Date());
  currentDate.setMonth(currentDate.getMonth() + months);
  dateInput.value = currentDate.toISOString().split("T")[0]; // Set the input value
  dateInput.dispatchEvent(new Event("change")); // Trigger the change event
}

function adjustYear(years) {
  const currentDate = new Date(dateInput.value || new Date());
  currentDate.setFullYear(currentDate.getFullYear() + years);
  dateInput.value = currentDate.toISOString().split("T")[0]; // Set the input value
  dateInput.dispatchEvent(new Event("change")); // Trigger the change event
}

//-----------------------------------------------------------------------------------------------------------------------

// Get elements
const addButton = document.getElementById("addButton");
const popupForm = document.getElementById("popupForm");
const closePopup = document.getElementById("closePopup");

// Open popup
addButton.addEventListener("click", () => {
  popupForm.style.display = "flex";
});

// Close popup
closePopup.addEventListener("click", () => {
  popupForm.style.display = "none";
});

// Close popup when clicking outside the form
popupForm.addEventListener("click", (event) => {
  if (event.target === popupForm) {
    popupForm.style.display = "none";
  }
});

//-----------------------------------------------------------------------------------------------------------------------
document.getElementById("rzp-button1").onclick = async function (e) {
  try {
    const token = localStorage.getItem("token");
    console.log(token);
    const response = await axios.get(
      `https://expense-tracker-mongo-t8fj.onrender.com/purchase/premiummembership`,
      { headers: { Authorization: token } }
    );

    console.log(response);

    var options = {
      key: response.data.key_id, // Enter the Key ID generated from the Dashboard
      order_id: response.data.order.id, // For one-time payment
      handler: async function (response) {
        try {
          const res = await axios.post(
            `https://expense-tracker-mongo-t8fj.onrender.com/purchase/updatetransactionstatus`,
            {
              order_id: options.order_id,
              payment_id: response.razorpay_payment_id,
            },
            { headers: { Authorization: token } }
          );
          console.log(res, "payyyyyyyyyyyyyyyyyyyyyyyyyyyyed");

          notyf.success("YOU ARE A PREMIUM USER NOW!");
          localStorage.setItem("token", res.data.token);
          document.getElementById("rzp-button1").style.display = "none";
          document.getElementById("button-holder").style.display = "block";
        } catch (error) {
          console.error("Error updating transaction status:", error);
          notyf.error("transaction failed please try again !");
        }
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new Razorpay(options); // call back func passed
    rzp1.open();
    e.preventDefault();
  } catch (error) {
    console.error("Error during payment process:", error);
    alert("Something went wrong. Please try again.");
  }
};

async function isPremium() {
  const token = localStorage.getItem("token");
  const response = await axios.get(`https://expense-tracker-mongo-t8fj.onrender.com/purchase/isPremium`, {
    headers: { Authorization: token },
  });

  console.log(response.data.isPremium);
  if (response.data.isPremium) {
    document.getElementById("rzp-button1").style.display = "none";
    document.getElementById("button-holder").style.display = "block";
  } else {
    document.getElementById("rzp-button1").style.display = "block";
  }
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

async function leaderboard() {
  const token = localStorage.getItem("token");
  const decodedToken = parseJwt(token);

  if (decodedToken.isPremium == true) {
    const response = await axios.get(
      `https://expense-tracker-mongo-t8fj.onrender.com/purchase/leaderboard`,
      { headers: { Authorization: token } }
    );

    console.log(response.data);

    const leaderboard = response.data.leaderboard;
    const leaderboardContainer = document.getElementById("leaderboardScore");

    // Clear any existing content in the container
    leaderboardContainer.innerHTML = "";

    // Create a table and add classes
    const table = document.createElement("table");
    table.classList.add("leaderboard-table");

    // Create table headers
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th class="table-header">Username</th>
      <th class="table-header">Email</th>
      <th class="table-header">Total Expenses</th>
    `;
    table.appendChild(headerRow);

    // Add each user as a table row
    leaderboard.forEach((user) => {
      const row = document.createElement("tr");
      row.classList.add("table-row");
      row.innerHTML = `
        <td class="table-cell">${user.username}</td>
        <td class="table-cell">${user.email}</td>
        <td class="table-cell">₹${user.total}</td>
      `;
      table.appendChild(row);
    });

    // Append the table to the container
    leaderboardContainer.appendChild(table);
  } else {
    notyf.error("You are not a premium user");
  }
}

async function handleDownload() {
  const token = localStorage.getItem("token");
  // const decodedToken = parseJwt(token);

  // if (decodedToken.isPremium == true) {
  try {
    // Notify the user that the download is starting
    $.notify("Download started! Preparing your file...", "info");
    const response = await axios.get(`https://expense-tracker-mongo-t8fj.onrender.com/download`, {
      headers: { Authorization: token },
    });

    if (response.data.fileUrl) {
      // Automatically trigger download
      const link = document.createElement("a");
      link.href = response.data.fileUrl;
      link.download = "ExpensesReport.html"; // Default download filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Notify the user that the download is complete

      $.notify("Download complete! Your file has been saved.", "success");
    } else {
      // Notify the user that the file URL was not returned
      $.notify("Failed to fetch the file URL. Please try again.", "warn");
    }
  } catch (error) {
    console.error("Error during download:", error);

    // Notify the user about the error
  }
  // } else {
  //   notyf.error("you are not a premium user");
  // }
}

// Function to fetch and display downloads
async function displayDownloads() {
  const token = localStorage.getItem("token");
  const decodedToken = parseJwt(token);

  if (decodedToken.isPremium == true) {
    try {
      // Make a GET request to the '/get-download' route
      const response = await axios.get("https://expense-tracker-mongo-t8fj.onrender.com/get-downloads", {
        headers: { Authorization: token },
      });

      // Extract data from the response
      const downloads = response.data.downloads;

      // Select the download list element
      const downloadContainer = document.getElementById("downloadList");

      // Clear the current content
      downloadContainer.innerHTML = "";

      // Create a table and add classes for styling
      const table = document.createElement("table");
      table.classList.add("download-table");

      // Add table headers
      const headerRow = document.createElement("tr");
      headerRow.innerHTML = `
        <th>Download Link</th>
        <th>Downloaded On</th>
      `;
      table.appendChild(headerRow);

      // Append each download as a row in the table
      downloads.forEach((download) => {
        const row = document.createElement("tr");
        row.classList.add("download-row");

        // Format the createdAt date
        const rawDate = download.createdAt;
        const readableDate = rawDate
          ? new Date(rawDate).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })
          : "No Date";

        // Add table cells for the download link and date
        row.innerHTML = `
          <td><a href="${download.url || "#"}" target="_blank">Download</a></td>
          <td>${readableDate}</td>
        `;

        table.appendChild(row);
      });

      // Append the table to the container
      downloadContainer.appendChild(table);
    } catch (error) {
      console.error("Error fetching downloads:", error);
      alert("Failed to fetch downloads. Please try again.");
    }
  } else {
    notyf.error("You are not a premium user");
  }
}

