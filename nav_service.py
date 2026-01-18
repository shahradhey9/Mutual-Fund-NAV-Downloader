from mftool import Mftool
import pandas as pd
import json

class NavService:
    def __init__(self):
        self.obj = Mftool()
        # Cache scheme codes to avoid fetching on every search if possible, 
        # but mftool is fast enough for basic usage.
        self._scheme_codes = None

    def get_all_schemes(self):
        if self._scheme_codes is None:
            self._scheme_codes = self.obj.get_scheme_codes()
        return self._scheme_codes

    def search_funds(self, keyword):
        """
        Search for funds matching the keyword.
        Returns a list of dicts: {'code': '...', 'name': '...'}
        """
        schemes = self.get_all_schemes()
        results = []
        keyword = keyword.lower()
        
        for code, name in schemes.items():
            if keyword in name.lower():
                results.append({'code': code, 'name': name})
        
        return results

    def get_historical_nav(self, scheme_code, start_date=None, end_date=None):
        """
        Fetch historical NAV data.
        mftool expects dates only if we want a range, otherwise likely returns all or recent.
        Note: mftool date format is often DD-MM-YYYY inside the library depending on method,
        but get_scheme_historical_nav usually takes no args for full history or specific args.
        Let's check specific mftool usage.
        Actually, get_scheme_historical_nav(code) returns full json.
        We can filter it ourselves or check if library supports range.
        Standard mftool library usage is `get_scheme_historical_nav(code)`.
        It returns a dictionary {'data': [...], ...}
        """
        try:
            # Fetch all data as mftool implementation for history is often just "get all"
            data = self.obj.get_scheme_historical_nav(scheme_code)
            
            if not data or 'data' not in data:
                return []

            nav_list = data['data']
            # nav_list is list of dicts: {'date': 'dd-mm-yyyy', 'nav': '...'}

            # Convert to dataframe for easier filtering if dates are provided
            df = pd.DataFrame(nav_list)
            df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y')
            df['nav'] = pd.to_numeric(df['nav'])

            if start_date:
                start = pd.to_datetime(start_date)
                df = df[df['date'] >= start]
            
            if end_date:
                end = pd.to_datetime(end_date)
                df = df[df['date'] <= end]

            # Sort by date descending
            df = df.sort_values(by='date', ascending=False)

            # Convert back to list of dicts with string dates for JSON response
            # Format: YYYY-MM-DD for consistency
            result = []
            for _, row in df.iterrows():
                result.append({
                    'date': row['date'].strftime('%Y-%m-%d'),
                    'nav': row['nav']
                })
            
            return result

        except Exception as e:
            print(f"Error fetching NAV for {scheme_code}: {e}")
            return []

if __name__ == "__main__":
    # Test
    service = NavService()
    print("Searching for 'Axis Bluechip'...")
    res = service.search_funds("Axis Bluechip")
    print(res[:3])
    
    if res:
        code = res[0]['code']
        print(f"Fetching history for {code}...")
        hist = service.get_historical_nav(code)
        print(f"Found {len(hist)} records. First: {hist[0]}")
