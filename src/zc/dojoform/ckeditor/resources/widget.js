/* Dojo form widget for resource reference list */

var CKEditor = function (config, parent, order) {
    var textarea = dojo.create(
        'textarea', {'name': config.name});
    textarea.postStartup = function () {
        CKEDITOR.replace(config.name);
    };
    return textarea;
};

zc.dojo.widgets['zc.dojoform.ckeditor.CKEditor'] = CKEditor;
