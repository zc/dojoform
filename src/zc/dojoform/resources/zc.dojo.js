dojo.provide('zc.dojo');
dojo.require('dijit.form.ValidationTextBox');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.form.ComboBox');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.Form');
dojo.require('dijit.form.SimpleTextarea');
dojo.require('dijit.Editor');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.form.NumberTextBox');
dojo.require('dijit.Dialog');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.require("dojox.grid.cells.dijit");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.EnhancedGrid");
dojo.require("dojox.grid.enhanced.plugins.DnD");
dojo.require("dojox.grid.enhanced.plugins.Menu");
dojo.require("dojox.grid.enhanced.plugins.NestedSorting");
dojo.require("dojox.grid.enhanced.plugins.IndirectSelection");

zc.dojo.widgets = {};

zc.dojo.beforeContentFormSubmittedTopic = "ZC_DOJO_BEFORE_CONTENT_FORM_SUBMITTED";
zc.dojo.beforeRecordFormSubmittedTopic = "ZC_DOJO_BEFORE_RECORD_FORM_SUBMITTED";
zc.dojo.dialogFormResetTopic = "ZC_DOJO_DIALOG_FORM_RESET";
zc.dojo.dialogFormUpdateTopic = "ZC_DOJO_DIALOG_FORM_UPDATE";

zc.dojo.get_recordlist_data = function (args) {
    var content, rec;
    if (args.form_id) {
        content = {};
        dojo.forEach(dojo.query('div.dojoxGrid', args.form_id), function (g) {
            var form_grid = dijit.byId(g.id);
            var idx = 0;
            var k;
            while (idx < form_grid.rowCount) {
                rec = form_grid.getItem(idx);
                for (k in rec) {
                    content[k + '.' + idx] = form_grid.store.getValue(rec, k);
                }
                idx += 1;
            }
        });
        return content;
    }
};

zc.dojo.alert = function (args) {
    // Parameters can be passed in an object or in the following order:
    //
    // title: String
    //              The text for the title bar of the dialog.
    // content: String
    //              The text for the body of the dialog.

    var button, dialog, dtor, el, nodes;

    var _args, params;

    if (arguments.length > 1) {
        _args = {};
        params = ['title', 'content'];
        for (i=0; i<arguments.length; i++) {
            _args[params[i]] = arguments[i];
        }
        args = _args;
    } else if (typeof args != "object") {
        throw new Error("Invalid argument.");
    }

    dialog = new dijit.Dialog({'title': args.title || 'Alert'});
    dtor = function () {
        dialog.hide();
        dialog.destroyRecursive();
    };
    dojo.connect(dialog, 'onCancel', dtor);
    button = new dijit.form.Button({
        label: 'OK',
        onClick: dtor
    });
    el = dojo.create('div', {
            style: 'text-align: left; width: 100%; margin-bottom: 15%;',
            innerHTML: args.content
        });
    nodes = new dojo.NodeList(el);
    el = dojo.create('div', {style: 'text-align: right; width: 100%;'});
    el.appendChild(button.domNode);
    nodes.push(el);
    dialog.attr('content', nodes);
    dialog.show();
};

zc.dojo.confirm = function (args) {
    // Parameters can be passed in an object or in the following order.
    //
    // title: String
    //              The text for the title bar of the dialog.
    // content: String
    //              The text for the body of the dialog.
    // yes: Function (optional)
    //              The callback for the 'Yes' button.
    // no: Function (optional)
    //              The callback for the 'No' or dialog cancel buttons.

    var btn, btn_div, dialog, events, handler, no_cb, nodes;

    var _args, params;

    if (arguments.length > 1) {
        _args = {};
        params = ['title', 'content', 'yes', 'no'];
        for (i=0; i<arguments.length; i++) {
            _args[params[i]] = arguments[i];
        }
        args = _args;
    } else if (typeof args != "object") {
        throw new Error("Invalid argument.");
    }

    dialog = new dijit.Dialog({title: args.title || 'Confirm'});

    events = [];
    handler = function (cb) {
        dialog.hide();
        dojo.forEach(events, dojo.disconnect);
        if (cb) {
            cb();
        }
        dialog.destroyRecursive();
    };

    btn_div = dojo.create('div', {style: 'text-align: right; width: 100%;'});

    btn = new dijit.form.Button({label: 'No'});
    btn_div.appendChild(btn.domNode);
    no_cb = dojo.partial(handler, args.no);
    events.push(dojo.connect(btn, 'onClick', no_cb));
    events.push(dojo.connect(dialog, 'onCancel', no_cb));

    btn = new dijit.form.Button({label: 'Yes'});
    btn_div.appendChild(btn.domNode);
    events.push(
        dojo.connect(btn, 'onClick', dojo.partial(handler, args.yes)));

    nodes = new dojo.NodeList(
                dojo.create('div', {
                    innerHTML: args.content,
                    style: 'margin-bottom: 10%;'}));
    nodes.push(btn_div);
    dialog.attr('content', nodes);
    dialog.show();
};


zc.dojo.call_server = function (args) {
    var content, k;
    var callback_error = function (error) {
        var result;
        result = dojo.fromJson(error.responseText);
        if (!('error' in result) && !('session_expired' in result)) {
            zc.dojo.system_error(args.task);
        }
        else if (result.session_expired) {
            return zc.dojo.session_expired(error);
        }
        else if (result.error) {
            zc.dojo.alert({
                title: args.task + ' failed',
                content: result.error
            });
        }
        if (args.failure) {
            args.failure(error);
        }
    };

    var callback_success = function (data) {
        var result, error, errors;
        if (dojo.isString(data)) {
            data = dojo.fromJson(data);
        }
        if (data.errors) {
            result = '';
            errors = data.errors;
            for (error in errors) {
                result += errors[error] + '<br>';
            }
            zc.dojo.alert({
                title: args.task + ' failed',
                content: result});
        }
        else if (args.success) {
            args.success(data);
        }
    };

    /* Subscribers might be listening to this event. Do not remove. */
    dojo.publish(zc.dojo.beforeContentFormSubmittedTopic, [args.form_id]);
    content = zc.dojo.get_recordlist_data(args);
    if (!args.content) {
        args.content = {};
    }
    for (k in content) {
        args.content[k] = content[k];
    }
    if (!args.form_id) {
        dojo.xhrPost({
            url: args.url,
            handleAs: "json",
            content: args.content,
            load: callback_success,
            error: callback_error
        });
    }
    else {
        dojo.xhrPost({
            url: args.url,
            content: args.content,
            form: args.form_id,
            load: callback_success,
            error: callback_error
        });
    }
};

zc.dojo.submit_form = zc.dojo.call_server;

zc.dojo.widgets['zope.schema.TextLine'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    if (config.max_size !== undefined)
    {
        wconfig.maxLength = config.max_size;
        if (config.min_size) {
            wconfig.regExp = ".{" + config.min_size + "," + config.max_size + "}";
        } else {
            wconfig.regExp = ".{0," + config.max_size + "}";
        }
    } else if (config.min_size) {
        wconfig.regExp = ".{" + config.mmin_size + ",}";
    }
    return new dijit.form.ValidationTextBox(wconfig, node).domNode;
};

function update(a, b) {
    for (var k in b) {
        if (b.hasOwnProperty(k)) {
            a[k] = b[k];
        }
    }
}

zc.dojo.widgets['zope.schema.Password'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.type = "password";
    if (config.max_size !== undefined9)
    {
        wconfig.maxLength = config.max_size;
        if (config.min_size) {
            wconfig.regExp = ".{" + config.min_size + "," + config.max_size + "}";
        } else {
            wconfig.regExp = ".{0," + config.max_size + "}";
        }
    } else if (config.min_size) {
        wconfig.regExp = ".{" + config.mmin_size + ",}";
    }
    return new dijit.form.ValidationTextBox(wconfig, node).domNode;
};

zc.dojo.widgets['zope.schema.Text'] = function (config, node, order, readOnly) {
    var wconfig = zc.dojo.parse_config(config, order);
    wconfig.style = 'width:auto';
    if (config.display_options) {
        update(wconfig, config.display_options);
    }
    return new dijit.form.SimpleTextarea(wconfig, node).domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.RichText'] =
        function (config, node, order, readOnly) {

    var wconfig = zc.dojo.parse_config(config, order);
    var total_editor = dojo.create('div', {}, node);
    var editor_for_form = new dijit.form.TextBox({
        type: 'hidden',
        name: wconfig.name,
        value: wconfig.value || ''
    });
    // iframes = :[
    if (!wconfig.style) {
        wconfig.style = '';
    }
    if (!wconfig.width) {
        wconfig.width = '400px';
    }
    if (!wconfig.height) {
        wconfig.height = '200px';
    }

    if (config.display_options) {
        update(wconfig, config.display_options);
    }

    wconfig.height = '100%';

    if (readOnly) {
        wconfig.readOnly = true;
    }
    var editor = new dijit.Editor(wconfig);
    total_editor.appendChild(editor_for_form.domNode);
    total_editor.appendChild(editor.domNode);
    editor.value = editor_for_form.getValue();
    dojo.connect(editor, 'onBlur', function () {
        editor_for_form.setValue(editor.getValue());
    });
    return total_editor;
};

zc.dojo.widgets['zc.ajaxform.widgets.Hidden'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.type = 'hidden';
    return new dijit.form.TextBox(wconfig, node).domNode;
};

zc.dojo.parse_number_config = function (config, order) {
    var wconfig, constraints;
    wconfig = zc.dojo.parse_config(config, order);
    constraints = {};
    if (config.field_min !== undefined) {
        constraints.min = config.field_min;
    }
    if (config.field_max !== undefined) {
        constraints.max = config.field_max;
    }
    wconfig.constraints = constraints;
    return wconfig;
};

zc.dojo.widgets['zope.schema.Int'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_number_config(config, order);
    wconfig.constraints.places = 0;
    return new dijit.form.NumberTextBox(wconfig, node).domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.NumberSpinner'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_number_config(config, order);
    return new dijit.form.NumberSpinner(wconfig, node).domNode;
};

zc.dojo.widgets['zope.schema.Decimal'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_number_config(config, order);
    return new dijit.form.NumberTextBox(wconfig, node).domNode;
};

zc.dojo.widgets['zope.schema.Bool'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.checked = config.value;
    return new dijit.form.CheckBox(wconfig, node).domNode;

};

zc.dojo.widgets['zc.ajaxform.widgets.BasicDisplay'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.readOnly = true;
    return new dijit.form.TextBox(wconfig, node).domNode;

};

zc.dojo.widgets['zc.ajaxform.widgets.RichTextDisplay'] = function (config, node, order) {
    var iframe = dojo.create('iframe', {'frameborder': 1}, node);
    iframe.postStartup = function (node) {
        var doc = this.contentDocument;
        doc.open();
        doc.write(config.value);
        doc.close();
    };
    return iframe;
};


var _choiceConfig = function (config, node, order) {
    var wconfig, values, index;
    wconfig = zc.dojo.parse_config(config, order);
    var store_data = {
        identifier: 'value',
        label: 'label'
    };
    var items = [];
    values = config.values;
    for (index in values) {
        items.push({
            label: values[index][1],
            value: values[index][0]
        });
    }
    store_data.items = items;
    var select_store = new dojo.data.ItemFileReadStore({
        data: store_data
    });
    wconfig.store = select_store;
    wconfig.searchAttr = "label";
    return wconfig;
};


var makeChoice = function (config, node, order) {
    var wconfig = _choiceConfig(config, node, order);
    return new dijit.form.FilteringSelect(wconfig, node).domNode;
};

zc.dojo.widgets['zope.schema.Choice'] = makeChoice;


var makeComboBox = function (config, node, order) {
    var wconfig = _choiceConfig(config, node, order);
    return new dijit.form.ComboBox(wconfig, node).domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.ComboBox'] = makeComboBox;

function build_layout(record) {
    var rc_wid, new_name;
    var record_layout = [];

    var formatter = function (v) {
        if (v) {
            var data = dojo.fromJson(v);
            if (data.thumbnail_tag != null) {
                return unescape(data.thumbnail_tag);
            }
            else if (data.thumbnail_url != null) {
                return '<img src="' + unescape(data.thumbnail_url) + '" />';
            }
            else if (data.filename != null) {
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
    for (rc_wid in record.widgets) {
        rc_wid = dojo.clone(record.widgets[rc_wid]);
        new_name = record.name + '.' + rc_wid.name;
        rc_wid.name = new_name;
        rc_wid.id = new_name;
        var column_label = rc_wid.fieldLabel;
        var column = {
            name: column_label,
            field: rc_wid.name,
            width: 'auto',
            widget_constructor: rc_wid.widget_constructor,
            rc_wid: rc_wid,
            draggable: false,
            cellStyles: 'vertical-align: top;'
        };
        if (rc_wid.type == "file") {
            column.formatter = formatter;
        }
        record_layout.push(column);
    }
    record_layout.push({
        name: '',
        field: '',
        width: '20px',
        noresize: true,
        cellStyles: 'text-align: right;',
        value: '<div>||</div>'
    });
    return record_layout;
}

function build_record(record, pnode, suffix, record_value) {
    var rc_wid, indexed_name, k;
    var record_json = '"name": "' + suffix + '", ';
    for (rc_wid in record.widgets) {
        rc_wid = dojo.clone(record.widgets[rc_wid]);
        indexed_name = rc_wid.name;
        rc_wid.name = record.name + '.' + indexed_name;
        rc_wid.id = record.name + '.' + indexed_name;
        if (record_value) {
            rc_wid.value = escape(record_value[indexed_name] || '');
        }
        record_json += '"' + rc_wid.name + '": "' + rc_wid.value + '",';
    }
    var rec = dojo.fromJson('{' + record_json + '}');
    for (k in rec) {
        rec[k] = unescape(rec[k]);
    }
    return rec;
}

function build_record_form(widget_name, grid, index_map) {
    var layout = grid.structure[0].cells;
    var edit_dlg = new dijit.Dialog({
        title: 'Add/Modify Record',
        style: 'width: auto;',
        doLayout: true
    });
    var rec_form = new dijit.form.Form({
        method: 'POST',
        style: 'max-height: 500px; overflow: auto;',
        encType: 'multipart/form-data'
    }, dojo.create('div', null, edit_dlg.domNode));
    new dijit.form.TextBox({
        name: 'record_id',
        type: 'hidden'
    }, dojo.create('div', null, rec_form.domNode));
    edit_dlg.form_widgets = [];
    dojo.forEach(layout, function (fld) {
        if (fld.rc_wid) {
            var rc_wid = dojo.clone(fld.rc_wid);
            var order = index_map[rc_wid.name];
            rc_wid.tabIndex = order;
            var widget_div = dojo.create(
                'div', {'class': 'widget', style: 'margin: 5px;'},
                rec_form.domNode);
            var label = dojo.create('label', {
                innerHTML:  rc_wid.fieldLabel + ': '
            }, widget_div);
            if (rc_wid.required) {
                var span = dojo.create(
                    'span', {innerHTML: ' (required)'}, label);
                dojo.addClass(span, 'status-marker');
            }
            dojo.create('br', null, widget_div);
            var wid = zc.dojo.widgets[rc_wid.widget_constructor](
                rc_wid,
                dojo.create('div', {style: 'height: auto;'}, widget_div),
                order);
            edit_dlg.form_widgets.push(wid);
        }
    });
    var buttons_cp = new dijit.layout.ContentPane(
        {}, dojo.create('div', null, rec_form.domNode));
    var buttons_div = dojo.create('div', null, buttons_cp.domNode);

    new dijit.form.Button({
        label: 'Save',
        id: widget_name + '.dojo.save.btn',
        tabIndex: index_map[widget_name + '.dojo.save'],
        onClick: function (e) {
            if (!rec_form.validate()) {
                return;
            }
            dojo.publish(zc.dojo.beforeRecordFormSubmittedTopic, [rec_form.id]);
            var record_data = dojo.formToObject(rec_form.domNode);
            if (! record_data.record_id) {
                var row = {name: '.' + grid.rowCount + 1};
                dojo.forEach(grid.structure[0].cells, function (fld) {
                    if (fld.rc_wid) {
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
                                grid.store.setValue(item, fld.field, record_data[fld.field]);
                                grid.store.save();
                            }
                        });
                    }
                });
            }
            edit_dlg.hide();
        }
    }, dojo.create('div', null, buttons_div));
    new dijit.form.Button({
        label: 'Cancel',
        id: widget_name + '.dojo.cancel.btn',
        tabIndex: index_map[widget_name + '.dojo.cancel'],
        onClick: function (evt) {
            edit_dlg.hide();

        }
    }, dojo.create('div', null, buttons_div));

    edit_dlg.attr('content', rec_form);
    edit_dlg.startup();
    edit_dlg.editForm = rec_form;
    dojo.forEach(edit_dlg.form_widgets, function (w) {
        if (w.postStartup) {
            w.postStartup(edit_dlg);
        }
    });
    return edit_dlg;
}

function edit_record(widget_name, grid, row_value, index_map) {
    grid.select.clearDrugDivs();
    if (!grid.edit_dlg) {
        grid.edit_dlg = build_record_form(widget_name, grid, index_map);
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
        }
    });

    dojo.publish(
        zc.dojo.dialogFormUpdateTopic,
        [grid.edit_dlg.editForm.id, form_values]);
    grid.edit_dlg.show();
}

zc.dojo.widgets['zope.schema.List'] = function (config, pnode, order, widgets, index_map) {
    var record, records;
    var node = new dijit.layout.BorderContainer({
            design: "headline",
            gutters: "false"
        }, pnode);
    var rc = config.record_schema;
    rc.name = config.name;
    var num = 0;
    var item_list = [];
    records = config.value;
    for (record in records) {
        record = records[record];
        item_list.push(build_record(rc, node, '.' + String(num), record));
        num += 1;
    }
    var records_data = {
        "items": item_list,
        "identifier": "name",
        "label": "name"
    };
    var records_jsonStore = new dojo.data.ItemFileWriteStore({data: records_data});
    var record_fields = build_layout(rc);
    var layout = [{
        cells: record_fields
    }];

    var grid_container = new dijit.layout.ContentPane({
        autoWidth: true,
        autoHeight: true,
        doLayout: true
    }, dojo.create('div', null, node.domNode));

    var grid = new dojox.grid.EnhancedGrid({
        query: { name: '*' },
        store: records_jsonStore,
        structure: layout,
        escapeHTMLInData: false,
        elastic: true,
        rowSelector: '20px',
        autoHeight: true,
        plugins: {
            nestedSorting: true,
            dnd: true
        }
    });
    grid_container.attr('content', grid);
    // To limit DnD activity to the DnD Handle.
    grid.select.exceptColumnsTo = record_fields.length - 2;
    grid.select.getExceptionalColOffsetWidth = dojo.hitch(grid.select, function () {
        // We override the method in dojox.grid.enhanced.dnd._DndMovingManager
        // because we don't use the IndirectSelection plugin, but still want DnD.
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
    if (!rc.readonly) {
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
            edit_record(config.name, grid, grid.selection.getSelected()[0], index_map);
        });
    }

    if (!rc.readonly) {
        new dijit.form.Button({
            label: 'New',
            id: config.name + '.dojo.new.btn',
            tabIndex: index_map[config.name + '.dojo.new'],
            onClick: function (evt) {
                if (!grid.edit_dlg) {
                    grid.edit_dlg = build_record_form(config.name, grid,
                                                      index_map);
                }
                grid.edit_dlg.reset();
                dojo.publish(zc.dojo.dialogFormResetTopic,
                             [grid.edit_dlg.editForm.id]);
                grid.select.cancelDND();
                grid.edit_dlg.show();
            }
        }, dojo.create('div', null, node.domNode));
        new dijit.form.Button({
            label: 'Edit',
            id: config.name + '.dojo.edit.btn',
            tabIndex: index_map[config.name + '.dojo.edit'],
            onClick: function (evt) {
                var row_values = grid.selection.getSelected();
                if (row_values.length != 1) {
                    zc.dojo.alert({
                        title: 'Error!',
                        content: 'Please select a single row to Edit.'
                    });
                    return;
                }
                edit_record(config.name, grid, row_values[0], index_map);
            }
        }, dojo.create('div', null, node.domNode));
        new dijit.form.Button({
            label: 'Delete',
            id: config.name + '.dojo.delete.btn',
            tabIndex: index_map[config.name + '.dojo.delete'],
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
        }, dojo.create('div', null, node.domNode));
    }

    pnode.postStartup = function (node) {
        grid.startup();
    };
    return pnode;
};

zc.dojo.build_form = function (config, pnode, tabIndexOffset)
{
    var action, actions, action_index;
    if (!tabIndexOffset) {
        tabIndexOffset = 0;
    }
    var form = dojo.create('form', {
        id: config.definition.prefix,
        style: 'position:absolute;'
    }, pnode);
    dojo.addClass(form, 'zcForm');
    var node = new dijit.layout.BorderContainer({
        design: "headline",
        gutters: "false",
        liveSplitters: true,
        style: "height:100%; width:100%;"
    }, form);
    var left_pane = false;
    var right_pane = new dijit.layout.ContentPane({
        region: 'center',
        splitter: true
    });
    node.addChild(right_pane);
    var bottom_pane = new dijit.layout.ContentPane({
        region: 'bottom'
    });
    node.addChild(bottom_pane);
    var widgets = [];
    var index_map = zc.dojo.tab_index_map(config.definition);
    for (var i in config.definition.widgets)
    {
        var cp = new dijit.layout.ContentPane({}, dojo.create('div'));
        dojo.addClass(cp.domNode, 'widget');
        var widget = config.definition.widgets[i];
        if (!(left_pane) && (!right_pane)) {
            node.addChild(cp);
        }
        else if (config.definition.left_fields[widget.name]) {
            if (!left_pane) {
                left_pane = new dijit.layout.ContentPane({
                    region: 'left',
                    style: 'width: 60%',
                    splitter: true
                });
                right_pane.style.width = '40%';
                node.addChild(left_pane);
            }
            left_pane.domNode.appendChild(cp.domNode);
        }
        else {
            right_pane.domNode.appendChild(cp.domNode);
        }

        if (widget.widget_constructor !== 'zc.ajaxform.widgets.Hidden') {
            var label = dojo.create(
                'label', {innerHTML: widget.fieldLabel}, cp.domNode);
            if (widget.required) {
                var span = dojo.create(
                    'span', {innerHTML: ' (required)'}, label);
                dojo.addClass(span, 'status-marker');
            }
            dojo.create('br', null, cp.domNode);
        }
        var wid = zc.dojo.widgets[widget.widget_constructor](
            widget,
            dojo.create('div'),
            index_map[widget.name] + tabIndexOffset,
            widgets,
            index_map
        );
        cp.domNode.appendChild(wid);
        widgets.push(wid);
    }

    node.fit = function () {
        var margin = 17;
        var getHeight = function (node) {
            return node.scrollHeight;
        };
        var heights = dojo.map(
            node.getChildren(),
            function (child) { return getHeight(child.domNode); }
        );
        var max = function (xs) {
            var m = null;
            var x;
            for (var i in xs) {
                x = xs[i];
                if (x > m) {
                    m = x;
                }
            }
            return m;
        };
        var h = max(heights) + getHeight(bottom_pane.domNode) + margin;
        node.domNode.style.height = h + 'px';
    };

    var fireSubmitEvent = function () {
        var event = document.createEvent('Event');
        event.initEvent('beforeSubmit', true, true);
        document.dispatchEvent(event);
    };

    if (bottom_pane) {
        if (config.definition.actions) {
            actions = config.definition.actions;
            for (action_index in actions) {
                action = actions[action_index];
                var button = new dijit.form.Button({
                    label: action.label,
                    id: action.name,
                    onClick: fireSubmitEvent,
                    type: 'button',
                    tabIndex: index_map[action.name] + tabIndexOffset
                });
                bottom_pane.domNode.appendChild(button.domNode);
             }
        }
    }
    dojo.forEach(widgets, function (widget, idx) {
        if (widget.postStartup) {
            widget.postStartup(node);
        }
    });
    return node;
};

/* Return a mapping from name to tab-index for all widgets in the form. */
zc.dojo.tab_index_map = function (definition) {
    var indices = {};
    var left = definition.left_fields;
    var right = [];
    var index = 0;
    var widget, k, i;
    var list_widgets = [];
    for (k in definition.widgets) {
        widget = definition.widgets[k];
        if (left[widget.name]) {
            indices[widget.name] = index;
            index += 1;
            if (widget.widget_constructor == 'zope.schema.List') {
                /* for the New, Edit, and Delete buttons */
                dojo.forEach(['new', 'edit', 'delete'], function (item) {
                    indices[widget.name + '.dojo.' + item] = index;
                    index += 1;
                });
                for (inner_k in widget.record_schema.widgets) {
                    if (widget.record_schema.widgets.hasOwnProperty(inner_k)) {
                        var list_widget = widget.record_schema.widgets[inner_k];
                        list_widgets.push(widget.name + '.' + list_widget.name);
                    }
                }
                dojo.forEach(['save', 'cancel'], function (item) {
                    list_widgets.push(widget.name + '.dojo.' + item);
                });
            }
        } else {
            right.push(widget);
        }
    }
    for (i in right) {
        widget = right[i];
        indices[widget.name] = index;
        index += 1;
    }
    for (k in definition.actions) {
        widget = definition.actions[k];
        indices[widget.name] = index;
        index += 1;
    }
    /* Handle widgets for list type if any*/
    dojo.forEach(list_widgets, function (item, idx, arr) {
        indices[item] = index;
        index += 1;
    });
    return indices;
};

zc.dojo.session_expired = function () {
   zc.dojo.alert({
       title: "Session Expired",
       content: "You will need to log-in again." });
};

zc.dojo.system_error = function (task) {
    zc.dojo.alert({
        title: "Failed",
        content: task + " failed for an unknown reason"
    });
};

zc.dojo.parse_config = function (config, order) {
    var readonly;
    readonly = config.readonly;
    if (!readonly) { readonly = false; }
    var wconfig = {
        required: config.required,
        id: config.name,
        name: config.name,
        promptMessage: config.fieldHint,
        tabIndex: order,
        value: config.value,
        readonly: readonly,
        left: config.left
    };
    return wconfig;
};
