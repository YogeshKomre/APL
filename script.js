// Function to capture and download element as image
async function downloadElementAsImage(elementId, filename) {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error('Element not found:', elementId);
            return;
        }
        
        // Temporarily show the element if it's hidden
        const originalDisplay = element.style.display;
        element.style.display = 'block';
        
        // Add a small delay to ensure the element is rendered
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use html2canvas to capture the element
        const canvas = await html2canvas(element, {
            scale: 2, // Higher quality
            logging: false,
            useCORS: true,
            backgroundColor: null,
            allowTaint: true
        });
        
        // Create download link
        const link = document.createElement('a');
        link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Restore original display
        element.style.display = originalDisplay;
    } catch (error) {
        console.error('Error capturing image:', error);
        alert('Error capturing image. Please try again.');
    }
}

console.log('Main script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded in main script');
    const csvFileInput = document.getElementById('csvFileInput');
    const topPerformersList = document.getElementById('topPerformersList');
    const otherEmployeesList = document.getElementById('otherEmployeesList');
    
    // Load data from localStorage if available
    const savedData = localStorage.getItem('dashboardData');
    if (savedData) {
        try {
            const { topPerformers, otherEmployees } = JSON.parse(savedData);
            if (topPerformers && otherEmployees) {
                renderDashboard(topPerformers, otherEmployees);
            }
        } catch (e) {
            console.error('Error loading saved data:', e);
            localStorage.removeItem('dashboardData');
        }
    }
    
    csvFileInput.addEventListener('change', handleFileUpload);
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const csvData = e.target.result;
                processCSV(csvData);
            };
            reader.readAsText(file);
        }
    }
    function processCSV(csvData) {
        // Split by lines and filter out empty lines
        const lines = csvData.split('\n').filter(line => line.trim() !== '');
        
        // The first line contains headers
        const headers = lines[0].split(',').map(header => header.trim());
        const employees = [];
        
        // Find the index of 'EMP Name' and 'Net Score' columns
        const nameColIndex = headers.indexOf('EMP Name');
        const scoreColIndex = headers.indexOf('Net Score');
        
        if (nameColIndex === -1 || scoreColIndex === -1) {
            alert('CSV must contain "EMP Name" and "Net Score" columns.');
            return;
        }
        
        // Get all column indices
        const columnIndices = {};
        headers.forEach((header, index) => {
            columnIndices[header.trim()] = index;
        });
        
        // Start processing from the second line (index 1)
        for (let i = 1; i < lines.length; i++) {
            // Skip empty lines
            if (lines[i].trim() === '') {
                continue;
            }
            
            const values = lines[i].split(',');
            if (values.length > 0) {
                let employee = {};
                // Map all columns to employee object
                headers.forEach(header => {
                    const index = columnIndices[header];
                    if (index !== undefined && values[index]) {
                        const value = values[index].trim();
                        // Convert numeric values to numbers
                        employee[header] = isNaN(value) ? value : parseFloat(value);
                    } else {
                        employee[header] = 0; // Default to 0 for missing numeric values
                    }
                });
                
                // Add Score as an alias for Net Score for backward compatibility
                employee.Score = employee['Net Score'] || 0;
                employee.Name = employee['EMP Name'] || '';
                
                employees.push(employee);
            }
        }
        
        // Function to find top performer in a category
        const getTopPerformer = (category) => {
            const sorted = [...employees].sort((a, b) => (b[category] || 0) - (a[category] || 0));
            const top = sorted[0];
            // Only return if there's a score > 0
            return (top && (top[category] || 0) > 0) ? top : null;
        };
        
        // Find top performers for each category
        const topNetScorer = getTopPerformer('Net Score');
        const topPromoter = getTopPerformer('Promoters Onboarded');
        const topMobileSales = getTopPerformer('Mobile Sales');
        const topFiberSales = getTopPerformer('Fiber Sales');
        const topGoodCalls = getTopPerformer('Good Call Nominations');
        
        // Define top performers with their respective categories
        const topPerformers = [
            { emp: topNetScorer, award: 'Man of the Tournament – Total Runs (1st Rank)', score: topNetScorer?.['Net Score'] || 0, category: 'Net Score' },
            { emp: topPromoter, award: 'Promoter Pro – Promoters Onboarded (2nd Rank)', score: topPromoter?.['Promoters Onboarded'] || 0, category: 'Promoters Onboarded' },
            { emp: topMobileSales, award: 'Captain\'s Knock – Mobile Sales (3rd Rank)', score: topMobileSales?.['Mobile Sales'] || 0, category: 'Mobile Sales' },
            { emp: topFiberSales, award: 'Fiber Finisher – Fiber Sales (4th Rank)', score: topFiberSales?.['Fiber Sales'] || 0, category: 'Fiber Sales' },
            { emp: topGoodCalls, award: 'Golden Call – Good Call Nominations (5th Rank)', score: topGoodCalls?.['Good Call Nominations'] || 0, category: 'Good Call Nominations' }
        ].filter(item => item.emp !== null); // Remove any categories with no qualified winners

        // Get all other employees not in top 5 by net score
        const otherEmployees = employees.filter(emp => !topPerformers.some(top => top.emp === emp));
        
        // Save to localStorage
        const dashboardData = {
            topPerformers,
            otherEmployees,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
        
        renderDashboard(topPerformers, otherEmployees);
    }
    
    function renderDashboard(topPerformers, otherEmployees) {
        // Clear previous content
        topPerformersList.innerHTML = '';
        otherEmployeesList.innerHTML = '';
        
        // Get or create runner ups container
        let runnerUpsList = document.getElementById('runnerUpsList');
        if (!runnerUpsList) {
            // If runner-ups section doesn't exist yet, create it
            const runnerUpsSection = document.createElement('div');
            runnerUpsSection.className = 'runner-ups';
            runnerUpsSection.innerHTML = `
                <h2>Runner Ups</h2>
                <div id="runnerUpsList" class="runner-ups-grid"></div>
            `;
            document.querySelector('.dashboard-content').insertBefore(runnerUpsSection, document.querySelector('.other-employees'));
            runnerUpsList = document.getElementById('runnerUpsList');
        } else {
            runnerUpsList.innerHTML = ''; // Clear previous runner ups
        }
        
        if (topPerformers.length === 0) {
            topPerformersList.innerHTML = '<p style="grid-column: 1 / -1; color: gray; text-align: center; margin: 20px 0;">No top performers to display.</p>';
            otherEmployeesList.innerHTML = '<p style="grid-column: 1 / -1; color: gray; text-align: center; margin: 20px 0;">No employee data to display.</p>';
            return;
        }

        // Create container for top 3 performers
        const topRow = document.createElement('div');
        topRow.className = 'top-row';

        // Create cards for each position
        topPerformers.forEach((item, index) => {
            const position = index + 1;
            const card = document.createElement('div');
            card.className = `employee-card position-${position} rank-${position}`;
            
            // Add position badge
            let positionBadge = '';
            if (position === 1) positionBadge = '🥇';
            else if (position === 2) positionBadge = '🥈';
            else if (position === 3) positionBadge = '🥉';
            
            // Set the name color based on position
            const nameColor = position === 2 ? 'black' : 'white';
            
            card.innerHTML = `
                <div style="font-size: 2em; margin-bottom: 10px;">${positionBadge}</div>
                <h3 class="employee-name" style="margin: 5px 0; color: ${nameColor};">${item.emp.Name || 'N/A'}</h3>
                <p class="award-title" style="font-size: 0.9em; margin: 5px 0; color: #ffd700;"><strong>${item.award.split('–')[0]}</strong></p>
                <p class="score" style="margin: 5px 0; font-size: 1.2em; font-weight: bold;">${item.score || 0}</p>
            `;
            
            // Position the cards in the layout
            if (position <= 3) {
                // Add to top row (1st, 2nd, 3rd places)
                topRow.appendChild(card);
            } else if (position <= 5) {
                // Add to runner ups (4th and 5th places)
                runnerUpsList.appendChild(card);
                // Remove position-specific classes for runner ups
                card.classList.remove(`position-${position}`, `rank-${position}`);
                card.classList.add('runner-up-card');
            }
        });

        // Add top row to the DOM
        topPerformersList.appendChild(topRow);

        // Sort other employees by Net Score in descending order
        const sortedEmployees = [...otherEmployees].sort((a, b) => (b['Net Score'] || 0) - (a['Net Score'] || 0));
        
        // Render Other Employees in a table
        if (sortedEmployees.length > 0) {
            const table = document.createElement('table');
            table.classList.add('employee-table');
            
            // Create table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            // Define columns to display
            const columns = [
                { key: 'EMP Name', label: 'Name' },
                { key: 'Emp. ID', label: 'Employee ID' },
                { key: 'Net Score', label: 'Net Score' },
                { key: 'Mobile Sales', label: 'Mobile Sales' },
                { key: 'Fiber Sales', label: 'Fiber Sales' },
                { key: 'Promoters Onboarded', label: 'Promoters' },
                { key: 'Good Call Nominations', label: 'Good Calls' }
            ];
            
            // Add column headers
            columns.forEach(column => {
                const th = document.createElement('th');
                th.textContent = column.label;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Create table body
            const tbody = document.createElement('tbody');
            
            // Add rows for each employee
            sortedEmployees.forEach(emp => {
                const row = document.createElement('tr');
                
                // Add cells for each column
                columns.forEach(column => {
                    const cell = document.createElement('td');
                    let value = emp[column.key] !== undefined ? emp[column.key] : 0;
                    
                    // Format the display value
                    if (typeof value === 'number') {
                        // For numeric values, show as integer if it's a whole number
                        cell.textContent = Number.isInteger(value) ? value : value.toFixed(2);
                        cell.style.textAlign = 'right'; // Right-align numbers
                    } else {
                        cell.textContent = value || '-'; // Show '-' for empty values
                    }
                    
                    // Highlight the cell if it's the highest in its column (except for name and ID)
                    if (column.key !== 'EMP Name' && column.key !== 'Emp. ID' && value > 0) {
                        const maxInColumn = Math.max(...sortedEmployees.map(e => Number(e[column.key]) || 0));
                        if (Number(value) === maxInColumn) {
                            cell.style.fontWeight = 'bold';
                            cell.style.color = '#ffd700'; // Gold color for highest values
                        }
                    }
                    
                    row.appendChild(cell);
                });
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            otherEmployeesList.innerHTML = ''; // Clear any existing content
            otherEmployeesList.appendChild(table);
        } else {
            otherEmployeesList.innerHTML = '<p style="grid-column: 1 / -1; color: gray; text-align: center; margin: 20px 0;">No other employees to display.</p>';
        }
    }
});