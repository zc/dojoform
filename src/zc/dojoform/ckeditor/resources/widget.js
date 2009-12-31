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
        if (order != null) {
            ckeditorConfig.tabIndex = order;
        }
        if (ckeditorCustomConfig != '') {
            ckeditorConfig['customConfig'] = ckeditorCustomConfig;
        }
        editor = CKEDITOR.replace(textarea, ckeditorConfig);
        var handler = function () {
            textarea.value = editor.getData();
        };
        window.addEventListener('beforeSubmit', handler, true);
        dojo.subscribe(zc.dojo.recordFormSubmittedTopic, handler);
        CKEDITOR.on('instanceReady', function (event) {
            if (formNode.fit != null) {
                formNode.fit()
            }
        });
    };
    parent.updateValues = function () {
        var editor = CKEDITOR.instances[textarea.name];
        editor.setData(textarea.value);
    }
    return parent;
};

zc.dojo.widgets['zc.dojoform.ckeditor.CKEditor'] = CKEditorWidget;
