document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const searchInput = document.getElementById('fund-search');
    const searchResults = document.getElementById('search-results');
    const selectedFundDisplay = document.getElementById('selected-fund-display');
    const fundNameEl = document.getElementById('fund-name');
    const fundCodeEl = document.getElementById('fund-code');
    const clearFundBtn = document.getElementById('clear-fund');

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    const getDataBtn = document.getElementById('get-data-btn');
    const downloadBtn = document.getElementById('download-btn');

    const dataCard = document.getElementById('data-card');
    const tableBody = document.querySelector('#nav-table tbody');
    const recordCount = document.getElementById('record-count');

    // State
    let selectedSchemeCode = null;
    let selectedSchemeName = null;
    let debounceTimer;

    // Search Input Handler
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        clearTimeout(debounceTimer);

        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchSearch(query);
        }, 300);
    });

    // Fetch Search Results
    async function fetchSearch(query) {
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            renderSearchResults(data);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    // Render Search Results
    function renderSearchResults(results) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.classList.add('hidden');
            return;
        }

        results.slice(0, 50).forEach(fund => { // Limit to 50 results
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <span class="name">${fund.name}</span>
                <span class="code">${fund.code}</span>
            `;
            div.addEventListener('click', () => selectFund(fund));
            searchResults.appendChild(div);
        });

        searchResults.classList.remove('hidden');
    }

    // Select Fund
    function selectFund(fund) {
        selectedSchemeCode = fund.code;
        selectedSchemeName = fund.name;

        fundNameEl.textContent = fund.name;
        fundCodeEl.textContent = fund.code;

        searchInput.value = '';
        searchResults.classList.add('hidden');
        searchInput.closest('.form-group').classList.add('hidden'); // Hide search input
        selectedFundDisplay.classList.remove('hidden');

        checkInputs();
    }

    // Clear Selection
    clearFundBtn.addEventListener('click', () => {
        selectedSchemeCode = null;
        selectedSchemeName = null;

        selectedFundDisplay.classList.add('hidden');
        searchInput.closest('.form-group').classList.remove('hidden');
        searchInput.focus();

        dataCard.classList.add('hidden');
        checkInputs();
    });

    // Inputs Change
    startDateInput.addEventListener('change', checkInputs);
    endDateInput.addEventListener('change', checkInputs);

    function checkInputs() {
        const isValid = selectedSchemeCode !== null;
        // Dates are optional, but if present, button enabled
        getDataBtn.disabled = !isValid;
        downloadBtn.disabled = !isValid;
    }

    // Get Data
    getDataBtn.addEventListener('click', async () => {
        if (!selectedSchemeCode) return;

        getDataBtn.textContent = 'Loading...';
        getDataBtn.disabled = true;

        try {
            let url = `/api/history?code=${selectedSchemeCode}`;
            if (startDateInput.value) url += `&start=${startDateInput.value}`;
            if (endDateInput.value) url += `&end=${endDateInput.value}`;

            const res = await fetch(url);
            const data = await res.json();

            renderTable(data);
        } catch (error) {
            console.error('Fetch data error:', error);
            alert('Error fetching data');
        } finally {
            getDataBtn.textContent = 'Get Data';
            getDataBtn.disabled = false;
        }
    });

    // Render Table
    function renderTable(data) {
        tableBody.innerHTML = '';

        if (!data || data.length === 0) {
            recordCount.textContent = '0 records';
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="2" style="text-align:center">No data found for selected range</td>';
            tableBody.appendChild(tr);
        } else {
            recordCount.textContent = `${data.length} records`;
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.date}</td>
                    <td>₹${row.nav}</td>
                `;
                tableBody.appendChild(tr);
            });
        }

        dataCard.classList.remove('hidden');
    }

    // Download CSV
    downloadBtn.addEventListener('click', () => {
        if (!selectedSchemeCode) return;

        let url = `/download?code=${selectedSchemeCode}&name=${encodeURIComponent(selectedSchemeName)}`;
        if (startDateInput.value) url += `&start=${startDateInput.value}`;
        if (endDateInput.value) url += `&end=${endDateInput.value}`;

        window.location.href = url;
    });

    // Set default end date to today
    const today = new Date().toISOString().split('T')[0];
    endDateInput.value = today;
});
