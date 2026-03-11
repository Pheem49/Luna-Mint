const spotlightInput = document.getElementById('spotlight-input');
const spotlightResultsArr = document.getElementById('spotlight-results');

spotlightInput.focus();

const COMMANDS = [
    { label: 'Open YouTube', desc: 'เปิดเว็บไซต์ YouTube', icon: '📺', action: { type: 'open_url', target: 'https://youtube.com' } },
    { label: 'Open GitHub', desc: 'เปิดเว็บไซต์ GitHub', icon: '🐙', action: { type: 'open_url', target: 'https://github.com' } },
    { label: 'System Info', desc: 'ดูข้อมูลระบบ', icon: '💻', action: { type: 'chat', query: 'ขอข้อมูลระบบหน่อย' } },
    { label: 'Weather', desc: 'เช็คสภาพอากาศ', icon: '🌤️', action: { type: 'chat', query: 'อากาศที่กรุงเทพเป็นยังไง' } },
];

let selectedIndex = -1;
let filteredCommands = [];

function renderResults(results) {
    filteredCommands = results;
    if (results.length === 0) {
        spotlightResultsArr.style.display = 'none';
        selectedIndex = -1;
        window.spotlightAPI.resize(600, 80);
        return;
    }

    spotlightResultsArr.style.display = 'block';
    // Calculate new height: 80 (input) + results height (approx 64px per item)
    const newHeight = Math.min(80 + (results.length * 64) + 16, 500);
    window.spotlightAPI.resize(600, newHeight);

    spotlightResultsArr.innerHTML = results.map((cmd, i) => `
        <div class="result-item ${i === selectedIndex ? 'selected' : ''}" data-index="${i}">
            <div class="result-icon">${cmd.icon}</div>
            <div class="result-content">
                <div class="result-title">${cmd.label}</div>
                <div class="result-desc">${cmd.desc}</div>
            </div>
        </div>
    `).join('');
}

spotlightInput.addEventListener('input', () => {
    const val = spotlightInput.value.toLowerCase().trim();
    if (!val) {
        renderResults([]);
        return;
    }

    // Simple calculation
    if (/^[0-9+\-*/().\s]+$/.test(val) && /[0-9]/.test(val)) {
        try {
            const result = eval(val);
            renderResults([{
                label: `Result: ${result}`,
                desc: 'Calculation result (Press Enter to copy)',
                icon: '🧮',
                action: { type: 'copy', value: result.toString() }
            }]);
            return;
        } catch {}
    }

    const matches = COMMANDS.filter(c => 
        c.label.toLowerCase().includes(val) || 
        c.desc.toLowerCase().includes(val)
    );
    
    // Add a default "Ask Gemini" option
    matches.push({
        label: `Ask Mint: "${val}"`,
        desc: 'Send query to AI Chat',
        icon: '✨',
        action: { type: 'chat', query: val }
    });

    renderResults(matches);
});

spotlightInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.spotlightAPI.hide();
    }
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
        renderResults(filteredCommands);
    }

    if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        renderResults(filteredCommands);
    }

    if (e.key === 'Enter') {
        if (selectedIndex >= 0 && filteredCommands[selectedIndex]) {
            handleAction(filteredCommands[selectedIndex].action);
        } else {
            const query = spotlightInput.value.trim();
            if (query) {
                window.spotlightAPI.submit(query);
            }
        }
    }
});

function handleAction(action) {
    if (action.type === 'chat') {
        window.spotlightAPI.submit(action.query);
    } else if (action.type === 'open_url') {
        window.spotlightAPI.submit(`open ${action.target}`); // Re-use submit logic or add open-url IPC
    } else if (action.type === 'copy') {
        // We need a clipboard API in spotlight preload or just send as chat message that triggers copy
        window.spotlightAPI.submit(`copy ${action.value}`);
    }
}

// Auto-focus on show
window.addEventListener('focus', () => {
    spotlightInput.focus();
    spotlightInput.select();
});
