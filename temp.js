
let currentPage = 1;
let lastPage = 1;

  async function handleMonthChange() {
    document.getElementById('month-list').innerHTML = '';
 
    const selectedDate = new Date(document.getElementById('dateInput').value);
    var month = selectedDate.toLocaleString("default", { month: "long" });
    var year = selectedDate.getFullYear();

  // Check for invalid date and handle it (optional)
  if (isNaN(year)) {
    month = "February";
    year = 2024; // Use default year
  }

    yearElement.textContent = year;
    monthElement.textContent = `${month},`;
    month=monthElement.textContent;

    loadPage(month, year, currentPage);
  }

  async function loadPage(month, year, page) {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:3000/user/get-expenses/${month}/${year}/${page}`, {
        headers: { "Authorization": token }
      });

      const monthList = document.getElementById('month-list');
      monthList.innerHTML = '';

      let credit = 0;
      let debit = 0;

     response.data.users.forEach((expense) => {
      credit += Number(expense.credit) || 0; // Convert credit to a number, default to 0 if undefined/null
      debit += Number(expense.debit) || 0; // Convert debit to a number, default to 0 if undefined/null
    });
    let total = credit - debit;
 
    document.getElementById("amount").innerHTML=total;

    for (let i = 0; i < response.data.users.length; i++) {
      const user = response.data.users[i];

      // Create list item and populate content
      const listItem = document.createElement('li');
      const div = document.createElement('div');
      div.id = "cont";
      div.textContent = `date: ${user.day} ${user.month} ${user.year}`;
      const div2 = document.createElement('div');
      div2.textContent = ` credit: ${user.credit}, debit: ${user.debit}, description: ${user.description}`;
      div2.className = 'container mt-5>';
      div2.appendChild(div);
      listItem.appendChild(div2);

      // Append to the month list
      monthList.appendChild(listItem);
    }

      currentPage = response.data.currentPage;
      lastPage = response.data.lastPage;

      document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${lastPage}`;
      document.getElementById('prevBtn').disabled = !response.data.hasPreviousPage;
      document.getElementById('nextBtn').disabled = !response.data.hasNextPage;
    } catch (err) {
      console.error(err);
    }
  }

  function changePage(direction) {
    const token = localStorage.getItem('token');
    const selectedDate = new Date(document.getElementById('dateInput').value);
    const month = selectedDate.toLocaleString("default", { month: "long" });
    const year = selectedDate.getFullYear();

    currentPage += direction;
    loadPage(month, year, currentPage);
  }


 

