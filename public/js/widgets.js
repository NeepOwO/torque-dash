/**
 * Dashboard Widgets Library
 * Custom gauges, indicators, and displays for real-time sensor data
 */

class DashboardWidget {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = {
            ...this.getDefaultConfig(),
            ...config
        };
        this.value = 0;
        this.targetValue = 0;
        this.displayValue = 0;
        this.animationFrame = null;
        this.lastUpdateTime = Date.now();
        
        // Image layers
        this.backgroundImage = null;
        this.foregroundImage = null;
        this.loadImages();
        
        // Start smooth update loop if enabled
        if (this.config.smoothing > 0) {
            this.startSmoothUpdate();
        }
    }

    getDefaultConfig() {
        return {
            // Basic
            minValue: 0,
            maxValue: 100,
            unit: '',
            label: 'Sensor',
            
            // Colors
            backgroundColor: 'transparent',
            primaryColor: '#00ff00',
            secondaryColor: '#333333',
            textColor: '#ffffff',
            
            // Angles and Rotation (for circular widgets)
            startAngle: 225,      // Starting angle in degrees (0-360) - default: bottom-left like car gauges (8 o'clock)
            endAngle: 495,        // Ending angle in degrees (0-360+) - default: bottom-right, gap at bottom (4 o'clock)
            rotation: 0,          // Widget rotation in degrees (0-360)
            
            // Ticks and Scale
            tickCount: 10,        // Number of tick marks
            showTicks: true,      // Show tick marks
            showNumbers: true,    // Show numbers on scale
            majorTickInterval: 2, // Every Nth tick is major
            tickLength: 10,       // Tick mark length in pixels
            
            // Value Display
            showValue: true,           // Show numeric value
            showLabel: true,           // Show label
            showUnit: true,            // Show unit
            valuePosition: 'bottom',   // 'center', 'top', 'bottom', 'custom'
            valueCustomX: 0,           // Custom X position (if valuePosition='custom')
            valueCustomY: 0,           // Custom Y position (if valuePosition='custom')
            valueFormat: '0',          // '0', '0.0', '0.00'
            valueSize: 24,             // Value font size
            unitSize: 14,              // Unit font size
            fontSize: 14,              // Label font size
            
            // Needle/Pointer (for gauge widgets)
            needleLength: 0.7,    // Length as ratio of radius (0-1)
            needleWidth: 3,       // Width in pixels
            needleColor: null,    // null = use primaryColor
            
            // Color Zones
            zones: [],            // Array of {from, to, color} objects
            useZones: false,      // Enable color zones
            
            // Images
            backgroundImageUrl: null,
            foregroundImageUrl: null,
            backgroundOpacity: 0.5,
            foregroundOpacity: 1.0,
            imageMode: 'background',    // 'background', 'dual', 'overlay'
            imageStartAngle: 0,         // Image fill start angle
            imageEndAngle: 360,         // Image fill end angle
            imageFillMode: 'linear',    // 'linear', 'circular', 'radial'
            imageScale: 1.0,            // Image scale factor
            imageOffsetX: 0,            // Image offset X
            imageOffsetY: 0,            // Image offset Y
            
            // Animation
            smoothing: 0.2,             // Value smoothing (0-1)
            updateDelay: 0,             // Update delay in ms
            animationDuration: 500,     // Animation duration in ms
            animationEasing: 'ease-in-out', // 'linear', 'ease-in-out', 'bounce'
            
            // Sensor mapping
            sensorKeys: [] // Array of sensor keys this widget responds to
        };
    }

    loadImages() {
        // Load background image
        if (this.config.backgroundImageUrl) {
            this.backgroundImage = new Image();
            this.backgroundImage.onload = () => this.draw();
            this.backgroundImage.src = this.config.backgroundImageUrl;
        }
        
        // Load foreground image
        if (this.config.foregroundImageUrl) {
            this.foregroundImage = new Image();
            this.foregroundImage.onload = () => this.draw();
            this.foregroundImage.src = this.config.foregroundImageUrl;
        }
    }

    setValue(value) {
        const clampedValue = Math.max(this.config.minValue, Math.min(this.config.maxValue, value));
        
        if (this.config.updateDelay > 0) {
            // Delayed update
            setTimeout(() => {
                this.targetValue = clampedValue;
                if (this.config.smoothing === 0) {
                    this.value = clampedValue;
                    this.displayValue = clampedValue;
                    this.draw();
                }
            }, this.config.updateDelay);
        } else {
            this.targetValue = clampedValue;
            if (this.config.smoothing === 0) {
                this.value = clampedValue;
                this.displayValue = clampedValue;
                this.draw();
            }
        }
    }

    startSmoothUpdate() {
        const update = () => {
            const now = Date.now();
            const deltaTime = (now - this.lastUpdateTime) / 1000; // seconds
            this.lastUpdateTime = now;
            
            // Smooth interpolation
            const diff = this.targetValue - this.displayValue;
            const smoothFactor = 1 - Math.pow(this.config.smoothing, deltaTime * 60);
            this.displayValue += diff * smoothFactor;
            
            // Update actual value for display
            this.value = this.displayValue;
            
            // Redraw
            this.draw();
            
            // Continue loop
            this.animationFrame = requestAnimationFrame(update);
        };
        
        update();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background color
        if (this.config.backgroundColor !== 'transparent') {
            this.ctx.fillStyle = this.config.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw background image if in background or dual mode
        if (this.backgroundImage && this.backgroundImage.complete) {
            this.ctx.save();
            this.ctx.globalAlpha = this.config.backgroundOpacity;
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }

    drawForegroundImage() {
        // Draw foreground image (filled gauge overlay)
        if (this.foregroundImage && this.foregroundImage.complete && this.config.imageMode === 'dual') {
            this.ctx.save();
            
            // Clip to value percentage
            const valueRatio = (this.value - this.config.minValue) / (this.config.maxValue - this.config.minValue);
            
            // Create clipping region based on fill direction
            this.ctx.beginPath();
            if (this.config.fillDirection === 'vertical') {
                const fillHeight = this.canvas.height * valueRatio;
                this.ctx.rect(0, this.canvas.height - fillHeight, this.canvas.width, fillHeight);
            } else {
                // Horizontal (default)
                const fillWidth = this.canvas.width * valueRatio;
                this.ctx.rect(0, 0, fillWidth, this.canvas.height);
            }
            this.ctx.clip();
            
            this.ctx.globalAlpha = this.config.foregroundOpacity;
            this.ctx.drawImage(this.foregroundImage, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }

    draw() {
        // Override in subclasses
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    updateConfig(newConfig) {
        const needsImageReload = 
            newConfig.backgroundImageUrl !== this.config.backgroundImageUrl ||
            newConfig.foregroundImageUrl !== this.config.foregroundImageUrl;
            
        this.config = { ...this.config, ...newConfig };
        
        if (needsImageReload) {
            this.loadImages();
        }
        
        // Restart smooth update if smoothing changed
        if (newConfig.smoothing !== undefined) {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            if (this.config.smoothing > 0) {
                this.startSmoothUpdate();
            }
        }
        
        this.draw();
    }

    // Helper: Format value according to valueFormat
    formatValue(value) {
        const format = this.config.valueFormat || '0';
        if (format === '0') {
            return Math.round(value).toString();
        } else if (format === '0.0') {
            return value.toFixed(1);
        } else if (format === '0.00') {
            return value.toFixed(2);
        }
        return value.toString();
    }

    // Helper: Get color for value based on zones
    getColorForValue(value) {
        if (this.config.useZones && this.config.zones && this.config.zones.length > 0) {
            for (const zone of this.config.zones) {
                if (value >= zone.from && value <= zone.to) {
                    return zone.color;
                }
            }
        }
        return this.config.primaryColor;
    }

    // Helper: Convert degrees to radians
    degToRad(degrees) {
        return (degrees * Math.PI) / 180;
    }

    // Helper: Normalize angle to 0-360 range
    normalizeAngle(angle) {
        angle = angle % 360;
        if (angle < 0) angle += 360;
        return angle;
    }

    // Helper: Get value position coordinates
    getValuePosition(centerX, centerY, radius) {
        const pos = this.config.valuePosition;
        
        switch (pos) {
            case 'center':
                return { x: centerX, y: centerY };
            case 'top':
                return { x: centerX, y: centerY - radius * 0.6 };
            case 'bottom':
                return { x: centerX, y: centerY + radius * 0.6 };
            case 'custom':
                return { 
                    x: centerX + this.config.valueCustomX, 
                    y: centerY + this.config.valueCustomY 
                };
            default:
                return { x: centerX, y: centerY };
        }
    }

    // Helper: Draw rotated context
    withRotation(x, y, rotation, callback) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(this.degToRad(rotation));
        this.ctx.translate(-x, -y);
        callback();
        this.ctx.restore();
    }
}

class CircularGauge extends DashboardWidget {
    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            startAngle: 225,
            endAngle: 495,
            needleColor: '#ff0000',
            tickCount: 10,
            showTicks: true,
            showNumbers: true,
            warningThreshold: null,
            dangerThreshold: null,
            warningColor: '#ffaa00',
            dangerColor: '#ff0000'
        };
    }

    draw() {
        this.clear();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        
        // Apply rotation to entire widget
        this.withRotation(centerX, centerY, this.config.rotation, () => {
            // Draw gauge arc
            this.drawArc(centerX, centerY, radius);
            
            // Draw ticks and numbers
            if (this.config.showTicks || this.config.showNumbers) {
                this.drawTicks(centerX, centerY, radius);
            }
            
            // Draw needle
            this.drawNeedle(centerX, centerY, radius);
            
            // Draw center value
            if (this.config.showValue) {
                this.drawValue(centerX, centerY, radius);
            }
            
            // Draw label
            if (this.config.showLabel) {
                this.drawLabel(centerX, this.canvas.height - 20);
            }
        });
        
        this.drawForegroundImage();
    }

    drawArc(centerX, centerY, radius) {
        const startAngleRad = this.degToRad(this.config.startAngle - 90);
        const endAngleRad = this.degToRad(this.config.endAngle - 90);
        const angleRange = endAngleRad - startAngleRad;
        
        // Draw colored zones if enabled (background)
        if (this.config.useZones && this.config.zones && this.config.zones.length > 0) {
            const valueRange = this.config.maxValue - this.config.minValue;
            this.config.zones.forEach(zone => {
                const zoneStartRatio = (zone.from - this.config.minValue) / valueRange;
                const zoneEndRatio = (zone.to - this.config.minValue) / valueRange;
                const zoneStartAngle = startAngleRad + angleRange * zoneStartRatio;
                const zoneEndAngle = startAngleRad + angleRange * zoneEndRatio;
                
                this.ctx.strokeStyle = zone.color;
                this.ctx.lineWidth = 15;
                this.ctx.globalAlpha = 0.3;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, zoneStartAngle, zoneEndAngle);
                this.ctx.stroke();
            });
            this.ctx.globalAlpha = 1.0;
        }
        
        // Background arc
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, startAngleRad, endAngleRad);
        this.ctx.lineWidth = 15;
        this.ctx.strokeStyle = this.config.secondaryColor;
        this.ctx.globalAlpha = 0.3;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
        
        // Value arc - use color zones if enabled
        const valueRatio = (this.value - this.config.minValue) / (this.config.maxValue - this.config.minValue);
        const valueAngle = startAngleRad + angleRange * valueRatio;
        
        const arcColor = this.getColorForValue(this.value);
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, startAngleRad, valueAngle);
        this.ctx.lineWidth = 15;
        this.ctx.strokeStyle = arcColor;
        this.ctx.stroke();
    }

    drawTicks(centerX, centerY, radius) {
        const startAngle = this.config.startAngle - 90;
        const endAngle = this.config.endAngle - 90;
        const angleRange = endAngle - startAngle;
        const tickCount = this.config.tickCount;
        
        for (let i = 0; i <= tickCount; i++) {
            const angleRad = this.degToRad(startAngle + (angleRange * i / tickCount));
            const isMajor = (i % this.config.majorTickInterval === 0);
            const tickLen = isMajor ? this.config.tickLength * 1.5 : this.config.tickLength;
            
            // Draw tick
            if (this.config.showTicks) {
                const x1 = centerX + Math.cos(angleRad) * (radius - 20);
                const y1 = centerY + Math.sin(angleRad) * (radius - 20);
                const x2 = centerX + Math.cos(angleRad) * (radius - 20 - tickLen);
                const y2 = centerY + Math.sin(angleRad) * (radius - 20 - tickLen);
                
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.strokeStyle = this.config.textColor;
                this.ctx.lineWidth = isMajor ? 2 : 1;
                this.ctx.stroke();
            }
            
            // Draw numbers
            if (this.config.showNumbers && isMajor) {
                const value = this.config.minValue + (this.config.maxValue - this.config.minValue) * (i / tickCount);
                const textRadius = radius - 20 - this.config.tickLength * 2;
                const textX = centerX + Math.cos(angleRad) * textRadius;
                const textY = centerY + Math.sin(angleRad) * textRadius;
                
                this.ctx.fillStyle = this.config.textColor;
                this.ctx.font = `${this.config.fontSize}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(this.formatValue(value), textX, textY);
            }
        }
    }

    drawNeedle(centerX, centerY, radius) {
        const startAngle = this.config.startAngle - 90;
        const endAngle = this.config.endAngle - 90;
        const angleRange = endAngle - startAngle;
        const valueRatio = (this.value - this.config.minValue) / (this.config.maxValue - this.config.minValue);
        const angleRad = this.degToRad(startAngle + angleRange * valueRatio);
        
        const needleLen = radius * this.config.needleLength;
        const needleX = centerX + Math.cos(angleRad) * needleLen;
        const needleY = centerY + Math.sin(angleRad) * needleLen;
        
        const color = this.config.needleColor || this.getColorForValue(this.value);
        
        // Needle
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(needleX, needleY);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.config.needleWidth;
        this.ctx.stroke();
        
        // Center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    drawValue(centerX, centerY, radius) {
        const valuePos = this.getValuePosition(centerX, centerY, radius);
        
        this.ctx.fillStyle = this.config.textColor;
        this.ctx.font = `bold ${this.config.valueSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.formatValue(this.value), valuePos.x, valuePos.y);
        
        if (this.config.showUnit && this.config.unit) {
            this.ctx.font = `${this.config.unitSize}px Arial`;
            this.ctx.fillText(this.config.unit, valuePos.x, valuePos.y + this.config.valueSize);
        }
    }

    drawLabel(centerX, y) {
        this.ctx.fillStyle = this.config.textColor;
        this.ctx.font = `${this.config.fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.config.label, centerX, y);
    }
}

class LinearGauge extends DashboardWidget {
    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            orientation: 'horizontal', // or 'vertical'
            barHeight: 40,
            showGradient: true,
            gradientColors: ['#00ff00', '#ffff00', '#ff0000']
        };
    }

    draw() {
        this.clear();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Apply rotation
        this.withRotation(centerX, centerY, this.config.rotation, () => {
            if (this.config.orientation === 'horizontal') {
                this.drawHorizontal();
            } else {
                this.drawVertical();
            }
        });
        
        this.drawForegroundImage();
    }

    drawHorizontal() {
        const padding = 20;
        const barY = (this.canvas.height - this.config.barHeight) / 2;
        const barWidth = this.canvas.width - padding * 2;
        const valueWidth = barWidth * ((this.value - this.config.minValue) / (this.config.maxValue - this.config.minValue));
        
        // Background bar
        this.ctx.fillStyle = this.config.secondaryColor;
        this.ctx.fillRect(padding, barY, barWidth, this.config.barHeight);
        
        // Draw zones if enabled
        if (this.config.useZones && this.config.zones && this.config.zones.length > 0) {
            const valueRange = this.config.maxValue - this.config.minValue;
            this.config.zones.forEach(zone => {
                const zoneStartPos = (zone.from - this.config.minValue) / valueRange * barWidth;
                const zoneEndPos = (zone.to - this.config.minValue) / valueRange * barWidth;
                this.ctx.fillStyle = zone.color;
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(padding + zoneStartPos, barY, zoneEndPos - zoneStartPos, this.config.barHeight);
            });
            this.ctx.globalAlpha = 1.0;
        }
        
        // Value bar
        const color = this.getColorForValue(this.value);
        if (this.config.showGradient) {
            const gradient = this.ctx.createLinearGradient(padding, 0, padding + barWidth, 0);
            this.config.gradientColors.forEach((color, i) => {
                gradient.addColorStop(i / (this.config.gradientColors.length - 1), color);
            });
            this.ctx.fillStyle = gradient;
        } else {
            this.ctx.fillStyle = color;
        }
        this.ctx.fillRect(padding, barY, valueWidth, this.config.barHeight);
        
        // Border
        this.ctx.strokeStyle = this.config.textColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(padding, barY, barWidth, this.config.barHeight);
        
        // Value text
        if (this.config.showValue) {
            const valuePos = this.getValuePosition(this.canvas.width / 2, barY + this.config.barHeight / 2, 0);
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `bold ${this.config.valueSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.formatValue(this.value), valuePos.x, valuePos.y);
            if (this.config.showUnit && this.config.unit) {
                this.ctx.font = `${this.config.unitSize}px Arial`;
                this.ctx.fillText(this.config.unit, valuePos.x + this.ctx.measureText(this.formatValue(this.value)).width / 2 + 10, valuePos.y);
            }
        }
        
        // Label
        if (this.config.showLabel) {
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `${this.config.fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.config.label, this.canvas.width / 2, barY - 10);
        }
    }

    drawVertical() {
        const padding = 20;
        const barX = (this.canvas.width - this.config.barHeight) / 2;
        const barHeight = this.canvas.height - padding * 3;
        const valueHeight = barHeight * ((this.value - this.config.minValue) / (this.config.maxValue - this.config.minValue));
        
        // Background bar
        this.ctx.fillStyle = this.config.secondaryColor;
        this.ctx.fillRect(barX, padding * 2, this.config.barHeight, barHeight);
        
        // Draw zones if enabled
        if (this.config.useZones && this.config.zones && this.config.zones.length > 0) {
            const valueRange = this.config.maxValue - this.config.minValue;
            this.config.zones.forEach(zone => {
                const zoneStartPos = (zone.from - this.config.minValue) / valueRange * barHeight;
                const zoneEndPos = (zone.to - this.config.minValue) / valueRange * barHeight;
                this.ctx.fillStyle = zone.color;
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(barX, padding * 2 + barHeight - zoneEndPos, this.config.barHeight, zoneEndPos - zoneStartPos);
            });
            this.ctx.globalAlpha = 1.0;
        }
        
        // Value bar
        const color = this.getColorForValue(this.value);
        if (this.config.showGradient) {
            const gradient = this.ctx.createLinearGradient(0, padding * 2 + barHeight, 0, padding * 2);
            this.config.gradientColors.forEach((color, i) => {
                gradient.addColorStop(i / (this.config.gradientColors.length - 1), color);
            });
            this.ctx.fillStyle = gradient;
        } else {
            this.ctx.fillStyle = color;
        }
        this.ctx.fillRect(barX, padding * 2 + barHeight - valueHeight, this.config.barHeight, valueHeight);
        
        // Border
        this.ctx.strokeStyle = this.config.textColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, padding * 2, this.config.barHeight, barHeight);
        
        // Value text
        if (this.config.showValue) {
            const valuePos = this.getValuePosition(this.canvas.width / 2, padding * 2 + barHeight + 20, 0);
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `bold ${this.config.valueSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(this.formatValue(this.value), valuePos.x, valuePos.y);
            if (this.config.showUnit && this.config.unit) {
                this.ctx.font = `${this.config.unitSize}px Arial`;
                this.ctx.fillText(this.config.unit, valuePos.x, valuePos.y + this.config.valueSize);
            }
        }
        
        // Label
        if (this.config.showLabel) {
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `${this.config.fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.config.label, this.canvas.width / 2, 10);
        }
    }
}

class DigitalDisplay extends DashboardWidget {
    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            decimals: 1,
            fontSize: 48,
            valueSize: 48,
            glowEffect: true,
            glowColor: '#00ff00'
        };
    }

    draw() {
        this.clear();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Apply rotation
        this.withRotation(centerX, centerY, this.config.rotation, () => {
            this.drawDisplay(centerX, centerY);
        });
        
        this.drawForegroundImage();
    }
    
    drawDisplay(centerX, centerY) {
        // Glow effect
        if (this.config.glowEffect) {
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = this.config.glowColor;
        }
        
        // Value
        if (this.config.showValue) {
            const color = this.getColorForValue(this.value);
            this.ctx.fillStyle = color;
            this.ctx.font = `bold ${this.config.valueSize}px 'Courier New', monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.formatValue(this.value), centerX, centerY);
        }
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Unit
        if (this.config.showUnit && this.config.unit) {
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `${this.config.unitSize}px Arial`;
            this.ctx.fillText(this.config.unit, centerX, centerY + this.config.valueSize * 0.6);
        }
        
        // Label
        if (this.config.showLabel) {
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `${this.config.fontSize}px Arial`;
            this.ctx.fillText(this.config.label, centerX, centerY - this.config.valueSize * 0.7);
        }
    }
}

class SpeedometerGauge extends CircularGauge {
    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            maxValue: 220,
            unit: 'km/h',
            label: 'Speed',
            tickCount: 22,
            warningThreshold: 100,
            dangerThreshold: 180,
            primaryColor: '#00aaff'
        };
    }
}

class TachometerGauge extends CircularGauge {
    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            maxValue: 8000,
            unit: 'RPM',
            label: 'Engine RPM',
            tickCount: 8,
            warningThreshold: 6000,
            dangerThreshold: 7000,
            primaryColor: '#00ff00'
        };
    }
}

class TemperatureGauge extends LinearGauge {
    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            minValue: 0,
            maxValue: 120,
            unit: '°C',
            label: 'Temperature',
            orientation: 'vertical',
            gradientColors: ['#0099ff', '#00ff00', '#ffff00', '#ff0000']
        };
    }
}

class IndicatorLight extends DashboardWidget {
    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            shape: 'circle', // 'circle', 'square', 'triangle', 'icon'
            size: 60,
            offColor: '#333333',
            onColor: '#ff0000',
            glowIntensity: 20,
            // Condition settings
            conditionType: 'threshold', // 'threshold', 'range', 'equals', 'always'
            thresholdValue: 50,
            thresholdOperator: '<', // '<', '>', '<=', '>=', '==', '!='
            rangeMin: 0,
            rangeMax: 100,
            // Blinking
            blinkEnabled: false,
            blinkSpeed: 500, // milliseconds
            blinkPattern: 'steady', // 'steady', 'blink', 'pulse', 'fast-blink'
            // Icon
            iconUrl: null,
            iconSize: 40
        };
    }

    constructor(canvas, config) {
        super(canvas, config);
        this.isOn = false;
        this.blinkState = true;
        this.blinkTimer = null;
        this.pulsePhase = 0;
        this.iconImage = null;
        
        if (this.config.iconUrl) {
            this.loadIcon();
        }
        
        this.startBlinkAnimation();
    }

    loadIcon() {
        this.iconImage = new Image();
        this.iconImage.onload = () => this.draw();
        this.iconImage.src = this.config.iconUrl;
    }

    checkCondition() {
        const value = this.value;
        
        switch (this.config.conditionType) {
            case 'threshold':
                switch (this.config.thresholdOperator) {
                    case '<': return value < this.config.thresholdValue;
                    case '>': return value > this.config.thresholdValue;
                    case '<=': return value <= this.config.thresholdValue;
                    case '>=': return value >= this.config.thresholdValue;
                    case '==': return value === this.config.thresholdValue;
                    case '!=': return value !== this.config.thresholdValue;
                    default: return false;
                }
            case 'range':
                return value >= this.config.rangeMin && value <= this.config.rangeMax;
            case 'equals':
                return value === this.config.thresholdValue;
            case 'always':
                return true;
            default:
                return false;
        }
    }

    startBlinkAnimation() {
        if (this.blinkTimer) {
            clearInterval(this.blinkTimer);
        }

        if (this.config.blinkPattern === 'blink') {
            this.blinkTimer = setInterval(() => {
                this.blinkState = !this.blinkState;
                this.draw();
            }, this.config.blinkSpeed);
        } else if (this.config.blinkPattern === 'fast-blink') {
            this.blinkTimer = setInterval(() => {
                this.blinkState = !this.blinkState;
                this.draw();
            }, this.config.blinkSpeed / 3);
        } else if (this.config.blinkPattern === 'pulse') {
            const pulseUpdate = () => {
                this.pulsePhase += 0.05;
                this.draw();
                if (this.blinkTimer) {
                    requestAnimationFrame(pulseUpdate);
                }
            };
            this.blinkTimer = true;
            pulseUpdate();
        }
    }

    draw() {
        this.clear();
        
        // Check if indicator should be on
        this.isOn = this.checkCondition();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Apply rotation
        this.withRotation(centerX, centerY, this.config.rotation, () => {
            this.drawIndicator(centerX, centerY);
        });
        
        this.drawForegroundImage();
    }
    
    drawIndicator(centerX, centerY) {
        // Determine current color and visibility
        let currentColor = this.isOn ? this.config.onColor : this.config.offColor;
        let visible = true;
        let alpha = 1.0;
        
        if (this.isOn) {
            switch (this.config.blinkPattern) {
                case 'blink':
                case 'fast-blink':
                    visible = this.blinkState;
                    break;
                case 'pulse':
                    alpha = 0.3 + 0.7 * (Math.sin(this.pulsePhase) * 0.5 + 0.5);
                    break;
            }
        }
        
        if (!visible) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // Draw glow effect if on
        if (this.isOn && this.config.glowIntensity > 0) {
            this.ctx.shadowBlur = this.config.glowIntensity;
            this.ctx.shadowColor = currentColor;
        }
        
        // Draw shape
        if (this.config.shape === 'circle') {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, this.config.size / 2, 0, Math.PI * 2);
            this.ctx.fillStyle = currentColor;
            this.ctx.fill();
            
            // Border
            this.ctx.strokeStyle = this.config.textColor;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        } else if (this.config.shape === 'square') {
            const halfSize = this.config.size / 2;
            this.ctx.fillStyle = currentColor;
            this.ctx.fillRect(centerX - halfSize, centerY - halfSize, this.config.size, this.config.size);
            
            // Border
            this.ctx.strokeStyle = this.config.textColor;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(centerX - halfSize, centerY - halfSize, this.config.size, this.config.size);
        } else if (this.config.shape === 'triangle') {
            const size = this.config.size;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY - size / 2);
            this.ctx.lineTo(centerX - size / 2, centerY + size / 2);
            this.ctx.lineTo(centerX + size / 2, centerY + size / 2);
            this.ctx.closePath();
            this.ctx.fillStyle = currentColor;
            this.ctx.fill();
            
            // Border
            this.ctx.strokeStyle = this.config.textColor;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        } else if (this.config.shape === 'icon' && this.iconImage && this.iconImage.complete) {
            // Draw icon
            const iconSize = this.config.iconSize;
            this.ctx.drawImage(
                this.iconImage,
                centerX - iconSize / 2,
                centerY - iconSize / 2,
                iconSize,
                iconSize
            );
        }
        
        this.ctx.restore();
        
        // Draw label
        if (this.config.showLabel && this.config.label) {
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `${this.config.fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.config.label,
                centerX,
                centerY + this.config.size / 2 + this.config.fontSize + 10
            );
        }
        
        // Draw value if enabled
        if (this.config.showValue) {
            const valuePos = this.getValuePosition(centerX, centerY + this.config.size / 2 + this.config.fontSize * 2 + 15, 0);
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `${this.config.valueSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.formatValue(this.value), valuePos.x, valuePos.y);
            if (this.config.showUnit && this.config.unit) {
                this.ctx.font = `${this.config.unitSize}px Arial`;
                this.ctx.fillText(this.config.unit, valuePos.x + this.ctx.measureText(this.formatValue(this.value)).width / 2 + 5, valuePos.y);
            }
        }
    }

    destroy() {
        super.destroy();
        if (this.blinkTimer) {
            if (typeof this.blinkTimer === 'number') {
                clearInterval(this.blinkTimer);
            }
            this.blinkTimer = null;
        }
    }

    updateConfig(newConfig) {
        super.updateConfig(newConfig);
        
        if (newConfig.iconUrl !== undefined && newConfig.iconUrl !== this.config.iconUrl) {
            this.loadIcon();
        }
        
        if (newConfig.blinkPattern !== undefined || newConfig.blinkSpeed !== undefined) {
            this.startBlinkAnimation();
        }
    }
}

class GPSMapWidget extends DashboardWidget {
    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            zoom: 15,
            mapStyleName: 'osm',
            mapStyle: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            showTrack: true,
            trackColor: '#00ff00',
            trackWidth: 3,
            showMarker: true,
            markerColor: '#ff0000',
            showSpeed: true,
            maxTrackPoints: 1000,
            speedHeatmap: false,
            replayMode: false,
            replaySpeed: 1,
            // GPS sensor keys
            latKey: 'kff1006',
            lonKey: 'kff1005',
            speedKey: 'kff1001',
            bearingKey: 'kff123b'
        };
    }

    constructor(canvas, config) {
        super(canvas, config);
        this.mapContainer = null;
        this.map = null;
        this.marker = null;
        this.trackLine = null;
        this.heatmapLine = null;
        this.trackPoints = [];
        this.trackData = []; // Stores {lat, lon, speed, time}
        this.initialized = false;
        this.tileLayer = null;
        
        // GPS data
        this.currentLat = null;
        this.currentLon = null;
        this.currentSpeed = 0;
        this.currentBearing = 0;
        
        // Replay state
        this.replayPlaying = false;
        this.replayPaused = false;
        this.replayIndex = 0;
        this.replayTimer = null;
        
        // Map styles
        this.mapStyles = {
            'osm': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'satellite': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            'terrain': 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            'dark': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            'topo': 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        };
    }

    initMap() {
        if (this.initialized || typeof L === 'undefined') return;
        
        // Check if we're in editor mode (canvas has no proper parent)
        if (!this.canvas.parentNode || this.canvas.parentNode.tagName !== 'DIV') {
            console.log('GPS Map: Editor mode detected, showing placeholder');
            return;
        }
        
        // Create map container div
        this.mapContainer = document.createElement('div');
        this.mapContainer.style.width = this.canvas.width + 'px';
        this.mapContainer.style.height = this.canvas.height + 'px';
        this.mapContainer.style.position = 'absolute';
        this.mapContainer.style.top = '0';
        this.mapContainer.style.left = '0';
        this.mapContainer.style.zIndex = '1000';
        
        // Insert after canvas
        this.canvas.parentNode.insertBefore(this.mapContainer, this.canvas.nextSibling);
        
        // Initialize Leaflet map
        try {
            this.map = L.map(this.mapContainer, {
                zoomControl: true,
                attributionControl: false
            }).setView([0, 0], this.config.zoom);
            
            // Add tile layer
            const styleUrl = this.mapStyles[this.config.mapStyleName] || this.config.mapStyle;
            this.tileLayer = L.tileLayer(styleUrl, {
                maxZoom: 19
            }).addTo(this.map);
            
            // Create marker
            if (this.config.showMarker) {
                this.createMarker();
            }
            
            // Create track line
            if (this.config.showTrack) {
                if (this.config.speedHeatmap) {
                    this.createHeatmapTrack();
                } else {
                    this.trackLine = L.polyline([], {
                        color: this.config.trackColor,
                        weight: this.config.trackWidth
                    }).addTo(this.map);
                }
            }
            
            this.initialized = true;
        } catch (err) {
            console.error('Failed to initialize GPS map:', err);
        }
    }
    
    createMarker() {
        const markerIcon = L.divIcon({
            className: 'gps-marker',
            html: `<div style="background: ${this.config.markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        this.marker = L.marker([0, 0], { icon: markerIcon }).addTo(this.map);
        
        // Add speed popup
        if (this.config.showSpeed) {
            this.marker.bindPopup('Speed: 0 km/h');
        }
    }
    
    createHeatmapTrack() {
        // Use polyline with color gradient based on speed
        // This is a simplified heatmap - full implementation would use leaflet-heat plugin
        this.heatmapLine = L.polyline([], {
            weight: this.config.trackWidth,
            smoothFactor: 1
        }).addTo(this.map);
    }
    
    updateMapStyle(styleName) {
        if (!this.map || !this.tileLayer) return;
        
        const newUrl = this.mapStyles[styleName] || this.mapStyles['osm'];
        this.tileLayer.setUrl(newUrl);
        this.config.mapStyleName = styleName;
    }
    
    updateMarkerColor(color) {
        if (!this.marker) return;
        
        const markerIcon = L.divIcon({
            className: 'gps-marker',
            html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        this.marker.setIcon(markerIcon);
    }
    
    toggleSpeedHeatmap(enabled) {
        if (!this.map) return;
        
        if (enabled) {
            // Remove regular track
            if (this.trackLine) {
                this.trackLine.remove();
                this.trackLine = null;
            }
            // Create heatmap track
            this.createHeatmapTrack();
            this.redrawHeatmap();
        } else {
            // Remove heatmap
            if (this.heatmapLine) {
                this.heatmapLine.remove();
                this.heatmapLine = null;
            }
            // Create regular track
            this.trackLine = L.polyline(this.trackPoints, {
                color: this.config.trackColor,
                weight: this.config.trackWidth
            }).addTo(this.map);
        }
    }
    
    redrawHeatmap() {
        if (!this.heatmapLine || this.trackData.length === 0) return;
        
        // Create segments with colors based on speed
        this.heatmapLine.setLatLngs([]);
        
        for (let i = 0; i < this.trackData.length - 1; i++) {
            const point = this.trackData[i];
            const nextPoint = this.trackData[i + 1];
            const speed = point.speed || 0;
            
            // Color from green (slow) to red (fast)
            const color = this.getSpeedColor(speed);
            
            L.polyline([[point.lat, point.lon], [nextPoint.lat, nextPoint.lon]], {
                color: color,
                weight: this.config.trackWidth,
                opacity: 0.8
            }).addTo(this.map);
        }
    }
    
    getSpeedColor(speed) {
        // Convert speed to color gradient (0-200 km/h)
        const ratio = Math.min(speed / 200, 1);
        const hue = (1 - ratio) * 120; // 120 = green, 0 = red
        return `hsl(${hue}, 100%, 50%)`;
    }
    
    // Replay methods
    startReplay() {
        if (this.trackData.length === 0) {
            alert('No track data to replay');
            return;
        }
        
        this.replayPlaying = true;
        this.replayPaused = false;
        
        if (this.replayIndex >= this.trackData.length) {
            this.replayIndex = 0;
        }
        
        this.playReplayStep();
    }
    
    playReplayStep() {
        if (!this.replayPlaying || this.replayPaused) return;
        
        if (this.replayIndex >= this.trackData.length) {
            this.replayPlaying = false;
            return;
        }
        
        const point = this.trackData[this.replayIndex];
        
        // Update marker position
        if (this.marker) {
            this.marker.setLatLng([point.lat, point.lon]);
            if (this.config.showSpeed) {
                this.marker.setPopupContent(`Speed: ${Math.round(point.speed || 0)} km/h`);
            }
        }
        
        // Center map on marker
        this.map.setView([point.lat, point.lon], this.config.zoom);
        
        this.replayIndex++;
        
        // Schedule next step
        const delay = this.config.replaySpeed ? 1000 / this.config.replaySpeed : 1000;
        this.replayTimer = setTimeout(() => this.playReplayStep(), delay);
    }
    
    pauseReplay() {
        this.replayPaused = true;
        if (this.replayTimer) {
            clearTimeout(this.replayTimer);
        }
    }
    
    resetReplay() {
        this.replayPlaying = false;
        this.replayPaused = false;
        this.replayIndex = 0;
        if (this.replayTimer) {
            clearTimeout(this.replayTimer);
        }
        
        // Reset marker to first position
        if (this.trackData.length > 0 && this.marker) {
            const firstPoint = this.trackData[0];
            this.marker.setLatLng([firstPoint.lat, firstPoint.lon]);
            this.map.setView([firstPoint.lat, firstPoint.lon], this.config.zoom);
        }
    }

    setValue(value) {
        // Value can be an object with lat/lon or single sensor value
        if (typeof value === 'object' && value.lat !== undefined && value.lon !== undefined) {
            this.currentLat = value.lat;
            this.currentLon = value.lon;
            this.currentSpeed = value.speed || 0;
            this.currentBearing = value.bearing || 0;
        } else {
            // Single sensor value (not typical for GPS widget)
            this.value = value;
        }
        
        this.draw();
    }

    updateGPS(lat, lon, speed, bearing) {
        this.currentLat = lat;
        this.currentLon = lon;
        this.currentSpeed = speed || 0;
        this.currentBearing = bearing || 0;
        
        // Store data for replay and heatmap
        this.trackData.push({
            lat: lat,
            lon: lon,
            speed: speed || 0,
            bearing: bearing || 0,
            time: Date.now()
        });
        
        // Limit track data
        if (this.trackData.length > this.config.maxTrackPoints) {
            this.trackData.shift();
        }
        
        this.draw();
    }

    draw() {
        if (!this.initialized) {
            this.initMap();
        }
        
        // Always draw placeholder in editor mode or when no data
        if (!this.map || this.currentLat === null || this.currentLon === null) {
            // Draw placeholder
            this.clear();
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw map icon
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.font = '48px "Font Awesome 5 Free"';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('\uf279', this.canvas.width / 2, this.canvas.height / 2 - 30);
            
            // Draw text
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText('GPS Map Widget', this.canvas.width / 2, this.canvas.height / 2 + 30);
            
            this.ctx.fillStyle = '#999';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('Will display live GPS tracking', this.canvas.width / 2, this.canvas.height / 2 + 50);
            return;
        }
        
        // Skip updates if in replay mode
        if (this.config.replayMode && this.replayPlaying) {
            return;
        }
        
        // Update marker position
        if (this.marker && this.config.showMarker) {
            this.marker.setLatLng([this.currentLat, this.currentLon]);
            
            if (this.config.showSpeed) {
                this.marker.setPopupContent(`Speed: ${Math.round(this.currentSpeed)} km/h`);
            }
            
            // Rotate marker based on bearing if available
            if (this.currentBearing !== 0) {
                const markerElement = this.marker.getElement();
                if (markerElement) {
                    markerElement.style.transform += ` rotate(${this.currentBearing}deg)`;
                }
            }
        }
        
        // Add point to track
        if (this.config.showTrack) {
            this.trackPoints.push([this.currentLat, this.currentLon]);
            
            // Limit track points
            if (this.trackPoints.length > this.config.maxTrackPoints) {
                this.trackPoints.shift();
            }
            
            if (this.config.speedHeatmap && this.trackData.length > 1) {
                // Redraw heatmap
                this.redrawHeatmap();
            } else if (this.trackLine) {
                // Update regular track
                this.trackLine.setLatLngs(this.trackPoints);
            }
        }
        
        // Center map on current position (only once or when requested)
        if (this.trackPoints.length === 1) {
            this.map.setView([this.currentLat, this.currentLon], this.config.zoom);
        }
        
        // Hide canvas (map container is visible)
        this.canvas.style.display = 'none';
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    destroy() {
        if (this.map) {
            this.map.remove();
        }
        if (this.mapContainer && this.mapContainer.parentNode) {
            this.mapContainer.parentNode.removeChild(this.mapContainer);
        }
        super.destroy();
    }

    updateConfig(newConfig) {
        super.updateConfig(newConfig);
        
        // Update map if config changes
        if (this.map) {
            if (newConfig.zoom !== undefined) {
                this.map.setZoom(newConfig.zoom);
            }
            
            if (newConfig.trackColor !== undefined && this.trackLine) {
                this.trackLine.setStyle({ color: newConfig.trackColor });
            }
            
            if (newConfig.trackWidth !== undefined && this.trackLine) {
                this.trackLine.setStyle({ weight: newConfig.trackWidth });
            }
        }
    }
}

// Export classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DashboardWidget,
        CircularGauge,
        LinearGauge,
        DigitalDisplay,
        SpeedometerGauge,
        TachometerGauge,
        TemperatureGauge,
        IndicatorLight,
        GPSMapWidget
    };
}

