import unittest
from unittest.mock import MagicMock, patch
import pandas as pd
from nav_service import NavService

class TestNavService(unittest.TestCase):
    def setUp(self):
        self.service = NavService()
        # Mock the internal Mftool object to avoid actual network calls
        self.service.obj = MagicMock()

    def test_search_funds(self):
        # Setup mock data
        self.service.obj.get_scheme_codes.return_value = {
            '1001': 'Axis Bluechip Fund',
            '1002': 'SBI Small Cap Fund',
            '1003': 'HDFC Top 100'
        }
        
        # Test search
        results = self.service.search_funds('Axis')
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['code'], '1001')
        self.assertEqual(results[0]['name'], 'Axis Bluechip Fund')
        
        # Test case insensitivity
        results_lower = self.service.search_funds('bluechip')
        self.assertEqual(len(results_lower), 1)

    def test_get_historical_nav(self):
        # Setup mock data
        mock_data = {
            'data': [
                {'date': '01-01-2023', 'nav': '100.50'},
                {'date': '02-01-2023', 'nav': '101.00'},
                {'date': '03-01-2023', 'nav': '99.50'},
            ]
        }
        self.service.obj.get_scheme_historical_nav.return_value = mock_data

        # Test fetching all (sanity check on format)
        data = self.service.get_historical_nav('1001')
        self.assertEqual(len(data), 3)
        # Check sort order (descending by date)
        self.assertEqual(data[0]['date'], '2023-01-03') # 3rd Jan
        self.assertEqual(data[1]['date'], '2023-01-02')

        # Test date filtering
        data_filtered = self.service.get_historical_nav('1001', start_date='2023-01-02', end_date='2023-01-02')
        self.assertEqual(len(data_filtered), 1)
        self.assertEqual(data_filtered[0]['date'], '2023-01-02')
        self.assertEqual(data_filtered[0]['nav'], 101.00)

if __name__ == '__main__':
    unittest.main()
