const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const PageController = require('../controllers/PageController');

router.get('/', (req, res) => { res.redirect('/overview') });
router.get('/login', PageController.renderLogin );
router.get('/register', PageController.renderRegister );
router.get('/overview', authenticate, PageController.renderOverview );
router.get('/mapview', authenticate, PageController.renderMapview );
router.get('/shareview/:shareId', PageController.renderShareview );
router.get('/share', authenticate, PageController.renderShare );
router.get('/settings', authenticate, PageController.renderSettings );
router.get('/edit/:sessionId', authenticate, PageController.renderEdit );

// Dashboard routes
router.get('/dashboards', authenticate, PageController.renderDashboards );
router.get('/dashboard/editor/:dashboardId?', authenticate, PageController.renderDashboardEditor );
router.get('/dashboard/view/:dashboardId', authenticate, PageController.renderDashboardView );
router.get('/dashboard/live/:shareId', PageController.renderDashboardLive );

module.exports = router;