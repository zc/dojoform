/* Dojo form widget for resource reference list */

var CKEditor = function (config, parent, order) {
    var textarea = dojo.create(
        'textarea',
        {'name': config.name},
        parent
    );
    textarea.value = config.value;
    parent.postStartup = function () {
        var editor = CKEDITOR.replace(textarea);
        var handler = function () {
            textarea.value = editor.getData();
        };
        window.addEventListener('beforeSubmit', handler, true);
    };
    return parent;
};

zc.dojo.widgets['zc.dojoform.ckeditor.CKEditor'] = CKEditor;
