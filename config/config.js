let config = {
    port: process.env.PORT || 3000,
    // Live-only mode: receive and broadcast sensor data in real-time without saving logs
    // Authentication and dashboards still work, only sensor logs are not saved
    // Set environment variable LIVE_ONLY_MODE=true to enable
    liveOnlyMode: process.env.LIVE_ONLY_MODE === 'true' || false,
    db: {
        uri: process.env.DATABASE_URL || 'postgres://postgres:heslo@localhost:5432/torquedash',
        options: {
            logging: false
        }
    },
    session: {
        keys: process.env.SESSION_KEYS || ['6a5w4d65a4wd', 'a65w4d6aw4d89a4', '65f4b8b4szd8']
    }
};

module.exports = config;