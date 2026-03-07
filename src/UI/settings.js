const DEFAULT_CONFIG = {
    theme: 'dark',
    accentColor: '#8b5cf6',
    apiKey: '',
    language: 'th-TH',
    proactiveInterval: 60,
    proactiveCooldown: 120
};

let currentConfig = { ...DEFAULT_CONFIG };

// Load settings from main process
async function loadSettings() {
    const config = await window.settingsApi.getSettings();
    currentConfig = { ...DEFAULT_CONFIG, ...config };
    applyConfig(currentConfig);
}

function applyConfig(config) {
    // Apply theme
    document.documentElement.setAttribute('data-theme', config.theme);

    // Apply accent color
    document.documentElement.style.setProperty('--accent', config.accentColor);
    document.documentElement.style.setProperty('--accent-hover', lightenColor(config.accentColor, 20));

    // Apply API key
    document.getElementById('api-key-input').value = config.apiKey || '';

    // Apply Automation Browser
    if (config.automationBrowser) {
        document.getElementById('automation-browser-select').value = config.automationBrowser;
    }

    // Update active theme card
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === config.theme);
    });

    // Update active color dot
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.classList.toggle('active', dot.dataset.color === config.accentColor);
    });

    // Update color picker
    document.getElementById('custom-color').value = config.accentColor;

    // Apply proactive settings
    const interval = config.proactiveInterval || 60;
    const cooldown = config.proactiveCooldown || 120;
    document.getElementById('proactive-interval').value = interval;
    document.getElementById('proactive-cooldown').value = cooldown;
    updateIntervalDisplay(interval);
    updateCooldownDisplay(cooldown);
}

function lightenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
    const b = Math.min(255, (num & 0x0000FF) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// --- Event Listeners ---

// Close button
document.getElementById('close-btn').addEventListener('click', () => {
    window.settingsApi.closeSettings();
});

// Toggle API key visibility
document.getElementById('toggle-key').addEventListener('click', () => {
    const input = document.getElementById('api-key-input');
    input.type = input.type === 'password' ? 'text' : 'password';
});

// AI Studio link
document.getElementById('ai-studio-link').addEventListener('click', () => {
    window.settingsApi.openExternal('https://aistudio.google.com/');
});

// Theme cards
document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
        currentConfig.theme = card.dataset.theme;
        applyConfig(currentConfig);
    });
});

// Color presets
document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        currentConfig.accentColor = dot.dataset.color;
        applyConfig(currentConfig);
        document.getElementById('custom-color').value = dot.dataset.color;
    });
});

// Custom color picker
document.getElementById('custom-color').addEventListener('input', (e) => {
    currentConfig.accentColor = e.target.value;
    document.documentElement.style.setProperty('--accent', e.target.value);
    document.documentElement.style.setProperty('--accent-hover', lightenColor(e.target.value, 20));
    // Deselect presets
    document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
});

// Proactive sliders
function formatSeconds(s) {
    if (s < 60) return `${s} วิ`;
    const m = s / 60;
    return Number.isInteger(m) ? `${m} นาที` : `${m.toFixed(1)} นาที`;
}

function updateIntervalDisplay(val) {
    document.getElementById('proactive-interval-display').textContent = formatSeconds(Number(val));
}

function updateCooldownDisplay(val) {
    document.getElementById('proactive-cooldown-display').textContent = formatSeconds(Number(val));
}

document.getElementById('proactive-interval').addEventListener('input', (e) => {
    updateIntervalDisplay(e.target.value);
});

document.getElementById('proactive-cooldown').addEventListener('input', (e) => {
    updateCooldownDisplay(e.target.value);
});

// Save
document.getElementById('save-btn').addEventListener('click', async () => {
    currentConfig.apiKey = document.getElementById('api-key-input').value.trim();
    currentConfig.automationBrowser = document.getElementById('automation-browser-select').value;
    currentConfig.proactiveInterval = Number(document.getElementById('proactive-interval').value);
    currentConfig.proactiveCooldown = Number(document.getElementById('proactive-cooldown').value);

    await window.settingsApi.saveSettings(currentConfig);
    const btn = document.getElementById('save-btn');
    btn.textContent = '✅ Saved!';
    setTimeout(() => { btn.textContent = 'Save Settings'; }, 1500);
});

// Reset to default
document.getElementById('reset-btn').addEventListener('click', () => {
    currentConfig = { ...DEFAULT_CONFIG };
    applyConfig(currentConfig);
});

// Init
window.addEventListener('DOMContentLoaded', loadSettings);
