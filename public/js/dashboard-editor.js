/**
 * Dashboard Editor with Drag & Drop
 * Visual editor for creating custom dashboards
 */

class DashboardEditor {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.widgets = [];
        this.selectedWidget = null;
        this.dragging = false;
        this.resizing = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.config = {
            gridSize: 20,
            backgroundColor: '#1a1a1a',
            backgroundImage: null,
            width: 1920,
            height: 1080,
            showGrid: true,
            snapToGrid: true,
            ...options
        };
        
        this.setupCanvas();
        this.setupEventListeners();
        this.render();
    }

    setupCanvas() {
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        this.canvas.style.cursor = 'default';
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on a widget
        for (let i = this.widgets.length - 1; i >= 0; i--) {
            const widget = this.widgets[i];
            if (this.isPointInWidget(x, y, widget)) {
                this.selectedWidget = widget;
                this.dragging = true;
                this.dragOffset = {
                    x: x - widget.x,
                    y: y - widget.y
                };
                this.render();
                return;
            }
        }
        
        // Clicked on empty space - deselect
        this.selectedWidget = null;
        this.render();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.dragging && this.selectedWidget) {
            let newX = x - this.dragOffset.x;
            let newY = y - this.dragOffset.y;
            
            // Snap to grid
            if (this.config.snapToGrid) {
                newX = Math.round(newX / this.config.gridSize) * this.config.gridSize;
                newY = Math.round(newY / this.config.gridSize) * this.config.gridSize;
            }
            
            this.selectedWidget.x = Math.max(0, Math.min(newX, this.canvas.width - this.selectedWidget.width));
            this.selectedWidget.y = Math.max(0, Math.min(newY, this.canvas.height - this.selectedWidget.height));
            
            this.render();
        } else {
            // Update cursor based on hover
            let hovering = false;
            for (let i = this.widgets.length - 1; i >= 0; i--) {
                if (this.isPointInWidget(x, y, this.widgets[i])) {
                    hovering = true;
                    break;
                }
            }
            this.canvas.style.cursor = hovering ? 'move' : 'default';
        }
    }

    handleMouseUp(e) {
        this.dragging = false;
        this.resizing = false;
    }

    handleDoubleClick(e) {
        if (this.selectedWidget) {
            this.showWidgetProperties(this.selectedWidget);
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Delete' && this.selectedWidget) {
            this.removeWidget(this.selectedWidget);
        } else if (e.key === 'Escape') {
            this.selectedWidget = null;
            this.render();
        }
    }

    isPointInWidget(x, y, widget) {
        return x >= widget.x && x <= widget.x + widget.width &&
               y >= widget.y && y <= widget.y + widget.height;
    }

    addWidget(type, config = {}) {
        const defaultConfig = {
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            type: type,
            sensorKey: null,
            ...config
        };
        
        const widget = {
            id: 'widget_' + Date.now(),
            ...defaultConfig,
            instance: null
        };
        
        // Create widget canvas
        widget.canvas = document.createElement('canvas');
        widget.canvas.width = widget.width;
        widget.canvas.height = widget.height;
        
        // Create widget instance
        widget.instance = this.createWidgetInstance(widget);
        
        this.widgets.push(widget);
        this.selectedWidget = widget;
        this.render();
        
        return widget;
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
            case 'gps-map':
                return new GPSMapWidget(widget.canvas, widget.config || {});
            default:
                return new CircularGauge(widget.canvas, widget.config || {});
        }
    }

    removeWidget(widget) {
        const index = this.widgets.indexOf(widget);
        if (index > -1) {
            if (widget.instance) {
                widget.instance.destroy();
            }
            this.widgets.splice(index, 1);
            this.selectedWidget = null;
            this.render();
        }
    }

    updateWidgetValue(widgetId, value) {
        const widget = this.widgets.find(w => w.id === widgetId);
        if (widget && widget.instance) {
            widget.instance.setValue(value);
            this.render();
        }
    }

    updateWidgetBySensor(sensorKey, value) {
        this.widgets.forEach(widget => {
            if (widget.sensorKey === sensorKey && widget.instance) {
                widget.instance.setValue(value);
            }
        });
        this.render();
    }
    
    updateGPSData(gpsData) {
        // Special method for updating GPS widgets with lat/lon/speed/bearing
        this.widgets.forEach(widget => {
            if (widget.type === 'gps-map' && widget.instance) {
                widget.instance.updateGPS(
                    gpsData.lat,
                    gpsData.lon,
                    gpsData.speed,
                    gpsData.bearing
                );
            }
        });
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background image if set
        if (this.config.backgroundImage) {
            // TODO: Draw background image
        }
        
        // Draw grid
        if (this.config.showGrid) {
            this.drawGrid();
        }
        
        // Draw all widgets
        this.widgets.forEach(widget => {
            if (widget.instance) {
                widget.instance.draw();
                this.ctx.drawImage(widget.canvas, widget.x, widget.y);
            }
            
            // Draw selection border
            if (widget === this.selectedWidget) {
                this.ctx.strokeStyle = '#00aaff';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.strokeRect(widget.x - 2, widget.y - 2, widget.width + 4, widget.height + 4);
                this.ctx.setLineDash([]);
                
                // Draw resize handles
                this.drawResizeHandles(widget);
            }
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += this.config.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += this.config.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawResizeHandles(widget) {
        const handleSize = 8;
        const handles = [
            { x: widget.x + widget.width, y: widget.y + widget.height } // Bottom-right
        ];
        
        this.ctx.fillStyle = '#00aaff';
        handles.forEach(handle => {
            this.ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
    }

    showWidgetProperties(widget) {
        // Trigger event to show properties panel
        const event = new CustomEvent('widget-properties', {
            detail: { widget }
        });
        document.dispatchEvent(event);
    }

    getConfig() {
        return {
            settings: this.config,
            widgets: this.widgets.map(w => ({
                id: w.id,
                type: w.type,
                x: w.x,
                y: w.y,
                width: w.width,
                height: w.height,
                sensorKey: w.sensorKey,
                config: w.instance ? w.instance.config : {}
            }))
        };
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

    exportToImage() {
        return this.canvas.toDataURL('image/png');
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.DashboardEditor = DashboardEditor;
}

