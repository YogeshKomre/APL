// Make function globally available with error handling
window.setupDownloadButtons = function() {
    console.log('Setting up download buttons...');
    // Download Leaders Button
    const downloadLeadersBtn = document.getElementById('downloadLeadersBtn');
    if (downloadLeadersBtn) {
        downloadLeadersBtn.addEventListener('click', async () => {
            const container = document.createElement('div');
            container.className = 'screenshot-container';
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.padding = '20px';
            container.style.background = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
            container.style.borderRadius = '10px';
            
            // Clone the elements we want to capture
            const topPerformers = document.querySelector('.top-performers')?.cloneNode(true);
            const runnerUps = document.querySelector('.runner-ups')?.cloneNode(true);
            
            if (!topPerformers) return;
            
            // Create a title for the image
            const title = document.createElement('h1');
            title.textContent = 'Top Performers - Altice Premier League';
            title.style.color = '#ffa500';
            title.style.textAlign = 'center';
            title.style.marginBottom = '30px';
            
            // Clear any existing content and add our elements
            container.innerHTML = '';
            container.appendChild(title);
            container.appendChild(topPerformers);
            if (runnerUps) container.appendChild(runnerUps);
            
            // Add to document to render
            document.body.appendChild(container);
            
            try {
                // Capture and download
                const canvas = await html2canvas(container, {
                    scale: 2,
                    backgroundColor: null,
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });
                
                const link = document.createElement('a');
                link.download = `top_performers_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                
            } catch (error) {
                console.error('Error capturing leaders:', error);
                alert('Error capturing leaders. Please try again.');
            } finally {
                // Clean up
                document.body.removeChild(container);
            }
        });
    }
    
    // Download Table Button
    const downloadTableBtn = document.getElementById('downloadTableBtn');
    if (downloadTableBtn) {
        downloadTableBtn.addEventListener('click', async () => {
            const table = document.querySelector('.other-employees');
            if (!table) return;
            
            const container = document.createElement('div');
            container.style.padding = '20px';
            container.style.background = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';
            container.style.borderRadius = '10px';
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.width = '90%';
            container.style.maxWidth = '1200px';
            container.style.margin = '0 auto';
            
            const title = document.createElement('h1');
            title.textContent = 'Employee Rankings - Altice Premier League';
            title.style.color = '#ffa500';
            title.style.textAlign = 'center';
            title.style.marginBottom = '20px';
            
            const date = document.createElement('p');
            date.textContent = `As of ${new Date().toLocaleDateString()}`;
            date.style.color = '#aaa';
            date.style.textAlign = 'center';
            date.style.marginBottom = '30px';
            
            container.appendChild(title);
            container.appendChild(date);
            container.appendChild(table.cloneNode(true));
            document.body.appendChild(container);
            
            try {
                // Add a small delay to ensure everything is rendered
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const canvas = await html2canvas(container, {
                    scale: 2,
                    backgroundColor: null,
                    logging: false,
                    useCORS: true,
                    allowTaint: true,
                    scrollX: 0,
                    scrollY: -window.scrollY
                });
                
                const link = document.createElement('a');
                link.download = `employee_table_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                
            } catch (error) {
                console.error('Error capturing table:', error);
                alert('Error capturing employee table. Please try again.');
            } finally {
                // Clean up
                document.body.removeChild(container);
            }
        });
    }
}

// Helper function to initialize buttons
function initializeDownloadButtons() {
    console.log('Attempting to initialize download buttons...');
    
    // Check if html2canvas is available
    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas is not loaded');
        return false;
    }
    
    // Check if buttons exist
    const downloadLeadersBtn = document.getElementById('downloadLeadersBtn');
    const downloadTableBtn = document.getElementById('downloadTableBtn');
    
    if (!downloadLeadersBtn || !downloadTableBtn) {
        console.error('Download buttons not found in the DOM');
        return false;
    }
    
    console.log('All required elements found, setting up event listeners...');
    
    // Set up the buttons
    window.setupDownloadButtons();
    return true;
}

// Initialize when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDownloadButtons);
} else {
    initializeDownloadButtons();
}
