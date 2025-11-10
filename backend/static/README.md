# Family Expense Tracker

A lightweight expense tracking dashboard for families built with plain HTML, JavaScript, and CSS.

## Features

✅ **Add/Delete Expenses** - Track all your family expenses with amounts, dates, descriptions, and family members
✅ **Dynamic Categories** - Add and delete expense categories as needed
✅ **Dashboard Summary** - View total expenses, monthly expenses, and record counts at a glance
✅ **Filter & Search** - Filter expenses by category, member, and date range
✅ **Visual Charts** - See expenses breakdown by category with interactive bar charts
✅ **JSON File Storage** - All data stored in a simple JSON file on the server
✅ **Responsive Design** - Works perfectly on desktop and mobile devices

## Project Structure

```
/app/backend/
├── server.py              # FastAPI backend server
├── expenses_data.json     # JSON data storage file
└── static/
    ├── index.html         # Main HTML page
    ├── styles.css         # CSS styling
    ├── app.js             # JavaScript functionality
    └── README.md          # This file
```

## How It Works

1. **Backend (FastAPI)**: Lightweight Python server that provides REST API endpoints for CRUD operations
2. **Frontend (Plain HTML/JS)**: Single page application with vanilla JavaScript - no frameworks needed
3. **Storage (JSON)**: All expenses and categories stored in `expenses_data.json` file

## API Endpoints

- `GET /api/data` - Get all expenses and categories
- `POST /api/expenses` - Add a new expense
- `DELETE /api/expenses/{id}` - Delete an expense
- `POST /api/categories` - Add a new category
- `DELETE /api/categories/{name}` - Delete a category

## Running the Application

### Option 1: With FastAPI Backend (Current Setup)
The app is already running at `http://localhost:8001`

To restart the backend:
```bash
sudo supervisorctl restart backend
```

### Option 2: As Static Files (WWW Folder)

To use this as pure static files, you have two options:

**A. With the Python Backend:**
1. Copy all files from `/app/backend/static/` to your web server's www folder
2. Make sure the FastAPI backend is running to handle API calls
3. Access via `index.html`

**B. Modify for Pure Client-Side (LocalStorage):**
To make it work without a backend server, modify `app.js` to use browser LocalStorage instead of API calls:

```javascript
// Replace API calls with LocalStorage
function loadData() {
    const data = localStorage.getItem('expensesData');
    if (data) {
        allData = JSON.parse(data);
    } else {
        allData = {
            categories: ["Rent", "Electricity", "Groceries", "Transport", "Entertainment"],
            expenses: []
        };
    }
    filteredExpenses = [...allData.expenses];
    updateUI();
}

function saveData() {
    localStorage.setItem('expensesData', JSON.stringify(allData));
}
```

## Data Storage

All expense data is stored in `/app/backend/expenses_data.json`:

```json
{
  "categories": ["Rent", "Electricity", "Groceries", ...],
  "expenses": [
    {
      "id": "1",
      "amount": 1000.0,
      "category": "Rent",
      "date": "2025-11-10",
      "description": "Monthly rent payment",
      "member": "John"
    }
  ]
}
```

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python FastAPI
- **Storage**: JSON file
- **Fonts**: Google Fonts (Space Grotesk, Inter)
- **Icons**: Font Awesome 6.5.1

## Customization

### Change Colors
Edit the gradient colors in `styles.css`:
```css
.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Add More Categories
1. Click "Manage Categories" button
2. Enter new category name
3. Click "Add" button

### Modify Summary Cards
Edit the summary cards section in `index.html` and update calculations in `app.js`

## Screenshots

- Clean, modern dashboard with gradient cards
- Easy-to-use expense form with date picker
- Category management modal
- Filterable expense table
- Visual category breakdown chart

## Support

For issues or questions, check the logs:
```bash
tail -n 50 /var/log/supervisor/backend.*.log
```

## License

Free to use for personal and family expense tracking.
