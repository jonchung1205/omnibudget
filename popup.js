document.addEventListener('DOMContentLoaded', function() {
    const budgetForm = document.getElementById('budgetForm');
    const budgetList = document.getElementById('budgetList');
    const spendingTable = document.getElementById('spendingTable').getElementsByTagName('tbody')[0];
    const totalSpending = document.getElementById('totalSpending');
    const currencySelect = document.getElementById('currency');
  
    let budgetItems = [];
  
    budgetForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const price = parseFloat(document.getElementById('price').value);
      const category = document.getElementById('category').value;
      const currency = currencySelect.value;
  
      const item = { name, price, category, currency };
      budgetItems.push(item);
      updateBudgetList();
      updateSpendingTable();
      budgetForm.reset();
    });
  
    function updateBudgetList() {
      budgetList.innerHTML = '';
      budgetItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'category';
        div.innerHTML = `${item.name} - ${item.price.toFixed(2)} ${item.currency} <span class="delete-btn" data-index="${index}">×</span>`;
        budgetList.appendChild(div);
      });
  
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const index = this.getAttribute('data-index');
          budgetItems.splice(index, 1);
          updateBudgetList();
          updateSpendingTable();
        });
      });
    }
  
    function updateSpendingTable() {
      spendingTable.innerHTML = '';
      const categoryTotals = budgetItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.price;
        return acc;
      }, {});
  
      let total = 0;
      for (const category in categoryTotals) {
        total += categoryTotals[category];
      }
  
      for (const category in categoryTotals) {
        const row = spendingTable.insertRow();
        row.insertCell(0).textContent = category;
        row.insertCell(1).textContent = categoryTotals[category].toFixed(2);
        row.insertCell(2).textContent = ((categoryTotals[category] / total) * 100).toFixed(2) + '%';
      }
  
      totalSpending.textContent = total.toFixed(2);
    }
  });
  