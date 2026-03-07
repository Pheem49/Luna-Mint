const bgCanvas = document.getElementById('bg-canvas');
const overlayCanvas = document.getElementById('overlay-canvas');
const bgCtx = bgCanvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');

let isDrawing = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let baseImage = null;

// Initialize canvases
function init() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    overlayCanvas.width = window.innerWidth;
    overlayCanvas.height = window.innerHeight;

    // Wait for the main process to send the screenshot
    window.electronPicker.onScreenshot((base64Data) => {
        baseImage = new Image();
        baseImage.onload = () => {
            bgCtx.drawImage(baseImage, 0, 0, bgCanvas.width, bgCanvas.height);
            drawDarkOverlay();
        };
        baseImage.src = base64Data;
    });
}

function drawDarkOverlay() {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

function drawSelection() {
    drawDarkOverlay();
    
    // Calculate selection dimensions
    const width = currentX - startX;
    const height = currentY - startY;
    
    // Clear the selected area to reveal the image underneath
    overlayCtx.clearRect(startX, startY, width, height);
    
    // Draw an outline around the selection
    overlayCtx.strokeStyle = '#00ff88'; // Mint color
    overlayCtx.lineWidth = 2;
    overlayCtx.strokeRect(startX, startY, width, height);
}

function cropAndSend(rect) {
    if (rect.width === 0 || rect.height === 0) return;
    
    // Handle dragging backwards
    const x = Math.min(rect.startX, rect.currentX);
    const y = Math.min(rect.startY, rect.currentY);
    const w = Math.abs(rect.width);
    const h = Math.abs(rect.height);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = w;
    cropCanvas.height = h;
    const cropCtx = cropCanvas.getContext('2d');
    
    cropCtx.drawImage(
        baseImage, 
        x, y, w, h, 
        0, 0, w, h
    );

    const croppedBase64 = cropCanvas.toDataURL('image/png');
    
    // Destroy the UI and return the result to main process
    window.electronPicker.sendSelection(croppedBase64);
}

// Mouse Events
overlayCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    startX = e.clientX;
    startY = e.clientY;
});

overlayCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    currentX = e.clientX;
    currentY = e.clientY;
    drawSelection();
});

overlayCanvas.addEventListener('mouseup', (e) => {
    isDrawing = false;
    cropAndSend({ startX, startY, currentX, currentY, width: currentX - startX, height: currentY - startY });
});

// UI Buttons
document.getElementById('btn-fullscreen').addEventListener('click', () => {
    if (baseImage) {
        window.electronPicker.sendSelection(baseImage.src);
    }
});

document.getElementById('btn-cancel').addEventListener('click', () => {
    window.electronPicker.closePicker();
});

// Setup
window.addEventListener('resize', init);
init();
