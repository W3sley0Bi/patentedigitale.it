const assets = [
    'assets/car-backpack.png',
    'assets/car-jumping.png',
    'assets/cars-colors.png',
    'assets/car-construction.png',
    'assets/car-stars.png',
    'assets/car-thinking.png'
];

const postItColors = [
    '#ffeb3b', // Yellow
    '#ffcc80', // Orange
    '#a5d6a7', // Green
    '#90caf9', // Blue
    '#f48fb1', // Pink
    '#ce93d8'  // Purple
];

const container = document.getElementById('bg-container');
const count = 10;

let activePostIt = null;
let offsetX = 0;
let offsetY = 0;

const placedRects = [];

function checkOverlap(newRect) {
    const padding = 20;
    for (const rect of placedRects) {
        if (!(newRect.x + newRect.w + padding < rect.x ||
              newRect.x > rect.x + rect.w + padding ||
              newRect.y + newRect.h + padding < rect.y ||
              newRect.y > rect.y + rect.h + padding)) {
            return true;
        }
    }
    return false;
}

function createPostIt() {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const color = postItColors[Math.floor(Math.random() * postItColors.length)];
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 768;
    
    const size = isMobile ? (80 + Math.random() * 30) : (120 + Math.random() * 60);
    
    let x, y, rect;
    let attempts = 0;
    const maxAttempts = 100;

    do {
        const side = Math.floor(Math.random() * 4);
        let pctX, pctY;
        
        // Dynamic exclusion zones
        const marginPct = isMobile ? 10 : 15;
        const farMarginPct = isMobile ? 90 : 85;

        switch(side) {
            case 0: pctX = Math.random() * 80; pctY = Math.random() * marginPct; break;
            case 1: pctX = Math.random() * 80; pctY = farMarginPct - marginPct/2; break;
            case 2: pctX = Math.random() * marginPct; pctY = Math.random() * 80; break;
            case 3: pctX = farMarginPct - marginPct/2; pctY = Math.random() * 80; break;
        }
        
        x = (pctX * vw) / 100;
        y = (pctY * vh) / 100;
        
        rect = { x, y, w: size, h: size };
        attempts++;
    } while (checkOverlap(rect) && attempts < maxAttempts);

    placedRects.push(rect);

    const postIt = document.createElement('div');
    postIt.className = 'post-it';
    
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.innerText = 'Drag me!';
    postIt.appendChild(tooltip);
    
    const car = document.createElement('img');
    car.src = asset;
    car.className = 'floating-car';
    postIt.appendChild(car);
    
    const rotation = (Math.random() * 20) - 10;
    
    postIt.style.left = `${x}px`;
    postIt.style.top = `${y}px`;
    postIt.style.width = `${size}px`;
    postIt.style.height = `${size}px`;
    postIt.style.backgroundColor = color;
    postIt.style.transform = `rotate(${rotation}deg)`;
    postIt.style.setProperty('--current-rotation', `${rotation}deg`);
    
    postIt.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        dragStart(e);
    });
    postIt.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        dragStart(e);
    }, { passive: false });
    
    container.appendChild(postIt);
}

function dragStart(e) {
    activePostIt = e.currentTarget;
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    const rect = activePostIt.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);
}

function drag(e) {
    if (!activePostIt) return;
    e.preventDefault();
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    activePostIt.style.left = (clientX - offsetX) + 'px';
    activePostIt.style.top = (clientY - offsetY) + 'px';
}

function dragEnd() {
    if (activePostIt) {
        activePostIt.classList.add('dropped');
        const currentEl = activePostIt;
        setTimeout(() => currentEl.classList.remove('dropped'), 300);
    }
    activePostIt = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', dragEnd);
}

setInterval(() => {
    const notes = document.querySelectorAll('.post-it');
    if (notes.length === 0) return;
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    if (randomNote === activePostIt) return;
    randomNote.classList.add('shake');
    setTimeout(() => randomNote.classList.remove('shake'), 1500);
}, 4000);

// Interactive Text Logic
const interactiveText = document.getElementById('interactive-text');
let interactionState = 'IDLE';
const lines = ["patentedigitale.it", "sta arrivando da te!"];
interactiveText.innerHTML = '';
const letters = [];

lines.forEach(lineText => {
    const lineContainer = document.createElement('div');
    lineContainer.style.display = 'block';
    lineText.split('').forEach(char => {
        const span = document.createElement('span');
        span.innerText = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.position = 'relative';
        lineContainer.appendChild(span);
        letters.push({ el: span, x: 0, y: 0, vx: 0, vy: 0 });
    });
    interactiveText.appendChild(lineContainer);
});

const FRICTION = 0.92;
let AVOID_RADIUS = window.innerWidth < 768 ? 80 : 150;
const AVOID_FORCE = 0.4;
const RANDOM_IMPULSE = 1.5;

function toggleRunningState() {
    if (interactionState === 'IDLE' || interactionState === 'STOPPED') {
        interactionState = 'RUNNING';
        requestAnimationFrame(updateLetters);
    } else {
        interactionState = 'STOPPED';
        letters.forEach(l => {
            gsap.to(l, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.5)", onUpdate: () => {
                l.el.style.transform = `translate(${l.x}px, ${l.y}px)`;
            }});
            l.vx = 0; l.vy = 0;
        });
    }
}

window.addEventListener('mousedown', toggleRunningState);

// Touch support for interaction toggle and avoidance
window.addEventListener('touchstart', (e) => {
    if (e.target.closest('.post-it')) return;
    // Start running on touch
    if (interactionState !== 'RUNNING') {
        toggleRunningState();
    }
});

window.addEventListener('touchend', (e) => {
    if (e.target.closest('.post-it')) return;
    // Reset on release
    if (interactionState === 'RUNNING') {
        toggleRunningState();
    }
});

let mouseX = -1000, mouseY = -1000;
document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
document.addEventListener('touchmove', (e) => { 
    mouseX = e.touches[0].clientX; 
    mouseY = e.touches[0].clientY; 
}, { passive: false });

function updateLetters() {
    if (interactionState !== 'RUNNING') return;
    const vw = window.innerWidth, vh = window.innerHeight;
    letters.forEach(l => {
        l.vx += (Math.random() - 0.5) * RANDOM_IMPULSE;
        l.vy += (Math.random() - 0.5) * RANDOM_IMPULSE;
        const rect = l.el.getBoundingClientRect();
        const dx = mouseX - (rect.left + rect.width / 2);
        const dy = mouseY - (rect.top + rect.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < AVOID_RADIUS) {
            const angle = Math.atan2(dy, dx);
            const push = (AVOID_RADIUS - dist) * AVOID_FORCE;
            l.vx -= Math.cos(angle) * push; l.vy -= Math.sin(angle) * push;
        }
        if (rect.left < 20) l.vx += 1;
        if (rect.right > vw - 20) l.vx -= 1;
        if (rect.top < 20) l.vy += 1;
        if (rect.bottom > vh - 20) l.vy -= 1;
        l.vx *= FRICTION; l.vy *= FRICTION;
        l.x += l.vx; l.y += l.vy;
        l.el.style.transform = `translate(${l.x}px, ${l.y}px)`;
    });
    requestAnimationFrame(updateLetters);
}

for (let i = 0; i < count; i++) createPostIt();
