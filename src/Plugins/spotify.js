const { exec } = require('child_process');

module.exports = {
    name: 'spotify',
    description: 'Controls Spotify playback (play, pause, next, previous). Only works if Spotify is running. Valid targets are: "play", "pause", "next", "previous".',
    
    async execute(target) {
        return new Promise((resolve) => {
            const commandMap = {
                'play': 'playerctl -p spotify play',
                'pause': 'playerctl -p spotify pause',
                'next': 'playerctl -p spotify next',
                'previous': 'playerctl -p spotify previous'
            };

            const cmd = commandMap[target.toLowerCase()];

            if (!cmd) {
                return resolve(`Invalid spotify command: ${target}`);
            }

            exec(cmd, (error) => {
                if (error) {
                    // Check if playerctl is missing or Spotify isn't running
                    if (error.message.includes('No players found')) {
                        return resolve('Spotify is not currently running or playing anything.');
                    }
                    if (error.code === 127) {
                        return resolve('Error: "playerctl" is not installed on this system. Please install it (e.g., sudo apt install playerctl).');
                    }
                    return resolve(`Failed to execute Spotify command: ${error.message}`);
                }

                const actionText = {
                    'play': 'Playing Spotify.',
                    'pause': 'Paused Spotify.',
                    'next': 'Skipped to the next song.',
                    'previous': 'Went back to the previous song.'
                };

                resolve(actionText[target.toLowerCase()]);
            });
        });
    }
};
