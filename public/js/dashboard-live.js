/**
 * Live Dashboard Viewer
 * Real-time dashboard rendering with WebSocket updates
 */

class DashboardLiveViewer {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.widgets = [];
        this.socket = null;
        this.sessionId = null;
        this.dashboardId = null;
        
        this.config = {
            gridSize: 20,
            backgroundColor: '#1a1a1a',
            backgroundImage: null,
            width: 1920,
            height: 1080,
            ...options
        };
        
        this.sensorMapping = this.createSensorMapping();
        
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
    }

    createSensorMapping() {
        // Map sensor keys to PID names
        return {
            'kc': 'Engine RPM',
            'kd': 'Speed (OBD)',
            'kff1001': 'Speed (GPS)',
            'k5': 'Engine Coolant Temperature',
            'kf': 'Intake Air Temperature',
            'k5c': 'Engine Oil Temperature',
            'kb': 'Intake Manifold Pressure',
            'k4': 'Engine Load',
            'k10': 'Mass Air Flow Rate',
            'k42': 'Voltage (Control Module)',
            'kff1225': 'Torque',
            'kff1226': 'Horsepower (At the wheels)',
            'kff1202': 'Turbo Boost & Vacuum Gauge',
            'k2f': 'Fuel Level (From Engine ECU)',
            'kff125a': 'Fuel flow rate/minute',
            'kff1201': 'Miles Per Gallon(Instant)',
            'ke': 'Timing Advance',
            'k11': 'Throttle Position(Manifold)',
            'k45': 'Relative Throttle Position'
        };
    }

    connectWebSocket(sessionId, dashboardId) {
        this.sessionId = sessionId;
        this.dashboardId = dashboardId;
        
        // Connect to Socket.IO server
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            
            if (this.sessionId) {
                this.socket.emit('join-session', this.sessionId);
            }
            if (this.dashboardId) {
                this.socket.emit('join-dashboard', this.dashboardId);
            }
        });

        this.socket.on('sensor-data', (data) => {
            this.updateSensorData(data);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });
    }

    updateSensorData(data) {
        if (!data.values) return;
        
        // Update each widget based on its sensor mapping
        this.widgets.forEach(widget => {
            if (widget.sensorKey && data.values[widget.sensorKey] !== undefined) {
                const value = parseFloat(data.values[widget.sensorKey]);
                if (!isNaN(value) && widget.instance) {
                    widget.instance.setValue(value);
                }
            }
        });
        
        this.render();
    }

    createWidgetInstance(widget) {
        switch (widget.type) {
            case 'circular-gauge':
                return new CircularGauge(widget.canvas, widget.config || {});
            case 'linear-gauge':
                return new LinearGauge(widget.canvas, widget.config || {});
            case 'digital-display':
                return new DigitalDisplay(widget.canvas, widget.config || {});
            case 'speedometer':
                return new SpeedometerGauge(widget.canvas, widget.config || {});
            case 'tachometer':
                return new TachometerGauge(widget.canvas, widget.config || {});
            case 'temperature':
                return new TemperatureGauge(widget.canvas, widget.config || {});
            case 'indicator-light':
                return new IndicatorLight(widget.canvas, widget.config || {});
            default:
                return new CircularGauge(widget.canvas, widget.config || {});
        }
    }

    loadConfig(config) {
        // Clear existing widgets
        this.widgets.forEach(w => {
            if (w.instance) w.instance.destroy();
        });
        this.widgets = [];
        
        // Load settings
        if (config.settings) {
            this.config = { ...this.config, ...config.settings };
            this.setupCanvas();
        }
        
        // Load widgets
        if (config.widgets) {
            config.widgets.forEach(widgetData => {
                const widget = {
                    id: widgetData.id,
                    type: widgetData.type,
                    x: widgetData.x,
                    y: widgetData.y,
                    width: widgetData.width,
                    height: widgetData.height,
                    sensorKey: widgetData.sensorKey,
                    config: widgetData.config
                };
                
                widget.canvas = document.createElement('canvas');
                widget.canvas.width = widget.width;
                widget.canvas.height = widget.height;
                widget.instance = this.createWidgetInstance(widget);
                
                this.widgets.push(widget);
            });
        }
        
        this.render();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background image if set
        if (this.config.backgroundImage) {
            // TODO: Draw background image
        }
        
        // Draw all widgets
        this.widgets.forEach(widget => {
            if (widget.instance) {
                widget.instance.draw();
                this.ctx.drawImage(widget.canvas, widget.x, widget.y);
            }
        });
    }

    start() {
        // Start rendering loop
        this.renderLoop();
    }

    renderLoop() {
        this.render();
        requestAnimationFrame(() => this.renderLoop());
    }

    destroy() {
        if (this.socket) {
            this.socket.disconnect();
        }
        this.widgets.forEach(w => {
            if (w.instance) w.instance.destroy();
        });
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.DashboardLiveViewer = DashboardLiveViewer;
}

