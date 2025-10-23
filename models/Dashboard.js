module.exports = (sequelize, DataTypes) => {
    const Dashboard = sequelize.define('Dashboard', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Unnamed Dashboard'
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        // JSON configuration for dashboard layout and widgets
        config: {
            type: DataTypes.JSONB,
            defaultValue: {
                widgets: [],
                settings: {
                    backgroundColor: '#1a1a1a',
                    backgroundImage: null,
                    gridSize: 20,
                    width: 1920,
                    height: 1080
                }
            }
        },
        // Public sharing link
        shareId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true
        },
        // Enable/disable public access
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        // Active session for real-time data
        activeSessionId: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['shareId']
            }
        ]
    });

    Dashboard.associate = function(models) {
        Dashboard.belongsTo(models.User, {
            foreignKey: 'userId',
            onDelete: 'CASCADE'
        });
    };

    return Dashboard;
};

