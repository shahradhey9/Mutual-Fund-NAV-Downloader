from flask import Flask, render_template, request, jsonify, Response
from nav_service import NavService
import pandas as pd
import io

app = Flask(__name__)
# Initialize service
nav_service = NavService()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/search')
def search():
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    results = nav_service.search_funds(query)
    return jsonify(results)

@app.route('/api/history')
def history():
    code = request.args.get('code')
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    
    if not code:
        return jsonify({'error': 'Scheme code required'}), 400
        
    data = nav_service.get_historical_nav(code, start_date, end_date)
    return jsonify(data)

@app.route('/download')
def download():
    code = request.args.get('code')
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    name = request.args.get('name', 'fund_data')
    
    if not code:
        return "Scheme code required", 400
        
    data = nav_service.get_historical_nav(code, start_date, end_date)
    
    if not data:
        return "No data found", 404
        
    # Create CSV
    df = pd.DataFrame(data)
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    
    return Response(
        csv_buffer.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename={name}_nav_history.csv"}
    )

if __name__ == '__main__':
    app.run(debug=True, port=5000)
