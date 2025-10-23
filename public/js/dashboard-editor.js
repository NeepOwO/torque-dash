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
        this.rotating = false;
        this.resizeHandle = null; // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'
        this.dragOffset = { x: 0, y: 0 };
        this.rotateStartAngle = 0;
        this.rotateCenter = { x: 0, y: 0 };
        
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
        
        // Check if clicking on selected widget's handles
        if (this.selectedWidget) {
            const handle = this.getHandleAtPoint(x, y, this.selectedWidget);
            
            if (handle === 'rotate') {
                this.rotating = true;
                const cx = this.selectedWidget.x + this.selectedWidget.width / 2;
                const cy = this.selectedWidget.y + this.selectedWidget.height / 2;
                this.rotateCenter = { x: cx, y: cy };
                this.rotateStartAngle = Math.atan2(y - cy, x - cx) - (this.selectedWidget.rotation || 0) * Math.PI / 180;
                return;
            } else if (handle) {
                this.resizing = true;
                this.resizeHandle = handle;
                this.dragOffset = {
                    x: x - this.selectedWidget.x,
                    y: y - this.selectedWidget.y
                };
                return;
            }
        }
        
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
        
        if (this.rotating && this.selectedWidget) {
            const angle = Math.atan2(y - this.rotateCenter.y, x - this.rotateCenter.x);
            let rotation = (angle - this.rotateStartAngle) * 180 / Math.PI;
            
            // Snap to 15 degree increments if shift is held
            if (e.shiftKey) {
                rotation = Math.round(rotation / 15) * 15;
            }
            
            this.selectedWidget.rotation = rotation % 360;
            this.render();
        } else if (this.resizing && this.selectedWidget) {
            this.handleResize(x, y);
            this.render();
        } else if (this.dragging && this.selectedWidget) {
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
            if (this.selectedWidget) {
                const handle = this.getHandleAtPoint(x, y, this.selectedWidget);
                this.canvas.style.cursor = this.getCursorForHandle(handle);
            } else {
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
    }

    handleMouseUp(e) {
        this.dragging = false;
        this.resizing = false;
        this.rotating = false;
        this.resizeHandle = null;
        this.canvas.style.cursor = 'default';
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
    
    getHandleAtPoint(x, y, widget) {
        const handleSize = 10;
        const rotateHandleDistance = 30;
        const wx = widget.x;
        const wy = widget.y;
        const ww = widget.width;
        const wh = widget.height;
        
        // Rotate handle (top center, above widget)
        const rotateCx = wx + ww / 2;
        const rotateCy = wy - rotateHandleDistance;
        if (Math.abs(x - rotateCx) < handleSize && Math.abs(y - rotateCy) < handleSize) {
            return 'rotate';
        }
        
        // Corner handles
        if (Math.abs(x - wx) < handleSize && Math.abs(y - wy) < handleSize) return 'nw';
        if (Math.abs(x - (wx + ww)) < handleSize && Math.abs(y - wy) < handleSize) return 'ne';
        if (Math.abs(x - wx) < handleSize && Math.abs(y - (wy + wh)) < handleSize) return 'sw';
        if (Math.abs(x - (wx + ww)) < handleSize && Math.abs(y - (wy + wh)) < handleSize) return 'se';
        
        // Edge handles
        if (Math.abs(x - (wx + ww / 2)) < handleSize && Math.abs(y - wy) < handleSize) return 'n';
        if (Math.abs(x - (wx + ww / 2)) < handleSize && Math.abs(y - (wy + wh)) < handleSize) return 's';
        if (Math.abs(x - wx) < handleSize && Math.abs(y - (wy + wh / 2)) < handleSize) return 'w';
        if (Math.abs(x - (wx + ww)) < handleSize && Math.abs(y - (wy + wh / 2)) < handleSize) return 'e';
        
        return null;
    }
    
    handleResize(x, y) {
        const widget = this.selectedWidget;
        if (!widget || !this.resizeHandle) return;
        
        const handle = this.resizeHandle;
        const minSize = 50;
        
        if (handle.includes('e')) {
            const newWidth = Math.max(minSize, x - widget.x);
            widget.width = newWidth;
            if (widget.canvas) widget.canvas.width = newWidth;
        }
        if (handle.includes('w')) {
            const newWidth = Math.max(minSize, widget.x + widget.width - x);
            if (newWidth >= minSize) {
                widget.x = x;
                widget.width = newWidth;
                if (widget.canvas) widget.canvas.width = newWidth;
            }
        }
        if (handle.includes('s')) {
            const newHeight = Math.max(minSize, y - widget.y);
            widget.height = newHeight;
            if (widget.canvas) widget.canvas.height = newHeight;
        }
        if (handle.includes('n')) {
            const newHeight = Math.max(minSize, widget.y + widget.height - y);
            if (newHeight >= minSize) {
                widget.y = y;
                widget.height = newHeight;
                if (widget.canvas) widget.canvas.height = newHeight;
            }
        }
        
        // Recreate widget instance with new canvas size
        if (widget.instance) {
            widget.instance.destroy();
        }
        widget.instance = this.createWidgetInstance(widget);
    }
    
    getCursorForHandle(handle) {
        if (!handle) return 'default';
        if (handle === 'rotate') return 'grab';
        
        const cursors = {
            'n': 'ns-resize',
            's': 'ns-resize',
            'e': 'ew-resize',
            'w': 'ew-resize',
            'nw': 'nwse-resize',
            'se': 'nwse-resize',
            'ne': 'nesw-resize',
            'sw': 'nesw-resize'
        };
        
        return cursors[handle] || 'default';
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
                
                // Apply rotation if set
                if (widget.rotation) {
                    this.ctx.save();
                    const cx = widget.x + widget.width / 2;
                    const cy = widget.y + widget.height / 2;
                    this.ctx.translate(cx, cy);
                    this.ctx.rotate(widget.rotation * Math.PI / 180);
                    this.ctx.drawImage(widget.canvas, -widget.width / 2, -widget.height / 2);
                    this.ctx.restore();
                } else {
                    this.ctx.drawImage(widget.canvas, widget.x, widget.y);
                }
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
        const handleSize = 10;
        const wx = widget.x;
        const wy = widget.y;
        const ww = widget.width;
        const wh = widget.height;
        
        // Corner handles (larger, white with blue border)
        const corners = [
            { x: wx, y: wy },                    // nw
            { x: wx + ww, y: wy },               // ne
            { x: wx, y: wy + wh },               // sw
            { x: wx + ww, y: wy + wh }           // se
        ];
        
        // Edge handles (smaller, blue)
        const edges = [
            { x: wx + ww / 2, y: wy },           // n
            { x: wx + ww / 2, y: wy + wh },      // s
            { x: wx, y: wy + wh / 2 },           // w
            { x: wx + ww, y: wy + wh / 2 }       // e
        ];
        
        // Draw corner handles
        corners.forEach(handle => {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
            this.ctx.strokeStyle = '#00aaff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
        
        // Draw edge handles
        edges.forEach(handle => {
            this.ctx.fillStyle = '#00aaff';
            this.ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
        
        // Draw rotate handle (circle above center top)
        const rotateHandleDistance = 30;
        const rotateCx = wx + ww / 2;
        const rotateCy = wy - rotateHandleDistance;
        
        // Draw line from widget to rotate handle
        this.ctx.strokeStyle = '#00aaff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(wx + ww / 2, wy);
        this.ctx.lineTo(rotateCx, rotateCy);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw rotate handle circle
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(rotateCx, rotateCy, handleSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw rotation icon
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(rotateCx, rotateCy, 3, 0, Math.PI * 1.5);
        this.ctx.stroke();
        
        // Display current rotation angle
        if (widget.rotation) {
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(Math.round(widget.rotation) + '°', rotateCx, rotateCy - 15);
        }
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
                rotation: w.rotation || 0,
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
                    rotation: widgetData.rotation || 0,
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

