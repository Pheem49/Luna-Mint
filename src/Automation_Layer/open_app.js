const { exec } = require('child_process');

function openApp(target) {
    if (!target) return;

    let cmd = '';
    if (process.platform === 'win32') {
        cmd = `start "" "${target}"`;
    } else if (process.platform === 'darwin') {
        if (!target.includes('/')) {
            cmd = `open -X -a "${target}" || open -a "${target}"`;
        } else {
            cmd = `open "${target}"`;
        }
    } else {
        const tLower = target.toLowerCase();
        // Try common linux patterns: gtk-launch, exact name, lowercase, flatpak
        if (!target.includes('/')) {
            cmd = `gtk-launch ${target} || gtk-launch ${tLower} || ${target} || ${tLower} || flatpak run com.${tLower}app.${target} || flatpak run com.${tLower}.${target} || snap run ${tLower}`;
        } else {
            cmd = `xdg-open "${target}"`;
        }
    }

    exec(cmd, (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            if (process.platform !== 'win32') {
                exec(target.toLowerCase(), (err2) => {
                    if (err2) console.error("Fallback lowercase exec failed:", err2);
                });
            }
        }
    });
}

module.exports = { openApp };
