const floatingBtn = document.getElementById('floating-btn');
const badge = document.getElementById('badge');
let isDragging = false;
let didDrag = false;
let dragStart = null;

function startDrag() {
    isDragging = true;
    document.body.classList.add('dragging');
}

function stopDrag() {
    isDragging = false;
    document.body.classList.remove('dragging');
}

function setBadge(count) {
    const value = Number(count) || 0;
    if (value <= 0) {
        badge.style.display = 'none';
        document.body.classList.remove('has-unread');
        return;
    }
    badge.textContent = value > 9 ? '9+' : String(value);
    badge.style.display = 'inline-block';
    document.body.classList.add('has-unread');
}

floatingBtn.addEventListener('click', () => {
    if (didDrag) return;
    if (window.floating) window.floating.openMain();
});

if (window.floating) {
    window.floating.onNotify((count) => {
        setBadge(count);
    });
}

window.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    startDrag();
    didDrag = false;
    dragStart = { x: e.screenX, y: e.screenY };
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    if (dragStart) {
        const dx = e.screenX - dragStart.x;
        const dy = e.screenY - dragStart.y;
        if (!didDrag && Math.hypot(dx, dy) < 4) return;
        didDrag = true;
    }
    if (window.floating) window.floating.dragMove(e.screenX, e.screenY);
});

window.addEventListener('mouseup', () => {
    stopDrag();
    dragStart = null;
});

window.addEventListener('mouseleave', () => {
    stopDrag();
    dragStart = null;
});
