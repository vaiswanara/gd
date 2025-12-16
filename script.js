document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    document.getElementById('donate-btn').addEventListener('click', () => {
        document.getElementById('bank-details').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

async function fetchData() {
    try {
        // Fetch the text file
        const response = await fetch('data.txt');
        if (!response.ok) throw new Error("Failed to load data.txt");
        const text = await response.text();
        processData(text);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('month-display').innerText = "Data unavailable";
    }
}

function processData(csvText) {
    const lines = csvText.trim().split('\n');
    const data = [];
    
    // Parse CSV (Skip header line 0)
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 4) {
            data.push({
                year: parseInt(parts[0].trim()),
                month: parseInt(parts[1].trim()),
                required: parseInt(parts[2].trim()),
                received: parseInt(parts[3].trim())
            });
        }
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JS months are 0-11, so add 1

    // 1. Find Current Month Data
    const currentData = data.find(d => d.year === currentYear && d.month === currentMonth);
    
    updateDashboard(currentData, currentYear, currentMonth);

    // 2. Filter Archive (Past months only)
    const archiveData = data.filter(d => {
        if (d.year < currentYear) return true;
        if (d.year === currentYear && d.month < currentMonth) return true;
        return false;
    }).sort((a, b) => {
        // Sort descending (newest first)
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });

    updateArchive(archiveData);
}

function updateDashboard(data, year, month) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[month - 1];
    
    document.getElementById('month-display').innerText = `${monthName} ${year} Overview`;

    // Default values if no data found for current month
    const required = data ? data.required : 0;
    const received = data ? data.received : 0;

    document.getElementById('target-amount').innerText = `₹${required.toLocaleString()}`;
    document.getElementById('raised-amount').innerText = `₹${received.toLocaleString()}`;

    // Calculate Percentage
    let percentage = 0;
    if (required > 0) {
        percentage = Math.round((received / required) * 100);
    }
    
    // Update Circular Progress
    const circle = document.getElementById('progress-circle');
    const percentageText = document.getElementById('percentage-text');
    
    const isFull = percentage >= 100;
    const color = isFull ? "#2e7d32" : "#902e48";

    percentageText.innerText = `${percentage}%`;
    percentageText.style.color = color;
    circle.style.background = `conic-gradient(${color} ${percentage * 3.6}deg, #ededed 0deg)`;

    // Status Message
    const statusMsg = document.getElementById('status-message');
    if (percentage >= 100) {
        statusMsg.style.display = 'block';
        statusMsg.innerText = "✨ Monthly need fulfilled. Gratitude! 🙏";
        statusMsg.style.color = "#2e7d32";
    } else {
        statusMsg.style.display = 'none';
    }
}

function updateArchive(archiveData) {
    const tbody = document.getElementById('archive-body');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    tbody.innerHTML = '';

    archiveData.forEach(row => {
        const tr = document.createElement('tr');
        const isFull = row.received >= row.required;
        const statusIcon = isFull ? "✅" : "⏳";
        
        tr.innerHTML = `
            <td>${monthNames[row.month - 1]} ${row.year}</td>
            <td>₹${row.required.toLocaleString()}</td>
            <td>₹${row.received.toLocaleString()}</td>
            <td>${statusIcon}</td>
        `;
        tbody.appendChild(tr);
    });
}