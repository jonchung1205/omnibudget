document.addEventListener('DOMContentLoaded', function() {
    const budgetForm = document.getElementById('budgetForm');
    const budgetList = document.getElementById('budgetList');
    const spendingTable = document.getElementById('spendingTable').getElementsByTagName('tbody')[0];
    const totalSpending = document.getElementById('totalSpending');
    const currencySelect = document.getElementById('currency');
    const newBudgetBtn = document.getElementById('newBudgetBtn');
    const savedBudgetsSelect = document.getElementById('savedBudgets');
    const currentBudgetNameElement = document.getElementById('currentBudgetName');

    let budgetItems = JSON.parse(localStorage.getItem('budgetItems')) || [];
    let savedBudgets = JSON.parse(localStorage.getItem('savedBudgets')) || [];
    let currentBudgetName = 'Default Budget';
    let exchangeRates = {};
    let selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';

    // Set the currency select to the saved currency
    currencySelect.value = selectedCurrency;

    // Fetch exchange rates
    async function fetchExchangeRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            exchangeRates = data.rates;
            updateBudgetList();
            updateSpendingTable();
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
        }
    }

    fetchExchangeRates();
    setInterval(fetchExchangeRates, 3600000); // Refresh exchange rates every hour

    newBudgetBtn.addEventListener('click', function() {
        const budgetName = prompt('Enter a name for your new budget:');
        if (budgetName) {
            // Save the current budget if there are items in it
            if (budgetItems.length > 0) {
                saveCurrentBudget();
            }
            currentBudgetName = budgetName;
            budgetItems = [];
            saveCurrentBudget();  // Save the new budget immediately after creating it
            loadSavedBudgets();  // Reload the saved budgets into the dropdown
            updateCurrentBudgetName();  // Update the display of the current budget name
            updateBudgetList();  // Update the budget list for the new budget
            updateSpendingTable();  // Update the spending table for the new budget
            alert(`New budget '${budgetName}' created!`);
        }
    });

    budgetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const price = parseFloat(document.getElementById('price').value);
        const category = document.getElementById('category').value;
        const currency = currencySelect.value;

        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price.');
            return;
        }

        const item = { name, price, category, currency };
        budgetItems.push(item);
        localStorage.setItem('budgetItems', JSON.stringify(budgetItems));
        updateBudgetList();
        updateSpendingTable();
        budgetForm.reset();
    });

    currencySelect.addEventListener('change', function() {
        selectedCurrency = currencySelect.value;
        localStorage.setItem('selectedCurrency', selectedCurrency);
        updateBudgetList();
        updateSpendingTable();
    });

    function loadSavedBudgets() {
        const savedBudgetsList = document.getElementById('savedBudgetsList');
        savedBudgetsList.innerHTML = ''; // Clear the list
    
        savedBudgets.forEach((budget, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    
            const budgetNameSpan = document.createElement('span');
            budgetNameSpan.textContent = budget.name;
            budgetNameSpan.style.cursor = 'pointer';
            budgetNameSpan.onclick = function() {
                loadBudget(budget.name);
            };
    
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.onclick = function(event) {
                event.stopPropagation(); // Prevent the list item from being selected
                deleteSavedBudget(budget.name);
            };
    
            listItem.appendChild(budgetNameSpan);
            listItem.appendChild(deleteBtn);
            savedBudgetsList.appendChild(listItem);
        });
    }
    
    function loadBudget(budgetName) {
        const selectedBudget = savedBudgets.find(budget => budget.name === budgetName);
        if (selectedBudget) {
            budgetItems = selectedBudget.items;
            currentBudgetName = selectedBudget.name;
            updateCurrentBudgetName();  // Update the display of the current budget name
            updateBudgetList();  // Update the budget list for the selected budget
            updateSpendingTable();  // Update the spending table for the selected budget
        }
    }
    
    function saveCurrentBudget() {
        const existingBudgetIndex = savedBudgets.findIndex(budget => budget.name === currentBudgetName);
        if (existingBudgetIndex !== -1) {
            savedBudgets[existingBudgetIndex].items = budgetItems;
        } else {
            savedBudgets.push({ name: currentBudgetName, items: budgetItems });
        }
        localStorage.setItem('savedBudgets', JSON.stringify(savedBudgets));
    }
    
    function deleteSavedBudget(budgetName) {
        savedBudgets = savedBudgets.filter(budget => budget.name !== budgetName);
        localStorage.setItem('savedBudgets', JSON.stringify(savedBudgets));
        
        // Only reset the currentBudgetName if the deleted budget was the current one
        if (currentBudgetName === budgetName) {
            currentBudgetName = ''; // Set this to an empty string or another appropriate value
            budgetItems = [];
        }
        loadSavedBudgets();
        updateBudgetList();
        updateSpendingTable();
    }
    
    function updateBudgetList() {
        budgetList.innerHTML = '';
        const categories = {};

        budgetItems.forEach((item, index) => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            const convertedPrice = exchangeRates[item.currency] ? 
                (item.price / exchangeRates[item.currency]) * exchangeRates[selectedCurrency] : 
                item.price;
            categories[item.category].push({ ...item, price: convertedPrice, index });
        });

        for (const category in categories) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `<h3>${category}</h3>`;
            categories[category].forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.innerHTML = `${item.name} - ${formatNumber(item.price)} ${selectedCurrency} <span class="delete-btn" data-index="${item.index}" style="color: red; cursor: pointer;">Delete</span>`;
                categoryDiv.appendChild(itemDiv);
            });
            budgetList.appendChild(categoryDiv);
        }

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                budgetItems.splice(index, 1);
                localStorage.setItem('budgetItems', JSON.stringify(budgetItems));
                updateBudgetList();
                updateSpendingTable();
            });
        });
    }

    function updateCurrentBudgetName() {
        currentBudgetNameElement.textContent = currentBudgetName || 'Default Budget';
    }

    function updateSpendingTable() {
        spendingTable.innerHTML = '';
        const categoryTotals = budgetItems.reduce((acc, item) => {
            const convertedPrice = exchangeRates[item.currency] ? 
                (item.price / exchangeRates[item.currency]) * exchangeRates[selectedCurrency] : 
                item.price;
            acc[item.category] = (acc[item.category] || 0) + convertedPrice;
            return acc;
        }, {});

        let total = 0;
        for (const category in categoryTotals) {
            total += categoryTotals[category];
        }

        for (const category in categoryTotals) {
            const row = spendingTable.insertRow();
            row.insertCell(0).textContent = category;
            row.insertCell(1).textContent = formatNumber(categoryTotals[category]);
            row.insertCell(2).textContent = ((categoryTotals[category] / total) * 100).toFixed(2) + '%';
        }

        totalSpending.textContent = formatNumber(total);
    }

    function formatNumber(num) {
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    loadSavedBudgets();  // Load the saved budgets when the page loads
    updateCurrentBudgetName();  // Display the current budget name when the page loads
    updateBudgetList();  // Display the items of the current budget
    updateSpendingTable();  // Display the spending summary for the current budget
});
