/*globals zc, dojo, CKEDITOR, window */

dojo.provide('zc.ckeditor');

dojo.require("dijit._Widget");

// URL of a CKEeditor config file to use.
var ckeditorCustomConfig = '';

dojo.ready(
    function () {
        /* Dojo form widget for resource reference list */
        zc.dojo.GLOBAL_HANDLERS = [];
        dojo.declare(
            "zc.ckeditor", [dijit._Widget], {

                change_events: [
                    'saveSnapshot',
                    'undo',
                    'redo',
                    'key'],

                constructor: function (jsonData, node, order) {
                    this.config = jsonData;
                    this.name = this.config.name;
                    this._previous_value = this.config.value;
                    this.original = this.config.value;
                    this.id = this.config.id;
                    this.domNode = node || dojo.create('div');
                    this.containerNode = this.domNode;
                    this.order = order;
                    this.inherited(arguments);
                },

                buildRendering: function () {
                    var textarea = dojo.create(
                        'textarea',
                        {'name': this.name},
                        this.domNode
                    );
                    textarea.value = this.config.value || '';
                    var editor;
                    var ckeditorConfig = this.config.ckConfig || {};
                    if (this.order !== null) {
                        ckeditorConfig.tabIndex = this.order;
                    }
                    if (ckeditorCustomConfig) {
                        ckeditorConfig.customConfig = ckeditorCustomConfig;
                    }
                    this.ckeditor = CKEDITOR.replace(textarea, ckeditorConfig);
                    var handler = function () {
                        textarea.value = this.ckeditor.getData();
                    };
                    window.addEventListener('beforeSubmit', handler, true);
                    zc.dojo.GLOBAL_HANDLERS.push(handler);
                    dojo.subscribe(zc.dojo.recordFormSubmittedTopic, handler);
                    dojo.forEach(this.change_events, dojo.hitch(this,
                        function (event_name) {
                            this.ckeditor.on(event_name, dojo.hitch(this,
                                this.on_change));
                        }));
                    this.ckeditor.on('setData', dojo.hitch(this, function (e) {
                        this.on_change(e.data.dataValue);
                    }));
                },

                focus: function () {
                    this.ckeditor.focusManager.focus(); 
                },

                on_change: function (e_value) {
                    var value = e_value || this.attr('value');
                    if (value != this._previous_value) {
                        this._previous_value = value;
                        this.onChange(value);
                    }
                },

                onChange: function (value) {
                    this.inherited(arguments);
                },

                _getValueAttr: function () {
                    return this.ckeditor.getData();
                },

                _setValueAttr: function (value) {
                    this.ckeditor.setData(value);
                },

                isValid: function () {
                    if (!this.required) {
                        return True
                    }
                    return Boolean(this.ckeditor.getData());
                },

                validate: function () {
                    return this.isValid();
                },

                reset: function () {
                    this.set('value', this.original);
                },

        })
        zc.dojo.widgets['zc.dojoform.ckeditor.CKEditor'] = zc.ckeditor;

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
})
