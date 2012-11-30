/*globals zc, dijit, dojo, CKEDITOR, window */

define(["dojo", "dijit/_Widget"], function (dojo, _Widget) {
    
    var widgets, module;

    module = dojo.declare("zc.ckeditor", [dijit._Widget], {

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
                },

                buildRendering: function () {
                    var textarea = dojo.create(
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
                    handler = dojo.hitch(this, function () {
                        textarea.value = this.ckeditor.getData();
                    });
                    window.addEventListener('beforeSubmit', handler, true);
                    this.event_handler = handler;
                    dojo.subscribe(zc.dojo.beforeRecordFormSubmittedTopic,
                        this, handler);
                    dojo.forEach(this.change_events,
                        function (event_name) {
                            this.ckeditor.on(event_name, dojo.hitch(this,
                                this.on_change));
                        }, this);
                    this.ckeditor.on('setData', dojo.hitch(this, function (e) {
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
        widgets = dojo.getObject("zc.dojo.widgets", true);
        widgets['zc.dojoform.ckeditor.CKEditor'] = function (config,
            node, order) {
                return new module(config, node, order).domNode;
        };

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
        return module;
});
