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
        const tCapitalized = target.charAt(0).toUpperCase() + target.slice(1).toLowerCase();
        
        // Try common linux patterns: gtk-launch, exact name, lowercase, flatpak
        if (!target.includes('/')) {
            const patterns = [
                `gtk-launch ${target}`,
                `gtk-launch ${tLower}`,
                `gtk-launch ${tCapitalized}`,
                `gtk-launch com.${tLower}app.${tCapitalized}`,
                `gtk-launch com.${tLower}.${tCapitalized}`,
                target,
                tLower,
                `flatpak run ${target}`, // In case target is already ID
                `flatpak run com.${tLower}app.${tCapitalized}`,
                `flatpak run com.${tLower}.${tCapitalized}`,
                `flatpak run com.${tLower}.Browser`,
                `flatpak run com.${tLower}.${target}`,
                `flatpak run com.valvesoftware.Steam`,
                `flatpak run net.lutris.Lutris`,
                `snap run ${tLower}`
            ];
            cmd = patterns.join(' || ');
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
