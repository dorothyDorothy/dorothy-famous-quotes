import json
import os
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'quotes.json')

def load_quotes():
    """Load quotes from the JSON data file."""
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

QUOTES = load_quotes()

@app.route('/')
def index():
    """Render the main single page quote generator application."""
    return render_template('index.html')

@app.route('/api/quote/random', methods=['GET'])
def get_random_quote():
    """Return a random quote, optionally filtered by category or author."""
    category = request.args.get('category', '').strip().lower()
    author = request.args.get('author', '').strip().lower()
    exclude_id = request.args.get('exclude_id', type=int)

    filtered = QUOTES

    if category and category != 'all':
        filtered = [q for q in filtered if q['category'].lower() == category]

    if author:
        filtered = [q for q in filtered if author in q['author'].lower()]

    if not filtered:
        return jsonify({
            'error': 'No quotes found matching the specified criteria',
            'quote': None,
            'total_available': 0
        }), 404

    # If possible, don't return the same quote twice consecutively
    candidates = filtered
    if exclude_id and len(filtered) > 1:
        candidates = [q for q in filtered if q['id'] != exclude_id] or filtered

    chosen = random.choice(candidates)
    return jsonify({
        'quote': chosen,
        'total_available': len(filtered)
    })

@app.route('/api/quotes', methods=['GET'])
def get_quotes():
    """Search and filter quotes by text, author, and/or category."""
    category = request.args.get('category', '').strip().lower()
    author = request.args.get('author', '').strip().lower()
    search = request.args.get('search', '').strip().lower()

    results = QUOTES

    if category and category != 'all':
        results = [q for q in results if q['category'].lower() == category]

    if author:
        results = [q for q in results if author in q['author'].lower()]

    if search:
        results = [
            q for q in results
            if search in q['quote'].lower() or search in q['author'].lower() or search in q['category'].lower()
        ]

    return jsonify({
        'quotes': results,
        'total': len(results)
    })

@app.route('/api/quote/<int:quote_id>', methods=['GET'])
def get_quote_by_id(quote_id):
    """Retrieve a single quote by its ID."""
    quote = next((q for q in QUOTES if q['id'] == quote_id), None)
    if not quote:
        return jsonify({'error': f'Quote with ID {quote_id} not found'}), 404
    return jsonify({'quote': quote})

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Return a list of all distinct categories with counts."""
    category_counts = {}
    for q in QUOTES:
        cat = q['category']
        category_counts[cat] = category_counts.get(cat, 0) + 1

    sorted_categories = [
        {'name': cat, 'count': count}
        for cat, count in sorted(category_counts.items(), key=lambda x: x[0])
    ]
    return jsonify({
        'categories': sorted_categories,
        'total_categories': len(sorted_categories)
    })

@app.route('/api/authors', methods=['GET'])
def get_authors():
    """Return a list of distinct authors with quote counts."""
    author_counts = {}
    for q in QUOTES:
        author = q['author']
        author_counts[author] = author_counts.get(author, 0) + 1

    sorted_authors = [
        {'name': author, 'count': count}
        for author, count in sorted(author_counts.items(), key=lambda x: x[0])
    ]
    return jsonify({
        'authors': sorted_authors,
        'total_authors': len(sorted_authors)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
