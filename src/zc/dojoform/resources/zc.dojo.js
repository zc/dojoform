/*global dijit, dojo, dojox, zc, escape, unescape */
dojo.provide('zc.dojo');
dojo.require('zc.RangeWidget');
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
dojo.require('dojo.date.stamp');
dojo.require("dojox.grid.cells.dijit");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.EnhancedGrid");
dojo.require("dojox.grid.enhanced.plugins.DnD");
dojo.require("dojox.grid.enhanced.plugins.Menu");
dojo.require("dojox.grid.enhanced.plugins.NestedSorting");
dojo.require("dojox.grid.enhanced.plugins.IndirectSelection");


zc.dojo.widgets = {};

zc.dojo.beforeContentFormSubmittedTopic =
    "ZC_DOJO_BEFORE_CONTENT_FORM_SUBMITTED";
zc.dojo.beforeRecordFormSubmittedTopic = "ZC_DOJO_BEFORE_RECORD_FORM_SUBMITTED";
zc.dojo.dialogFormResetTopic = "ZC_DOJO_DIALOG_FORM_RESET";
zc.dojo.dialogFormUpdateTopic = "ZC_DOJO_DIALOG_FORM_UPDATE";

zc.dojo.flags = {};

zc.dojo.flag_startup = function () {
    for (var key in zc.dojo.flags) {
        if (zc.dojo.flags.hasOwnProperty(key)) {
            var flag_wid = dijit.byId(key);
            var flagged_cps = zc.dojo.flags[key];
            var state = flag_wid.checked;
            dojo.forEach(flagged_cps, function(cp) {
                dojo.style(cp.domNode, 'display', state ? '': 'none');
            });
        }
    }
};

zc.dojo.get_recordlist_data = function (args) {
    var content, rec;
    if (args.form_id) {
        content = {};
        dojo.forEach(dojo.query('div.dojoxGrid', args.form_id), function (g) {
            var form_grid = dijit.byId(g.id);
            var i, k;
            for (i=0; i<form_grid.rowCount; i++) {
                rec = form_grid.getItem(i);
                for (k in rec) {
                    if (rec.hasOwnProperty(k)) {
                        content[k + '.' + i] = form_grid.store.getValue(rec, k);
                    }
                }
            }
        });
        return content;
    }
    return null;
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
        for (var i=0; i<arguments.length; i++) {
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
            style: 'text-align: left; margin-bottom: 15%;',
            innerHTML: args.content
        });

    nodes = new dojo.NodeList(el);
    el = dojo.create('div', {style: 'text-align: right;'});
    dojo.addClass(el, 'dijitDialogPaneActionBar');
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
        for (var i=0; i<arguments.length; i++) {
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

    btn_div = dojo.create('div', {style: 'text-align: right;'});
    dojo.addClass(btn_div, 'dijitDialogPaneActionBar');
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
        if (error.responseText) {
            result = dojo.fromJson(error.responseText);
        }

        if (result) {
            if (!('error' in result) && !('session_expired' in result)) {
                zc.dojo.system_error(args.task);
            }
            else if (result.session_expired) {
                zc.dojo.session_expired(error);
                return;
            }
            else if (result.error) {
                zc.dojo.alert({
                    title: args.task + ' failed',
                    content: result.error
                });
            }
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
                if (errors.hasOwnProperty(error)) {
                    result += errors[error] + '<br>';
                }
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
        if (content.hasOwnProperty(k)) {
            args.content[k] = content[k];
        }
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
            wconfig.regExp =
                ".{" + config.min_size + "," + config.max_size + "}";
        } else {
            wconfig.regExp = ".{0," + config.max_size + "}";
        }
    } else if (config.min_size) {
        wconfig.regExp = ".{" + config.mmin_size + ",}";
    }
    return new dijit.form.ValidationTextBox(wconfig, node).domNode;
};

zc.dojo._update = function(a, b) {
    for (var k in b) {
        if (b.hasOwnProperty(k)) {
            a[k] = b[k];
        }
    }
};

zc.dojo.widgets['zope.schema.Password'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.type = "password";
    if (config.max_size !== undefined)
    {
        wconfig.maxLength = config.max_size;
        if (config.min_size) {
            wconfig.regExp =
                ".{" + config.min_size + "," + config.max_size + "}";
        } else {
            wconfig.regExp = ".{0," + config.max_size + "}";
        }
    } else if (config.min_size) {
        wconfig.regExp = ".{" + config.mmin_size + ",}";
    }
    return new dijit.form.ValidationTextBox(wconfig, node).domNode;
};

zc.dojo.widgets['zope.schema.Text'] = function (
    config, node, order, readOnly) {
    var wconfig = zc.dojo.parse_config(config, order);
    wconfig.style = 'width:auto';
    if (config.display_options) {
        zc.dojo._update(wconfig, config.display_options);
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
        zc.dojo._update(wconfig, config.display_options);
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

zc.dojo.widgets['zc.ajaxform.widgets.DateRange'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_range_config(config, order);
    wconfig.start_label = 'Start';
    wconfig.end_label = 'End';
    if (wconfig.value) {
        wconfig.value = dojo.fromJson(wconfig.value);
        for (var key in wconfig.value) {
            if (wconfig.value.hasOwnProperty(key)) {
                var value = wconfig.value[key];
                wconfig.value[key] = dojo.date.stamp.fromISOString(value);
            }
        }
    }
    return new zc.RangeWidget({
        config: wconfig,
        dijit_type: dijit.form.DateTextBox,
        conversion: function (date_ob) {
            if (date_ob) {
                return dojo.date.stamp.toISOString(date_ob).split('T')[0];
            }
            else {
                return null;
            }
        }
    }, node).domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.IntRange'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_range_config(config, order);
    wconfig.start_label = 'Min';
    wconfig.end_label = 'Max';
    if (wconfig.value) {
        wconfig.value = dojo.fromJson(wconfig.value);
    }
    return new zc.RangeWidget({
        config: wconfig,
        dijit_type: dijit.form.NumberTextBox,
        conversion: function (int_ob) {
            if (!int_ob) {
                return null;
            }
            return int_ob;
        }
    }, node).domNode;
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

zc.dojo.parse_range_config = function (config, order) {
    var wconfig;
    wconfig = zc.dojo.parse_number_config(config, order);
    wconfig.start = config.start;
    wconfig.end = config.end;
    return wconfig;
};

zc.dojo.widgets['zope.schema.Int'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_number_config(config, order);
    wconfig.constraints.places = 0;
    return new dijit.form.NumberTextBox(wconfig, node).domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.NumberSpinner'] = function (
    config, node, order) {
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
    wconfig.onChange = function (state) {
        var follower_cps = zc.dojo.flags[config.id];
        dojo.forEach(follower_cps, function (cp) {
            dojo.style(cp.domNode, 'display', state ? '': 'none');
        });
    };
    return new dijit.form.CheckBox(wconfig, node).domNode;

};

zc.dojo.widgets['zc.ajaxform.widgets.BasicDisplay'] = function (
    config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.readOnly = true;
    return new dijit.form.TextBox(wconfig, node).domNode;

};

zc.dojo.widgets['zc.ajaxform.widgets.RangeDisplay'] = function (
    config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.readOnly = true;
    var domNode = dojo.create('div', {}, node);
    dojo.create('label', {
        'innerHTML': config.start_label
    }, dojo.create('div', {}, domNode));
    var startbox = new dijit.form.TextBox({
        'value': wconfig.value[config.start],
        'readOnly': true
    }, dojo.create('div', {}, domNode));
    dojo.create('label', {
        'innerHTML': config.end_label
    }, dojo.create('div', {}, domNode));
    var endbox = new dijit.form.TextBox({
        'value': wconfig.value[config.end],
        'readOnly': true
    }, dojo.create('div', {}, domNode));
    return domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.BoolDisplay'] = function (
    config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.checked = config.value;
    wconfig.onChange = function (state) {
        var follower_cps = zc.dojo.flags[config.id];
        dojo.forEach(follower_cps, function (cp) {
            dojo.style(cp.domNode, 'display', state ? '': 'none');
        });
    };
    wconfig.readOnly = true;
    return new dijit.form.CheckBox(wconfig, node).domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.RichTextDisplay'] = function (
    config, node, order) {
    var iframe = dojo.create('iframe', {'frameborder': 1}, node);
    iframe.postStartup = function (node) {
        var doc = this.contentDocument;
        doc.open();
        doc.write(config.value);
        doc.close();
    };
    return iframe;
};

zc.dojo.widgets['zope.schema.Date'] = function (
    config, node, order, readOnly) {
        var wconfig;
        wconfig = zc.dojo.parse_config(config, order);
        wconfig.value = dojo.date.stamp.fromISOString(wconfig.value);
        var widget = new dijit.form.DateTextBox(wconfig, dojo.create('div'));
        return widget.domNode;
};

zc.dojo.widgets['zope.schema.Time'] = function (
    config, node, order, readOnly) {
        var wconfig;
        wconfig = zc.dojo.parse_config(config, order);
        if (wconfig.value) {
            var ts = wconfig.value;
            if (ts[0] != 'T') {
                ts = 'T' + ts;
            }
            wconfig.value = dojo.date.stamp.fromISOString(ts);
        }
        var widget = new dijit.form.TimeTextBox(wconfig, dojo.create('div'));
        return widget.domNode;
};

zc.dojo._choiceConfig = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    var store_data = {
        identifier: 'value',
        label: 'label'
    };
    store_data.items = dojo.map(
                        config.values,
                        function (item) {
                            return {label: item[1], value: item[0]};
                        });

    var select_store = new dojo.data.ItemFileReadStore({data: store_data});
    if (wconfig.value === undefined) {
        wconfig.value = null;
    }
    wconfig.store = select_store;
    wconfig.searchAttr = "label";
    return wconfig;
};

zc.dojo.widgets['zope.schema.Choice'] = function (config, node, order) {
    var wconfig = zc.dojo._choiceConfig(config, node, order);
    return new dijit.form.FilteringSelect(wconfig, node).domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.ComboBox'] = function (
    config, node, order) {
    var wconfig = zc.dojo._choiceConfig(config, node, order);
    return new dijit.form.ComboBox(wconfig, node).domNode;
};

zc.dojo._build_layout = function (record) {
    var record_layout = [];

    var formatter = function (v) {
        if (v) {
            var data = dojo.fromJson(v);
            if (data.thumbnail_tag) {
                return unescape(data.thumbnail_tag);
            }
            else if (data.thumbnail_url) {
                return '<img src="' + unescape(data.thumbnail_url) + '" />';
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
        var column_label = widget.fieldLabel;
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
};

zc.dojo._build_record = function (record, pnode, suffix, record_value) {
    var k, rec;
    var record_json = '"name": "' + suffix + '", ';
    dojo.forEach(record.widgets, function (rc_wid) {
        var indexed_name;
        rc_wid = dojo.clone(rc_wid);
        indexed_name = rc_wid.name;
        rc_wid.name = record.name + '.' + indexed_name;
        rc_wid.id = record.name + '.' + indexed_name;
        if (record_value) {
            var val = record_value[indexed_name];
            if (val === false) { return val;}
            rc_wid.value = escape(val || '');
        }
        record_json += '"' + rc_wid.name + '": "' + rc_wid.value + '",';
    });
    rec = dojo.fromJson('{' + record_json + '}');
    for (k in rec) {
        if (rec.hasOwnProperty(k)) {
            rec[k] = unescape(rec[k]);
        }
    }
    return rec;
};

zc.dojo._build_record_form = function (widget_name, grid, index_map) {
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
    var widget = new dijit.form.TextBox({
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
    var buttons_div = dojo.create('div', {style: 'text-align: right;'});
    dojo.addClass(buttons_div, 'dijitDialogPaneActionBar');

    widget = new dijit.form.Button({
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
        tabIndex: index_map[widget_name + '.dojo.cancel'],
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
};

zc.dojo._edit_record = function (widget_name, grid, row_value, index_map) {
    grid.select.clearDrugDivs();
    if (!grid.edit_dlg) {
        grid.edit_dlg = zc.dojo._build_record_form(
            widget_name, grid, index_map);
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
};

zc.dojo.widgets['zope.schema.Object'] = function (
    config, pnode, order, widgets, index_map) {
    var node = new dijit.layout.BorderContainer({
        design: "headline", gutters: "false"
    });

    pnode.appendChild(node.domNode);

    var sub_widgets = new dojo.NodeList();

    dojo.forEach(config.schema.widgets, function (widget) {
            var cp = new dijit.layout.ContentPane({}, dojo.create('div'));
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
            dojo.addClass(cp.domNode, 'widget');
            var wid = zc.dojo.widgets[widget.widget_constructor](
                widget,
                cp.domNode,
                index_map[widget.name],
                widgets,
                index_map
            );
            sub_widgets.push(dijit.byId(widget.name));
            cp.domNode.appendChild(wid);
            node.domNode.appendChild(cp.domNode);
        });

    if (!config.required) {
        var checkbox = new dijit.form.CheckBox({});
        var label = dojo.byId(config.name + '.label');
        label.parentNode.insertBefore(checkbox.domNode, label);

        dojo.style(node.domNode, 'opacity', '0');
        dojo.connect(checkbox, 'onClick', function () {
            sub_widgets.forEach(function (widget) {
                widget.disabled = !checkbox.checked;
            });
            /* jslint doesn't complain about this ::evil laugh:: */
            (checkbox.checked ? dojo.fadeIn : dojo.fadeOut)(
                                                {node: node.domNode}).play();

        });
        checkbox.onClick();
    }


    return pnode;

};

zc.dojo.widgets['zope.schema.List'] = function (
    config, pnode, order, widgets, index_map) {

    var node = new dijit.layout.BorderContainer({
            design: "headline",
            gutters: "false"
        }, pnode);
    var rc = config.record_schema;
    rc.name = config.name;
    var num = 0;
    var item_list = [];

    dojo.forEach(config.value, function (record) {
        item_list.push(zc.dojo._build_record(rc, node, '.' + num, record));
        num += 1;
    });

    var records_data = {
        "items": item_list,
        "identifier": "name",
        "label": "name"
    };
    var records_jsonStore = new dojo.data.ItemFileWriteStore(
        {data: records_data});
    var record_fields = zc.dojo._build_layout(rc);
    var layout = [{
        cells: record_fields
    }];

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
    }, dojo.create('div', {}, node.domNode));
    // To limit DnD activity to the DnD Handle.
    grid.select.exceptColumnsTo = record_fields.length - 2;
    grid.select.getExceptionalColOffsetWidth = dojo.hitch(
        grid.select, function () {
        // We override the method in dojox.grid.enhanced.dnd._DndMovingManager
        // because we don't use the IndirectSelection plugin, but
        // still want DnD.
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
            zc.dojo._edit_record(
                config.name, grid, grid.selection.getSelected()[0], index_map);
        });
    }

    if (!rc.readonly) {
        var widget = new dijit.form.Button({
            label: 'New',
            id: config.name + '.dojo.new.btn',
            tabIndex: index_map[config.name + '.dojo.new'],
            onClick: function (evt) {
                if (!grid.edit_dlg) {
                    grid.edit_dlg = zc.dojo._build_record_form(
                        config.name, grid, index_map);
                }
                grid.edit_dlg.reset();
                dojo.publish(zc.dojo.dialogFormResetTopic,
                             [grid.edit_dlg.editForm.id]);
                grid.select.cancelDND();
                grid.edit_dlg.show();
            }
        }, dojo.create('div', null, node.domNode));
        widget = new dijit.form.Button({
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
                zc.dojo._edit_record(
                    config.name, grid, row_values[0], index_map);
            }
        }, dojo.create('div', null, node.domNode));
        widget = new dijit.form.Button({
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

zc.dojo.build_form = function (config, pnode, tabIndexOffset, startup)
{
    startup = startup === undefined ? true: startup;
    if (!config.definition.left_fields) {
        config.definition.left_fields = [];
    }
    if (!tabIndexOffset) {
        tabIndexOffset = 0;
    }
    var form = new dijit.form.Form({id: config.definition.prefix}, pnode);
    form.startup = function () {
        // First, restore the original startup
        this.startup = dijit.form.Form.prototype.startup;
        this.startup();
        this.getChildren().forEach(function (node) {node.startup();});
    };
    dojo.addClass(form, 'zcForm');
    var node = new dijit.layout.BorderContainer({
        design: "headline",
        gutters: "false",
        liveSplitters: true,
        style: "height:100%; width:100%;"
    });
    form.domNode.appendChild(node.domNode);

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
    var left_pane;
    if (config.definition.left_fields) {
        left_pane = new dijit.layout.ContentPane({
                    region: 'left',
                    style: 'width: 60%',
                    splitter: true
        });
        right_pane.style.width = '40%';
        node.addChild(left_pane);
    }

    dojo.forEach(config.definition.widgets, function (widget) {
        var prefix;
        if (config.definition.prefix) {
            prefix = config.definition.prefix + '.';
            if (!widget.id) {
                widget.id = widget.name;
            }

            if (widget.id.substr(0, prefix.length) != prefix) {
                widget.id = prefix + widget.id;
            }
        }
        var cp = new dijit.layout.ContentPane({}, dojo.create('div'));
        var bool_flag = widget.bool_flag;
        if (bool_flag) {
            if (config.definition.prefix) {
                bool_flag = prefix + bool_flag;
            }
            if (zc.dojo.flags[bool_flag] === undefined) {
                zc.dojo.flags[bool_flag] = [];
            }
            zc.dojo.flags[bool_flag].push(cp);
        }
        dojo.addClass(cp.domNode, 'widget');
        if (!(left_pane || right_pane)) {
            node.addChild(cp);
        }
        else if (config.definition.left_fields[widget.name]) {
            left_pane.domNode.appendChild(cp.domNode);
        }
        else {
            right_pane.domNode.appendChild(cp.domNode);
        }

        if (widget.widget_constructor !== 'zc.ajaxform.widgets.Hidden') {
            var label = dojo.create(
                'label', {id: widget.name + '.label',
                innerHTML: widget.fieldLabel},
                cp.domNode);
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
    });

    // XXX The role of this function is unclear.  We need to document what's
    // going on here.
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
            xs.forEach(function (x) {
                if (x > m) {
                    m = x;
                }
            });
            return m;
        };
        var h = max(heights) + getHeight(bottom_pane.domNode) + margin;
        node.domNode.style.height = h + 'px';
    };

    // XXX The usage of this event is unclear.  We need to document what's
    // going on here.
    var fireSubmitEvent = function () {
        var event = dojo.doc.createEvent('Event');
        event.initEvent('beforeSubmit', true, true);
        dojo.doc.dispatchEvent(event);
    };

    if (bottom_pane) {
        dojo.forEach(config.definition.actions, function (action) {
            var button = new dijit.form.Button({
                    label: action.label,
                    id: action.name,
                    onClick: action.onClick || fireSubmitEvent,
                    type: 'button',
                    tabIndex: index_map[action.name] + tabIndexOffset
                });
            bottom_pane.domNode.appendChild(button.domNode);
        });
    }
    if (startup) {
        node.startup();
        dojo.forEach(widgets, function (widget) {
            if (widget.postStartup) {
                widget.postStartup(node);
            }
        });
        zc.dojo.flag_startup();
    }
    return node;
};

/* Return a mapping from name to tab-index for all widgets in the form. */
zc.dojo.tab_index_map = function (definition) {
    var indices = {};
    var left = definition.left_fields;
    var right = [];
    var index = 0;
    var list_widgets = [];

    dojo.forEach(definition.widgets, function (widget) {
        if (left[widget.name]) {
            indices[widget.name] = index++;
            if (widget.widget_constructor == 'zope.schema.List') {
                /* for the New, Edit, and Delete buttons */
                dojo.forEach(['new', 'edit', 'delete'], function (item) {
                    indices[widget.name + '.dojo.' + item] = index++;
                });
                for (var inner_k in widget.record_schema.widgets) {
                    if (widget.record_schema.widgets.hasOwnProperty(inner_k)) {
                        var list_widget = widget.record_schema.widgets[inner_k];
                        list_widgets.push(widget.name + '.' + list_widget.name);
                    }
                }
                dojo.forEach(['save', 'cancel'], function (item) {
                    list_widgets.push(widget.name + '.dojo.' + item);
                });
            }
            else if (widget.widget_constructor == 'zope.schema.Object') {
                dojo.forEach(widget.record_schema.widgets, function (widget) {
                        indices[widget.name] = index++;
                    });
            }
        } else {
            right.push(widget);
        }
    });

    var fn = function (widget) {indices[widget.name] = index++;};

    dojo.forEach(right, fn);
    dojo.forEach(definition.actions, fn);

    /* Handle widgets for list type if any*/
    dojo.forEach(list_widgets, function (item) {
        indices[item] = index++;
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
    if (!readonly) { readonly = false;}
    var wconfig = {
        required: config.required,
        id: config.id,
        name: config.name,
        promptMessage: config.fieldHint,
        tabIndex: order,
        value: config.value,
        readonly: readonly,
        left: config.left
    };
    return wconfig;
};
