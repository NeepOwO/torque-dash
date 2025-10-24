/**
 * Advanced Widget Properties UI
 * Comprehensive UI with tabs for all widget customization options
 */

function createPropertiesPanel(widget) {
    const config = widget.instance ? widget.instance.config : {};
    
    // Determine which tabs/sections to show based on widget type
    const isCircular = ['circular-gauge', 'speedometer', 'tachometer'].includes(widget.type);
    const hasNeedle = isCircular;
    const isIndicator = widget.type === 'indicator-light';
    
    // Build HTML
    let html = `
        <h6 class="mb-3">
            <i class="fas fa-cube"></i> 
            <span id="widget-title">${widget.type}</span>
        </h6>
        
        <!-- Layer Controls -->
        <div class="mb-3">
            <label class="d-block"><i class="fas fa-layer-group mr-2"></i>Layer Order (Z-Index: ${widget.zIndex || 0})</label>
            <div class="btn-group btn-group-sm d-flex" role="group">
                <button type="button" class="btn btn-outline-primary" id="btn-bring-front" title="Bring to Front">
                    <i class="fas fa-arrow-up"></i><i class="fas fa-arrow-up"></i> Front
                </button>
                <button type="button" class="btn btn-outline-primary" id="btn-move-up" title="Move Up">
                    <i class="fas fa-arrow-up"></i> Up
                </button>
                <button type="button" class="btn btn-outline-primary" id="btn-move-down" title="Move Down">
                    <i class="fas fa-arrow-down"></i> Down
                </button>
                <button type="button" class="btn btn-outline-primary" id="btn-send-back" title="Send to Back">
                    <i class="fas fa-arrow-down"></i><i class="fas fa-arrow-down"></i> Back
                </button>
            </div>
        </div>
        
        <hr>

        <!-- Sensor Mapping -->
        <div class="form-group">
            <label><i class="fas fa-satellite-dish"></i> Sensor</label>
            <div class="input-group input-group-sm">
                <select class="form-control" id="prop-sensor">
                    <option value="">No sensors loaded...</option>
                    ${widget.sensorKey ? `<option value="${widget.sensorKey}" selected>${widget.sensorKey}</option>` : ''}
                </select>
                <div class="input-group-append">
                    <button class="btn btn-outline-info btn-sm" type="button" id="load-sensors-btn" title="Load sensors from active session">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <small class="text-muted"><strong>Important:</strong> Click <i class="fas fa-sync-alt"></i> to load sensors from a session</small>
        </div>

        <hr>

        <!-- Tabs Navigation -->
        <style>
            #propTabs .nav-link {
                color: #495057 !important;
                background-color: white !important;
                border: 1px solid #dee2e6 !important;
                padding: 0.5rem 0.75rem !important;
                font-size: 0.875rem !important;
            }
            #propTabs .nav-link:hover {
                color: #007bff !important;
                background-color: #f8f9fa !important;
            }
            #propTabs .nav-link.active {
                color: #fff !important;
                background-color: #007bff !important;
                border-color: #007bff !important;
                font-weight: bold !important;
            }
        </style>
        <ul class="nav nav-tabs nav-fill small" id="propTabs" role="tablist">
            <li class="nav-item">
                <a class="nav-link active" id="tab-general" data-toggle="tab" href="#pane-general">General</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-display" data-toggle="tab" href="#pane-display">Display</a>
            </li>
            ${isCircular ? `
            <li class="nav-item">
                <a class="nav-link" id="tab-angles" data-toggle="tab" href="#pane-angles">Angles</a>
            </li>
            ` : ''}
            <li class="nav-item">
                <a class="nav-link" id="tab-colors" data-toggle="tab" href="#pane-colors">Colors</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-images" data-toggle="tab" href="#pane-images">Images</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-anim" data-toggle="tab" href="#pane-anim">Anim</a>
            </li>
        </ul>

        <!-- Tabs Content -->
        <div class="tab-content mt-3" id="propTabContent">
            
            <!-- GENERAL TAB -->
            <div class="tab-pane fade show active" id="pane-general">
                <div class="form-group">
                    <label>Label</label>
                    <input type="text" class="form-control form-control-sm" id="prop-label" value="${config.label || ''}">
                </div>
                <div class="form-group">
                    <label>Unit</label>
                    <input type="text" class="form-control form-control-sm" id="prop-unit" value="${config.unit || ''}">
                </div>
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label>Min Value</label>
                            <input type="number" class="form-control form-control-sm" id="prop-min" value="${config.minValue || 0}">
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-group">
                            <label>Max Value</label>
                            <input type="number" class="form-control form-control-sm" id="prop-max" value="${config.maxValue || 100}">
                        </div>
                    </div>
                </div>
            </div>

            <!-- DISPLAY TAB -->
            <div class="tab-pane fade" id="pane-display">
                <div class="custom-control custom-checkbox mb-2">
                    <input type="checkbox" class="custom-control-input" id="prop-show-value" ${config.showValue !== false ? 'checked' : ''}>
                    <label class="custom-control-label" for="prop-show-value">Show Value</label>
                </div>
                <div class="custom-control custom-checkbox mb-2">
                    <input type="checkbox" class="custom-control-input" id="prop-show-unit" ${config.showUnit !== false ? 'checked' : ''}>
                    <label class="custom-control-label" for="prop-show-unit">Show Unit</label>
                </div>
                <div class="custom-control custom-checkbox mb-2">
                    <input type="checkbox" class="custom-control-input" id="prop-show-label" ${config.showLabel !== false ? 'checked' : ''}>
                    <label class="custom-control-label" for="prop-show-label">Show Label</label>
                </div>
                ${isCircular ? `
                <div class="custom-control custom-checkbox mb-3">
                    <input type="checkbox" class="custom-control-input" id="prop-show-numbers" ${config.showNumbers !== false ? 'checked' : ''}>
                    <label class="custom-control-label" for="prop-show-numbers">Show Scale Numbers</label>
                </div>
                ` : ''}
                
                <div class="form-group">
                    <label>Value Format</label>
                    <input type="text" class="form-control form-control-sm" id="prop-value-format" value="${config.valueFormat || '0'}" placeholder="0, 0.0, 0.00">
                    <small class="text-muted">Decimal places</small>
                </div>
                
                <div class="form-group">
                    <label>Value Position</label>
                    <select class="form-control form-control-sm" id="prop-value-position">
                        <option value="center" ${config.valuePosition === 'center' || !config.valuePosition ? 'selected' : ''}>Center</option>
                        <option value="top" ${config.valuePosition === 'top' ? 'selected' : ''}>Top</option>
                        <option value="bottom" ${config.valuePosition === 'bottom' ? 'selected' : ''}>Bottom</option>
                        <option value="custom" ${config.valuePosition === 'custom' ? 'selected' : ''}>Custom (X, Y)</option>
                    </select>
                </div>
                
                <div id="custom-position-controls" style="display: ${config.valuePosition === 'custom' ? 'block' : 'none'};">
                    <div class="row">
                        <div class="col-6">
                            <div class="form-group">
                                <label>Custom X</label>
                                <input type="number" class="form-control form-control-sm" id="prop-value-x" value="${config.valueCustomX || 0}">
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-group">
                                <label>Custom Y</label>
                                <input type="number" class="form-control form-control-sm" id="prop-value-y" value="${config.valueCustomY || 0}">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-6">
                        <div class="form-group">
                            <label>Value Size</label>
                            <input type="number" class="form-control form-control-sm" id="prop-value-size" min="8" max="120" value="${config.valueSize || 24}">
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-group">
                            <label>Unit Size</label>
                            <input type="number" class="form-control form-control-sm" id="prop-unit-size" min="8" max="120" value="${config.unitSize || 14}">
                        </div>
                    </div>
                </div>
            </div>

            ${isCircular ? `
            <!-- ANGLES & ROTATION TAB -->
            <div class="tab-pane fade" id="pane-angles">
                <div class="form-group">
                    <label>Rotation (degrees)</label>
                    <input type="range" class="custom-range" id="prop-rotation" min="0" max="360" step="15" value="${config.rotation || 0}">
                    <small class="text-muted">Value: <span id="rotation-value">${config.rotation || 0}</span>°</small>
                </div>
                
                <div class="form-group">
                    <label>Start Angle</label>
                    <input type="number" class="form-control form-control-sm" id="prop-start-angle" min="0" max="360" value="${config.startAngle || 135}">
                    <small class="text-muted">Gauge start position (0-360°)</small>
                </div>
                
                <div class="form-group">
                    <label>End Angle</label>
                    <input type="number" class="form-control form-control-sm" id="prop-end-angle" min="0" max="720" value="${config.endAngle || 405}">
                    <small class="text-muted">Gauge end position</small>
                </div>
                
                <hr>
                
                <div class="custom-control custom-checkbox mb-2">
                    <input type="checkbox" class="custom-control-input" id="prop-show-ticks" ${config.showTicks !== false ? 'checked' : ''}>
                    <label class="custom-control-label" for="prop-show-ticks">Show Ticks</label>
                </div>
                
                <div class="form-group">
                    <label>Tick Count</label>
                    <input type="number" class="form-control form-control-sm" id="prop-tick-count" min="0" max="100" value="${config.tickCount || 10}">
                </div>
                
                <div class="form-group">
                    <label>Major Tick Interval</label>
                    <input type="number" class="form-control form-control-sm" id="prop-major-tick" min="1" max="10" value="${config.majorTickInterval || 2}">
                    <small class="text-muted">Every Nth tick is major</small>
                </div>
                
                <div class="form-group">
                    <label>Tick Length</label>
                    <input type="number" class="form-control form-control-sm" id="prop-tick-length" min="1" max="50" value="${config.tickLength || 10}">
                </div>
            </div>
            ` : ''}

            <!-- COLORS TAB -->
            <div class="tab-pane fade" id="pane-colors">
                <div class="form-group">
                    <label>Primary Color</label>
                    <input type="color" class="form-control form-control-sm" id="prop-primary-color" value="${config.primaryColor || '#00ff00'}">
                </div>
                <div class="form-group">
                    <label>Secondary Color</label>
                    <input type="color" class="form-control form-control-sm" id="prop-secondary-color" value="${config.secondaryColor || '#333333'}">
                </div>
                <div class="form-group">
                    <label>Text Color</label>
                    <input type="color" class="form-control form-control-sm" id="prop-text-color" value="${config.textColor || '#ffffff'}">
                </div>
                ${hasNeedle ? `
                <div class="form-group">
                    <label>Needle Color <small class="text-muted">(empty = auto)</small></label>
                    <input type="color" class="form-control form-control-sm" id="prop-needle-color" value="${config.needleColor || '#ff0000'}">
                </div>
                ` : ''}
                
                <hr>
                <h6>Color Zones</h6>
                <div class="custom-control custom-checkbox mb-2">
                    <input type="checkbox" class="custom-control-input" id="prop-use-zones" ${config.useZones ? 'checked' : ''}>
                    <label class="custom-control-label" for="prop-use-zones">Enable Color Zones</label>
                </div>
                
                <div id="zones-container" style="display: ${config.useZones ? 'block' : 'none'};">
                    <button type="button" class="btn btn-sm btn-success btn-block mb-2" id="add-zone-btn">
                        <i class="fas fa-plus"></i> Add Zone
                    </button>
                    <div id="zones-list"></div>
                </div>
            </div>

            <!-- IMAGES TAB -->
            <div class="tab-pane fade" id="pane-images">
                <div class="form-group">
                    <label>Background Image</label>
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control" id="prop-bg-image" value="${config.backgroundImageUrl || ''}" placeholder="URL...">
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary" type="button" id="upload-bg-btn" title="Upload">
                                <i class="fas fa-upload"></i>
                            </button>
                            <button class="btn btn-outline-secondary" type="button" id="browse-bg-btn" title="Browse">
                                <i class="fas fa-images"></i>
                            </button>
                        </div>
                    </div>
                    <input type="file" id="bg-file-input" accept="image/*" style="display: none;">
                </div>
                
                <div class="form-group">
                    <label>Background Opacity</label>
                    <input type="range" class="custom-range" id="prop-bg-opacity" min="0" max="1" step="0.1" value="${config.backgroundOpacity || 0.5}">
                    <small class="text-muted">Value: <span id="bg-opacity-value">${config.backgroundOpacity || 0.5}</span></small>
                </div>
                
                <hr>
                
                <div class="form-group">
                    <label>Foreground Image (optional)</label>
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control" id="prop-fg-image" value="${config.foregroundImageUrl || ''}" placeholder="URL...">
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary" type="button" id="upload-fg-btn" title="Upload">
                                <i class="fas fa-upload"></i>
                            </button>
                            <button class="btn btn-outline-secondary" type="button" id="browse-fg-btn" title="Browse">
                                <i class="fas fa-images"></i>
                            </button>
                        </div>
                    </div>
                    <input type="file" id="fg-file-input" accept="image/*" style="display: none;">
                </div>
                
                <div class="form-group">
                    <label>Foreground Opacity</label>
                    <input type="range" class="custom-range" id="prop-fg-opacity" min="0" max="1" step="0.1" value="${config.foregroundOpacity || 1.0}">
                    <small class="text-muted">Value: <span id="fg-opacity-value">${config.foregroundOpacity || 1.0}</span></small>
                </div>
                
                <div class="form-group">
                    <label>Image Fill Mode</label>
                    <select class="form-control form-control-sm" id="prop-image-fill-mode">
                        <option value="linear" ${config.imageFillMode === 'linear' || !config.imageFillMode ? 'selected' : ''}>Linear</option>
                        <option value="circular" ${config.imageFillMode === 'circular' ? 'selected' : ''}>Circular</option>
                    </select>
                </div>
                
                ${isCircular ? `
                <div id="image-angles-group">
                    <div class="row">
                        <div class="col-6">
                            <div class="form-group">
                                <label>Image Start Angle</label>
                                <input type="number" class="form-control form-control-sm" id="prop-image-start-angle" min="0" max="360" value="${config.imageStartAngle || 0}">
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="form-group">
                                <label>Image End Angle</label>
                                <input type="number" class="form-control form-control-sm" id="prop-image-end-angle" min="0" max="360" value="${config.imageEndAngle || 360}">
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- ANIMATION TAB -->
            <div class="tab-pane fade" id="pane-anim">
                <div class="form-group">
                    <label>Smoothing</label>
                    <input type="range" class="custom-range" id="prop-smoothing" min="0" max="1" step="0.05" value="${config.smoothing || 0.2}">
                    <small class="text-muted">Value: <span id="smoothing-value">${config.smoothing || 0.2}</span></small>
                </div>
                
                <div class="form-group">
                    <label>Update Delay (ms)</label>
                    <input type="number" class="form-control form-control-sm" id="prop-delay" min="0" max="5000" step="100" value="${config.updateDelay || 0}">
                    <small class="text-muted">Delay before value updates</small>
                </div>
                
                <div class="form-group">
                    <label>Animation Duration (ms)</label>
                    <input type="number" class="form-control form-control-sm" id="prop-anim-duration" min="0" max="2000" step="50" value="${config.animationDuration || 500}">
                </div>
                
                <div class="form-group">
                    <label>Animation Easing</label>
                    <select class="form-control form-control-sm" id="prop-anim-easing">
                        <option value="linear" ${config.animationEasing === 'linear' ? 'selected' : ''}>Linear</option>
                        <option value="ease-in" ${config.animationEasing === 'ease-in' ? 'selected' : ''}>Ease In</option>
                        <option value="ease-out" ${config.animationEasing === 'ease-out' ? 'selected' : ''}>Ease Out</option>
                        <option value="ease-in-out" ${config.animationEasing === 'ease-in-out' || !config.animationEasing ? 'selected' : ''}>Ease In-Out</option>
                    </select>
                </div>
            </div>

        </div>

        ${hasNeedle ? `
        <!-- Needle Settings -->
        <hr>
        <h6><i class="fas fa-location-arrow"></i> Needle</h6>
        
        <div class="custom-control custom-checkbox mb-3">
            <input type="checkbox" class="custom-control-input" id="prop-needle-use-image" ${config.needleImageUrl ? 'checked' : ''}>
            <label class="custom-control-label" for="prop-needle-use-image">Use Custom Needle Image</label>
        </div>
        
        <div id="needle-image-section" style="display: ${config.needleImageUrl ? 'block' : 'none'};">
            <div class="form-group">
                <label>Needle Image URL</label>
                <div class="input-group input-group-sm mb-2">
                    <input type="text" class="form-control" id="prop-needle-image" placeholder="URL or path" value="${config.needleImageUrl || ''}">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" onclick="uploadImage('needle')">
                            <i class="fas fa-upload"></i>
                        </button>
                        <button class="btn btn-outline-info" type="button" onclick="browseImages('needle')">
                            <i class="fas fa-folder-open"></i>
                        </button>
                    </div>
                </div>
                <small class="text-muted">Upload PNG with transparency</small>
            </div>
            
            <div class="row">
                <div class="col-6">
                    <div class="form-group">
                        <label>Scale</label>
                        <input type="range" class="custom-range" id="prop-needle-image-scale" min="0.1" max="3" step="0.1" value="${config.needleImageScale || 1}">
                        <small class="text-muted"><span id="needle-image-scale-value">${config.needleImageScale || 1}</span></small>
                    </div>
                </div>
                <div class="col-6">
                    <div class="form-group">
                        <label>Rotation Offset</label>
                        <input type="number" class="form-control form-control-sm" id="prop-needle-rotation-offset" min="-180" max="180" value="${config.needleRotationOffset || 0}">
                    </div>
                </div>
            </div>
        </div>
        
        <div id="needle-standard-section" style="display: ${config.needleImageUrl ? 'none' : 'block'};">
            <div class="row">
                <div class="col-6">
                    <div class="form-group">
                        <label>Length</label>
                        <input type="range" class="custom-range" id="prop-needle-length" min="0.1" max="1" step="0.05" value="${config.needleLength || 0.7}">
                        <small class="text-muted"><span id="needle-length-value">${config.needleLength || 0.7}</span></small>
                    </div>
                </div>
                <div class="col-6">
                    <div class="form-group">
                        <label>Width</label>
                        <input type="number" class="form-control form-control-sm" id="prop-needle-width" min="1" max="20" value="${config.needleWidth || 3}">
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

        ${isIndicator ? `
        <!-- Indicator Light Settings -->
        <hr>
        <h6><i class="fas fa-lightbulb"></i> Indicator</h6>
        
        <div class="form-group">
            <label>Shape</label>
            <select class="form-control form-control-sm" id="prop-shape">
                <option value="circle" ${config.shape === 'circle' || !config.shape ? 'selected' : ''}>Circle</option>
                <option value="square" ${config.shape === 'square' ? 'selected' : ''}>Square</option>
                <option value="triangle" ${config.shape === 'triangle' ? 'selected' : ''}>Triangle</option>
                <option value="icon" ${config.shape === 'icon' ? 'selected' : ''}>Icon</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Size</label>
            <input type="number" class="form-control form-control-sm" id="prop-size" min="10" max="200" value="${config.size || 60}">
        </div>
        
        <div class="row">
            <div class="col-6">
                <div class="form-group">
                    <label>On Color</label>
                    <input type="color" class="form-control form-control-sm" id="prop-on-color" value="${config.onColor || '#ff0000'}">
                </div>
            </div>
            <div class="col-6">
                <div class="form-group">
                    <label>Off Color</label>
                    <input type="color" class="form-control form-control-sm" id="prop-off-color" value="${config.offColor || '#333333'}">
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label>Condition Type</label>
            <select class="form-control form-control-sm" id="prop-condition-type">
                <option value="threshold" ${config.conditionType === 'threshold' || !config.conditionType ? 'selected' : ''}>Threshold</option>
                <option value="range" ${config.conditionType === 'range' ? 'selected' : ''}>Range</option>
                <option value="always" ${config.conditionType === 'always' ? 'selected' : ''}>Always On</option>
            </select>
        </div>
        
        <div id="threshold-settings" style="display: ${config.conditionType === 'range' || config.conditionType === 'always' ? 'none' : 'block'};">
            <div class="form-group">
                <label>Operator</label>
                <select class="form-control form-control-sm" id="prop-threshold-op">
                    <option value="<" ${config.thresholdOperator === '<' || !config.thresholdOperator ? 'selected' : ''}>&lt; Less Than</option>
                    <option value=">" ${config.thresholdOperator === '>' ? 'selected' : ''}>&gt; Greater Than</option>
                    <option value="<=" ${config.thresholdOperator === '<=' ? 'selected' : ''}>&lt;= Less or Equal</option>
                    <option value=">=" ${config.thresholdOperator === '>=' ? 'selected' : ''}>&gt;= Greater or Equal</option>
                    <option value="==" ${config.thresholdOperator === '==' ? 'selected' : ''}>== Equal</option>
                    <option value="!=" ${config.thresholdOperator === '!=' ? 'selected' : ''}>!= Not Equal</option>
                </select>
            </div>
            <div class="form-group">
                <label>Threshold Value</label>
                <input type="number" class="form-control form-control-sm" id="prop-threshold-value" value="${config.thresholdValue || 50}">
            </div>
        </div>
        
        <div id="range-settings" style="display: ${config.conditionType === 'range' ? 'block' : 'none'};">
            <div class="row">
                <div class="col-6">
                    <div class="form-group">
                        <label>Range Min</label>
                        <input type="number" class="form-control form-control-sm" id="prop-range-min" value="${config.rangeMin || 0}">
                    </div>
                </div>
                <div class="col-6">
                    <div class="form-group">
                        <label>Range Max</label>
                        <input type="number" class="form-control form-control-sm" id="prop-range-max" value="${config.rangeMax || 100}">
                    </div>
                </div>
            </div>
        </div>
        
        <hr>
        <h6>Blinking</h6>
        
        <div class="form-group">
            <label>Blink Pattern</label>
            <select class="form-control form-control-sm" id="prop-blink-pattern">
                <option value="steady" ${config.blinkPattern === 'steady' || !config.blinkPattern ? 'selected' : ''}>Steady</option>
                <option value="blink" ${config.blinkPattern === 'blink' ? 'selected' : ''}>Blink</option>
                <option value="fast-blink" ${config.blinkPattern === 'fast-blink' ? 'selected' : ''}>Fast Blink</option>
                <option value="pulse" ${config.blinkPattern === 'pulse' ? 'selected' : ''}>Pulse</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Blink Speed (ms)</label>
            <input type="number" class="form-control form-control-sm" id="prop-blink-speed" min="50" max="5000" step="50" value="${config.blinkSpeed || 500}">
        </div>
        ` : ''}

        ${widget.type === 'gps-map' ? `
        <!-- GPS Map Settings -->
        <hr>
        <h6><i class="fas fa-map-marked-alt"></i> GPS Map Settings</h6>
        
        <div class="form-group">
            <label>Map Style</label>
            <select class="form-control form-control-sm" id="prop-map-style">
                <option value="osm" ${!config.mapStyleName || config.mapStyleName === 'osm' ? 'selected' : ''}>OpenStreetMap</option>
                <option value="satellite" ${config.mapStyleName === 'satellite' ? 'selected' : ''}>Satellite</option>
                <option value="terrain" ${config.mapStyleName === 'terrain' ? 'selected' : ''}>Terrain</option>
                <option value="dark" ${config.mapStyleName === 'dark' ? 'selected' : ''}>Dark Mode</option>
                <option value="topo" ${config.mapStyleName === 'topo' ? 'selected' : ''}>Topographic</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Zoom Level</label>
            <input type="range" class="custom-range" id="prop-map-zoom" min="1" max="19" value="${config.zoom || 15}">
            <small class="text-muted">Level: <span id="map-zoom-value">${config.zoom || 15}</span></small>
        </div>
        
        <hr>
        <h6>Track Settings</h6>
        
        <div class="custom-control custom-checkbox mb-2">
            <input type="checkbox" class="custom-control-input" id="prop-show-track" ${config.showTrack !== false ? 'checked' : ''}>
            <label class="custom-control-label" for="prop-show-track">Show Track</label>
        </div>
        
        <div class="form-group">
            <label>Track Color</label>
            <input type="color" class="form-control form-control-sm" id="prop-track-color" value="${config.trackColor || '#00ff00'}">
        </div>
        
        <div class="form-group">
            <label>Track Width</label>
            <input type="range" class="custom-range" id="prop-track-width" min="1" max="10" value="${config.trackWidth || 3}">
            <small class="text-muted">Width: <span id="track-width-value">${config.trackWidth || 3}</span>px</small>
        </div>
        
        <div class="form-group">
            <label>Max Track Points</label>
            <input type="number" class="form-control form-control-sm" id="prop-max-track-points" min="100" max="10000" step="100" value="${config.maxTrackPoints || 1000}">
            <small class="text-muted">Limit points for performance</small>
        </div>
        
        <div class="custom-control custom-checkbox mb-2">
            <input type="checkbox" class="custom-control-input" id="prop-speed-heatmap" ${config.speedHeatmap ? 'checked' : ''}>
            <label class="custom-control-label" for="prop-speed-heatmap">Speed Heatmap</label>
        </div>
        
        <hr>
        <h6>Marker Settings</h6>
        
        <div class="custom-control custom-checkbox mb-2">
            <input type="checkbox" class="custom-control-input" id="prop-show-marker" ${config.showMarker !== false ? 'checked' : ''}>
            <label class="custom-control-label" for="prop-show-marker">Show Marker</label>
        </div>
        
        <div class="form-group">
            <label>Marker Color</label>
            <input type="color" class="form-control form-control-sm" id="prop-marker-color" value="${config.markerColor || '#ff0000'}">
        </div>
        
        <div class="custom-control custom-checkbox mb-2">
            <input type="checkbox" class="custom-control-input" id="prop-show-speed" ${config.showSpeed !== false ? 'checked' : ''}>
            <label class="custom-control-label" for="prop-show-speed">Show Speed Popup</label>
        </div>
        
        <hr>
        <h6>Playback Controls</h6>
        
        <div class="custom-control custom-checkbox mb-2">
            <input type="checkbox" class="custom-control-input" id="prop-replay-mode" ${config.replayMode ? 'checked' : ''}>
            <label class="custom-control-label" for="prop-replay-mode">Enable Replay Mode</label>
        </div>
        
        <div id="replay-controls" style="display: ${config.replayMode ? 'block' : 'none'};">
            <div class="form-group">
                <label>Replay Speed</label>
                <select class="form-control form-control-sm" id="prop-replay-speed">
                    <option value="0.5" ${config.replaySpeed === 0.5 ? 'selected' : ''}>0.5x</option>
                    <option value="1" ${config.replaySpeed === 1 || !config.replaySpeed ? 'selected' : ''}>1x</option>
                    <option value="2" ${config.replaySpeed === 2 ? 'selected' : ''}>2x</option>
                    <option value="5" ${config.replaySpeed === 5 ? 'selected' : ''}>5x</option>
                    <option value="10" ${config.replaySpeed === 10 ? 'selected' : ''}>10x</option>
                </select>
            </div>
            
            <div class="btn-group btn-group-sm btn-block mb-2" role="group">
                <button type="button" class="btn btn-outline-primary" id="replay-play-btn">
                    <i class="fas fa-play"></i> Play
                </button>
                <button type="button" class="btn btn-outline-secondary" id="replay-pause-btn">
                    <i class="fas fa-pause"></i> Pause
                </button>
                <button type="button" class="btn btn-outline-danger" id="replay-reset-btn">
                    <i class="fas fa-redo"></i> Reset
                </button>
            </div>
        </div>
        ` : ''}

        <hr>
        <button type="button" class="btn btn-sm btn-danger btn-block" id="delete-widget-btn">
            <i class="fas fa-trash"></i> Delete Widget
        </button>
    `;
    
    return html;
}

