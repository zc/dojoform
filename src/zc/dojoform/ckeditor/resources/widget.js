/* Dojo form widget for resource reference list */


// URL of a CKEeditor config file to use.
var customConfig = '';


var CKEditor = function (config, parent, order) {
    var textarea = dojo.create(
        'textarea',
        {'name': config.name},
        parent
    );
    textarea.value = config.value;
    parent.postStartup = function () {
        var editor;
        if (customConfig == '') {
            editor = CKEDITOR.replace(textarea);
        } else {
            editor = CKEDITOR.replace(
                textarea, {'customConfig': customConfig});
        }
        var handler = function () {
            textarea.value = editor.getData();
        };
        window.addEventListener('beforeSubmit', handler, true);
    };
    return parent;
};

zc.dojo.widgets['zc.dojoform.ckeditor.CKEditor'] = CKEditor;
