const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const undoBtn = document.getElementById('undo');
const saveBtn = document.getElementById('save');
const loadInput = document.getElementById('load');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
let circles = [];
let isDrawing = false;
let startX, startY;

// Draw all circles
function drawCircles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color;
        ctx.fill();
        ctx.closePath();
    });
}

// Check if point is inside any circle
function isPointInCircle(x, y) {
    return circles.find(circle => {
        const dx = x - circle.x;
        const dy = y - circle.y;
        return Math.sqrt(dx * dx + dy * dy) <= circle.radius;
    });
}

// Mouse down: Start drawing or check hit/miss
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!isDrawing) {
        isDrawing = true;
        startX = x;
        startY = y;
    }

    // Check hit/miss
    status.textContent = isPointInCircle(x, y) ? 'Hit' : 'Miss';
});

// Mouse move: Calculate radius while dragging
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate radius: minimum from slider + drag distance
    const dx = x - startX;
    const dy = y - startY;
    const dragRadius = Math.sqrt(dx * dx + dy * dy);
    const minRadius = parseInt(brushSize.value);
    const radius = minRadius + dragRadius;

    // Redraw canvas with temporary circle
    drawCircles();
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.fillStyle = colorPicker.value;
    ctx.fill();
    ctx.closePath();
});

// Mouse up: Finalize circle
canvas.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate radius
    const dx = x - startX;
    const dy = y - startY;
    const dragRadius = Math.sqrt(dx * dx + dy * dy);
    const minRadius = parseInt(brushSize.value);
    const radius = minRadius + dragRadius;

    // Add circle to array
    if (radius > minRadius) {
        circles.push({
            x: startX,
            y: startY,
            radius: radius,
            color: colorPicker.value
        });
        drawCircles();
    }
});

// Double click: Delete circle
canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const circle = isPointInCircle(x, y);
    if (circle) {
        circles = circles.filter(c => c !== circle);
        drawCircles();
        status.textContent = 'Circle deleted';
    }
});

// Reset canvas
resetBtn.addEventListener('click', () => {
    circles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    status.textContent = 'Canvas cleared';
});

// Undo last circle
undoBtn.addEventListener('click', () => {
    circles.pop();
    drawCircles();
    status.textContent = 'Last circle undone';
});

// Save canvas as image
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    status.textContent = 'Canvas saved as image';
});

// Load image onto canvas
loadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            circles = []; // Clear circles to avoid conflicts
            status.textContent = 'Image loaded';
        };
        img.src = URL.createObjectURL(file);
    }
});