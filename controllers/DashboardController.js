const Dashboard = require('../models').Dashboard;
const { nanoid } = require('nanoid');

class DashboardController {
    // Get all dashboards for current user
    static async getAll(req, res) {
        try {
            const dashboards = await Dashboard.findAll({
                where: { userId: req.user.id },
                order: [['updatedAt', 'DESC']]
            });
            res.json(dashboards);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch dashboards' });
        }
    }

    // Get single dashboard
    static async getOne(req, res) {
        try {
            const dashboard = await Dashboard.findOne({
                where: {
                    id: req.params.dashboardId,
                    userId: req.user.id
                }
            });

            if (!dashboard) {
                return res.status(404).json({ error: 'Dashboard not found' });
            }

            res.json(dashboard);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch dashboard' });
        }
    }

    // Get shared dashboard (public access)
    static async getShared(req, res) {
        try {
            const dashboard = await Dashboard.findOne({
                where: {
                    shareId: req.params.shareId,
                    isPublic: true
                }
            });

            if (!dashboard) {
                return res.status(404).json({ error: 'Dashboard not found or not public' });
            }

            res.json(dashboard);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch dashboard' });
        }
    }

    // Create new dashboard
    static async create(req, res) {
        try {
            const { name, description, config } = req.body;

            const dashboard = await Dashboard.create({
                userId: req.user.id,
                name: name || 'New Dashboard',
                description: description || '',
                config: config || {
                    widgets: [],
                    settings: {
                        backgroundColor: '#1a1a1a',
                        backgroundImage: null,
                        gridSize: 20,
                        width: 1920,
                        height: 1080
                    }
                }
            });

            res.status(201).json(dashboard);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to create dashboard' });
        }
    }

    // Update dashboard
    static async update(req, res) {
        try {
            const { name, description, config, activeSessionId } = req.body;

            const dashboard = await Dashboard.findOne({
                where: {
                    id: req.params.dashboardId,
                    userId: req.user.id
                }
            });

            if (!dashboard) {
                return res.status(404).json({ error: 'Dashboard not found' });
            }

            await dashboard.update({
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(config !== undefined && { config }),
                ...(activeSessionId !== undefined && { activeSessionId })
            });

            res.json(dashboard);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update dashboard' });
        }
    }

    // Delete dashboard
    static async delete(req, res) {
        try {
            const dashboard = await Dashboard.findOne({
                where: {
                    id: req.params.dashboardId,
                    userId: req.user.id
                }
            });

            if (!dashboard) {
                return res.status(404).json({ error: 'Dashboard not found' });
            }

            await dashboard.destroy();
            res.json({ message: 'Dashboard deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete dashboard' });
        }
    }

    // Toggle public sharing
    static async toggleShare(req, res) {
        try {
            const dashboard = await Dashboard.findOne({
                where: {
                    id: req.params.dashboardId,
                    userId: req.user.id
                }
            });

            if (!dashboard) {
                return res.status(404).json({ error: 'Dashboard not found' });
            }

            const isPublic = !dashboard.isPublic;
            let shareId = dashboard.shareId;

            // Generate shareId if making public and no shareId exists
            if (isPublic && !shareId) {
                shareId = nanoid(10);
            }

            await dashboard.update({
                isPublic,
                shareId
            });

            res.json(dashboard);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to toggle sharing' });
        }
    }

    // Duplicate dashboard
    static async duplicate(req, res) {
        try {
            const original = await Dashboard.findOne({
                where: {
                    id: req.params.dashboardId,
                    userId: req.user.id
                }
            });

            if (!original) {
                return res.status(404).json({ error: 'Dashboard not found' });
            }

            const duplicate = await Dashboard.create({
                userId: req.user.id,
                name: `${original.name} (Copy)`,
                description: original.description,
                config: original.config,
                isPublic: false,
                shareId: null
            });

            res.status(201).json(duplicate);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to duplicate dashboard' });
        }
    }
}

module.exports = DashboardController;

