/*global dojo, dijit zc */

dojo.provide("zc.RecordList");
dojo.require("dijit._Widget");

dojo.ready(
    function () {
        dojo.declare(
            "zc.RecordList", [dijit._Widget], {

                constructor: function (jsonData, node) {
                    this.config = jsonData.config;
                    this.rc = this.config.record_schema;
                    this.rc.name = this.config.name;
                    this.original = this.config.value;
                    this.dijit_type = jsonData.dijit_type;
                    this.name = this.config.name;
                    this.id = this.config.id;
                    this.domNode = node || dojo.create('div');
                    this.containerNode = this.domNode;
                    this.inherited(arguments);
                },

                _build_layout: function (record) {
                    var record_layout = [];

                    var formatter = function (v) {
                        if (v) {
                            var data = dojo.fromJson(v);
                            if (data.thumbnail_tag) {
                                return unescape(data.thumbnail_tag);
                            }
                            else if (data.thumbnail_url) {
                                return '<img src="' + unescape(
                                    data.thumbnail_url) + '" />';
                            }
                            else if (data.filename) {
                                return data.filename;
                            }
                            else {
                                return '';
                            }
                        }
                        else {
                            return '';
                        }
                    };
                    dojo.forEach(record.widgets, function (widget) {
                        if (widget.widget_constructor == "zc.ajaxform.widgets.Hidden") {
                            return
                        }
                        var new_name;
                        widget = dojo.clone(widget);
                        new_name = record.name + '.' + widget.name;
                        widget.id = widget.name = new_name;
                        var column_label = widget.label || widget.fieldLabel;
                        var column = {
                            name: column_label,
                            field: widget.name,
                            width: 'auto',
                            widget_constructor: widget.widget_constructor,
                            rc_wid: widget,
                            draggable: false,
                            cellStyles: 'vertical-align: top;'
                        };
                        if (widget.type == "file") {
                            column.formatter = formatter;
                        }
                        else if (widget.filter_formatter) {
                            column.formatter = function (v) {
                                var str = String(v);
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
                    var k, rec;
                    var rec = {"name": suffix};
                    dojo.forEach(record.widgets, function (rc_wid) {
                        var indexed_name;
                        rc_wid = dojo.clone(rc_wid);
                        indexed_name = rc_wid.name;
                        rc_wid.name = record.name + '.' + indexed_name;
                        rc_wid.id = record.name + '.' + indexed_name;
                        var val = '';
                        if (record_value) {
                            val = record_value[indexed_name];
                        }
                        rec[rc_wid.name] = val;
                    });
                    return rec;
                },

                _build_record_form: function (widget_name, order) {
                    var grid = this.grid;
                    var layout = grid.structure[0].cells;
                    var edit_dlg = new dijit.Dialog({
                        title: 'Add/Modify Record',
                        style: 'width: auto;',
                        doLayout: true
                    });
                    /* A dijit.Dialog widget will prevent keypress events from propagating if
                     * the event target isn't a child of its domNode.  We want to supress
                     * this behavior for CKEditor text inputs (e.g., for the "Link" and
                     * "Anchor" popups).
                     * */
                    edit_dlg._onKey = function (evt) {
                        if (!dojo.hasClass(evt.target,
                            'cke_dialog_ui_input_text')) {
                                return dijit.Dialog.prototype._onKey.call(
                                    edit_dlg, evt);
                        }
                        return null;
                    };
                    var rec_form = new dijit.form.Form({
                        method: 'POST',
                        style: 'max-height: 500px; overflow: auto;',
                        encType: 'multipart/form-data'
                    }, dojo.create('div', null, edit_dlg.domNode));
                    var widget = new dijit.form.TextBox({
                        name: 'record_id',
                        type: 'hidden'
                    }, dojo.create('div', null, rec_form.domNode));
                    edit_dlg.form_widgets = [];
                    dojo.forEach(layout, function (fld) {
                        if (fld.rc_wid) {
                            var rc_wid = dojo.clone(fld.rc_wid);
                            rc_wid.tabIndex = order;
                            var widget_div = dojo.create(
                                'div', {'class': 'widget',
                                        'style': 'margin: 5px;'},
                                rec_form.domNode);
                            var label = dojo.create('label', {
                                innerHTML:  (rc_wid.label || rc_wid.fieldLabel) + ': '
                            }, widget_div);
                            if (rc_wid.required) {
                                var span = dojo.create(
                                    'span', {innerHTML: ' (required)'}, label);
                                dojo.addClass(span, 'status-marker');
                            }
                            dojo.create('br', null, widget_div);
                            var wid = zc.dojo.widgets[rc_wid.widget_constructor](
                                rc_wid,
                                dojo.create('div', {style: 'height: auto;'
                                }, widget_div),
                                order);
                            edit_dlg.form_widgets.push(wid);
                        }
                    });
                    var buttons_div = dojo.create('div', {
                        style: 'text-align: right;'
                    });
                    dojo.addClass(buttons_div, 'dijitDialogPaneActionBar');

                    widget = new dijit.form.Button({
                        label: 'Save',
                        id: widget_name + '.dojo.save.btn',
                        tabIndex: order,
                        onClick: function (e) {
                            if (!rec_form.validate()) {
                                return;
                            }
                            dojo.publish(
                                zc.dojo.beforeRecordFormSubmittedTopic,
                                [rec_form.id]); 
                            var record_data = dojo.formToObject(
                                rec_form.domNode);
                            if (! record_data.record_id) {
                                var row = {name: '.' + grid.rowCount + 1};
                                dojo.forEach(grid.structure[0].cells, function (fld) {
                                    if (fld.rc_wid) {
                                        if (fld.widget_constructor == 'zope.schema.Bool') {
                                            record_data[fld.field] =
                                                Boolean(record_data[fld.field]);
                                        }
                                        row[fld.field] = record_data[fld.field];
                                    }
                                });
                                grid.store.newItem(row);
                                grid.store.save();
                            }
                            else {
                                grid.store.fetchItemByIdentity({
                                    identity: record_data.record_id,
                                    onItem: function (item) {
                                        dojo.forEach(grid.structure[0].cells, function (fld) {
                                            if (fld.rc_wid) {
                                                if (fld.widget_constructor == 'zope.schema.Bool') {
                                                    record_data[fld.field] =
                                                        Boolean(record_data[fld.field]);
                                                }
                                                grid.store.setValue(item,
                                                                   fld.field,
                                                                    record_data[fld.field]);
                                                grid.store.save();
                                            }
                                        });
                                    }
                                });
                            }
                            edit_dlg.hide();
                        }
                    });
                    buttons_div.appendChild(widget.domNode);
                    widget = new dijit.form.Button({
                        label: 'Cancel',
                        id: widget_name + '.dojo.cancel.btn',
                        tabIndex: order,
                        onClick: function (evt) {
                            edit_dlg.hide();

                        }
                    });
                    buttons_div.appendChild(widget.domNode);


                    var nodes = new dojo.NodeList(rec_form.domNode);
                    nodes.push(buttons_div);

                    edit_dlg.attr('content', nodes);
                    edit_dlg.startup();
                    edit_dlg.editForm = rec_form;
                    dojo.forEach(edit_dlg.form_widgets, function (w) {
                        if (w.postStartup) {
                            w.postStartup(edit_dlg);
                        }
                    });
                    return edit_dlg;
                },

                _edit_record: function (widget_name, row_value, order) {
                    var grid = this.grid;
                    if (dojo.version < '1.6') {
                        grid.select.clearDrugDivs();
                    }
                    if (!grid.edit_dlg) {
                        grid.edit_dlg = this._build_record_form(
                            widget_name, order);
                    }
                    var form_values = {record_id: grid.store.getValue(row_value, 'name')};
                    dojo.forEach(grid.structure[0].cells, function (fld) {
                        if (fld.rc_wid) {
                            form_values[fld.field] = grid.store.getValue(row_value, fld.field);
                        }
                    });
                    /* order of next two lines is important */
                    grid.edit_dlg.editForm.getChildren().forEach(function (el) {
                        if (el.name in form_values) {
                            el.attr('value', form_values[el.name]);
                            if (el.checked !== undefined) {
                                el.attr('checked', form_values[el.name]);
                            }
                        }
                    });

                    dojo.publish(
                        zc.dojo.dialogFormUpdateTopic,
                        [grid.edit_dlg.editForm.id, form_values]);
                    grid.edit_dlg.show();
                },

                buildRendering: function () {

                    var record_fields = this._build_layout(this.rc);
                    var layout = [{
                        cells: record_fields
                    }];

                    var grid = new dojox.grid.EnhancedGrid({
                        query: { name: '*' },
                        store: this._store_from_data(this.config.value),
                        structure: layout,
                        escapeHTMLInData: false,
                        elastic: true,
                        rowSelector: '20px',
                        autoHeight: true,
                        plugins: {
                            nestedSorting: true,
                            dnd: true
                        }
                    }, dojo.create('div', {}, this.domNode));
                    this.grid = grid;
                    if (dojo.version < '1.6') {
                        grid.select.exceptColumnsTo = record_fields.length - 2;
                        grid.select.getExceptionalColOffsetWidth = dojo.hitch(
                            grid.select, function () {
                                var normalizedOffsetWidth = 0, offsetWidth = 0;
                                dojo.forEach(this.getHeaderNodes(), function (node, index) {
                                                 if (index <= this.exceptColumnsTo) {
                                                     var coord = dojo.coords(node);
                                                     offsetWidth += coord.w;
                                                 }
                                             }, this);
                                normalizedOffsetWidth = offsetWidth;
                                return normalizedOffsetWidth > 0 ? normalizedOffsetWidth : 0;
                            });
                    }
                    if (!this.rc.readonly) {
                        dojo.connect(grid, 'onCellMouseOver', function (e) {
                            if (e.cell.draggable) {
                                grid.select.cleanAll();
                                grid.selection.select(e.rowIndex);
                                grid.select.clearDrugDivs();
                                grid.select.addRowMover(e.rowIndex, e.rowIndex);
                            }
                            else {
                                grid.select.clearDrugDivs();
                            }
                        });
                        dojo.connect(grid, 'onCellClick', function (e) {
                            grid.selection.select(e.rowIndex);
                        });
                        dojo.connect(grid, 'onCellDblClick', function (e) {
                            grid.selection.select(e.rowIndex);
                            this._edit_record(
                                this.config.name, grid.selection.getSelected()[0], this.order);
                        });
                    }
                    if (!this.rc.readonly) {
                        var widget = new dijit.form.Button({
                            label: 'New',
                            id: this.config.name + '.dojo.new.btn',
                            tabIndex: this.order,
                            onClick: dojo.hitch(this, function (evt) {
                                if (!grid.edit_dlg) {
                                    grid.edit_dlg = this._build_record_form(
                                        this.config.name, this.order);
                                }
                                grid.edit_dlg.reset();
                                dojo.publish(zc.dojo.dialogFormResetTopic,
                                             [grid.edit_dlg.editForm.id]);
                                grid.select.cancelDND();
                                grid.edit_dlg.show();
                            })
                        }, dojo.create('div', null, this.domNode));
                        widget = new dijit.form.Button({
                            label: 'Edit',
                            id: this.config.name + '.dojo.edit.btn',
                            tabIndex: this.order,
                            onClick: dojo.hitch(this, function () {
                                var row_values = grid.selection.getSelected();
                                if (row_values.length != 1) {
                                    zc.dojo.alert({
                                        title: 'Error!',
                                        content: 'Please select a single row to Edit.'
                                    });
                                    return;
                                }
                                this._edit_record(
                                    this.config.name, row_values[0], this.order);
                            })
                        }, dojo.create('div', null, this.domNode));
                        widget = new dijit.form.Button({
                            label: 'Delete',
                            id: this.config.name + '.dojo.delete.btn',
                            tabIndex: this.order,
                            onClick: function (evt) {
                                var selected = grid.selection.getSelected();
                                if (!selected.length) {
                                    zc.dojo.alert({
                                        title: 'Error!',
                                        content: 'No row selected.'
                                    });
                                    return;
                                }
                                dojo.forEach(selected, grid.store.deleteItem, grid.store);
                                grid.store.save();
                            }
                        }, dojo.create('div', null, this.domNode));
                    }

                    this.startup = function (node) {
                        grid.startup();
                    };

                    this.domNode.postStartup = this.startup;
                    this.input_value = dojo.create('input', {
                        type: 'hidden',
                    }, this.domNode);
                    this.input_parent = dojo.create('div', null, this.domNode);
                    dojo.connect(this.grid, 'startup', dojo.hitch(this, function () {
                        this._set_inputs(this.get('value'));
                    }));
                },

                _getValueAttr: function () {
                    var i = 0;
                    var content = {};
                    dojo.forEach(this.grid.store._arrayOfAllItems,
                        dojo.hitch(this, function (item) {
                            if (item === null) { return } 
                            dojo.forEach(this.rc.widgets, dojo.hitch(this,
                                function (def) {
                                    var name = this.config.name + '.' + def.name;
                                    if (item[name] !== undefined) {
                                        content[name + '.' + i] = item[name][0];
                                    }
                            }))
                            i++;
                    }))
                    return dojo.toJson(content)
                },

                _values_from: function (value) {
                },

                _store_from_data: function (value) {
                    var item_list = [];
                    var num = 0;
                    dojo.forEach(value, dojo.hitch(this,
                        function (record) {
                            item_list.push(this._build_record(this.rc,
                                '.' + num,
                                record));
                            num += 1;
                    }));
                    var data = {
                        "items": item_list,
                        "identifier": "name",
                        "label": "name"
                    };
                    var store = new dojo.data.ItemFileWriteStore(
                        {data: data});
                    dojo.connect(store, 'onNew', dojo.hitch(this,
                        this._on_change));
                    dojo.connect(store, 'onDelete', dojo.hitch(this,
                        this._on_change));
                    dojo.connect(store, 'onSet', dojo.hitch(this,
                        this._on_change));
                    return store;
                },

                _set_inputs: function (value) {
                    this.input_value.value = value;
                    this.input_parent.innerHTML = '';
                    var values = dojo.fromJson(value);
                    for (name in values) {
                        dojo.create('input', {
                            type: 'hidden',
                            name: name,
                            value: values[name]
                        }, this.input_parent);
                    }
                },

                onChange: function (value) {
                    this._set_inputs(value);
                    this.inherited(arguments);
                },

                _on_change: function () {
                    this.onChange(this.attr('value'));
                },

                _setValueAttr: function (value) {
                    this.grid.setStore(this._store_from_data(value));
                    this.onChange(this.get('value'));
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
});
