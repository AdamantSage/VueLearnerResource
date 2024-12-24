document.addEventListener('DOMContentLoaded', function () {
    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        FilePondPluginFileEncode
    );

    FilePond.setOptions({
        stylePanelAspectRatio: 15/10, // Custom aspect ratio for image preview panel
    });

    FilePond.parse(document.body);
});
