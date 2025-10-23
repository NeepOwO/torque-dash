    function showWidgetProperties(widget) {
        const panel = $('#propertiesPanel');
        panel.empty();
        
        // Use new UI system
        const html = createPropertiesPanel(widget);
        panel.html(html);
        
        // Setup all event handlers
        setupPropertiesHandlers(widget, editor, uploadImage, browseImages);
    }

