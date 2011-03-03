/*globals zc, dojo, CKEDITOR, window */

dojo.provide('zc.ckeditor');
dojo.require('zc.dojo');

/* Dojo form widget for resource reference list */

zc.dojo.GLOBAL_HANDLERS = [];

// URL of a CKEeditor config file to use.
var ckeditorCustomConfig = '';


var CKEditorWidget = function (config, parent, order) {
    var textarea = dojo.create(
        'textarea',
        {'name': config.name},
        parent
    );
    textarea.value = config.value || '';
    var editor;
    var ckeditorConfig = config.ckConfig || {};
    if (order !== null) {
        ckeditorConfig.tabIndex = order;
    }
    if (ckeditorCustomConfig) {
        ckeditorConfig.customConfig = ckeditorCustomConfig;
    }
    editor = CKEDITOR.replace(textarea, ckeditorConfig);
    var handler = function () {
        textarea.value = editor.getData();
    };
    window.addEventListener('beforeSubmit', handler, true);
    zc.dojo.GLOBAL_HANDLERS.push(handler);
    dojo.subscribe(zc.dojo.recordFormSubmittedTopic, handler);
    return parent;
};

zc.dojo.widgets['zc.dojoform.ckeditor.CKEditor'] = CKEditorWidget;

dojo.subscribe(
    zc.dojo.beforeRecordFormSubmittedTopic, function(frm_id) {
        dojo.forEach(
            dojo.query('textarea', frm_id), function (textarea) {
                var editor = CKEDITOR.instances[textarea.name];
                if (editor) {
                    textarea.value = editor.getData();
                }
            });
    });
dojo.subscribe(
    zc.dojo.dialogFormResetTopic, function(frm_id) {
        dojo.forEach(
            dojo.query('textarea', frm_id), function (textarea) {
                var editor = CKEDITOR.instances[textarea.name];
                if (editor) {
                    editor.setData('');
                }
            });
    });
dojo.subscribe(
    zc.dojo.dialogFormUpdateTopic, function(frm_id, row) {
        dojo.forEach(
            dojo.query('textarea', frm_id), function (textarea) {
                textarea.value = row[textarea.name];
                var editor = CKEDITOR.instances[textarea.name];
                if (editor) {
                    editor.setData(row[textarea.name]);
                }
            });
    });
