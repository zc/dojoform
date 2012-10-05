/*global dijit, dojo, dojox, zc, escape, unescape */

// provide a hook for developers to selectively require widgets
if (window.zc_dojo_norequires === undefined) {
    dojo.require('dojo.date.stamp');
    dojo.require('dojo.data.ItemFileReadStore');
    dojo.require('dojo.data.ItemFileWriteStore');
    dojo.require('dijit.Dialog');
    dojo.require('dijit.Editor');
    dojo.require('dijit.form.Button');
    dojo.require('dijit.form.CheckBox');
    dojo.require('dijit.form.ComboBox');
    dojo.require('dijit.form.DateTextBox');
    dojo.require('dijit.form.Form');
    dojo.require('dijit.form.FilteringSelect');
    dojo.require('dijit.form.NumberSpinner');
    dojo.require('dijit.form.NumberTextBox');
    dojo.require('dijit.form.MultiSelect');
    dojo.require('dijit.form.SimpleTextarea');
    dojo.require('dijit.form.TextBox');
    dojo.require('dijit.form.TimeTextBox');
    dojo.require('dijit.form.ValidationTextBox');
    dojo.require('dijit.layout.BorderContainer');
    dojo.require('dijit.layout.ContentPane');
    dojo.require('dijit._Widget');
    dojo.require("dojox.grid.cells.dijit");
    dojo.require("dojox.grid.EnhancedGrid");
    dojo.require("dojox.grid.enhanced.plugins.DnD");
    dojo.require(
        "dojox.grid.enhanced.plugins.IndirectSelection");
    dojo.require("dojox.grid.enhanced.plugins.Menu");
    dojo.require("dojox.grid.enhanced.plugins.NestedSorting");
    dojo.require('zc.ckeditor');
}

dojo.provide('zc.dojo');


dojo.ready(function () {

    zc.DateTimeTextBox = function (config, node) {

        var domNode, value_node, dateNode, date_box, timeNode,
            time_box, change_value;

        domNode = dojo.create('div', {
            'style': 'padding:5px;'
        }, node);
        value_node = dojo.create('input', {
            'type': 'hidden',
            'name': config.name,
            'value': config.value
        }, domNode);

        dateNode = dojo.create('div', {}, domNode);
        dojo.create('span', {
            'innerHTML': 'Date: '
        }, dateNode);
        date_box = new dijit.form.DateTextBox({
            value: config.value,
            onChange: function () {change_value();}
        }, dojo.create('div', {}, dateNode));

        timeNode = dojo.create('div', {}, domNode);
        dojo.create('span', {
            'innerHTML': 'Time: '
        }, timeNode);
        time_box = new dojox.form.TimeSpinner({
            value: config.value,
            onChange: function () {change_value();}
        }, dojo.create('div', {}, timeNode));

        change_value = function () {
            var date_v = date_box.value,
                time_v = time_box.value,
                new_time = new Date(date_v.getFullYear(),
                                    date_v.getMonth(),
                                    date_v.getDate(),
                                    time_v.getHours(),
                                    time_v.getMinutes(),
                                    time_v.getSeconds());
            value_node.value = new_time.toString();
        };

        change_value();

        return {
            getValue: function () {
                return value_node.value;
            },
            domNode: domNode
        };
    };

});

zc.dojo.widgets = {};

zc.dojo.beforeContentFormSubmittedTopic =
    "ZC_DOJO_BEFORE_CONTENT_FORM_SUBMITTED";
zc.dojo.beforeRecordFormSubmittedTopic = "ZC_DOJO_BEFORE_RECORD_FORM_SUBMITTED";
zc.dojo.dialogFormResetTopic = "ZC_DOJO_DIALOG_FORM_RESET";
zc.dojo.dialogFormUpdateTopic = "ZC_DOJO_DIALOG_FORM_UPDATE";

zc.dojo.flags = {};

zc.dojo.flag_startup = function () {
    var key, flag_wid, flagged_cps, state;

    for (key in zc.dojo.flags) {
        if (zc.dojo.flags.hasOwnProperty(key)) {
            flag_wid = dijit.byId(key);
            flagged_cps = zc.dojo.flags[key];
            state = flag_wid.checked;
            dojo.forEach(flagged_cps, function(cp) {
                dojo.style(cp.domNode, 'display', state ? '': 'none');
            });
        }
    }
};

zc.dojo.alert = function (args) {
    // Parameters can be passed in an object or in the following order:
    //
    // title: String
    //              The text for the title bar of the dialog.
    // content: String
    //              The text for the body of the dialog.

    var button, dialog, dtor, el, nodes, i,
        _args, params;

    if (arguments.length > 1) {
        _args = {};
        params = ['title', 'content', 'onClick', 'show'];
        for (i = 0; i < arguments.length; i++) {
            _args[params[i]] = arguments[i];
        }
        args = _args;
    } else if (!dojo.isObject(args)) {
        throw new Error("Invalid argument.");
    }

    args.show = args.show || true;

    dialog = new dijit.Dialog({'title': args.title || 'Alert'});
    dtor = function () {
        var d = dialog.hide();
        if (d) {
            d.addCallback(function () {
                delete dialog._fadeOutDeferred;
                dialog.destroyRecursive();
            });
        } else {
            dialog.destroyRecursive();
        }
    };
    dojo.connect(dialog, 'onCancel', dtor);
    button = new dijit.form.Button({
        label: 'OK',
        onClick: function () {
            if (args.onClick) {
                args.onClick();
            }
            dtor();
        }
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
    if (args.show) {
        dialog.show();
    }
    return dialog;
};

zc.dojo.confirm = function (args) {
    // Parameters can be passed in an object or in the following order.
    //
    // title: String
    //              The text for the title bar of the dialog.
    // content: String
    //              The text for the body of the dialog.
    // confirm_label: String (optional)
    //              The label used for the button which calls the yes function
    // cancel_label: String (optional)
    //              The label used for the button which calls the no function
    // yes: Function (optional)
    //              The callback for when thhe user clicks the affirmative
    //              button.
    // no: Function (optional)
    //              The callback for the 'No' or dialog cancel buttons.

    var btn, btn_div, dialog, events, handler, no_cb, nodes,
        _args, params, i;

    if (arguments.length > 1) {
        _args = {};
        params = ['title', 'content', 'yes', 'no'];
        for (i=0; i<arguments.length; i++) {
            _args[params[i]] = arguments[i];
        }
        args = _args;
    } else if (!dojo.isObject(args)) {
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
    btn = new dijit.form.Button({label: args.cancel_label || 'Cancel'});
    btn_div.appendChild(btn.domNode);
    no_cb = dojo.partial(handler, args.no);
    events.push(dojo.connect(btn, 'onClick', no_cb));
    events.push(dojo.connect(dialog, 'onCancel', no_cb));

    btn = new dijit.form.Button({label: args.confirm_label || 'Confirm'});
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
    var content, k, callback_error,
        callback_success;
    callback_error = function (error) {
        var result;
        if (error.responseText) {
            result = dojo.fromJson(error.responseText);
        }

        if (result) {
            if (result.error === undefined &&
                result.session_expired === undefined) {
                zc.dojo.system_error(args.task);
            } else if (result.session_expired) {
                zc.dojo.session_expired(error);
            } else if (result.error) {
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

    callback_success = function (data) {
        var result, error, errors;
        if (dojo.isString(data)) {
            data = dojo.fromJson(data);
        }
        if (data.session_expired) {
            if (args.failure) {
                args.failure(error);
            }
            zc.dojo.session_expired(error);
        } else if (data.errors) {
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
            if (args.failure) {
                args.failure(error);
            }
        } else if (args.success) {
            args.success(data);
        }
    };

    /* Subscribers might be listening to this event. Do not remove. */
    dojo.publish(zc.dojo.beforeContentFormSubmittedTopic, [args.form_id]);
    if (!args.content) {
        args.content = {};
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
    var k;
    for (k in b) {
        if (b.hasOwnProperty(k)) {
            a[k] = b[k];
        }
    }
};

zc.dojo.widgets['zope.schema.Password'] = function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.type = "password";
    if (config.max_size !== undefined) {
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
    config, node, order, _, nostyle) {
    var wconfig = zc.dojo.parse_config(config, order);
    if (!nostyle) {
        wconfig.style = 'width:auto';
    }
    return new dijit.form.SimpleTextarea(wconfig, node).domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.RichText'] =
    function (config, node, order) {

    var wconfig = zc.dojo.parse_config(config, order),
        total_editor = dojo.create('div', {}, node),
        editor_for_form, editor;

    editor_for_form = new dijit.form.TextBox({
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

    wconfig.height = '100%';
    editor = new dijit.Editor(wconfig);
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

zc.dojo.RangeConversion = function (v) {
    if (dojo.isString(v)) {
        v = dojo.fromJson(v);
    }
    else {
        v = dojo.toJson(v);
    }
    return v;
};

zc.dojo.DateConversion = function (v) {
    if (dojo.isString(v)) {
        v = dojo.date.stamp.fromISOString(v);
    } else if (v) {
        v = dojo.date.stamp.toISOString(v).split('T')[0];
    }
    return v;
};

zc.dojo.widgets['zc.ajaxform.widgets.DateRange'] =
    function (config, node, order) {
        var wconfig;
        wconfig = zc.dojo.parse_range_config(config, order);
        wconfig.start_label = wconfig.start_label || 'Start';
        wconfig.end_label = wconfig.end_label || 'End';
        return new zc.RangeWidget(
            {
                config: wconfig,
                dijit_type: dijit.form.DateTextBox,
                convert_from: zc.dojo.DateConversion,
                convert_to: zc.dojo.DateConversion
            }, node).domNode;
};

zc.dojo.widgets['zc.ajaxform.widgets.IntRange'] =
    function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_range_config(config, order);
    wconfig.start_label = wconfig.start_label || 'Min';
    wconfig.end_label = wconfig.end_label || 'Max';
    return new zc.RangeWidget({
        config: wconfig,
        dijit_type: config.dijit_type || dijit.form.NumberSpinner
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
    wconfig.start_label = config.start_label;
    wconfig.end_label = config.end_label;
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

zc.dojo.widgets['zc.ajaxform.widgets.BasicDisplay'] =
    function (config, node, order) {
    var wconfig;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.readOnly = true;
    return new dijit.form.TextBox(wconfig, node).domNode;

};

zc.dojo.widgets['zc.ajaxform.widgets.RangeDisplay'] = function (
    config, node, order) {
    var wconfig, domNode, startbox, endbox;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.readOnly = true;
    domNode = dojo.create('div', {}, node);
    dojo.create('label', {
        'innerHTML': config.start_label
    }, dojo.create('div', {}, domNode));
    startbox = new dijit.form.TextBox({
        'value': wconfig.value[config.start],
        'readOnly': true
    }, dojo.create('div', {}, domNode));
    dojo.create('label', {
        'innerHTML': config.end_label
    }, dojo.create('div', {}, domNode));
    endbox = new dijit.form.TextBox({
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
    var iframe = dojo.create('iframe', {
        'frameborder': 1,
        'class': 'zcdojoformRichTextDisplay'
    }, node);
    iframe.postStartup = function (node) {
        var doc = this.contentDocument;
        doc.open();
        doc.write(config.value);
        doc.close();
    };
    return iframe;
};

zc.dojo.widgets['zope.schema.Date'] = function (config, node, order) {
    var wconfig, widget;
    wconfig = zc.dojo.parse_config(config, order);
    wconfig.value = dojo.date.stamp.fromISOString(wconfig.value);
    widget = new dijit.form.DateTextBox(wconfig, dojo.create('div', {}, node));
    return widget.domNode;
};

zc.dojo.widgets['zope.schema.Time'] = function (config, node, order) {
    var wconfig, ts, widget;
    wconfig = zc.dojo.parse_config(config, order);
    if (wconfig.value) {
        ts = wconfig.value;
        if (ts[0] !== 'T') {
            ts = 'T' + ts;
        }
        wconfig.value = dojo.date.stamp.fromISOString(ts);
    }
    widget = new dojox.form.TimeSpinner(wconfig, dojo.create('div', {}, node));
    return widget.domNode;
};

zc.dojo.widgets['zope.schema.Datetime'] = function (
    config, node, order, readOnly) {
    var wconfig = zc.dojo.parse_config(config, order),
        widget;
    wconfig.value = wconfig.value ? new Date(wconfig.value) : new Date();
    widget = new zc.DateTimeTextBox(wconfig, dojo.create('div', {}, node));
    return widget.domNode;
};

zc.dojo._choiceConfig = function (config, node, order) {
    var wconfig, store_data, select_store;
    wconfig = zc.dojo.parse_config(config, order);
    store_data = {
        identifier: 'value',
        label: 'label'
    };
    store_data.items = dojo.map(
                        config.values,
                        function (item) {
                            return {label: item[1], value: item[0]};
                        });

    select_store = new dojo.data.ItemFileReadStore({data: store_data});
    if (wconfig.value === undefined) {
        wconfig.value = null;
    }
    wconfig.store = select_store;
    wconfig.searchAttr = "label";
    return wconfig;
};

zc.dojo.widgets['zope.schema.Set'] = function (config, node, order) {
    var wconfig = zc.dojo.parse_config(config, order),
        sel = dojo.create('select', {}, node),
        sel_vals, select;
    config.value = config.value || [];
    sel_vals = config.value.join(' ');
    dojo.forEach(config.values, function (item) {
        var op = dojo.create('option', {
            value: item[0],
            innerHTML: item[1]
        }, sel);
        if (String(sel_vals.match(item[0])) === item[0]) {
            op.setAttribute('selected', true);
        }
    });
    delete wconfig.value;
    select = new dijit.form.MultiSelect(wconfig, sel);
    return node;
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

zc.dojo.widgets['zope.schema.Object'] = function (
    config, pnode, order, widgets) {
    var node, sub_widgets, checkbox, label;

    node = new dijit.layout.BorderContainer({
        design: "headline", gutters: true
    });

    pnode.appendChild(node.domNode);

    sub_widgets = new dojo.NodeList();

    dojo.forEach(config.schema.widgets, function (widget) {
            var cp = new dijit.layout.ContentPane({}, dojo.create('div')),
                label, span, wid;
            if (widget.widget_constructor !== 'zc.ajaxform.widgets.Hidden') {
                label = dojo.create(
                    'label', {innerHTML: widget.label || widget.fieldLabel},
                    cp.domNode);
                if (widget.required) {
                    span = dojo.create(
                        'span', {innerHTML: ' (required)'}, label);
                    dojo.addClass(span, 'status-marker');
                }
                dojo.create('br', null, cp.domNode);
            }
            dojo.addClass(cp.domNode, 'widget');
            wid = zc.dojo.widgets[widget.widget_constructor](
                widget,
                cp.domNode,
                order,
                widgets
            );
            sub_widgets.push(dijit.byId(widget.name));
            cp.domNode.appendChild(wid);
            node.domNode.appendChild(cp.domNode);
        }
    );

    if (!config.required) {
        checkbox = new dijit.form.CheckBox({});
        label = dojo.byId(config.name + '.label');
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
    config, pnode, order, widgets) {
    return new zc.RecordList({config: config}, pnode).domNode;
};

zc.dojo.build_widgets = function (config) {
    var widget_mapping = {};
    dojo.forEach(config.definition.widgets, function (widget_config) {
        var widget = zc.dojo.widgets[
            widget_config.widget_constructor](
                widget_config, dojo.create('div'));
        widget_mapping[widget_config.id] = widget;
    });
    return widget_mapping;
};

zc.dojo.build_form = function (config, pnode, order, startup) {
    var form, node, right_pane, left_pane, bottom_pane, widgets,
        key, have_left_fields, fireSubmitEvent;
    startup = startup === undefined ? true: startup;
    order = order || 0;
    if (!config.definition.left_fields) {
        config.definition.left_fields = [];
    }
    if (config.definition.button_type === undefined) {
        config.definition.button_type = dijit.form.Button;
    }
    form = new dijit.form.Form({
        id: config.definition.prefix,
        style: 'height:100%; width:100%;'
    }, pnode);
    if (startup) {
        form.startup = function () {
            // First, restore the original startup
            this.startup = dijit.form.Form.prototype.startup;
            this.startup();
            this.getChildren().forEach(function (node) {node.startup();});
        };
    }
    dojo.addClass(form, 'zcForm');
    node = new dijit.layout.BorderContainer({
        design: "headline",
        gutters: true,
        liveSplitters: true,
        style: "height:100%; width:100%;"
    });
    form.domNode.appendChild(node.domNode);

    right_pane = new dijit.layout.ContentPane({
        region: 'center',
        splitter: true
    });
    node.addChild(right_pane);
    bottom_pane = new dijit.layout.ContentPane({
        region: 'bottom'
    });
    node.addChild(bottom_pane);
    widgets = [];
    have_left_fields = false;
    for (key in config.definition.left_fields){
        if (config.definition.left_fields.hasOwnProperty(key)) {
	    if (config.definition.left_fields[key]){
	        have_left_fields = true;
	        break;
            }
        }
    }
    if (have_left_fields) {
        left_pane = new dijit.layout.ContentPane({
                    region: 'left',
                    style: 'width: 60%;',
                    splitter: true
        });
        right_pane.style.width = '40%';
        node.addChild(left_pane);
    }

    dojo.forEach(config.definition.widgets, function (widget) {
        var prefix, cp, bool_flag, label, span, wid, wid_domnode;
        if (config.definition.prefix) {
            prefix = config.definition.prefix + '.';
            if (!widget.id) {
                widget.id = widget.name;
            }

            if (widget.id.substr(0, prefix.length) !== prefix) {
                widget.id = prefix + widget.id;
            }
        }
        cp = new dijit.layout.ContentPane({}, dojo.create('div'));
        bool_flag = widget.bool_flag;
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
            label = dojo.create(
                'label', {id: widget.name + '.label',
                innerHTML: widget.label || widget.fieldLabel},
                cp.domNode);
            if (widget.required) {
                span = dojo.create(
                    'span', {innerHTML: ' (required)'}, label);
                dojo.addClass(span, 'status-marker');
            }
            dojo.create('br', null, cp.domNode);
        }
        wid_domnode = dojo.create('div');
        cp.domNode.appendChild(wid_domnode);
        wid = zc.dojo.widgets[widget.widget_constructor](
            widget, wid_domnode, order, widgets
        );
        widgets.push(wid);
    });

    // XXX The role of this function is unclear.  We need to document what's
    // going on here.
    node.fit = function () {
        var margin = 17, getHeight, heights, max, h;
        getHeight = function (node) {
            return node.scrollHeight;
        };
        heights = dojo.map(
            node.getChildren(),
            function (child) { return getHeight(child.domNode); }
        );
        max = function (xs) {
            var m = null;
            xs.forEach(function (x) {
                if (x > m) {
                    m = x;
                }
            });
            return m;
        };
        h = max(heights) + getHeight(bottom_pane.domNode) + margin;
        node.domNode.style.height = h + 'px';
    };

    // XXX The usage of this event is unclear.  We need to document what's
    // going on here.
    fireSubmitEvent = function () {
        var event = dojo.doc.createEvent('Event');
        event.initEvent('beforeSubmit', true, true);
        dojo.doc.dispatchEvent(event);
    };

    if (bottom_pane) {
        dojo.forEach(config.definition.actions, function (action) {
            var button = new config.definition.button_type({
                    label: action.label,
                    id: action.name,
                    'class': action['class'],
                    onClick: action.onClick || fireSubmitEvent,
                    type: 'button',
                    timeout: 10000,
                    tabIndex: order
                });
            bottom_pane.domNode.appendChild(button.domNode);
        });
    }
    if (startup) {
        node.startup();
        node.resize();
        dojo.forEach(widgets, function (widget) {
            if (widget.postStartup) {
                widget.postStartup(node);
            }
            if (widget.resize) {
                widget.resize();
            }
        });
        zc.dojo.flag_startup();
    }
    return node;
};

dojo.ready( function () {
    zc.dojo.Form = dojo.declare(
        dijit.form.Form, {
            startup : function () {
                this.inherited(arguments);
                this.getChildren().forEach(
                    function (node) {
                        node.startup();
                    });
            }
        });
});

zc.dojo._func_handler = function (func) {
    return dojo.isString(func) ? dojo.getObject(func, false) : func;
};

zc.dojo.build_form2 = function (config, pnode, order, startup) {
    var definition = config.definition || config,
        prefix, suffix, legacy, form, widgets,
        widgets_by_name, flag_changed, needed_flags,
        handle_bool_flag, build_group, bool_flag,
        fields_div, action_div, action_div_id, groups,
        left_widgets, right_widgets, border;
    startup = startup === undefined ? true: startup;
    order = order || 0;
    prefix = definition.prefix ? definition.prefix+'.' : '';
    suffix = prefix ? '.' + definition.prefix : '';

    legacy = !!pnode; // Are we using a build_form-style call

    if (prefix) {
        form = dijit.byId(definition.prefix);
        if (! form) {
            form = dojo.byId(definition.prefix);
            if (form) {
                form = new zc.dojo.Form({id: definition.prefix}, form);
            }
        }
    }
    if (form) {
        legacy = false;
    }
    else {
        form = {};
        if (prefix) {
            form.id = definition.prefix;
        }
        form = new zc.dojo.Form(form, pnode);
    }

    dojo.addClass(form.domNode, 'zc-form');
    if (definition['class']) {
        dojo.addClass(form.domNode, definition['class']);
    }


    // normalize widget namey data
    widgets = dojo.map(
        definition.widgets, function (widget) {
            widget = dojo.clone(widget);

            if (! widget.id) {
                widget.id = widget.name;
            }

            if (prefix) {
                widget.id = prefix + widget.id;
            }

            if (! widget.label) {
                widget.label = widget.fieldLabel || widget.name;
            }

            return widget;
        });

    groups = definition.groups;

    // normlize groups
    if (!groups) {
        groups = [];
        if (definition.left_fields) {
            left_widgets = [];
            right_widgets = [];
            dojo.forEach(
                widgets, function (widget) {
                    if (definition.left_fields[widget.name]) {
                        left_widgets.push(widget.name);
                    }
                    else {
                        right_widgets.push(widget.name);
                    }
                }
            );
            if (left_widgets.length) {
                if (right_widgets.length) {
                    groups.push(
                        {
                            id: 'zc.dojo.zc-left-fields' + suffix,
                            'class': 'zc-left-fields',
                            widgets: left_widgets
                        });
                    groups.push(
                        {
                            id: 'zc.dojo.zc-right-fields' + suffix,
                            'class': 'zc-right-fields',
                            widgets: right_widgets
                        });

                    if (legacy) {
                        dojo.style(form.domNode,
                                   {height: '100%', width: '100%'});
                        border = new dijit.layout.BorderContainer(
                            {
                                design:"headline",
                                gutters: true,
                                livesplitters: true,
                                style: "height: 100%; width: 100%;"
                            }, dojo.create('div', {}, form.domNode));

                        border.addChild(
                            new dijit.layout.ContentPane(
                                {
                                    id: groups[0].id,
                                    region: "left",
                                    splitter: true,
                                    content: '',
                                    style: "width: 60%"
                                }));
                        border.addChild(
                            new dijit.layout.ContentPane(
                                {
                                    id: groups[1].id,
                                    region: "center",
                                    content: '',
                                    splitter: true
                                }));
                        border.addChild(
                            new dijit.layout.ContentPane(
                                {
                                    id: "zc.dojo.zc-actions.ExampleForm",
                                    region: "bottom",
                                    content: ''
                                }));
                    }
                }
                else {
                    groups.push(
                        {
                            id: 'zc.dojo.zc-fields' + suffix,
                            'class': 'zc-fields',
                            widgets: left_widgets
                        });
                }
            }
            else {
                groups.push(
                    {
                        id: 'zc.dojo.zc-fields' + suffix,
                        'class': 'zc-fields',
                        widgets: right_widgets
                    });
            }
        } else {
            groups.push(
                {
                    id: 'zc.dojo.zc-fields' + suffix,
                    'class': 'zc-fields',
                    widgets: dojo.map(
                        widgets, function (widget) {
                            return widget.name;
                        })
                });
        }
    }


    // create a widget index
    widgets_by_name = {};
    dojo.forEach(widgets, function (widget) {
                     widgets_by_name[widget.name] = widget;
                 });

    flag_changed = function (value) {
        if (value) {
              dojo.removeClass(this, 'zc-widget-hidden');
          }
          else {
            dojo.addClass(this, 'zc-widget-hidden');
          }
    };

    needed_flags = {};

    handle_bool_flag = function (def, div) {
        var bool_flag, flag_widget;
        if (def.bool_flag) {
            bool_flag = prefix + def.bool_flag;
            flag_widget = dijit.byId(bool_flag);
            if (flag_widget) {
                dojo.connect(flag_widget, 'onChange',
                             div, flag_changed);
                flag_changed.call(div, flag_widget.get('value'));
            }
            else {
                if (needed_flags.bool_flag !== undefined) {
                    needed_flags[bool_flag].push(div);
                }
                else {
                    needed_flags[bool_flag] = [div];
                }
            }
        }
    };


    // Now, iterate through the groups
    build_group = function(group, parent) {
        var group_node, group_data = dojo.clone(group);
        delete group_data.widgets;
        if (group_data['class']) {
            group_data['class'] += ' zc-fieldset';
        } else {
            group_data['class'] = 'zc-fieldset';
        }

        if (group.id) {
            group_node = dijit.byId(group.id);
            if (group_node) {
                group_node = group_node.containerNode;
            }
            else {
                group_node = dojo.byId(group.id);
            }
        }
        if (! group_node) {
            group_node = dojo.create('div', group_data, parent);
        }
        parent = group_node;

        handle_bool_flag(group, parent);

        dojo.forEach(
            group.widgets, function (widget) {
                var class_, div, flag_widget;
                if (!dojo.isString(widget)) {
                    build_group(widget, parent);
                    return;     // continue
                }
                widget = widgets_by_name[widget];

                class_ = ('zc-field ' +
                              widget.widget_constructor.split('.').join('-'));
                if (widget['class']) {
                    class_ = widget['class'] + ' ' + class_;
                }
                if (widget.required) {
                    class_ += ' required';
                }

                div = { 'class': class_};
                if (widget.id) {
                    div.id = 'zc-field-'+widget.id;
                }
                if (widget.hint || widget.fieldHint) {
                    div.title = widget.hint || widget.fieldHint;
                }
                div = dojo.create('div', div);

                handle_bool_flag(widget, div);

                if (widget.widget_constructor !==
                    'zc.ajaxform.widgets.Hidden') {
                    dojo.create(
                        'label',
                        {innerHTML: widget.label || widget.fieldLabel,
                         'for': widget.id, 'class': 'zc-label'
                        },
                        div);
                }
                zc.dojo.widgets[widget.widget_constructor](
                    widget, dojo.create('div', {}, div), order, [],
                    true
                );
                parent.appendChild(div);

                if (needed_flags[widget.id] !== undefined) {
                    flag_widget = dijit.byId(widget.id);
                    dojo.forEach(
                        needed_flags[widget.id], function (div) {
                            dojo.connect(flag_widget, 'onChange',
                                         div, flag_changed);
                            flag_changed.call(div, flag_widget.get('value'));
                        });
                    delete needed_flags[widget.id];
                }
            });
    };

    dojo.forEach(
        groups, function (group) {
            if (!fields_div && ((! group.id) || ! dojo.byId(group.id))) {
                fields_div = dojo.create('div', {'class': 'zc-fields'},
                                         form.domNode);
            }
            build_group(group, fields_div);

            if (group.id) {
                var group_widget = dijit.byId(group.id);
                if (group_widget && group_widget._started) {
                    dojo.forEach(
                        group_widget.getChildren(), function(child) {
                            child.startup();
                        });
                }
            }
        });


    if (needed_flags) {
        for (bool_flag in needed_flags) {
            if (needed_flags.hasOwnProperty(bool_flag)) {
                console.error('Unresolved bool flag: '+ bool_flag);
            }
        }
    }

    if (definition.actions) {
        action_div_id = 'zc.dojo.zc-actions' + suffix;
        action_div = dijit.byId(action_div_id);
        if (action_div) {
            action_div = action_div.containerNode;
        }
        else {
            action_div = dojo.byId(action_div_id);
        }

        if (!action_div) {
            action_div = dojo.create(
                'div', {id: action_div_id, 'class': 'zc-actions'},
                form.domNode);
        }

        dojo.forEach(
            definition.actions, function (action) {
                action = dojo.mixin(
                    {
                        id: action.id || (prefix &&
                             action.name.slice(0, prefix.length) === prefix ?
                             action.name:
                             prefix+action.name
                            ),
                        label: action.label || action.name,
                        tabIndex: order,
                        onClick: function () {
                            if (action.validate) {
                                if (!form.isValid()) {
                                    return;
                                }
                            }
                            if (action.handler) {
                                zc.dojo._func_handler(action.handler)(
                                    form.getValues(), action, form);
                            }
                            if (definition.handler && !action.ignore_default) {
                                zc.dojo._func_handler(definition.handler)(
                                    form.getValues(), action, form);
                            }
                        }
                    },
                    action);
                if (!action['class']) {
                    action['class'] = '';
                }
                action['class'] += 'zc-action';

                if (definition.onClick !== undefined) {
                    if (action.onClick !== undefined) {
                        dojo.connect(action, 'onClick', null,
                                     definition.onClick);
                    } else {
                        action.onClick = definition.onClick;
                    }
                }
                action_div.appendChild((new dijit.form.Button(action)).domNode);
            });
    }
    if (pnode && startup) {
        form.startup();
    }

    return form;
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
    var readonly, wconfig;
    readonly = config.readonly !== undefined ? config.readonly : false;
    wconfig = {
        required: config.required,
        id: config.id,
        name: config.name,
        promptMessage: config.hint || config.fieldHint,
        tabIndex: order,
        value: config.value,
        readonly: readonly,
        readOnly: readonly,     // dijit use camels
        left: config.left,
        'class': 'zc-widget'
    };
    return wconfig;
};

dojo.ready(
    function () {
        dojo.declare(
            "zc.RecordList", [dijit._Widget], {

                constructor: function (jsonData, node) {
                    this.config = jsonData.config;
                    this.rc = this.config.record_schema;
                    this.rc.name = this.config.name;
                    this.original = this.config.value;
                    this.dnd__preselect = true;
                    this.dijit_type = jsonData.dijit_type;
                    this.name = this.config.name;
                    this.id = this.config.id;
                    this.domNode = node || dojo.create('div');
                    this.containerNode = this.domNode;
                    this.inherited(arguments);
                },

                _build_layout: function (record) {
                    var record_layout = [], formatter;

                    formatter = function (v) {
                        var data;
                        if (v) {
                            data = dojo.fromJson(v);
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
                    dojo.forEach(record.widgets, function (widget) {
                        var new_name, column_label, column;
                        if (widget.widget_constructor ===
                            "zc.ajaxform.widgets.Hidden") {
                            return;
                        }
                        widget = dojo.clone(widget);
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
                    dojo.forEach(record.widgets, function (rc_wid) {
                        var indexed_name, val = '';
                        rc_wid = dojo.clone(rc_wid);
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
                    edit_dlg = new dijit.Dialog({
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
                        if (!dojo.hasClass(evt.target,
                            'cke_dialog_ui_input_text')) {
                                return dijit.Dialog.prototype._onKey.call(
                                    edit_dlg, evt);
                        }
                        return null;
                    };
                    rec_form = new dijit.form.Form({
                        method: 'POST',
                        style: 'max-height: 500px; overflow: auto;',
                        encType: 'multipart/form-data'
                    }, dojo.create('div', null, edit_dlg.domNode));
                    widget = new dijit.form.TextBox({
                        name: 'record_id',
                        type: 'hidden'
                    }, dojo.create('div', null, rec_form.domNode));
                    edit_dlg.form_widgets = [];
                    dojo.forEach(layout, function (fld) {
                        var rc_wid, widget_div, label, span, wid;
                        if (fld.rc_wid) {
                            rc_wid = dojo.clone(fld.rc_wid);
                            rc_wid.tabIndex = order;
                            widget_div = dojo.create(
                                'div', {'class': 'widget',
                                        'style': 'margin: 5px;'},
                                rec_form.domNode);
                            label = dojo.create('label', {
                                innerHTML:  (rc_wid.label ||
                                             rc_wid.fieldLabel) + ': '
                            }, widget_div);
                            if (rc_wid.required) {
                                span = dojo.create(
                                    'span', {innerHTML: ' (required)'}, label);
                                dojo.addClass(span, 'status-marker');
                            }
                            dojo.create('br', null, widget_div);
                            wid = zc.dojo.widgets[
                                rc_wid.widget_constructor](
                                rc_wid,
                                dojo.create('div', {style: 'height: auto;'
                                }, widget_div),
                                order);
                            edit_dlg.form_widgets.push(wid);
                        }
                    });
                    buttons_div = dojo.create('div', {
                        style: 'text-align: right;'
                    });
                    dojo.addClass(buttons_div, 'dijitDialogPaneActionBar');

                    widget = new dijit.form.Button({
                        label: 'Cancel',
                        id: widget_name + '.dojo.cancel.btn',
                        tabIndex: order,
                        onClick: function (evt) {
                            edit_dlg.hide();

                        }
                    });
                    buttons_div.appendChild(widget.domNode);

                    widget = new dijit.form.Button({
                        label: 'Save',
                        id: widget_name + '.dojo.save.btn',
                        tabIndex: order,
                        onClick: function (e) {
                            var record_data, row;
                            if (!rec_form.validate()) {
                                return;
                            }
                            dojo.publish(
                                zc.dojo.beforeRecordFormSubmittedTopic,
                                [rec_form.id]);
                            record_data = dojo.formToObject(
                                rec_form.domNode);
                            if (!record_data.record_id) {
                                row = {name: '.' + grid.rowCount + 1};
                                dojo.forEach(
                                    grid.structure[0].cells, function (fld) {
                                        if (fld.rc_wid) {
                                            if (fld.widget_constructor ===
                                                'zope.schema.Bool') {
                                                record_data[fld.field] =
                                                    Boolean(
                                                        record_data[fld.field]);
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
                                        dojo.forEach(
                                            grid.structure[0].cells,
                                            function (fld) {
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

                    nodes = new dojo.NodeList(rec_form.domNode);
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

                resize: function () {
                    this.inherited(arguments);
                    this.grid.resize();
                },

                _edit_record: function (widget_name, row_value, order) {
                    var grid = this.grid, form_values;
                    if (dojo.version < '1.6') {
                        grid.select.clearDrugDivs();
                    }
                    if (!grid.edit_dlg) {
                        grid.edit_dlg = this._build_record_form(
                            widget_name, order);
                    }
                    form_values = {
                        record_id: grid.store.getValue(row_value, 'name')};
                    dojo.forEach(grid.structure[0].cells, function (fld) {
                        if (fld.rc_wid) {
                            form_values[fld.field] =
                                grid.store.getValue(row_value, fld.field);
                        }
                    });
                    /* order of next two lines is important */
                    grid.edit_dlg.editForm.getChildren().forEach(function (el) {
                        if (form_values[el.name] !== undefined) {
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
                    var record_fields, layout, grid, widget, dnd_plugin;

                    record_fields = this._build_layout(this.rc);
                    layout = [{
                        cells: record_fields
                    }];

                    grid = new dojox.grid.EnhancedGrid({
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
                    }, dojo.create('div', {}, this.domNode));
                    this.grid = grid;
                    dnd_plugin = grid.pluginMgr.getPlugin('dnd');
                    dnd_plugin.selector.setupConfig({
                        'row': 'single',
                        'cell': 'disabled',
                        'column': 'disabled'
                    });
                    dojo.connect(grid, 'onCellMouseOver', dojo.hitch(this,
                        function (e) {
                            if (this.dnd_preselect) {
                                var dnd_plugin = grid.pluginMgr.getPlugin('dnd');
                                dnd_plugin._dndReady = true;
                                dnd_plugin.selector.select('row', e.rowIndex);
                            }
                    }));
                    if (dojo.version < '1.6') {
                        grid.select.exceptColumnsTo = record_fields.length - 2;
                        grid.select.getExceptionalColOffsetWidth = dojo.hitch(
                            grid.select, function () {
                                var normalizedOffsetWidth = 0, offsetWidth = 0;
                                dojo.forEach(
                                    this.getHeaderNodes(),
                                    function (node, index) {
                                        if (index <= this.exceptColumnsTo) {
                                            var coord = dojo.coords(node);
                                            offsetWidth += coord.w;
                                        }
                                    }, this);
                                normalizedOffsetWidth = offsetWidth;
                                return normalizedOffsetWidth > 0 ?
                                    normalizedOffsetWidth : 0;
                            });
                    }
                    if (!this.rc.readonly) {
                        if (dojo.version < '1.6') {
                            dojo.connect(grid, 'onCellMouseOver', function (e) {
                                if (e.cell.draggable) {
                                    grid.select.cleanAll();
                                    grid.selection.select(e.rowIndex);
                                    grid.select.clearDrugDivs();
                                    grid.select.addRowMover(e.rowIndex,
                                        e.rowIndex);
                                }
                                else {
                                    grid.select.clearDrugDivs();
                                }
                            });
                        }
                        dojo.connect(grid, 'onCellClick', dojo.hitch(this,
                            function (e) {
                            grid.selection.select(e.rowIndex);
                            var dnd_plugin = grid.pluginMgr.getPlugin('dnd');
                            dnd_plugin._dndReady = true;
                            dnd_plugin.selector.select('row', e.rowIndex);
                            this.dnd_preselect = false;
                        }));
                        dojo.connect(grid, 'onCellDblClick', function (e) {
                            grid.selection.select(e.rowIndex);
                            this._edit_record(
                                this.config.name,
                                grid.selection.getSelected()[0],
                                this.order);
                        });
                    }
                    if (!this.rc.readonly) {
                        widget = new dijit.form.Button({
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
                                if (dojo.version < 1.6) {
                                    grid.selection.cancelDND();
                                }
                                grid.edit_dlg.show();
                            })
                        }, dojo.create('div', null, this.domNode));
                        widget = new dijit.form.Button({
                            label: 'Edit',
                            id: this.config.name + '.dojo.edit.btn',
                            tabIndex: this.order,
                            onClick: dojo.hitch(this, function () {
                                var row_values = grid.selection.getSelected();
                                if (row_values.length !== 1) {
                                    zc.dojo.alert(
                                        {
                                           title: 'Error!',
                                           content:
                                           'Please select a single row to Edit.'
                                        });
                                    return;
                                }
                                this._edit_record(
                                    this.config.name,
                                    row_values[0],
                                    this.order);
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
                                dojo.forEach(
                                    selected,
                                    grid.store.deleteItem,
                                    grid.store);
                                grid.store.save();
                            }
                        }, dojo.create('div', null, this.domNode));
                        // While the event seems deceptively decorative, we are
                        // using this to know when to recalculate our grid
                        // value, since we do so by iterating over rows.
                        // We do this because order is important, and the store
                        // cares nothing of order.
                        dojo.connect(grid, 'postresize', dojo.hitch(this,
                            function (item) {
                                this._set_inputs();
                                this.onChange(this.attr('value'));
                                this.dnd_preselect = true;
                            })
                        );
                    }

                    this.startup = function (node) {
                        grid.startup();
                    };

                    this.domNode.postStartup = this.startup;
                    this.input_value = dojo.create('input', {
                        type: 'hidden'
                    }, this.domNode);
                    this.input_parent = dojo.create('div', null, this.domNode);
                    dojo.connect(
                        this.grid, 'startup', dojo.hitch(
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
                    var item_list = [], num = 0, data, store;
                    dojo.forEach(value, dojo.hitch(this,
                        function (record) {
                            item_list.push(this._build_record(this.rc,
                                '.' + num,
                                record));
                            num += 1;
                    }));
                    data = {
                        items: item_list,
                        identifier: "name",
                        label: "name"
                    };
                    store = new dojo.data.ItemFileWriteStore(
                        {data: data});
                    // This won't trigger a resize, so we have to keep this
                    // event.
                    dojo.connect(store, 'onSet', dojo.hitch(this, function () {
                        this._set_inputs();
                    }));
                    return store;
                },

                _set_inputs: function () {
                    var items = {}, i, attrs, name, value, rec;
                    this.input_parent.innerHTML = '';
                    for (i = 0; i < this.grid.rowCount; i++) {
                        rec = this.grid.getItem(i);
                        if (rec) {
                            attrs = this.grid.store.getAttributes(rec);
                            dojo.forEach(attrs, function (attr) {
                                if (attr !== 'name') {
                                    name = attr + '.' + i;
                                    value = this.grid.store.getValue(rec, attr);
                                    dojo.create('input', {
                                        type: 'hidden',
                                        name: name,
                                        value: value
                                    }, this.input_parent);
                                    items[name] = value;
                                }
                            }, this);
                        }
                    }
                    this.input_value.value = dojo.toJson(items);
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

        dojo.declare(
            "zc.RangeWidget", [dijit._Widget], {

                constructor: function (jsonData, node) {
                    this.config = jsonData.config;
                    this.dijit_type = jsonData.dijit_type;
                    this.convert_to = jsonData.convert_to;
                    this.convert_from = jsonData.convert_from;
                    this.constraints = this.config.constraints;
                    this.name = this.config.name;
                    this.id = this.config.id;
                    this.domNode = node || dojo.create('div');
                    this.containerNode = this.domNode;
                    this.inherited(arguments);
                },

                buildRendering: function () {
                    var min_constraint = {}, max_constraint = {}, value;
                    if (this.constraints.min !== undefined) {
                        min_constraint.min = this.constraints.min;
                        max_constraint.min = this.constraints.min;
                    }

                    if (this.constraints.max !== undefined) {
                        min_constraint.max = this.constraints.max;
                        max_constraint.max = this.constraints.max;
                    }
                    value = this._values_from(this.config.value);

                    dojo.create(
                        'label', {
                            'innerHTML': this.config.start_label
                        }, dojo.create('div', {}, this.domNode));
                    this.min_value = new this.dijit_type(
                        {
                            constraints: min_constraint,
                            name: this.config.start,
                            value: value[this.config.start],
                            onChange: dojo.hitch(
                                this, function (value) {
                                    if (value || value === 0) {
                                        var min_con = value;
                                        if (this.constraints.min) {
                                            if (this.constraints.min > min_con) {
                                                min_con = this.constraints.min;
                                            }
                                        }
                                        this.max_value.constraints.min = min_con;
                                        this.onChange(this.get('value'));
                                        this.max_value.validate();
                                    }
                                })
                        }, dojo.create('div', {}, this.domNode));
                    dojo.create('label', {
                                    'innerHTML': this.config.end_label
                                }, dojo.create('div', {}, this.domNode));
                    this.max_value = new this.dijit_type(
                        {
                            constraints: max_constraint,
                            name: this.config.end,
                            value: value[this.config.end],
                            onChange: dojo.hitch(
                                this, function (value) {
                                    if (value || value === 0) {
                                        var max_con = value;
                                        if (this.constraints.max) {
                                            if (this.constraints.max < max_con) {
                                                max_con = this.constraints.max;
                                            }
                                        }
                                        this.min_value.constraints.max = max_con;
                                        this.onChange(this.get('value'));
                                        this.min_value.validate();
                                    }
                                })
                        }, dojo.create('div', {}, this.domNode));

                    this.value_input = dojo.create(
                        'input',
                        {
                            type: 'hidden',
                            name: this.name,
                            value: this.get('value')
                        },
                        this.domNode);
                },

                onChange: function (value) {
                    this.value_input.value = value;
                    this.inherited(arguments);
                },

                conversion: function (v) {
                    if (v === '') {
                        v = null;
                    }
                    return v;
                },

                _getValueAttr: function () {
                    var value = {}, min = this.min_value.get('value');
                    value[this.config.start] = this.min_value.getValue();
                    if (isNaN(value[this.config.start])) {
                        value[this.config.start] = null;
                    }
                    value[this.config.end] = this.max_value.getValue();
                    if (isNaN(value[this.config.end])) {
                        value[this.config.end] = null;
                    }
                    if (this.convert_to) {
                        if (value[this.config.start] !== null) {
                            value[this.config.start] =
                                this.convert_to(value[this.config.start]);
                        }
                        if (value[this.config.end] !== null) {
                            value[this.config.end] =
                                this.convert_to(value[this.config.end]);
                        }
                    }
                    return dojo.toJson(value);
                },

                _values_from: function (value) {
                    if (value) {
                        if (!(value instanceof Object)) {
                            value = dojo.fromJson(value);
                        }
                        if (this.convert_from) {
                            value[this.config.start] =
                                this.convert_from(value[this.config.start]);
                            value[this.config.end] =
                                this.convert_from(value[this.config.end]);
                        }
                    }
                    else {
                        value = {};
                        value[this.config.start] = null;
                        value[this.config.end] = null;
                    }
                    return value;
                },

                _setValueAttr: function (value) {
                    value = this._values_from(value);
                    this.min_value.set('value', value[this.config.start]);
                    this.max_value.set('value', value[this.config.end]);
                },

                isValid: function () {
                    return this.min_value.isValid() &&
                        this.max_value.isValid() &&
                        (this.min_value.get('value') === null ||
                         this.max_value.get('value') === null ||
                         (this.max_value.get('value') >
                          this.min_value.get('value'))
                         );
                },

                validate: function () {
                    return this.min_value.validate() &&
                        this.max_value.validate() &&
                        (this.min_value.get('value') === null ||
                         this.max_value.get('value') === null ||
                         (this.max_value.get('value') >
                          this.min_value.get('value'))
                         );
                },

                reset: function () {
                  this.set('value', this.original);
                },

                focus: function () {
                    if (! this.min_value.isValid()) {
                        this.min_value.focus();
                    }
                    else if (! this.max_value.isValid()) {
                        this.max_value.focus();
                    }
                    else {
                        this.min_value.focus();
                    }
                }

            });
});
