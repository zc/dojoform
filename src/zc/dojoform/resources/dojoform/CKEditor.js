/*globals define, CKEDITOR */
define(
["dojo/_base/array",
 "dojo/_base/connect",
 "dojo/_base/declare",
 "dojo/_base/lang",
 "dojo/dom-construct",
 "dojo/query",
 "dijit/_Widget",
 "./widgets",
 "./List"
], function (array, connect, declare, lang, domConstruct,
             query, _Widget, widgets, List)
{

    var CKEditor = declare(
        _Widget, {

            declaredClass: "zc.dojoform.CKEditor",

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
                this.order = order;
            },

            buildRendering: function () {
                this.inherited(arguments);
                var textarea = domConstruct.create(
                    'textarea',
                    {'name': this.name},
                    this.domNode
                ), ckeditorConfig = this.config.ckConfig || {},
                editor, handler;
                textarea.value = this.config.value || '';
                if (this.order !== null) {
                    ckeditorConfig.tabIndex = this.order;
                }
                if (window.ckeditorCustomConfig) {
                    ckeditorConfig.customConfig = (
                        window.ckeditorCustomConfig);
                }
                this.ckeditor = CKEDITOR.replace(textarea, ckeditorConfig);
                handler = lang.hitch(
                    this, function () {
                        textarea.value = this.ckeditor.getData();
                    });
                window.addEventListener('beforeSubmit', handler, true);
                this.event_handler = handler;
                connect.subscribe(List.beforeRecordFormSubmittedTopic,
                                  this, handler);
                array.forEach(
                    this.change_events,
                    function (event_name) {
                        this.ckeditor.on(
                            event_name,
                            lang.hitch(this, this.on_change));
                    }, this);
                this.ckeditor.on(
                    'setData',
                    lang.hitch(
                        this, function (e) {
                            this.on_change(e.data.dataValue);
                        }));
            },

            focus: function () {
                this.ckeditor.focusManager.focus();
            },

            on_change: function (e_value) {
                var value = e_value || this.get('value');
                if (value !== this._previous_value) {
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
                    return true;
                }
                return Boolean(this.ckeditor.getData());
            },

            validate: function () {
                return this.isValid();
            },

            reset: function () {
                this.set('value', this.original);
            },

            destroy: function () {
                window.removeEventListener('beforeSubmit',
                                           this.event_handler, true);
                CKEDITOR.instances[this.name].destroy();
                this.inherited(arguments);
            }

        });

    widgets['CKEditor'] = function (config, node, order) {
        return new CKEditor(config, node, order).domNode;
    };

    connect.subscribe(
        List.beforeRecordFormSubmittedTopic, function(frm_id) {
            query("textarea", frm_id).forEach(
                function (textarea) {
                    var editor = CKEDITOR.instances[textarea.name];
                    if (editor) {
                        textarea.value = editor.getData();
                    }
                });
        });
    connect.subscribe(
        List.dialogFormResetTopic, function(frm_id) {
            query("textarea", frm_id).forEach(
                function (textarea) {
                    var editor = CKEDITOR.instances[textarea.name];
                    if (editor) {
                        editor.setData('');
                    }
                });
        });
    connect.subscribe(
        List.dialogFormUpdateTopic, function(frm_id, row) {
            query('textarea', frm_id).forEach(
                function (textarea) {
                    textarea.value = row[textarea.name];
                    var editor = CKEDITOR.instances[textarea.name];
                    if (editor) {
                        editor.setData(row[textarea.name]);
                    }
                });
        });

    return CKEditor;
});
