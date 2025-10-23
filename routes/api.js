const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const SessionController = require('../controllers/SessionController');
const UploadController = require('../controllers/UploadController');
const UserController = require('../controllers/UserController');
const DashboardController = require('../controllers/DashboardController');
const UploadImageController = require('../controllers/UploadImageController');
const upload = require('../config/multer');

// Torque sends data through GET request rather than post
router.get('/upload', UploadController.processUpload );

// Live-only mode endpoints
router.get('/live-sessions', UploadController.getLiveSessions);
router.get('/live-sessions/:sessionId', UploadController.getLiveSessionData);

router.post('/users/register', UserController.register);
router.post('/users/login', UserController.login);
router.get('/users/logout', UserController.logout);
router.get('/users/shareid', authenticate, UserController.getShareId);
router.get('/users/forwardurls', authenticate, UserController.getForwardUrls);
router.put('/users/forwardurls', authenticate, UserController.updateForwardUrls);
router.patch('/users/shareid', authenticate, UserController.toggleShareId);
router.get('/users/settings', authenticate, UserController.getSettings);
router.patch('/users/settings/live-mode', authenticate, UserController.toggleLiveOnlyMode);

router.get('/sessions/active', authenticate, SessionController.getActiveSession);
router.get('/sessions', authenticate, SessionController.getAll);
router.get('/sessions/shared/:shareId', SessionController.getAllShared);
router.get('/sessions/shared/:shareId/:sessionId', SessionController.getOneShared);
router.get('/sessions/:sessionId', authenticate, SessionController.getOne);
router.get('/sessions/:sessionId/sensors', authenticate, SessionController.getAvailableSensors);
router.delete('/sessions/:sessionId', authenticate, SessionController.delete);

router.patch('/sessions/rename/:sessionId', authenticate, SessionController.rename);
router.patch('/sessions/addlocation/:sessionId', authenticate, SessionController.addLocation);
router.patch('/sessions/filter/:sessionId', authenticate, SessionController.filter);
router.patch('/sessions/cut/:sessionId', authenticate, SessionController.cut);
router.post('/sessions/copy/:sessionId', authenticate, SessionController.copy);
router.post('/sessions/join/:sessionId', authenticate, SessionController.join);

// Dashboard routes
router.get('/dashboards', authenticate, DashboardController.getAll);
router.get('/dashboards/shared/:shareId', DashboardController.getShared);
router.get('/dashboards/:dashboardId', authenticate, DashboardController.getOne);
router.post('/dashboards', authenticate, DashboardController.create);
router.put('/dashboards/:dashboardId', authenticate, DashboardController.update);
router.delete('/dashboards/:dashboardId', authenticate, DashboardController.delete);
router.patch('/dashboards/:dashboardId/share', authenticate, DashboardController.toggleShare);
router.post('/dashboards/:dashboardId/duplicate', authenticate, DashboardController.duplicate);

// Image upload routes
router.post('/upload-image', authenticate, upload.single('image'), UploadImageController.uploadImage);
router.get('/images', authenticate, UploadImageController.listImages);
router.delete('/images/:filename', authenticate, UploadImageController.deleteImage);

module.exports = router;