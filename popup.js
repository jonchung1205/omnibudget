document.getElementById('budgetForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const name = document.getElementById('name').value;
    const price = parseFloat(document.getElementById('price').value);
    const category = document.getElementById('category').value;
  
    chrome.storage.local.get({budget: {}}, function(data) {
      const budget = data.budget;
  
      if (!budget[category]) {
        budget[category] = [];
      }
  
      budget[category].push({name, price});
      chrome.storage.local.set({budget}, function() {
        displayBudget();
      });
    });
  
    document.getElementById('budgetForm').reset();
  });
  
  document.getElementById('currency').addEventListener('change', displayBudget);
  
  function displayBudget() {
    const selectedCurrency = document.getElementById('currency').value;
    fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
      .then(response => response.json())
      .then(data => {
        const exchangeRate = data.rates[selectedCurrency];
        chrome.storage.local.get({budget: {}}, function(data) {
          const budget = data.budget;
          const budgetList = document.getElementById('budgetList');
          const totalSpendingCell = document.getElementById('totalSpending');
          const spendingTableBody = document.getElementById('spendingTable').querySelector('tbody');
          budgetList.innerHTML = '';
          spendingTableBody.innerHTML = '';
          let total = 0;
          const categoryTotals = {};
  
          for (const category in budget) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `<h2>${category}</h2>`;
  
            const items = budget[category];
            items.forEach((item, index) => {
              const itemDiv = document.createElement('div');
              const convertedPrice = item.price * exchangeRate;
              itemDiv.textContent = `${item.name}: ${selectedCurrency} ${formatNumber(convertedPrice)}`;
              total += convertedPrice;
  
              if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
              }
              categoryTotals[category] += convertedPrice;
  
              const deleteBtn = document.createElement('span');
              deleteBtn.textContent = 'Delete';
              deleteBtn.className = 'delete-btn';
              deleteBtn.addEventListener('click', function() {
                deletePurchase(category, index);
              });
  
              itemDiv.appendChild(deleteBtn);
              categoryDiv.appendChild(itemDiv);
            });
  
            budgetList.appendChild(categoryDiv);
          }
  
          totalSpendingCell.textContent = `${selectedCurrency} ${formatNumber(total)}`;
  
          for (const category in categoryTotals) {
            const row = document.createElement('tr');
            const categoryCell = document.createElement('td');
            categoryCell.textContent = category;
            const spendingCell = document.createElement('td');
            spendingCell.textContent = `${selectedCurrency} ${formatNumber(categoryTotals[category])}`;
            const percentageCell = document.createElement('td');
            const percentage = ((categoryTotals[category] / total) * 100).toFixed(2);
            percentageCell.textContent = `${percentage}%`;
            row.appendChild(categoryCell);
            row.appendChild(spendingCell);
            row.appendChild(percentageCell);
            spendingTableBody.appendChild(row);
          }
        });
      });
  }
  
  function deletePurchase(category, index) {
    chrome.storage.local.get({budget: {}}, function(data) {
      const budget = data.budget;
      if (budget[category]) {
        budget[category].splice(index, 1);
        if (budget[category].length === 0) {
          delete budget[category];
        }
        chrome.storage.local.set({budget}, function() {
          displayBudget();
        });
      }
    });
  }
  
  function formatNumber(number) {
    return new Intl.NumberFormat().format(number.toFixed(2));
  }
  
  document.addEventListener('DOMContentLoaded', displayBudget);
  