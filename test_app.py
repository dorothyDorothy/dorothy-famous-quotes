import json
import unittest
from app import app, QUOTES

class QuoteAppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        self.client.testing = True

    def test_quotes_data_integrity(self):
        """Verify that exactly 100 quotes exist and conform to the schema."""
        self.assertEqual(len(QUOTES), 100, f"Expected 100 quotes, found {len(QUOTES)}")
        ids = set()
        for q in QUOTES:
            self.assertIn('id', q)
            self.assertIn('quote', q)
            self.assertIn('author', q)
            self.assertIn('category', q)
            self.assertTrue(len(q['quote'].strip()) > 0)
            self.assertTrue(len(q['author'].strip()) > 0)
            self.assertTrue(len(q['category'].strip()) > 0)
            self.assertNotIn(q['id'], ids, f"Duplicate ID: {q['id']}")
            ids.add(q['id'])
        self.assertEqual(len(ids), 100)

    def test_index_route(self):
        """Verify that the home route serves the HTML page."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Wisdom100', response.data)
        self.assertIn(b'id="heroQuoteCard"', response.data)

    def test_random_quote(self):
        """Verify the random quote endpoint."""
        response = self.client.get('/api/quote/random')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('quote', data)
        self.assertIsNotNone(data['quote'])
        self.assertEqual(data['total_available'], 100)

    def test_random_quote_filtered_by_category(self):
        """Verify random quote with category filter."""
        response = self.client.get('/api/quote/random?category=Philosophy')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['quote']['category'], 'Philosophy')

    def test_random_quote_filtered_by_author(self):
        """Verify random quote with author filter."""
        response = self.client.get('/api/quote/random?author=Einstein')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('Einstein', data['quote']['author'])

    def test_random_quote_exclude_id(self):
        """Verify exclude_id parameter."""
        response = self.client.get('/api/quote/random?category=Philosophy&exclude_id=3')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertNotEqual(data['quote']['id'], 3)

    def test_get_all_quotes(self):
        """Verify fetching all quotes without filters returns all 100."""
        response = self.client.get('/api/quotes')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['total'], 100)
        self.assertEqual(len(data['quotes']), 100)

    def test_filter_quotes_by_category(self):
        """Verify filtering quotes by category."""
        response = self.client.get('/api/quotes?category=Science')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['total'] > 0)
        for q in data['quotes']:
            self.assertEqual(q['category'].lower(), 'science')

    def test_filter_quotes_by_author(self):
        """Verify searching quotes by author."""
        response = self.client.get('/api/quotes?author=Jobs')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['total'] > 0)
        for q in data['quotes']:
            self.assertIn('Jobs', q['author'])

    def test_filter_quotes_by_search_keyword(self):
        """Verify full-text search across quotes and authors."""
        response = self.client.get('/api/quotes?search=impossible')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['total'] >= 1)
        found = any('impossible' in q['quote'].lower() for q in data['quotes'])
        self.assertTrue(found)

    def test_get_categories(self):
        """Verify category listing and counts."""
        response = self.client.get('/api/categories')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('categories', data)
        total_count = sum(c['count'] for c in data['categories'])
        self.assertEqual(total_count, 100)

    def test_get_authors(self):
        """Verify authors listing and counts."""
        response = self.client.get('/api/authors')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('authors', data)
        total_count = sum(a['count'] for a in data['authors'])
        self.assertEqual(total_count, 100)

    def test_get_quote_by_id(self):
        """Verify single quote retrieval by ID."""
        response = self.client.get('/api/quote/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['quote']['id'], 1)
        self.assertEqual(data['quote']['author'], 'Steve Jobs')

        # Test non-existent ID
        response_404 = self.client.get('/api/quote/9999')
        self.assertEqual(response_404.status_code, 404)

if __name__ == '__main__':
    unittest.main()
