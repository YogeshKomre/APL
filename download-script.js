// Make function globally available with error handling
window.setupDownloadButtons = function() {
    console.log('Setting up download and email buttons...');
    
    // Function to capture leaders as an image
    async function captureLeaders() {
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
        
        if (!topPerformers) return null;
        
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
            // Capture and return the image data URL
            const canvas = await html2canvas(container, {
                scale: 2,
                backgroundColor: null,
                logging: false,
                useCORS: true,
                allowTaint: true
            });
            
            const imageData = canvas.toDataURL('image/png');
            return imageData;
        } catch (error) {
            console.error('Error capturing leaders:', error);
            alert('Error capturing leaders. Please try again.');
            return null;
        } finally {
            // Clean up
            document.body.removeChild(container);
        }
    }
    
    // Function to capture table as an image
    async function captureTable() {
        const table = document.querySelector('.other-employees');
        if (!table) return null;
        
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
                allowTaint: true
            });
            
            const imageData = canvas.toDataURL('image/png');
            return imageData;
        } catch (error) {
            console.error('Error capturing table:', error);
            alert('Error capturing table. Please try again.');
            return null;
        } finally {
            document.body.removeChild(container);
        }
    }
    
    // Function to send email with image attachment using EmailJS
    async function sendEmail(imageData, type) {
        const emailInput = document.getElementById('emailInput');
        const email = emailInput.value.trim();
        
        if (!email) {
            alert('Please enter an email address.');
            return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Show loading state
        const emailBtn = type.includes('Leaders') ? 
            document.getElementById('emailLeadersBtn') : 
            document.getElementById('emailTableBtn');
        const originalText = emailBtn.innerHTML;
        emailBtn.disabled = true;
        emailBtn.innerHTML = 'Sending...';
        
        try {
            // Convert base64 to blob
            const blob = await (await fetch(imageData)).blob();
            
            // Create form data
            const formData = new FormData();
            formData.append('service_id', 'YOUR_SERVICE_ID'); // Replace with your EmailJS service ID
            formData.append('template_id', 'YOUR_TEMPLATE_ID'); // Replace with your EmailJS template ID
            formData.append('user_id', 'YOUR_PUBLIC_KEY'); // Same as in the initialization
            formData.append('to_email', email);
            formData.append('subject', `Altice Premier League - ${type} ${new Date().toLocaleDateString()}`);
            formData.append('message', `Please find the ${type.toLowerCase()} from Altice Premier League attached.`);
            formData.append('attachment', blob, `altice_${type.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.png`);
            
            // Send email using EmailJS
            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send-form', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                alert('Email sent successfully!');
            } else {
                throw new Error('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again or check your internet connection.');
        } finally {
            // Reset button state
            emailBtn.disabled = false;
            emailBtn.innerHTML = originalText;
        }
    }
    
    // Set up download leaders button
    const downloadLeadersBtn = document.getElementById('downloadLeadersBtn');
    if (downloadLeadersBtn) {
        downloadLeadersBtn.addEventListener('click', async () => {
            const imageData = await captureLeaders();
            if (imageData) {
                const link = document.createElement('a');
                link.download = `top_performers_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = imageData;
                link.click();
            }
        });
    }
    
    // Set up download table button
    const downloadTableBtn = document.getElementById('downloadTableBtn');
    if (downloadTableBtn) {
        downloadTableBtn.addEventListener('click', async () => {
            const imageData = await captureTable();
            if (imageData) {
                const link = document.createElement('a');
                link.download = `employee_table_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = imageData;
                link.click();
            }
        });
    }
    
    // Set up email leaders button
    const emailLeadersBtn = document.getElementById('emailLeadersBtn');
    if (emailLeadersBtn) {
        emailLeadersBtn.addEventListener('click', async () => {
            const imageData = await captureLeaders();
            if (imageData) {
                await sendEmail(imageData, 'Top Performers');
            }
        });
    }
    
    // Set up email table button
    const emailTableBtn = document.getElementById('emailTableBtn');
    if (emailTableBtn) {
        emailTableBtn.addEventListener('click', async () => {
            const imageData = await captureTable();
            if (imageData) {
                await sendEmail(imageData, 'Employee Table');
            }
        });
    }
};

// Helper function to initialize buttons
function initializeDownloadButtons() {
    if (typeof html2canvas === 'undefined') {
        console.warn('html2canvas not loaded, retrying...');
        setTimeout(initializeDownloadButtons, 100);
        return;
    }
    
    if (typeof setupDownloadButtons === 'function') {
        setupDownloadButtons();
    } else {
        console.warn('setupDownloadButtons function not found');
    }
}

// Initialize when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDownloadButtons);
} else {
    initializeDownloadButtons();
}
