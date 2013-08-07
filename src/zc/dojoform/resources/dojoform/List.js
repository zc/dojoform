define(
    [
        "dojo/_base/array",
        "dojo/_base/connect",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/aspect",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/json",
        "dojo/query",
        "dojo/data/ObjectStore",
        "dojo/store/Memory",
        "dijit/_Container",
        "dijit/_Widget",
        "dijit/Dialog",
        "dijit/form/Button",
        "dijit/form/Form",
        "dijit/form/TextBox",
        "dijit/layout/ContentPane",
        "dojox/grid/EnhancedGrid",
        "./widgets",
        "dojox/grid/enhanced/plugins/DnD",
        "dojox/grid/enhanced/plugins/NestedSorting"
    ],
function (array, connect, declare, lang, aspect, domClass,
          domConstruct, json, query, ObjectStore, MemoryStore,
          _Container, _Widget, Dialog,
          Button, Form, TextBox, ContentPane, EnhancedGrid,
          widgets)
{
    var module = {
        beforeRecordFormSubmittedTopic: "ZC_DOJO_BEFORE_RECORD_FORM_SUBMITTED",
        dialogFormResetTopic: "ZC_DOJO_DIALOG_FORM_RESET",
        dialogFormUpdateTopic: "ZC_DOJO_DIALOG_FORM_UPDATE"
        };

    module['List'] = declare([_Widget, _Container],
    {
        declaredClass: "zc.dojoform.List",

        value: "",

        constructor: function (params, srcNodeRef) {
            this.config = params.config;
            this.rc = this.config.record_schema;
            this.rc.name = this.config.name;
            this.original = this.config.value;
            this.dnd__preselect = true;
            this.dijit_type = params.dijit_type;
            this.name = this.config.name;
            this.id = this.config.id;
        },

        _build_layout: function (record) {
            var record_layout = [], formatter;

            formatter = function (v) {
                var data;
                if (v) {
                    data = json.parse(v);
                    if (data.thumbnail_tag) {
                        return unescape(data.thumbnail_tag);
                    }
                    if (data.thumbnail_url) {
                        return '<img src="' + unescape(
                            data.thumbnail_url) + '" />';
                    }
                    if (data.filename) {
                        return data.filename;
                    }
                }
                return "";
            };
            array.forEach(record.widgets, function (widget) {
                var new_name, column_label, column;
                if (widget.widget_constructor === "Hidden") {
                    return;
                }
                widget = lang.clone(widget);
                new_name = record.name + '.' + widget.name;
                widget.id = widget.name = new_name;
                column_label = widget.label || widget.fieldLabel;
                column = {
                    name: column_label,
                    field: widget.name,
                    width: 'auto',
                    widget_constructor: widget.widget_constructor,
                    rc_wid: widget,
                    draggable: false,
                    cellStyles: 'vertical-align: top;'
                };
                if (widget.type === "file") {
                    column.formatter = formatter;
                }
                else if (widget.filter_formatter) {
                    column.formatter = function (v) {
                        var str = v.toString();
                        return widget.filter_formatter[str] || str;
                    };
                }
                record_layout.push(column);

            });
            record_layout.push({
                name: '',
                field: '',
                width: '20px',
                noresize: true,
                cellStyles: 'text-align: right;',
                value: '<div>||</div>'
            });
            return record_layout;
        },

        _build_record: function (record, suffix, record_value) {
            var k, rec = {"name": suffix};
            array.forEach(record.widgets, function (rc_wid) {
                var indexed_name, val = '';
                rc_wid = lang.clone(rc_wid);
                indexed_name = rc_wid.name;
                rc_wid.name = record.name + '.' + indexed_name;
                rc_wid.id = record.name + '.' + indexed_name;
                if (record_value) {
                    val = record_value[indexed_name];
                }
                rec[rc_wid.name] = val;
            });
            return rec;
        },

        _build_record_form: function (widget_name, order) {
            var grid = this.grid, layout, edit_dlg, rec_form,
                widget, buttons_div, nodes;
            layout = grid.structure[0].cells;
            edit_dlg = new Dialog({
                title: 'Add/Modify Record',
                style: 'width: auto;',
                doLayout: true
            });
            /* A dijit.Dialog widget will prevent keypress
             * events from propagating if the event target
             * isn't a child of its domNode.  We want to
             * supress this behavior for CKEditor text inputs
             * (e.g., for the "Link" and "Anchor" popups).
             * */
            edit_dlg._onKey = function (evt) {
                if (!domClass.contains(evt.target,
                    'cke_dialog_ui_input_text')) {
                        return Dialog.prototype._onKey.call(
                            edit_dlg, evt);
                }
                return null;
            };
            rec_form = new Form({
                method: 'POST',
                style: 'max-height: 500px; overflow: auto;',
                encType: 'multipart/form-data'
            });
            widget = new TextBox({
                name: 'record_id',
                type: 'hidden'
            }, domConstruct.create('div', null, rec_form.domNode));
            edit_dlg.form_widgets = [widget];
            array.forEach(layout, function (fld) {
                var rc_wid, widget_div, label, span, wid;
                if (fld.rc_wid) {
                    rc_wid = lang.clone(fld.rc_wid);
                    rc_wid.tabIndex = order;
                    widget_div = domConstruct.create(
                        'div', {'class': 'widget',
                                'style': 'margin: 5px;'},
                        rec_form.domNode);
                    label = domConstruct.create('label', {
                        innerHTML:  (rc_wid.label ||
                                     rc_wid.fieldLabel) + ': '
                    }, widget_div);
                    if (rc_wid.required) {
                        span = domConstruct.create(
                            'span', {innerHTML: ' (required)'}, label);
                        domClass.add(span, 'status-marker');
                    }
                    domConstruct.create('br', null, widget_div);
                    wid = widgets[
                        rc_wid.widget_constructor](
                        rc_wid,
                        domConstruct.create('div', {style: 'height: auto;'
                        }, widget_div),
                        order);
                    edit_dlg.form_widgets.push(wid);
                }
            });
            buttons_div = domConstruct.create('div', {
                style: 'text-align: right;'
            });
            domClass.add(buttons_div, 'dijitDialogPaneActionBar');

            widget = new Button({
                label: 'Cancel',
                id: widget_name + '.dojo.cancel.btn',
                tabIndex: order,
                onClick: function (evt) {
                    edit_dlg.hide();
                }
            });
            buttons_div.appendChild(widget.domNode);

            widget = new Button({
                label: 'Save',
                id: widget_name + '.dojo.save.btn',
                tabIndex: order,
                onClick: function (e) {
                    var record_data, item;
                    if (!rec_form.validate()) {
                        return;
                    }
                    connect.publish(
                        module.beforeRecordFormSubmittedTopic,
                        [rec_form.id]);
                    record_data = rec_form.get("value");
                    if (!record_data.record_id) {
                        item = {name: '.' + grid.rowCount + 1};
                        array.forEach(
                            grid.structure[0].cells, function (fld) {
                                var val = lang.getObject(
                                    fld.field, false, record_data);
                                if (fld.rc_wid) {
                                    if (fld.widget_constructor ===
                                        'zope.schema.Bool') {
                                        val = Boolean(val);
                                }
                                item[fld.field] = val;
                            }
                        });
                        grid.store.newItem(item);
                        grid.store.save();
                    }
                    else {
                        grid.store.fetchItemByIdentity({
                            identity: record_data.record_id,
                            onItem: function (item) {
                                array.forEach(
                                    grid.structure[0].cells,
                                    function (fld) {
                                        var val = lang.getObject(
                                                fld.field, false,
                                                record_data);
                                        if (fld.rc_wid) {
                                            if (fld.
                                                widget_constructor ===
                                                'zope.schema.Bool') {
                                                record_data[fld.field] =
                                                    Boolean(
                                                        record_data[
                                                            fld.field]);
                                            }
                                            grid.store.setValue(
                                                item,
                                                fld.field,
                                                val);
                                    }
                                });
                                grid.store.save();
                            }
                        });
                    }
                    edit_dlg.hide();
                }
            });
            buttons_div.appendChild(widget.domNode);

            nodes = new query.NodeList([rec_form.domNode, buttons_div]);

            edit_dlg.set('content', nodes);
            edit_dlg.startup();
            edit_dlg.editForm = rec_form;
            array.forEach(edit_dlg.form_widgets, function (w) {
                if (w.postStartup) {
                    w.postStartup(edit_dlg);
                }
            });
            return edit_dlg;
        },

        resize: function () {
            this.inherited(arguments);
            this.grid.resize();
        },

        _edit_record: function (widget_name, row_value, order) {
            var grid = this.grid, form_values;
            if (!grid.edit_dlg) {
                grid.edit_dlg = this._build_record_form(
                    widget_name, order);
            }
            form_values = {
                record_id: grid.store.getValue(row_value, 'name')};
            array.forEach(grid.structure[0].cells, function (fld) {
                if (fld.rc_wid) {
                    form_values[fld.field] =
                        grid.store.getValue(row_value, fld.field);
                }
            });
            /* order of next two lines is important */
            grid.edit_dlg.editForm.getChildren().forEach(function (el) {
                if (form_values[el.name] !== undefined) {
                    el.set('value', form_values[el.name]);
                    if (el.checked !== undefined) {
                        el.set('checked', form_values[el.name]);
                    }
                }
            });

            connect.publish(
                module.dialogFormUpdateTopic,
                [grid.edit_dlg.editForm.id, form_values]);
            grid.edit_dlg.show();
        },

        buildRendering: function () {
            this.inherited(arguments);
            var record_fields, layout, grid, widget, dnd_plugin;

            record_fields = this._build_layout(this.rc);
            layout = [{
                cells: record_fields
            }];

            grid = new EnhancedGrid({
                query: { name: '*' },
                store: this._store_from_data(this.config.value),
                structure: layout,
                escapeHTMLInData: false,
                elastic: true,
                rowSelector: '20px',
                autoHeight: true,
                plugins: {
                    nestedSorting: true,
                    dnd: {'dndConfig':
                       {'col': {
                            'out': false,
                            'within': false,
                            'in': false
                           },
                        'cell': {
                            'out': false,
                            'within': false,
                            'in': false
                           }
                       }
                    }
                }
            }, domConstruct.create('div', null, this.domNode));
            this.grid = grid;
            dnd_plugin = grid.pluginMgr.getPlugin('dnd');
            dnd_plugin.selector.setupConfig({
                'row': 'single',
                'cell': 'disabled',
                'column': 'disabled'
            });
            grid.on("cellmouseover", lang.hitch(this,
                function (e) {
                    if (this.dnd_preselect) {
                        var dnd_plugin = grid.pluginMgr.getPlugin('dnd');
                        dnd_plugin._dndReady = true;
                        dnd_plugin.selector.select('row', e.rowIndex);
                    }
            }));
            if (!this.rc.readonly) {
                grid.on('cellclick', lang.hitch(this,
                    function (e) {
                    grid.selection.select(e.rowIndex);
                    var dnd_plugin = grid.pluginMgr.getPlugin('dnd');
                    dnd_plugin._dndReady = true;
                    dnd_plugin.selector.select('row', e.rowIndex);
                    this.dnd_preselect = false;
                }));
                grid.on('celldblclick', lang.hitch(this, function (e) {
                    grid.selection.select(e.rowIndex);
                    this._edit_record(
                        this.config.name,
                        grid.selection.getSelected()[0],
                        this.order);
                }));
            }
            if (!this.rc.readonly) {
                widget = new Button({
                    label: 'New',
                    id: this.config.name + '.dojo.new.btn',
                    tabIndex: this.order,
                    onClick: lang.hitch(this, function (evt) {
                        if (!grid.edit_dlg) {
                            grid.edit_dlg = this._build_record_form(
                                this.config.name, this.order);
                        }
                        grid.edit_dlg.reset();
                        connect.publish(module.dialogFormResetTopic,
                                     [grid.edit_dlg.editForm.id]);
                        grid.edit_dlg.show();
                    })
                }, domConstruct.create('div', null, this.domNode));
                widget = new Button({
                    label: 'Edit',
                    id: this.config.name + '.dojo.edit.btn',
                    tabIndex: this.order,
                    onClick: lang.hitch(this, function () {
                        var row_values = grid.selection.getSelected();
                        if (row_values.length !== 1) {
                            alert('Please select a single row to Edit.');
                            return;
                        }
                        this._edit_record(
                            this.config.name,
                            row_values[0],
                            this.order);
                    })
                }, domConstruct.create('div', null, this.domNode));
                widget = new Button({
                    label: 'Delete',
                    id: this.config.name + '.dojo.delete.btn',
                    tabIndex: this.order,
                    onClick: function (evt) {
                        var selected = grid.selection.getSelected();
                        if (!selected.length) {
                            alert('No row selected.');
                            return;
                        }
                        array.forEach(
                            selected,
                            grid.store.deleteItem,
                            grid.store);
                        grid.store.save();
                    }
                }, domConstruct.create('div', null, this.domNode));
                // While the event seems deceptively decorative, we are
                // using this to know when to recalculate our grid
                // value, since we do so by iterating over rows.
                // We do this because order is important, and the store
                // cares nothing of order.
                aspect.after(grid, "postresize", lang.hitch(this,
                    function (item) {
                        this._set_inputs();
                        this.onChange(this.get('value'));
                        this.dnd_preselect = true;
                    })
                );
            }

            this.startup = function (node) {
                grid.startup();
            };

            this.domNode.postStartup = this.startup;
            this.input_value = domConstruct.create('input', {
                type: 'hidden'
            }, this.domNode);
            this.input_parent = domConstruct.create('div', null, this.domNode);

            aspect.after(this.grid, "startup", lang.hitch(
                    this, function () {
                        this._set_inputs();
                    }));
        },

        onChange: function (value) {
            this.inherited(arguments);
        },

        _getValueAttr: function () {
            return this.input_value.value;
        },

        _values_from: function (value) {
        },

        _store_from_data: function (value) {
            var item_list = [], num = 0, store;
            array.forEach(value, lang.hitch(this,
                function (record) {
                    item_list.push(this._build_record(this.rc,
                        '.' + num,
                        record));
                    num += 1;
            }));

            store = new MemoryStore({data: item_list, idProperty: "name"});
            store = new ObjectStore({objectStore: store});
            // This won't trigger a resize, so we have to keep this
            // event.
            aspect.after(store, "onSet", lang.hitch(this, this._set_inputs));
            return store;
        },

        _set_inputs: function () {
            var items = {}, i, attrs, name, value, rec;
            this.input_parent.innerHTML = '';
            for (i = 0; i < this.grid.rowCount; i++) {
                rec = this.grid.getItem(i);
                if (rec) {
                    attrs = this.grid.store.getAttributes(rec);
                    array.forEach(attrs, function (attr) {
                        if (attr !== 'name') {
                            name = attr + '.' + i;
                            value = this.grid.store.getValue(rec, attr);
                            domConstruct.create('input', {
                                type: 'hidden',
                                name: name,
                                value: value
                            }, this.input_parent);
                            items[name] = value;
                        }
                    }, this);
                }
            }
            this.input_value.value = json.stringify(items);
        },

        _setValueAttr: function (value) {
            this.grid.setStore(this._store_from_data(value));
        },

        isValid: function () {
            return true;
        },

        validate: function () {
        },

        reset: function () {
            this.set('value', this.original);
        },

        focus: function () {
            this.grid.focus.findAndFocusGridCell();
        }

    });

    widgets['List'] = function (
        config, pnode, order, widgets) {
        return new module.List({config: config}, pnode).domNode;
    };

    return module;
});
