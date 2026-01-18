// STANDALONE SCRIPT WITH MOCKED BACKEND
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

    // --- MOCK DATA ---
    const MOCK_FUNDS = [
        { code: '120503', name: 'Axis Bluechip Fund - Direct Plan - Growth' },
        { code: '118989', name: 'HDFC Top 100 Fund - Direct Plan - Growth Option' },
        { code: '125497', name: 'SBI Small Cap Fund - Direct Plan - Growth' },
        { code: '100033', name: 'Aditya Birla Sun Life Frontline Equity Fund - Direct Plan - Growth' }
    ];

    const MOCK_HISTORY = [
        { date: '2023-10-25', nav: '54.23' },
        { date: '2023-10-24', nav: '54.89' },
        { date: '2023-10-23', nav: '55.12' },
        { date: '2023-10-20', nav: '55.01' },
        { date: '2023-10-19', nav: '54.78' },
        { date: '2023-10-18', nav: '54.65' },
    ];

    // Search Input Mock
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        clearTimeout(debounceTimer);

        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        debounceTimer = setTimeout(() => {
            // Mock API Search
            const results = MOCK_FUNDS.filter(f => f.name.toLowerCase().includes(query));
            renderSearchResults(results);
        }, 300);
    });

    function renderSearchResults(results) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.textContent = 'No results found (Mock)';
            searchResults.appendChild(div);
            searchResults.classList.remove('hidden');
            return;
        }

        results.slice(0, 50).forEach(fund => {
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

    function selectFund(fund) {
        selectedSchemeCode = fund.code;
        selectedSchemeName = fund.name;

        fundNameEl.textContent = fund.name;
        fundCodeEl.textContent = fund.code;

        searchInput.value = '';
        searchResults.classList.add('hidden');
        searchInput.closest('.form-group').classList.add('hidden');
        selectedFundDisplay.classList.remove('hidden');

        checkInputs();
    }

    clearFundBtn.addEventListener('click', () => {
        selectedSchemeCode = null;
        selectedSchemeName = null;

        selectedFundDisplay.classList.add('hidden');
        searchInput.closest('.form-group').classList.remove('hidden');
        searchInput.focus();

        dataCard.classList.add('hidden');
        checkInputs();
    });

    startDateInput.addEventListener('change', checkInputs);
    endDateInput.addEventListener('change', checkInputs);

    function checkInputs() {
        const isValid = selectedSchemeCode !== null;
        getDataBtn.disabled = !isValid;
        downloadBtn.disabled = !isValid;
    }

    // Get Data Mock
    getDataBtn.addEventListener('click', () => {
        if (!selectedSchemeCode) return;

        getDataBtn.textContent = 'Loading...';
        getDataBtn.disabled = true;

        // Simulate network delay
        setTimeout(() => {
            renderTable(MOCK_HISTORY);
            getDataBtn.textContent = 'Get Data (Mock)';
            getDataBtn.disabled = false;
        }, 800);
    });

    function renderTable(data) {
        tableBody.innerHTML = '';
        recordCount.textContent = `${data.length} records`;

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.date}</td>
                <td>₹${row.nav}</td>
            `;
            tableBody.appendChild(tr);
        });

        dataCard.classList.remove('hidden');
    }

    // Download CSV Mock
    downloadBtn.addEventListener('click', () => {
        alert("This is a mock download. In the real app, this downloads a CSV file.");
    });

    // Set default end date
    const today = new Date().toISOString().split('T')[0];
    endDateInput.value = today;
});
