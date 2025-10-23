/**
 * Event handlers for widget properties panel
 * Sets up all input listeners and updates widget config in real-time
 */

function setupPropertiesHandlers(widget, editor, uploadImage, browseImages) {
    // Sensor mapping
    $('#prop-sensor').on('change', function() {
        widget.sensorKey = $(this).val();
    });
    
    // Load sensors from active session
    $('#load-sensors-btn').on('click', function() {
        const sessionId = $('#sessionSelect').val();
        if (!sessionId) {
            alert('Please select a session from the left panel first');
            return;
        }
        
        $(this).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
        
        $.ajax({
            url: `/api/sessions/${sessionId}/sensors`,
            method: 'GET',
            success: function(response) {
                const select = $('#prop-sensor');
                const currentValue = select.val();
                
                // Clear existing options (except the first one)
                select.find('option:not(:first)').remove();
                
                // Add sensors from session
                if (response.sensors && response.sensors.length > 0) {
                    response.sensors.forEach(sensor => {
                        const option = $('<option>')
                            .val(sensor.key)
                            .text(`${sensor.name} (${sensor.key})`)
                            .data('current-value', sensor.value);
                        select.append(option);
                    });
                    
                    // Restore previous selection if it exists
                    if (currentValue && select.find(`option[value="${currentValue}"]`).length > 0) {
                        select.val(currentValue);
                    }
                    
                    alert(`Loaded ${response.sensors.length} sensors from session`);
                } else {
                    alert('No sensors found in this session');
                }
            },
            error: function(err) {
                console.error('Failed to load sensors:', err);
                alert('Failed to load sensors from session');
            },
            complete: function() {
                $('#load-sensors-btn').prop('disabled', false).html('<i class="fas fa-sync-alt"></i>');
            }
        });
    });
    
    // General tab handlers
    $('#prop-label').on('input', function() {
        widget.instance.updateConfig({ label: $(this).val() });
        editor.render();
    });
    
    $('#prop-unit').on('input', function() {
        widget.instance.updateConfig({ unit: $(this).val() });
        editor.render();
    });
    
    $('#prop-min').on('input', function() {
        widget.instance.updateConfig({ minValue: parseFloat($(this).val()) });
        editor.render();
    });
    
    $('#prop-max').on('input', function() {
        widget.instance.updateConfig({ maxValue: parseFloat($(this).val()) });
        editor.render();
    });
    
    // Display tab handlers
    $('#prop-show-value').on('change', function() {
        widget.instance.updateConfig({ showValue: $(this).is(':checked') });
        editor.render();
    });
    
    $('#prop-show-unit').on('change', function() {
        widget.instance.updateConfig({ showUnit: $(this).is(':checked') });
        editor.render();
    });
    
    $('#prop-show-label').on('change', function() {
        widget.instance.updateConfig({ showLabel: $(this).is(':checked') });
        editor.render();
    });
    
    $('#prop-show-numbers').on('change', function() {
        widget.instance.updateConfig({ showNumbers: $(this).is(':checked') });
        editor.render();
    });
    
    $('#prop-value-format').on('input', function() {
        widget.instance.updateConfig({ valueFormat: $(this).val() });
        editor.render();
    });
    
    $('#prop-value-position').on('change', function() {
        const pos = $(this).val();
        widget.instance.updateConfig({ valuePosition: pos });
        $('#custom-position-controls').toggle(pos === 'custom');
        editor.render();
    });
    
    $('#prop-value-x').on('input', function() {
        widget.instance.updateConfig({ valueCustomX: parseFloat($(this).val()) });
        editor.render();
    });
    
    $('#prop-value-y').on('input', function() {
        widget.instance.updateConfig({ valueCustomY: parseFloat($(this).val()) });
        editor.render();
    });
    
    $('#prop-value-size').on('input', function() {
        widget.instance.updateConfig({ valueSize: parseInt($(this).val()) });
        editor.render();
    });
    
    $('#prop-unit-size').on('input', function() {
        widget.instance.updateConfig({ unitSize: parseInt($(this).val()) });
        editor.render();
    });
    
    // Angles tab handlers (for circular widgets)
    $('#prop-rotation').on('input', function() {
        const val = parseInt($(this).val());
        $('#rotation-value').text(val);
        widget.instance.updateConfig({ rotation: val });
        editor.render();
    });
    
    $('#prop-start-angle').on('input', function() {
        widget.instance.updateConfig({ startAngle: parseFloat($(this).val()) });
        editor.render();
    });
    
    $('#prop-end-angle').on('input', function() {
        widget.instance.updateConfig({ endAngle: parseFloat($(this).val()) });
        editor.render();
    });
    
    $('#prop-show-ticks').on('change', function() {
        widget.instance.updateConfig({ showTicks: $(this).is(':checked') });
        editor.render();
    });
    
    $('#prop-tick-count').on('input', function() {
        widget.instance.updateConfig({ tickCount: parseInt($(this).val()) });
        editor.render();
    });
    
    $('#prop-major-tick').on('input', function() {
        widget.instance.updateConfig({ majorTickInterval: parseInt($(this).val()) });
        editor.render();
    });
    
    $('#prop-tick-length').on('input', function() {
        widget.instance.updateConfig({ tickLength: parseInt($(this).val()) });
        editor.render();
    });
    
    // Colors tab handlers
    $('#prop-primary-color').on('input', function() {
        widget.instance.updateConfig({ primaryColor: $(this).val() });
        editor.render();
    });
    
    $('#prop-secondary-color').on('input', function() {
        widget.instance.updateConfig({ secondaryColor: $(this).val() });
        editor.render();
    });
    
    $('#prop-text-color').on('input', function() {
        widget.instance.updateConfig({ textColor: $(this).val() });
        editor.render();
    });
    
    $('#prop-needle-color').on('input', function() {
        widget.instance.updateConfig({ needleColor: $(this).val() });
        editor.render();
    });
    
    // Color zones
    $('#prop-use-zones').on('change', function() {
        const enabled = $(this).is(':checked');
        widget.instance.updateConfig({ useZones: enabled });
        $('#zones-container').toggle(enabled);
        editor.render();
    });
    
    $('#add-zone-btn').on('click', function() {
        const zones = widget.instance.config.zones || [];
        zones.push({
            from: widget.instance.config.minValue || 0,
            to: widget.instance.config.maxValue || 100,
            color: '#ffff00'
        });
        widget.instance.updateConfig({ zones: zones });
        renderZones(widget, editor);
        editor.render();
    });
    
    // Initial zones render
    if (widget.instance.config.useZones && widget.instance.config.zones) {
        renderZones(widget, editor);
    }
    
    // Images tab handlers
    $('#prop-bg-image').on('change', function() {
        widget.instance.updateConfig({ backgroundImageUrl: $(this).val() });
        widget.instance.loadImages();
        editor.render();
    });
    
    $('#prop-bg-opacity').on('input', function() {
        const val = parseFloat($(this).val());
        $('#bg-opacity-value').text(val);
        widget.instance.updateConfig({ backgroundOpacity: val });
        editor.render();
    });
    
    $('#prop-fg-image').on('change', function() {
        widget.instance.updateConfig({ foregroundImageUrl: $(this).val() });
        widget.instance.loadImages();
        editor.render();
    });
    
    $('#prop-fg-opacity').on('input', function() {
        const val = parseFloat($(this).val());
        $('#fg-opacity-value').text(val);
        widget.instance.updateConfig({ foregroundOpacity: val });
        editor.render();
    });
    
    $('#prop-image-fill-mode').on('change', function() {
        widget.instance.updateConfig({ imageFillMode: $(this).val() });
        editor.render();
    });
    
    $('#prop-image-start-angle').on('input', function() {
        widget.instance.updateConfig({ imageStartAngle: parseInt($(this).val()) });
        editor.render();
    });
    
    $('#prop-image-end-angle').on('input', function() {
        widget.instance.updateConfig({ imageEndAngle: parseInt($(this).val()) });
        editor.render();
    });
    
    // Image upload handlers
    $('#upload-bg-btn').click(() => $('#bg-file-input').click());
    $('#upload-fg-btn').click(() => $('#fg-file-input').click());
    
    $('#bg-file-input').on('change', function(e) {
        if (this.files && this.files[0]) {
            uploadImage(this.files[0], (url) => {
                $('#prop-bg-image').val(url).trigger('change');
            });
        }
    });
    
    $('#fg-file-input').on('change', function(e) {
        if (this.files && this.files[0]) {
            uploadImage(this.files[0], (url) => {
                $('#prop-fg-image').val(url).trigger('change');
            });
        }
    });
    
    $('#browse-bg-btn').click(() => {
        browseImages((url) => {
            $('#prop-bg-image').val(url).trigger('change');
        });
    });
    
    $('#browse-fg-btn').click(() => {
        browseImages((url) => {
            $('#prop-fg-image').val(url).trigger('change');
        });
    });
    
    // Animation tab handlers
    $('#prop-smoothing').on('input', function() {
        const val = parseFloat($(this).val());
        $('#smoothing-value').text(val);
        widget.instance.updateConfig({ smoothing: val });
    });
    
    $('#prop-delay').on('input', function() {
        widget.instance.updateConfig({ updateDelay: parseInt($(this).val()) });
    });
    
    $('#prop-anim-duration').on('input', function() {
        widget.instance.updateConfig({ animationDuration: parseInt($(this).val()) });
    });
    
    $('#prop-anim-easing').on('change', function() {
        widget.instance.updateConfig({ animationEasing: $(this).val() });
    });
    
    // Needle handlers
    $('#prop-needle-length').on('input', function() {
        const val = parseFloat($(this).val());
        $('#needle-length-value').text(val);
        widget.instance.updateConfig({ needleLength: val });
        editor.render();
    });
    
    $('#prop-needle-width').on('input', function() {
        widget.instance.updateConfig({ needleWidth: parseInt($(this).val()) });
        editor.render();
    });
    
    // Indicator Light handlers
    $('#prop-shape').on('change', function() {
        widget.instance.updateConfig({ shape: $(this).val() });
        editor.render();
    });
    
    $('#prop-size').on('input', function() {
        widget.instance.updateConfig({ size: parseInt($(this).val()) });
        editor.render();
    });
    
    $('#prop-on-color').on('input', function() {
        widget.instance.updateConfig({ onColor: $(this).val() });
        editor.render();
    });
    
    $('#prop-off-color').on('input', function() {
        widget.instance.updateConfig({ offColor: $(this).val() });
        editor.render();
    });
    
    $('#prop-glow-intensity').on('input', function() {
        const val = parseInt($(this).val());
        $('#glow-intensity-value').text(val);
        widget.instance.updateConfig({ glowIntensity: val });
        editor.render();
    });
    
    $('#prop-condition-type').on('change', function() {
        const type = $(this).val();
        widget.instance.updateConfig({ conditionType: type });
        
        // Show/hide settings based on type
        $('#threshold-settings').toggle(type === 'threshold');
        $('#range-settings').toggle(type === 'range');
        
        editor.render();
    });
    
    $('#prop-threshold-op').on('change', function() {
        widget.instance.updateConfig({ thresholdOperator: $(this).val() });
        editor.render();
    });
    
    $('#prop-threshold-value').on('input', function() {
        widget.instance.updateConfig({ thresholdValue: parseFloat($(this).val()) });
        editor.render();
    });
    
    $('#prop-range-min').on('input', function() {
        widget.instance.updateConfig({ rangeMin: parseFloat($(this).val()) });
        editor.render();
    });
    
    $('#prop-range-max').on('input', function() {
        widget.instance.updateConfig({ rangeMax: parseFloat($(this).val()) });
        editor.render();
    });
    
    $('#prop-blink-pattern').on('change', function() {
        widget.instance.updateConfig({ blinkPattern: $(this).val() });
        if (widget.instance.startBlinkAnimation) {
            widget.instance.startBlinkAnimation();
        }
        editor.render();
    });
    
    $('#prop-blink-speed').on('input', function() {
        widget.instance.updateConfig({ blinkSpeed: parseInt($(this).val()) });
        if (widget.instance.startBlinkAnimation) {
            widget.instance.startBlinkAnimation();
        }
        editor.render();
    });
    
    // Delete widget button
    $('#delete-widget-btn').on('click', function() {
        if (confirm('Are you sure you want to delete this widget?')) {
            editor.removeWidget(widget);
            $('#propertiesPanel').html('<p class="text-muted">Select a widget to edit properties</p>');
        }
    });
}

function renderZones(widget, editor) {
    const zones = widget.instance.config.zones || [];
    const container = $('#zones-list');
    container.empty();
    
    zones.forEach((zone, index) => {
        const zoneHtml = $(`
            <div class="card mb-2 zone-card">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <small><strong>Zone ${index + 1}</strong></small>
                        <button type="button" class="btn btn-sm btn-danger" data-zone-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="row">
                        <div class="col-4">
                            <input type="number" class="form-control form-control-sm zone-from" data-zone-index="${index}" value="${zone.from}" placeholder="From">
                        </div>
                        <div class="col-4">
                            <input type="number" class="form-control form-control-sm zone-to" data-zone-index="${index}" value="${zone.to}" placeholder="To">
                        </div>
                        <div class="col-4">
                            <input type="color" class="form-control form-control-sm zone-color" data-zone-index="${index}" value="${zone.color}">
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        container.append(zoneHtml);
    });
    
    // Zone delete button
    $('.zone-card .btn-danger').on('click', function() {
        const index = parseInt($(this).data('zone-index'));
        zones.splice(index, 1);
        widget.instance.updateConfig({ zones: zones });
        renderZones(widget, editor);
        editor.render();
    });
    
    // Zone inputs
    $('.zone-from').on('input', function() {
        const index = parseInt($(this).data('zone-index'));
        zones[index].from = parseFloat($(this).val());
        widget.instance.updateConfig({ zones: zones });
        editor.render();
    });
    
    $('.zone-to').on('input', function() {
        const index = parseInt($(this).data('zone-index'));
        zones[index].to = parseFloat($(this).val());
        widget.instance.updateConfig({ zones: zones });
        editor.render();
    });
    
    $('.zone-color').on('input', function() {
        const index = parseInt($(this).data('zone-index'));
        zones[index].color = $(this).val();
        widget.instance.updateConfig({ zones: zones });
        editor.render();
    });
}

