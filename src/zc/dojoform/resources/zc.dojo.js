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

zc.dojo.recordFormSubmittedTopic = "ZC_DOJO_RECORD_FORM_SUBMITTED";

zc.dojo.get_recordlist_data = function (args) {
    if (args.form_id) {
        content = {}
        dojo.forEach(dojo.query('div.dojoxGrid', args.form_id), function (g) {
            var form_grid = dijit.byId(g.id);
            var idx = 0;
            while (idx < form_grid.rowCount) {
                rec = form_grid.getItem(idx);
                for (k in rec) {
                    content[k + '.' + idx] = rec[k];
                }
                idx++;
            }
        });
        return content;
    }
}

zc.dojo.call_server = function (args) {
    var callback_error = function (error) {
        result = dojo.fromJson(error.responseText);
        if (!('error' in result) && !('session_expired' in result)){
            zc.dojo.system_error(args.task);
        }
        else if (result.session_expired) {
            return zc.dojo.session_expired(error);
        }
        else if (result.error) {
            var this_dialog = new dijit.Dialog({
                title: args.task+' failed',
                content: result.error });
            this_dialog.show();
        }
        if (args.failure) {
            args.failure(error);
        }
    };

    var callback_success = function (data) {
        if (dojo.isString(data)) {
            data = dojo.fromJson(data);
        }
        if (data.errors) {
            result = '';
            errors = data.errors;
            for (error in errors) {
                result += errors[error]+'<br>';
            }
            var this_dialog = new dijit.Dialog({
                title: args.task+' failed',
                content: dojo.create('div',{id: 'error_message', innerHTML: result})
            });
            this_dialog.show();
        }
        else if (args.success) {
            args.success(data);
        }
    };

    content = zc.dojo.get_recordlist_data(args);
    if (args.content == null) {
        args.content = {};
    }
    for (k in content) {
        args.content[k] = content[k];
    }
    if (args.form_id == undefined) {
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
}

zc.dojo.submit_form = zc.dojo.call_server;

zc.dojo.widgets['zope.schema.TextLine'] = function (config, node, order)
{
    wconfig = zc.dojo.parse_config(config, order);
    if (config.max_size != undefined)
    {
        wconfig.maxLength = config.max_size;
        if (config.min_size)
            wconfig.regExp = ".{"+config.min_size+","+config.max_size+"}";
        else
            wconfig.regExp = ".{0,"+config.max_size+"}";
    }
    else if (config.min_size)
        wconfig.regExp = ".{"+config.mmin_size+",}";
    return new dijit.form.ValidationTextBox(wconfig, node).domNode;
};

zc.dojo.widgets['zope.schema.Text'] = function (config, node, order, readOnly) {

    wconfig = zc.dojo.parse_config(config, order);
    var total_editor = dojo.create('div', {}, node);
    var editor_for_form = new dijit.form.TextBox({
        type: 'hidden',
        name: wconfig.name,
        value: wconfig.value
    });
    // iframes = :[
    wconfig['style'] = 'width:400px; height:200px;';
    wconfig['height'] = '100%';
    if (readOnly) {
        wconfig['readOnly'] = true;
    }
    var editor = new dijit.Editor(wconfig);
    total_editor.appendChild(editor_for_form.domNode);
    total_editor.appendChild(editor.domNode);
    editor.value = editor_for_form.getValue();
    dojo.connect(editor, 'onBlur', function() {
            editor_for_form.setValue(editor.getValue());
    });
    return total_editor;
}

zc.dojo.widgets['zc.ajaxform.widgets.Hidden'] = function (config, node, order) {

    wconfig = zc.dojo.parse_config(config, order);
    wconfig.type = 'hidden';
    return new dijit.form.TextBox(wconfig, node).domNode;
}

zc.dojo.parse_number_config = function(config, order) {
    wconfig = zc.dojo.parse_config(config, order);
    constraints = {};
    if (config.field_min != undefined) {
        constraints['min'] = config.field_min;
    }
    if (config.field_max != undefined) {
        constraints['max'] = config.field_max;
    }
    wconfig['constraints'] = constraints;
    return wconfig;
};

zc.dojo.widgets['zope.schema.Int'] = function (config, node, order) {

    wconfig = zc.dojo.parse_number_config(config, order);
    wconfig.constraints['places'] = 0;
    return new dijit.form.NumberTextBox(wconfig, node).domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.NumberSpinner'] = function (config, node, order) {

    wconfig = zc.dojo.parse_number_config(config, order);
    return new dijit.form.NumberSpinner(wconfig, node).domNode;
};

zc.dojo.widgets['zope.schema.Decimal'] = function (config, node, order) {

    wconfig = zc.dojo.parse_number_config(config, order);
    return new dijit.form.NumberTextBox(wconfig, node).domNode;
};

zc.dojo.widgets['zope.schema.Bool'] = function (config, node, order) {

    wconfig = zc.dojo.parse_config(config, order);
    wconfig['checked'] = config.value;
    return new dijit.form.CheckBox(wconfig, node).domNode;

};

zc.dojo.widgets['zc.ajaxform.widgets.BasicDisplay'] = function (config, node, order) {

    wconfig = zc.dojo.parse_config(config, order);
    wconfig['readOnly'] = true;
    return new dijit.form.TextBox(wconfig, node).domNode;

};

zc.dojo.widgets['zc.ajaxform.widgets.RichTextDisplay'] = function (config, node, order) {
    var iframe = dojo.create('iframe', {'frameborder': 1}, node);
    iframe.postStartup = function (node) {
        var doc = this.contentDocument;
        doc.open()
        doc.write(config['value']);
        doc.close();
    };
    return iframe;
};


var _choiceConfig = function (config, node, order) {
    wconfig = zc.dojo.parse_config(config, order);
    var store_data = {
        identifier: 'value',
        label: 'label'
    };
    var items = [];
    values = config.values;
    for (index in values){
        items.push({
            label: values[index][1],
            value: values[index][0]
        });
    }
    store_data['items'] = items;
    var select_store = new dojo.data.ItemFileReadStore({
        data: store_data
    })
    wconfig['store'] = select_store;
    wconfig['searchAttr'] = "label";
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


var build_record = function (record, pnode, suffix, record_value){

    var record_json = '"name": "' + suffix + '", ';
    for (rc_wid in record.widgets) {
        rc_wid = dojo.clone(record.widgets[rc_wid]);
        indexed_name = rc_wid.name;
        rc_wid.name = indexed_name;
        rc_wid.id = indexed_name;
        if (record_value){
            rc_wid.value = escape(record_value[rc_wid.id]);
        }
        record_json += '"' + rc_wid.name + '": "' + rc_wid.value + '",';
    }
    var rec = dojo.fromJson('{' + record_json + '}');
    for (k in rec) {
        rec[k] = unescape(rec[k]);
    }
    return rec;
};

var build_layout = function (record){

    var record_layout = [];
    for (rc_wid in record.widgets) {
        rc_wid = dojo.clone(record.widgets[rc_wid]);
        record_layout.push({
            name: rc_wid.fieldLabel,
            field: rc_wid.name,
            width: 'auto',
            widget_constructor: rc_wid.widget_constructor,
            rc_wid: rc_wid
        });
    }
    return record_layout;
};

var build_record_form = function (grid) {
    var layout = grid.structure;
    var edit_dlg = new dijit.Dialog({title: 'Add/Modify Record'});
    var rec_form = new dijit.form.Form({});
    var form_table = dojo.create('table', {
        width: '100%',
        cellspacing: '5px',
    }, rec_form.domNode);
    edit_dlg.form_widgets = [];
    for (fld in layout) {
        var rc_wid = dojo.clone(layout[fld].rc_wid);
        var tr = dojo.create('tr', null, form_table);
        var label_td = dojo.create('td', {
            innerHTML: rc_wid.fieldLabel + ': ',
            valign: 'top',
            align: 'right',
        }, tr);
        var field_td = dojo.create('td', {
            valign: 'top',
        }, tr);
        var wid = zc.dojo.widgets[rc_wid.widget_constructor](
            rc_wid, dojo.create('div', null, field_td));
        edit_dlg.form_widgets.push(wid);
    }
    var buttons_td = dojo.create(
        'td', {colspan: '2', align: 'center'},
        dojo.create('tr', null, form_table));
    var record_input = new dijit.form.TextBox({
        name: 'record_id',
        type: 'hidden'
    }, dojo.create('div', null, buttons_td));
    var save_btn = new dijit.form.Button({
        label: 'Save',
        onClick: function (e) {
            dojo.publish(zc.dojo.recordFormSubmittedTopic);
            var record_data = dojo.formToObject(rec_form.domNode);
            if (! record_data.record_id) {
                var row = {name: '.' + grid.rowCount};
                dojo.forEach(grid.structure, function (fld) {
                    row[fld.field] = record_data[fld.field];
                });
                grid.store.newItem(row);
            }
            else {
                grid.store.fetchItemByIdentity({
                    identity: record_data.record_id,
                    onItem: function (item) {
                        dojo.forEach(grid.structure, function (fld) {
                            grid.store.setValue(item, fld.field, record_data[fld.field]);
                        });
                    }
                })
            }
            edit_dlg.hide();
        }
    }, dojo.create('div', null, buttons_td));
    var cancel_btn = new dijit.form.Button({
        label: 'Cancel',
        onClick: function (evt) {
            edit_dlg.hide();
        }
    }, dojo.create('div', null, buttons_td));

    edit_dlg.attr('content', rec_form);
    edit_dlg.startup()
    edit_dlg.formNode = rec_form.domNode;
    dojo.forEach(edit_dlg.form_widgets, function (w) {
        if (w.postStartup != null) {
            w.postStartup(edit_dlg);
        }
    });
    edit_dlg.beforeShow = function() {
        dojo.forEach(edit_dlg.form_widgets, function (w) {
            if (w.updateValues != null) {
                w.updateValues();
            }
        });
    };
    return edit_dlg;
};

zc.dojo.widgets['zope.schema.List'] = function (config, pnode, order, widgets) {

    var node = new dijit.layout.BorderContainer({
            design:"headline",
            gutters:"false",
        }, pnode);
    var rc = config.record_schema;
    rc.name = config.name;
    var num = 0;
    var item_list = [];
    records = dojo.fromJson(config.value);
    for (record in records) {
        record = records[record];
        item_list.push(build_record(rc, node, '.'+String(num), record));
        num++;
    }
    var records_data = {
        "items": item_list,
        "identifier": "name",
        "label": "name"
    };
    var records_jsonStore = new dojo.data.ItemFileWriteStore({data: records_data});
    var layout = build_layout(rc);
    var grid = new dojox.grid.EnhancedGrid({
        query: { name: '*' },
        store: records_jsonStore,
        rowSelector: '20px',
        structure: layout,
        escapeHTMLInData: false,
        plugins: {
            nestedSorting: true,
            dnd: true,
            indirectSelection: {
                name: "Selection",
                width: '70px',
                styles: "text-align: center;"
            }
        }
    }, dojo.create('div', {style: 'height: 300px;'}, node.domNode));

    var new_btn = new dijit.form.Button({
        label: 'New',
        onClick: function (evt) {
            if (grid.edit_dlg == null) {
                grid.edit_dlg = build_record_form(grid);
            }
            var row_values = {record_id: '', highlight_text:'', body: ''};
            dojo.forEach(grid.edit_dlg.formNode.elements, function (ele) {
                if (row_values[ele.name] != null) {
                    ele.value = row_values[ele.name];
                }
            });
            grid.edit_dlg.beforeShow();
            grid.edit_dlg.show();
        }
    }, dojo.create('div', null, node.domNode));
    var edit_btn = new dijit.form.Button({
        label: 'Edit',
        onClick: function (evt) {
            if (grid.edit_dlg == null) {
                grid.edit_dlg = build_record_form(grid, true);
            }
            var row_values = grid.selection.getSelected()[0];
            row_values['record_id'] = row_values.name[0];
            dojo.forEach(grid.edit_dlg.formNode.elements, function (ele) {
                if (row_values[ele.name] != null) {
                    ele.value = row_values[ele.name];
                }
            });
            grid.edit_dlg.beforeShow();
            grid.edit_dlg.show();
        }
    }, dojo.create('div', null, node.domNode));
    var delete_btn = new dijit.form.Button({
        label: 'Delete',
        onClick: function (evt) {
            grid.removeSelectedRows();
        }
    }, dojo.create('div', null, node.domNode));

    pnode.postStartup = function (node) {
        grid.startup();
    };
    return pnode;
};

zc.dojo.build_form = function (config, pnode, tabIndexOffset)
{
    if (!tabIndexOffset) {
        tabIndexOffset = 0;
    }
    var form = dojo.create('form', {
        id: config.definition.prefix,
        style: 'position:absolute;'
    }, pnode);
    dojo.addClass(form, 'zcForm');
    var node = new dijit.layout.BorderContainer({
        design:"headline",
        gutters:"false",
        liveSplitters: true,
        style:"height:100%; width:100%;"
    }, form);
    var left_pane = false;
    var right_pane = new dijit.layout.ContentPane({
        region: 'center',
        style: 'width:100%',
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
        if (!(left_pane) && (!right_pane)){
            node.addChild(cp);
        }
        else if (config.definition.left_fields[widget.name]){
            if (!left_pane){
                var left_pane = new dijit.layout.ContentPane({
                    region: 'left',
                    style: 'width:60%',
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

        if (widget.widget_constructor != 'zc.ajaxform.widgets.Hidden'){
            var label = dojo.create(
                'label', {innerHTML: widget.fieldLabel}, cp.domNode);
            if (widget.required == true) {
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
            widgets
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
            };
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
        if (config.definition.actions != undefined){
            actions = config.definition.actions;
            for (action_index in actions) {
                action = actions[action_index];
                var button = new dijit.form.Button({
                    label: action.label,
                    id: action.name,
                    tabIndex: index_map[action.name] + tabIndexOffset
                }, dojo.create('div', {style: "float:left;"}));
                button.onClick = fireSubmitEvent;
                bottom_pane.domNode.appendChild(button.domNode);
             }
        }
    }
    node.startup();
    dojo.forEach(widgets, function (widget) {
        if (widget.postStartup != null) {
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
    var widget;
    for (var k in definition.widgets) {
        widget = definition.widgets[k];
        if (left[widget.name]) {
            indices[widget.name] = index;
            index += 1;
        } else {
            right.push(widget);
        }
    };
    for (var i in right) {
        widget = right[i];
        indices[widget.name] = index;
        index += 1;
    };
    for (var k in definition.actions) {
        widget = definition.actions[k];
        indices[widget.name] = index;
        index += 1;
    }
    return indices;
};

zc.dojo.session_expired = function () {
   dijit.Dialog({
       title: "Session Expired",
       content: "You will need to log-in again." }).show();
}

zc.dojo.system_error = function (task) {
    var this_dialog = new dijit.Dialog({
    title: "Failed",
    content: task+" failed for an unknown reason" })
    this_dialog.show();
}

zc.dojo.parse_config = function (config, order) {
    readonly = config.readonly;
    if (!readonly){ readonly = false; }
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
}
