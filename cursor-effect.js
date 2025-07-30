document.addEventListener('DOMContentLoaded', () => {
    // Create cursor and trail elements
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    
    const cursorTrail = [];
    const trailLength = 10; // Number of trail elements
    
    // Create trail elements
    for (let i = 0; i < trailLength; i++) {
        const trailDot = document.createElement('div');
        trailDot.className = 'cursor-trail';
        trailDot.style.opacity = 1 - (i / trailLength);
        trailDot.style.transform = `scale(${1 - (i * 0.05)})`;
        document.body.appendChild(trailDot);
        cursorTrail.push({
            element: trailDot,
            x: 0,
            y: 0
        });
    }
    
    document.body.appendChild(cursor);
    
    // Track cursor position
    let mouseX = 0;
    let mouseY = 0;
    let posX = 0;
    let posY = 0;
    
    // Smoothing factor (lower = smoother but slower)
    const ease = 0.2;
    
    // Update cursor position
    const updateCursor = () => {
        // Smooth movement for cursor
        posX += (mouseX - posX) * ease;
        posY += (mouseY - posY) * ease;
        
        // Update main cursor
        cursor.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
        
        // Update trail with delay
        cursorTrail.forEach((trail, index) => {
            // Each trail element follows the previous one with a delay
            const prev = index === 0 ? {x: posX, y: posY} : cursorTrail[index - 1];
            const x = prev.x;
            const y = prev.y;
            
            trail.x += (x - trail.x) * (ease * 0.5);
            trail.y += (y - trail.y) * (ease * 0.5);
            
            trail.element.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) scale(${1 - (index * 0.05)})`;
        });
        
        requestAnimationFrame(updateCursor);
    };
    
    // Start the animation
    updateCursor();
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Add hover effects
    const hoverElements = document.querySelectorAll('a, button, .employee-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
        });
    });
});
