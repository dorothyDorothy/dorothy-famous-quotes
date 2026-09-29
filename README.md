# Wisdom100 - 100 Quotes Web Application

A responsive, modern web application built with **Python Flask**, **Vanilla JavaScript**, and **Semantic HTML5** to explore and discover 100 well-known quotes from history's most notable minds in Science, Philosophy, Literature, Technology, Leadership, Art, and Wisdom.

---

## Features

- **100 Curated Well-Known Quotes**: High quality quotes with author attributions, categories, and historical years.
- **Random Quote Generator**: Smooth hero card displaying a featured random quote with keyboard shortcuts (`Space` or `R`).
- **Real-Time Author & Keyword Search**: Debounced search input that queries both author names and quote text instantaneously.
- **Category Filter Pills**: Interactive pills with live counters for 10 distinct categories (Philosophy, Science, Technology, Literature, Leadership, Wisdom, Inspiration, Art, Humor, Life).
- **Interactive Card Gallery**: Click any card in the grid to immediately focus and highlight it in the hero display.
- **Dark / Light Theme Toggle**: Persistent theme preference saved in localStorage.
- **Clipboard & Share**: One-click copy with toast notification and social share intent.
- **RESTful API**: Clean Flask endpoints for integration into other tools or CLI queries.

---

## Directory Structure

```
quote-generator/
├── app.py                  # Flask backend & REST API endpoints
├── requirements.txt        # Python dependencies (flask)
├── test_app.py             # Automated test suite (13 test cases)
├── data/
│   └── quotes.json         # 100 curated quotes dataset
├── templates/
│   └── index.html          # HTML5 single-page application layout
└── static/
    ├── css/
    │   └── style.css       # CSS styling, variables, dark/light themes, animations
    └── js/
        └── app.js          # Pure vanilla JS (DOM, fetch, search, filters, toast)
```

---

## Quickstart

### 1. Navigate to the project directory
```bash
cd /home/dorothy/agy2-projects/quote-generator
```

### 2. Activate virtual environment
```bash
source venv/bin/activate
```

### 3. Run the Flask application
```bash
python app.py
```
By default, the server runs at `http://localhost:5000`.

---

## API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /` | `GET` | Serves the web application UI |
| `GET /api/quote/random` | `GET` | Returns a random quote (supports `?category=...`, `?author=...`, `?exclude_id=...`) |
| `GET /api/quotes` | `GET` | Filter/search quotes (`?search=...`, `?category=...`, `?author=...`) |
| `GET /api/quote/<id>` | `GET` | Retrieves a quote by ID |
| `GET /api/categories` | `GET` | Lists all 10 categories with quote counts |
| `GET /api/authors` | `GET` | Lists all 70 unique authors with quote counts |

---

## Running Automated Tests

Run the test suite with Python's built-in `unittest`:

```bash
venv/bin/python -m unittest test_app.py
```
All 13 unit tests test data integrity, category/author counts, and all API endpoints.
