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
            minValue: 0,
            maxValue: 100,
            unit: '',
            backgroundColor: 'transparent',
            primaryColor: '#00ff00',
            secondaryColor: '#333333',
            textColor: '#ffffff',
            fontSize: 14,
            showValue: true,
            showLabel: true,
            label: 'Sensor',
            // New: Image support
            backgroundImageUrl: null,
            foregroundImageUrl: null,
            backgroundOpacity: 0.5,
            foregroundOpacity: 1.0,
            imageMode: 'background', // 'background', 'dual', 'overlay'
            // New: Smoothing and delay
            smoothing: 0.2, // 0 = instant, 1 = very smooth
            updateDelay: 0, // milliseconds delay
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
}

class CircularGauge extends DashboardWidget {
    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            startAngle: 135,
            endAngle: 405,
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
        
        // Draw gauge arc
        this.drawArc(centerX, centerY, radius);
        
        // Draw ticks and numbers
        if (this.config.showTicks) {
            this.drawTicks(centerX, centerY, radius);
        }
        
        // Draw needle
        this.drawNeedle(centerX, centerY, radius);
        
        // Draw center value
        if (this.config.showValue) {
            this.drawValue(centerX, centerY);
        }
        
        // Draw label
        if (this.config.showLabel) {
            this.drawLabel(centerX, this.canvas.height - 20);
        }
    }

    drawArc(centerX, centerY, radius) {
        const startAngle = (this.config.startAngle - 90) * Math.PI / 180;
        const endAngle = (this.config.endAngle - 90) * Math.PI / 180;
        
        // Background arc
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.lineWidth = 15;
        this.ctx.strokeStyle = this.config.secondaryColor;
        this.ctx.stroke();
        
        // Value arc with gradient
        const valueAngle = startAngle + (endAngle - startAngle) * 
            ((this.value - this.config.minValue) / (this.config.maxValue - this.config.minValue));
        
        let arcColor = this.config.primaryColor;
        if (this.config.dangerThreshold && this.value >= this.config.dangerThreshold) {
            arcColor = this.config.dangerColor;
        } else if (this.config.warningThreshold && this.value >= this.config.warningThreshold) {
            arcColor = this.config.warningColor;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
        this.ctx.lineWidth = 15;
        this.ctx.strokeStyle = arcColor;
        this.ctx.stroke();
    }

    drawTicks(centerX, centerY, radius) {
        const startAngle = this.config.startAngle;
        const endAngle = this.config.endAngle;
        const angleRange = endAngle - startAngle;
        
        for (let i = 0; i <= this.config.tickCount; i++) {
            const angle = (startAngle + (angleRange * i / this.config.tickCount) - 90) * Math.PI / 180;
            const tickLength = i % 2 === 0 ? 15 : 10;
            
            const x1 = centerX + Math.cos(angle) * (radius - 20);
            const y1 = centerY + Math.sin(angle) * (radius - 20);
            const x2 = centerX + Math.cos(angle) * (radius - 20 - tickLength);
            const y2 = centerY + Math.sin(angle) * (radius - 20 - tickLength);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = this.config.textColor;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw numbers
            if (this.config.showNumbers && i % 2 === 0) {
                const value = this.config.minValue + (this.config.maxValue - this.config.minValue) * i / this.config.tickCount;
                const textX = centerX + Math.cos(angle) * (radius - 40);
                const textY = centerY + Math.sin(angle) * (radius - 40);
                
                this.ctx.fillStyle = this.config.textColor;
                this.ctx.font = `${this.config.fontSize}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(Math.round(value), textX, textY);
            }
        }
    }

    drawNeedle(centerX, centerY, radius) {
        const startAngle = this.config.startAngle;
        const endAngle = this.config.endAngle;
        const angleRange = endAngle - startAngle;
        const valueRatio = (this.value - this.config.minValue) / (this.config.maxValue - this.config.minValue);
        const angle = (startAngle + angleRange * valueRatio - 90) * Math.PI / 180;
        
        const needleLength = radius * 0.7;
        const needleX = centerX + Math.cos(angle) * needleLength;
        const needleY = centerY + Math.sin(angle) * needleLength;
        
        // Needle
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(needleX, needleY);
        this.ctx.strokeStyle = this.config.needleColor;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.config.needleColor;
        this.ctx.fill();
    }

    drawValue(centerX, centerY) {
        this.ctx.fillStyle = this.config.textColor;
        this.ctx.font = `bold ${this.config.fontSize * 1.5}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            `${this.value.toFixed(1)} ${this.config.unit}`,
            centerX,
            centerY + 30
        );
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
        
        if (this.config.orientation === 'horizontal') {
            this.drawHorizontal();
        } else {
            this.drawVertical();
        }
    }

    drawHorizontal() {
        const padding = 20;
        const barY = (this.canvas.height - this.config.barHeight) / 2;
        const barWidth = this.canvas.width - padding * 2;
        const valueWidth = barWidth * ((this.value - this.config.minValue) / (this.config.maxValue - this.config.minValue));
        
        // Background bar
        this.ctx.fillStyle = this.config.secondaryColor;
        this.ctx.fillRect(padding, barY, barWidth, this.config.barHeight);
        
        // Value bar
        if (this.config.showGradient) {
            const gradient = this.ctx.createLinearGradient(padding, 0, padding + barWidth, 0);
            this.config.gradientColors.forEach((color, i) => {
                gradient.addColorStop(i / (this.config.gradientColors.length - 1), color);
            });
            this.ctx.fillStyle = gradient;
        } else {
            this.ctx.fillStyle = this.config.primaryColor;
        }
        this.ctx.fillRect(padding, barY, valueWidth, this.config.barHeight);
        
        // Border
        this.ctx.strokeStyle = this.config.textColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(padding, barY, barWidth, this.config.barHeight);
        
        // Value text
        if (this.config.showValue) {
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `bold ${this.config.fontSize * 1.2}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                `${this.value.toFixed(1)} ${this.config.unit}`,
                this.canvas.width / 2,
                barY + this.config.barHeight / 2
            );
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
        
        // Value bar
        if (this.config.showGradient) {
            const gradient = this.ctx.createLinearGradient(0, padding * 2 + barHeight, 0, padding * 2);
            this.config.gradientColors.forEach((color, i) => {
                gradient.addColorStop(i / (this.config.gradientColors.length - 1), color);
            });
            this.ctx.fillStyle = gradient;
        } else {
            this.ctx.fillStyle = this.config.primaryColor;
        }
        this.ctx.fillRect(barX, padding * 2 + barHeight - valueHeight, this.config.barHeight, valueHeight);
        
        // Border
        this.ctx.strokeStyle = this.config.textColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, padding * 2, this.config.barHeight, barHeight);
        
        // Value text
        if (this.config.showValue) {
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `bold ${this.config.fontSize * 1.2}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(
                `${this.value.toFixed(1)}`,
                this.canvas.width / 2,
                padding * 2 + barHeight + 5
            );
            this.ctx.font = `${this.config.fontSize}px Arial`;
            this.ctx.fillText(
                this.config.unit,
                this.canvas.width / 2,
                padding * 2 + barHeight + 25
            );
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
            glowEffect: true,
            glowColor: '#00ff00'
        };
    }

    draw() {
        this.clear();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Glow effect
        if (this.config.glowEffect) {
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = this.config.glowColor;
        }
        
        // Value
        this.ctx.fillStyle = this.config.primaryColor;
        this.ctx.font = `bold ${this.config.fontSize}px 'Courier New', monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            this.value.toFixed(this.config.decimals),
            centerX,
            centerY
        );
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Unit
        this.ctx.fillStyle = this.config.textColor;
        this.ctx.font = `${this.config.fontSize * 0.4}px Arial`;
        this.ctx.fillText(
            this.config.unit,
            centerX,
            centerY + this.config.fontSize * 0.6
        );
        
        // Label
        if (this.config.showLabel) {
            this.ctx.font = `${this.config.fontSize * 0.3}px Arial`;
            this.ctx.fillText(
                this.config.label,
                centerX,
                centerY - this.config.fontSize * 0.7
            );
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
        if (this.config.showLabel) {
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
            this.ctx.fillStyle = this.config.textColor;
            this.ctx.font = `${this.config.fontSize * 0.8}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `${this.value.toFixed(1)} ${this.config.unit}`,
                centerX,
                centerY + this.config.size / 2 + this.config.fontSize * 2 + 15
            );
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
        IndicatorLight
    };
}

