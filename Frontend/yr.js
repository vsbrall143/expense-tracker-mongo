function populateTable(data) {
    const tableBody = document
      .getElementById("expenseTable")
      .getElementsByTagName("tbody")[0];
  
    // Clear the table before adding rows
    tableBody.innerHTML = "";
  
    let Total=0;
    // Loop through the data and create rows
    data.forEach((item) => {
      const row = tableBody.insertRow();
      
      row.innerHTML = `
        <td>${item._id}</td>
        <td>${item.totalCredit }</td>
        <td>${item.totalDebit }</td>
        `;
        Total+=item.totalCredit-item.totalDebit;

    });

    document.getElementById("Total").innerHTML=Total;

  }
  


  async function handleYearChange() {
    const currentDate = new Date();

    const yearr = currentDate.getFullYear(); // Get the year (e.g., 2025)

    document.getElementById("year-list").innerHTML = "";
    const token = localStorage.getItem("token");
    const selectedDate = new Date(dateInput.value);
    var year = selectedDate.getFullYear();

    if (isNaN(year)) {
      year = yearr; // Use default year
    }

    yearElement.textContent = year;
    try {
      const response = await axios.get(
        `https://expense-tracker-mongo-t8fj.onrender.com/user/get-expenses/${year}`, // Use the year in the endpoint
        {
          headers: { Authorization: token },
        }
      );
      console.log("Response data:", response.data.expenses[0]);
      populateTable(response.data.expenses); // Use fetched data
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  }
  

  window.onload = function () {
    handleYearChange();
  };
  