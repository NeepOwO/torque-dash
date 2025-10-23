const Log = require('../models').Log;
const User = require('../models').User;
const Session = require('../models').Session;
const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');
const config = require('../config/config');

// In-memory storage for live-only mode
const liveDataStore = new Map();

// Clean old data every 5 minutes
if (config.liveOnlyMode) {
    setInterval(() => {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        for (const [sessionId, data] of liveDataStore.entries()) {
            if (data.timestamp < fiveMinutesAgo) {
                liveDataStore.delete(sessionId);
            }
        }
    }, 5 * 60 * 1000);
}

class UploadController {  
    static async processUpload(req, res) {
        try {
            let { eml, session, time } = req.query;
            let lon = req.query.kff1005;
            let lat = req.query.kff1006;

            // check for duplicate gps values (when selecting always send gps values in settings + choosing gps pids in pid list)
            if (Array.isArray(lon)) lon = lon[0];
            if (Array.isArray(lat)) lat = lat[0];

            // Check if request has gps position data - filters out meta logs
            if (lon == null || lat == null) return res.status(200).send('OK!');

            // Create values json by filtering out non pid values
            let values = _.omit(req.query, ['eml', 'v', 'session', 'id', 'time', 'kff1005', 'kff1006']);
            let timestamp = moment(time, 'x').format('YYYY-MM-DD HH:mm:ss');

            // Check if user exists (always required, even in live-only mode)
            let user = await User.findOne({ where: { email: eml } });
            if (!user) return res.status(403).send('Invalid user account.');
            
            // Check if live-only mode is enabled (global or user-specific)
            const isLiveOnlyMode = config.liveOnlyMode || user.liveOnlyMode;

            // Check if user set any forward URLs, resend request
            let urls = user.forwardUrls;
            if(urls) {
                urls.forEach(url => {
                    try{
                        axios.get(url, {
                            params: req.query
                        }).catch(err => console.log('Forward error:', err.message));
                    }
                    catch (err) {
                        console.log(err);
                    }
                });
            }

            //Check if session already exists or create new
            let currentSession = await Session.findOrCreate({
                where: {
                    sessionId: session
                },
                defaults: {
                    userId: user.id
                }
            });

            // LIVE-ONLY MODE: Skip saving logs to database, only stream
            if (isLiveOnlyMode) {
                const modeSource = config.liveOnlyMode ? 'global' : 'user';
                console.log(`[LIVE-ONLY ${modeSource}] Streaming data from session ${session} (user: ${eml})`);
                
                // Store in memory for quick access
                liveDataStore.set(session, {
                    sessionId: session,
                    timestamp: Date.now(),
                    lon: lon,
                    lat: lat,
                    values: values,
                    userId: user.id,
                    email: eml,
                    liveOnlyMode: true,
                    modeSource: modeSource
                });

                // Update session with latest data only
                await currentSession[0].update({
                    latestData: {
                        timestamp: timestamp,
                        lon: lon,
                        lat: lat,
                        ...values
                    }
                });

                // Emit real-time data via WebSocket
                if (global.io) {
                    global.io.to(`session-${session}`).emit('sensor-data', {
                        sessionId: session,
                        timestamp: timestamp,
                        lon: lon,
                        lat: lat,
                        values: values
                    });
                }

                return res.status(200).send(`OK! [LIVE-ONLY ${modeSource.toUpperCase()} - NO LOGS SAVED]`);
            }

            // NORMAL MODE: Save logs to database
            //Check if timestamp already exists as torque app is spamming multiple requests
            let log = await Log.findOne({
                where: {
                    sessionId: currentSession[0].dataValues.id,
                    timestamp: timestamp,
                }
            });
            if (log) return res.status(403).send('Duplicate entry.');

            // Create log in database
            log = await Log.create({
                sessionId: currentSession[0].dataValues.id,
                timestamp: timestamp,
                lon: lon,
                lat: lat,
                values: values
            });

            // Update session with latest data
            await currentSession[0].update({
                latestData: {
                    timestamp: timestamp,
                    lon: lon,
                    lat: lat,
                    ...values
                }
            });

            // Emit real-time data via WebSocket
            if (global.io) {
                const sessionRoomId = session;
                global.io.to(`session-${sessionRoomId}`).emit('sensor-data', {
                    sessionId: sessionRoomId,
                    timestamp: timestamp,
                    lon: lon,
                    lat: lat,
                    values: values
                });
            }

            if (log) res.status(200).send('OK!');
        } catch (err) {
            res.sendStatus(500);
            console.log(err);
        }
    }

    // Get live sessions (for live-only mode - in-memory cache)
    static async getLiveSessions(req, res) {
        try {
            const sessions = Array.from(liveDataStore.values()).map(data => ({
                sessionId: data.sessionId,
                email: data.email,
                userId: data.userId,
                lastUpdate: data.timestamp,
                age: Date.now() - data.timestamp
            }));

            res.json({ 
                sessions, 
                mode: config.liveOnlyMode ? 'live-only' : 'normal',
                count: sessions.length 
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get live sessions' });
        }
    }

    // Get latest data for a session (in-memory cache)
    static async getLiveSessionData(req, res) {
        try {
            const { sessionId } = req.params;
            const data = liveDataStore.get(sessionId);

            if (!data) {
                return res.status(404).json({ error: 'Session not found or expired from memory cache' });
            }

            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get session data' });
        }
    }
}

module.exports = UploadController;