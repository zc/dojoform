/* Dojo form widget for resource reference list */


// URL of a CKEeditor config file to use.
var ckeditorCustomConfig = '';


var CKEditorWidget = function (config, parent, order) {
    var textarea = dojo.create(
        'textarea',
        {'name': config.name},
        parent
    );
    textarea.value = config.value;
    parent.postStartup = function (formNode) {
        var editor, ckeditorConfig;
        if (config.display_options != null) {
            ckeditorConfig = config.display_options;
        } else {
            ckeditorConfig = {};
        }
        if (ckeditorCustomConfig != '') {
            ckeditorConfig['customConfig'] = ckeditorCustomConfig;
        }
        editor = CKEDITOR.replace(textarea, ckeditorConfig);
        var handler = function () {
            textarea.value = editor.getData();
        };
        window.addEventListener('beforeSubmit', handler, true);
        CKEDITOR.on('instanceReady', function (event) {
            formNode.fit()
        });
    };
    return parent;
};

zc.dojo.widgets['zc.dojoform.ckeditor.CKEditor'] = CKEditorWidget;
