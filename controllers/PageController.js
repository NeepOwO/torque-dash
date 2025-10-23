const User = require('../models').User;
const Dashboard = require('../models').Dashboard;

class PageController {
    static async renderOverview(req, res) {
        res.render('dashboard', {
            dashboard: true,
            overview: true,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
    static async renderMapview(req, res) { 
        res.render('mapview', {
            dashboard: true,
            mapview: true,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
    static async renderShareview(req, res) {
        // check if shareview exists
        let user = await User.findOne({ where: { shareId: req.params.shareId } });
        if(!user) return res.render('404');
        res.render('shareview', {
            dashboard: true,
            shareview: true,
        });
    }
    static async renderLogin(req, res) {
        if (req.user) {
            // user already logged in
            res.redirect('/overview');
        } else {
            // not logged in
            res.render('login');
        }
    }
    static async renderRegister(req, res) {
        res.render('register', {
            register: true
        });
    }
    static async renderEdit(req, res) {
        res.render('edit', {
            dashboard: true,
            edit: true,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
    static async renderShare(req, res) {
        res.render('share', {
            dashboard: true,
            share: true,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
    
    static async renderSettings(req, res) {
        res.render('settings', {
            dashboard: true,
            settings: true,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
    
    // Dashboard pages
    static async renderDashboards(req, res) {
        res.render('dashboards', {
            dashboard: true,
            dashboards: true,
            userEmail: req.user.email,
            loggedIn: true
        });
    }
    
    static async renderDashboardEditor(req, res) {
        res.render('dashboard-editor', {
            dashboard: true,
            dashboardEditor: true,
            userEmail: req.user.email,
            loggedIn: true,
            dashboardId: req.params.dashboardId || 'new'
        });
    }
    
    static async renderDashboardView(req, res) {
        res.render('dashboard-view', {
            dashboard: true,
            dashboardView: true,
            userEmail: req.user.email,
            loggedIn: true,
            dashboardId: req.params.dashboardId
        });
    }
    
    static async renderDashboardLive(req, res) {
        // Public live dashboard view (for browser source/OBS)
        const dashboard = await Dashboard.findOne({
            where: { 
                shareId: req.params.shareId,
                isPublic: true 
            }
        });
        
        if (!dashboard) {
            return res.render('404');
        }
        
        res.render('dashboard-live', {
            layout: false, // No layout for browser source
            shareId: req.params.shareId
        });
    }
}

module.exports = PageController;