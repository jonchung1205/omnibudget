# OmniBudget

A Chrome extension for personal budget tracking with real-time currency conversion and expense management.

## Features

- **Budget Setting & Tracking**: Set daily, weekly, or monthly budgets and track spending in real-time
- **Multi-Currency Support**: Automatic currency conversion using live exchange rates
- **Expense Categorization**: Organize expenses by category for better financial insights
- **Quick Entry**: Add expenses directly from your browser without switching tabs
- **Visual Indicators**: Color-coded budget status to quickly see spending progress

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **APIs**: Currency conversion API for real-time exchange rates
- **Platform**: Chrome Extension (Manifest V3)

## Installation

1. Clone the repository
```bash
git clone https://github.com/jonchung1205/omnibudget.git
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the project directory

5. The OmniBudget extension should now appear in your Chrome toolbar

## Usage

1. Click the OmniBudget icon in your Chrome toolbar
2. Set your budget amount and time period
3. Add expenses as you spend throughout the day
4. View your remaining budget and spending patterns

## Project Structure

```
omnibudget/
├── manifest.json          # Extension configuration
├── popup.html            # Main interface
├── popup.js              # Frontend logic
├── background.js         # Service worker
├── contentScript.js      # Content script functionality
├── styles.css            # Styling
└── README.md            # Project documentation
```

## Future Enhancements

- Data export functionality
- Spending analytics and trends
- Budget goal setting and notifications
- Integration with banking APIs
