document.addEventListener('DOMContentLoaded', function() {
    const budgetForm = document.getElementById('budgetForm');
    const budgetList = document.getElementById('budgetList');
    const spendingTable = document.getElementById('spendingTable').getElementsByTagName('tbody')[0];
    const totalSpending = document.getElementById('totalSpending');
    const currencySelect = document.getElementById('currency');

    let budgetItems = JSON.parse(localStorage.getItem('budgetItems')) || [];
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

    budgetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const price = parseFloat(document.getElementById('price').value);
        const category = document.getElementById('category').value;
        const currency = currencySelect.value;

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

    function updateBudgetList() {
        budgetList.innerHTML = '';
        const categories = {};

        budgetItems.forEach((item, index) => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            const convertedPrice = (item.price / exchangeRates[item.currency]) * exchangeRates[selectedCurrency];
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

    function updateSpendingTable() {
        spendingTable.innerHTML = '';
        const categoryTotals = budgetItems.reduce((acc, item) => {
            const convertedPrice = (item.price / exchangeRates[item.currency]) * exchangeRates[selectedCurrency];
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

    fetchExchangeRates();
    setInterval(fetchExchangeRates, 3600000)
    updateBudgetList();
    updateSpendingTable();
});
