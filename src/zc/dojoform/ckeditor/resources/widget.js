/*globals zc, dojo, CKEDITOR, window */

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
    parent.postStartup = function (formNode) {
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
        CKEDITOR.on('instanceReady', function (event) {
            if (formNode.fit) {
                formNode.fit();
            }
        });
    };

    /* subscribers to reset/set/save photo widget data.
    */
    if (!zc.dojo.widgets['zc.dojoform.ckeditor.CKEditor'].subscribers) {
        dojo.subscribe(zc.dojo.beforeRecordFormSubmittedTopic, function(frm_id) {
            dojo.forEach(dojo.query('textarea', frm_id), function (textarea) {
                var editor = CKEDITOR.instances[textarea.name];
                if (editor) {
                    textarea.value = editor.getData();
                }
            });
        });
        dojo.subscribe(zc.dojo.dialogFormResetTopic, function(frm_id) {
            dojo.forEach(dojo.query('textarea', frm_id), function (textarea) {
                var editor = CKEDITOR.instances[textarea.name];
                if (editor) {
                    editor.setData('');
                }
            });
        });
        dojo.subscribe(zc.dojo.dialogFormUpdateTopic, function(frm_id, row) {
            dojo.forEach(dojo.query('textarea', frm_id), function (textarea) {
                textarea.value = row[textarea.name];
                var editor = CKEDITOR.instances[textarea.name];
                if (editor) {
                    editor.setData(row[textarea.name]);
                }
            });
        });
        zc.dojo.widgets['zc.dojoform.ckeditor.CKEditor'].subscribers = true;
    }

    return parent;
};

zc.dojo.widgets['zc.dojoform.ckeditor.CKEditor'] = CKEditorWidget;
