/*global define */
define(["dojo/_base/array",
        "dojo/_base/connect",
        "dojo/_base/declare",
        "dojo/_base/fx",
        "dojo/_base/lang",
        "dojo/_base/window",
        "dojo/aspect",
        "dojo/date/stamp",
        "dojo/data/ItemFileReadStore",
        "dojo/data/ItemFileWriteStore",
        "dojo/dom",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/dom-form",
        "dojo/dom-geometry",
        "dojo/dom-style",
        "dojo/json",
        "dojo/on",
        "dojo/query",
        "dojo/request/xhr",
        "dijit/_Widget",
        "dijit/Dialog",
        "dijit/Editor",
        "dijit/form/_FormValueWidget",
        "dijit/form/Button",
        "dijit/form/CheckBox",
        "dijit/form/ComboBox",
        "dijit/form/DateTextBox",
        "dijit/form/Form",
        "dijit/form/FilteringSelect",
        "dijit/form/MultiSelect",
        "dijit/form/NumberSpinner",
        "dijit/form/NumberTextBox",
        "dijit/form/SimpleTextarea",
        "dijit/form/TextBox",
        "dijit/form/TimeTextBox",
        "dijit/form/ValidationTextBox",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/registry",
        "dojox/form/TimeSpinner",
        "dojox/grid/EnhancedGrid",
        "dojox/grid/cells/dijit",
        "dojox/grid/enhanced/plugins/DnD",
        "dojox/grid/enhanced/plugins/IndirectSelection",
        "dojox/grid/enhanced/plugins/Menu",
        "dojox/grid/enhanced/plugins/NestedSorting"
        ], function (array, connect, declare, fx, lang, win, aspect, stamp,
                     ItemFileReadStore, ItemFileWriteStore, dom, domClass,
                     domConstruct, domForm, domGeo, domStyle, json, on, query,
                     xhr, _Widget, Dialog, Editor, _FormValueWidget, Button,
                     CheckBox, ComboBox, DateTextBox, Form, FilteringSelect,
                     MultiSelect, NumberSpinner, NumberTextBox, SimpleTextarea,
                     TextBox, TimeTextBox, ValidationTextBox, BorderContainer,
                     ContentPane, registry, TimeSpinner, EnhancedGrid) {
    var zc = lang.getObject("zc", true),
        module = lang.getObject("zc.dojo", true),
        widgets = lang.getObject("zc.dojo.widgets", true),
        RecordList;

    zc.DateTimeTextBox = function (config, node) {

        var domNode, value_node, dateNode, date_box, timeNode,
            time_box, change_value;

        domNode = domConstruct.create('div', {
            'style': 'padding:5px;'
        }, node);
        value_node = domConstruct.create('input', {
            'type': 'hidden',
            'name': config.name,
            'value': config.value
        }, domNode);

        dateNode = domConstruct.create('div', null, domNode);
        domConstruct.create('span', {
            'innerHTML': 'Date: '
        }, dateNode);
        date_box = new DateTextBox({
            value: config.value,
            onChange: function () {change_value();}
        }, domConstruct.create('div', null, dateNode));

        timeNode = domConstruct.create('div', null, domNode);
        domConstruct.create('span', {
            'innerHTML': 'Time: '
        }, timeNode);
        time_box = new TimeSpinner({
            value: config.value,
            onChange: function () {change_value();}
        }, domConstruct.create('div', null, timeNode));

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

module.beforeContentFormSubmittedTopic =
    "ZC_DOJO_BEFORE_CONTENT_FORM_SUBMITTED";
module.beforeRecordFormSubmittedTopic = "ZC_DOJO_BEFORE_RECORD_FORM_SUBMITTED";
module.dialogFormResetTopic = "ZC_DOJO_DIALOG_FORM_RESET";
module.dialogFormUpdateTopic = "ZC_DOJO_DIALOG_FORM_UPDATE";

module.flags = {};

module.flag_startup = function () {
    var key, flag_wid, flagged_cps, state;

    for (key in module.flags) {
        if (module.flags.hasOwnProperty(key)) {
            flag_wid = registry.byId(key);
            flagged_cps = module.flags[key];
            state = flag_wid.checked;
            array.forEach(flagged_cps, function(cp) {
                domStyle.set(cp.domNode, 'display', state ? '': 'none');
            });
        }
    }
};

module.alert = function (args) {
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
    } else if (!lang.isObject(args)) {
        throw new Error("Invalid argument.");
    }

    args.show = args.show || true;

    dialog = new Dialog({'title': args.title || 'Alert'});
    dtor = function () {
        var d = dialog.hide();
        if (d) {
            d[d.addCallback ? "addCallback" : "then"](function () {
                delete dialog._fadeOutDeferred;
                dialog.destroyRecursive();
            });
        } else {
            dialog.destroyRecursive();
        }
    };
    dialog.on("cancel", dtor);

    button = new Button({
        label: 'OK',
        onClick: function () {
            if (args.onClick) {
                args.onClick();
            }
            dtor();
        }
    });
    el = domConstruct.create('div', {
            style: 'text-align: left; margin-bottom: 15%;',
            innerHTML: args.content
        });

    nodes = query.NodeList([el]);
    el = domConstruct.create('div', {style: 'text-align: right;'});
    domClass.add(el, 'dijitDialogPaneActionBar');
    el.appendChild(button.domNode);
    nodes.push(el);
    dialog.set('content', nodes);
    if (args.show) {
        dialog.show();
    }
    return dialog;
};

module.confirm = function (args) {
    // Parameters can be passed in an object or in the following order.
    //
    // title: String
    //              The text for the title bar of the dialog.
    // content: String
    //              The text for the body of the dialog.
    // yes: Function (optional)
    //              The callback for when the user clicks the affirmative
    //              button.
    // no: Function (optional)
    //              The callback for the 'No' or dialog cancel buttons.
    // confirm_label: String (optional)
    //              The label used for the button which calls the yes function
    // cancel_label: String (optional)
    //              The label used for the button which calls the no function
    // confirm_id: String (optional)
    //              The id used for the button which calls the yes function
    // cancel_id: String (optional)
    //              The id used for the button which calls the no function

    var btn, btn_div, dialog, events, handler, no_cb, nodes,
        _args, params, i;

    if (arguments.length > 1) {
        _args = {};
        params = [
            'title', 'content', 'yes', 'no', 'confirm_label', 'cancel_label',
            'confirm_id', 'cancel_id'];
        for (i=0; i<arguments.length; i++) {
            _args[params[i]] = arguments[i];
        }
        args = _args;
    } else if (!lang.isObject(args)) {
        throw new Error("Invalid argument.");
    }

    var title = args.title || 'Confirm';
    dialog = new Dialog({title: title});

    handler = function (cb) {
        dialog.hide();
        if (cb) {
            cb();
        }
        dialog.destroyRecursive();
    };

    btn_div = domConstruct.create('div', {style: 'text-align: right;'});
    domClass.add(btn_div, 'dijitDialogPaneActionBar');
    btn = new Button(
        {label: args.cancel_label || 'Cancel', id: args.cancel_id || null});
    btn_div.appendChild(btn.domNode);
    no_cb = lang.partial(handler, args.no);
    btn.on("click", no_cb);
    dialog.on("cancel", no_cb);

    btn = new Button(
        {label: args.confirm_label || 'Confirm', id: args.confirm_id || null});
    btn_div.appendChild(btn.domNode);
    btn.on("click", lang.partial(handler, args.yes));

    nodes = query.NodeList([
                domConstruct.create('div', {
                    innerHTML: args.content,
                    style: 'margin-bottom: 10%;'})]);
    nodes.push(btn_div);
    dialog.set('content', nodes);
    dialog.show();
};


module.call_server = function (args) {
    var content, k, callback_error,
        callback_success;
    callback_error = function (error) {
        var result;
        if (error.responseText) {
            result = json.parse(error.responseText);
        }

        if (result) {
            if (result.error === undefined &&
                result.session_expired === undefined) {
                module.system_error(args.task);
            } else if (result.session_expired) {
                module.session_expired(error);
            } else if (result.error) {
                module.alert({
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
        if (lang.isString(data)) {
            data = json.parse(data);
        }
        if (data.session_expired) {
            if (args.failure) {
                args.failure(error);
            }
            module.session_expired(error);
        } else if (data.errors) {
            result = '';
            errors = data.errors;
            for (error in errors) {
                if (errors.hasOwnProperty(error)) {
                    result += errors[error] + '<br>';
                }
            }
            module.alert({
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
    connect.publish(module.beforeContentFormSubmittedTopic, [args.form_id]);
    if (!args.content) {
        args.content = {};
    }
    if (args.form_id) {
        args.content = domForm.toObject(args.form_id);
    }
    return xhr.post(args.url, {
        handleAs: "json",
        data: args.content
    }).then(callback_success, callback_error);
};

module.submit_form = module.call_server;

module.widgets['zope.schema.TextLine'] = function (config, node, order) {
    var wconfig;
    wconfig = module.parse_config(config, order);
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
    return new ValidationTextBox(wconfig, node).domNode;
};

module._update = function(a, b) {
    var k;
    for (k in b) {
        if (b.hasOwnProperty(k)) {
            a[k] = b[k];
        }
    }
};

module.widgets['zope.schema.Password'] = function (config, node, order) {
    var wconfig;
    wconfig = module.parse_config(config, order);
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
    return new ValidationTextBox(wconfig, node).domNode;
};

module.widgets['zope.schema.Text'] = function (
    config, node, order, _, nostyle) {
    var wconfig = module.parse_config(config, order);
    if (!nostyle) {
        wconfig.style = 'width:auto';
    }
    return new SimpleTextarea(wconfig, node).domNode;
};

module.widgets['zc.ajaxform.widgets.RichText'] =
    function (config, node, order) {

    var wconfig = module.parse_config(config, order),
        total_editor = domConstruct.create('div', {}, node),
        editor_for_form, editor;

    editor_for_form = new TextBox({
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
    editor = new Editor(wconfig);
    total_editor.appendChild(editor_for_form.domNode);
    total_editor.appendChild(editor.domNode);
    editor.value = editor_for_form.get("value");
    editor.on("blur", function () {
        editor_for_form.set("value", editor.get("value"));
    });
    return total_editor;
};

module.widgets['zc.ajaxform.widgets.Hidden'] = function (config, node, order) {
    var wconfig;
    wconfig = module.parse_config(config, order);
    wconfig.type = 'hidden';
    return new TextBox(wconfig, node).domNode;
};

module.RangeConversion = function (v) {
    if (lang.isString(v)) {
        v = json.parse(v);
    }
    else {
        v = json.stringify(v);
    }
    return v;
};

module.DateConversion = function (v) {
    if (lang.isString(v)) {
        v = stamp.fromISOString(v);
    } else if (v) {
        v = stamp.toISOString(v).split('T')[0];
    }
    return v;
};

module.widgets['zc.ajaxform.widgets.DateRange'] =
    function (config, node, order) {
        var wconfig;
        wconfig = module.parse_range_config(config, order);
        wconfig.start_label = wconfig.start_label || 'Start';
        wconfig.end_label = wconfig.end_label || 'End';
        return new zc.RangeWidget(
            {
                config: wconfig,
                dijit_type: DateTextBox,
                convert_from: module.DateConversion,
                convert_to: module.DateConversion
            }, node).domNode;
};

module.widgets['zc.ajaxform.widgets.IntRange'] =
    function (config, node, order) {
    var wconfig;
    wconfig = module.parse_range_config(config, order);
    wconfig.start_label = wconfig.start_label || 'Min';
    wconfig.end_label = wconfig.end_label || 'Max';
    return new zc.RangeWidget({
        config: wconfig,
        dijit_type: config.dijit_type || NumberSpinner
    }, node).domNode;
};

module.parse_number_config = function (config, order) {
    var wconfig, constraints;
    wconfig = module.parse_config(config, order);
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

module.parse_range_config = function (config, order) {
    var wconfig;
    wconfig = module.parse_number_config(config, order);
    wconfig.start = config.start;
    wconfig.end = config.end;
    wconfig.start_label = config.start_label;
    wconfig.end_label = config.end_label;
    return wconfig;
};

module.widgets['zope.schema.Int'] = function (config, node, order) {
    var wconfig;
    wconfig = module.parse_number_config(config, order);
    wconfig.constraints.places = 0;
    return new NumberTextBox(wconfig, node).domNode;
};

module.widgets['zc.ajaxform.widgets.NumberSpinner'] = function (
    config, node, order) {
    var wconfig;
    wconfig = module.parse_number_config(config, order);
    return new NumberSpinner(wconfig, node).domNode;
};

module.widgets['zope.schema.Decimal'] = function (config, node, order) {
    var wconfig;
    wconfig = module.parse_number_config(config, order);
    return new NumberTextBox(wconfig, node).domNode;
};

module.widgets['zope.schema.Bool'] = function (config, node, order) {
    var wconfig;
    wconfig = module.parse_config(config, order);
    wconfig.checked = config.value;
    wconfig.onChange = function (state) {
        var follower_cps = module.flags[config.id];
        array.forEach(follower_cps, function (cp) {
            domStyle.set(cp.domNode, 'display', state ? '': 'none');
        });
    };
    return new CheckBox(wconfig, node).domNode;

};

module.widgets['zc.ajaxform.widgets.BasicDisplay'] =
    function (config, node, order) {
    var wconfig;
    wconfig = module.parse_config(config, order);
    wconfig.readOnly = true;
    return new TextBox(wconfig, node).domNode;

};

module.widgets['zc.ajaxform.widgets.RangeDisplay'] = function (
    config, node, order) {
    var wconfig, domNode, startbox, endbox;
    wconfig = module.parse_config(config, order);
    wconfig.readOnly = true;
    domNode = domConstruct.create('div', {}, node);
    domConstruct.create('label', {
        'innerHTML': config.start_label
    }, domConstruct.create('div', {}, domNode));
    startbox = new TextBox({
        'value': wconfig.value[config.start],
        'readOnly': true
    }, domConstruct.create('div', {}, domNode));
    domConstruct.create('label', {
        'innerHTML': config.end_label
    }, domConstruct.create('div', {}, domNode));
    endbox = new TextBox({
        'value': wconfig.value[config.end],
        'readOnly': true
    }, domConstruct.create('div', {}, domNode));
    return domNode;
};

module.widgets['zc.ajaxform.widgets.BoolDisplay'] = function (
    config, node, order) {
    var wconfig;
    wconfig = module.parse_config(config, order);
    wconfig.checked = config.value;
    wconfig.onChange = function (state) {
        var follower_cps = module.flags[config.id];
        array.forEach(follower_cps, function (cp) {
            ddomStyle.set(cp.domNode, 'display', state ? '': 'none');
        });
    };
    wconfig.readOnly = true;
    return new CheckBox(wconfig, node).domNode;
};

module.widgets['zc.ajaxform.widgets.RichTextDisplay'] = function (
    config, node, order) {
    var iframe = domConstruct.create('iframe', {
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

module.widgets['zope.schema.Date'] = function (config, node, order) {
    var wconfig, widget;
    wconfig = module.parse_config(config, order);
    wconfig.value = stamp.fromISOString(wconfig.value);
    widget = new DateTextBox(wconfig, domConstruct.create('div', {}, node));
    return widget.domNode;
};

module.widgets['zope.schema.Time'] = function (config, node, order) {
    var wconfig, ts, widget;
    wconfig = module.parse_config(config, order);
    if (wconfig.value) {
        ts = wconfig.value;
        if (ts[0] !== 'T') {
            ts = 'T' + ts;
        }
        wconfig.value = stamp.fromISOString(ts);
    }
    widget = new TimeSpinner(wconfig, domConstruct.create('div', {}, node));
    return widget.domNode;
};

module.widgets['zope.schema.Datetime'] = function (
    config, node, order, readOnly) {
    var wconfig = module.parse_config(config, order),
        widget;
    wconfig.value = wconfig.value ? new Date(wconfig.value) : new Date();
    widget = new zc.DateTimeTextBox(wconfig, domConstruct.create('div', {}, node));
    return widget.domNode;
};

module._choiceConfig = function (config, node, order) {
    var wconfig, store_data, select_store;
    wconfig = module.parse_config(config, order);
    store_data = {
        identifier: 'value',
        label: 'label'
    };
    store_data.items = array.map(
                        config.values,
                        function (item) {
                            return {label: item[1], value: item[0]};
                        });

    select_store = new ItemFileReadStore({data: store_data});
    if (wconfig.value === undefined) {
        wconfig.value = null;
    }
    wconfig.store = select_store;
    wconfig.searchAttr = "label";
    return wconfig;
};

module.widgets['zope.schema.Set'] = function (config, node, order) {
    var wconfig = module.parse_config(config, order),
        sel = domConstruct.create('select', {}, node),
        sel_vals, select;
    config.value = config.value || [];
    sel_vals = config.value.join(' ');
    array.forEach(config.values, function (item) {
        var op = domConstruct.create('option', {
            value: item[0],
            innerHTML: item[1]
        }, sel);
        if (sel_vals.match(item[0]).toString() === item[0]) {
            op.set("selected", true);
        }
    });
    delete wconfig.value;
    select = new MultiSelect(wconfig, sel);
    return node;
};

module.widgets['zope.schema.Choice'] = function (config, node, order) {
    var wconfig = module._choiceConfig(config, node, order);
    return new FilteringSelect(wconfig, node).domNode;
};

module.widgets['zc.ajaxform.widgets.ComboBox'] = function (
    config, node, order) {
    var wconfig = module._choiceConfig(config, node, order);
    return new ComboBox(wconfig, node).domNode;
};

module.widgets['zope.schema.Object'] = function (
    config, pnode, order, widgets) {
    var node, sub_widgets, checkbox, label;

    node = new BorderContainer({
        design: "headline", gutters: true
    });

    pnode.appendChild(node.domNode);

    sub_widgets = query.NodeList();

    array.forEach(config.schema.widgets, function (widget) {
            var cp = new ContentPane({}, domConstruct.create('div')),
                label, span, wid;
            if (widget.widget_constructor !== 'zc.ajaxform.widgets.Hidden') {
                label = domConstruct.create(
                    'label', {innerHTML: widget.label || widget.fieldLabel},
                    cp.domNode);
                if (widget.required) {
                    span = domConstruct.create(
                        'span', {innerHTML: ' (required)'}, label);
                    domClass.add(span, 'status-marker');
                }
                domConstruct.create('br', null, cp.domNode);
            }
            domClass.add(cp.domNode, 'widget');
            wid = module.widgets[widget.widget_constructor](
                widget,
                cp.domNode,
                order,
                widgets
            );
            sub_widgets.push(registry.byId(widget.name));
            cp.domNode.appendChild(wid);
            node.domNode.appendChild(cp.domNode);
        }
    );

    if (!config.required) {
        checkbox = new CheckBox({});
        label = dom.byId(config.name + '.label');
        label.parentNode.insertBefore(checkbox.domNode, label);

        domStyle.set(node.domNode, 'opacity', '0');
        checkbox.on("click", function () {
            sub_widgets.forEach(function (widget) {
                widget.disabled = !checkbox.checked;
            });

            if (checkbox.checked) {
                fx.fadeIn({node: node.domNode}).play();
            } else {
                fx.fadeOut({node: node.domNode}).play();
            }
        });
        checkbox.onClick();
    }


    return pnode;

};

module.widgets['zope.schema.List'] = function (
    config, pnode, order, widgets) {
    return new RecordList({config: config}, pnode).domNode;
};

module.build_widgets = function (config) {
    var widget_mapping = {};
    array.forEach(config.definition.widgets, function (widget_config) {
        var widget = module.widgets[
            widget_config.widget_constructor](
                widget_config, domConstruct.create('div'));
        widget_mapping[widget_config.id] = widget;
    });
    return widget_mapping;
};

module.build_form = function (config, pnode, order, startup) {
    var form, node, right_pane, left_pane, bottom_pane, widgets,
        key, have_left_fields, fireSubmitEvent;
    startup = startup === undefined ? true: startup;
    order = order || 0;
    if (!config.definition.left_fields) {
        config.definition.left_fields = [];
    }
    if (!config.definition.button_type) {
        config.definition.button_type = Button;
    }
    form = new Form({
        id: config.definition.prefix,
        style: 'height:100%; width:100%;'
    }, pnode);
    if (startup) {
        form.startup = function () {
            // First, restore the original startup
            this.startup = Form.prototype.startup;
            this.startup();
            this.getChildren().forEach(function (node) {node.startup();});
        };
    }
    domClass.add(form, 'zcForm');
    node = new BorderContainer({
        design: "headline",
        gutters: true,
        liveSplitters: true,
        style: "height:100%; width:100%;"
    });
    form.domNode.appendChild(node.domNode);

    right_pane = new ContentPane({
        region: 'center',
        splitter: true
    });
    node.addChild(right_pane);
    bottom_pane = new ContentPane({
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
        left_pane = new ContentPane({
                    region: 'left',
                    style: 'width: 60%;',
                    splitter: true
        });
        right_pane.style.width = '40%';
        node.addChild(left_pane);
    }

    array.forEach(config.definition.widgets, function (widget) {
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
        cp = new ContentPane({}, domConstruct.create('div'));
        bool_flag = widget.bool_flag;
        if (bool_flag) {
            if (config.definition.prefix) {
                bool_flag = prefix + bool_flag;
            }
            if (module.flags[bool_flag] === undefined) {
                module.flags[bool_flag] = [];
            }
            module.flags[bool_flag].push(cp);
        }
        domClass.add(cp.domNode, 'widget');
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
            label = domConstruct.create(
                'label', {id: widget.name + '.label',
                innerHTML: widget.label || widget.fieldLabel},
                cp.domNode);
            if (widget.required) {
                span = domConstruct.create(
                    'span', {innerHTML: ' (required)'}, label);
                domClass.add(span, 'status-marker');
            }
            domConstruct.create('br', null, cp.domNode);
        }
        wid_domnode = domConstruct.create('div');
        cp.domNode.appendChild(wid_domnode);
        wid = module.widgets[widget.widget_constructor](
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
        heights = array.map(
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
        var event = win.doc.createEvent('Event');
        event.initEvent('beforeSubmit', true, true);
        win.doc.dispatchEvent(event);
    };

    if (bottom_pane) {
        array.forEach(config.definition.actions, function (action) {
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
        array.forEach(widgets, function (widget) {
            if (widget.postStartup) {
                widget.postStartup(node);
            }
            if (widget.resize) {
                widget.resize();
            }
        });
        module.flag_startup();
    }
    return node;
};

module._func_handler = function (func) {
    return lang.isString(func) ? lang.getObject(func, false) : func;
};

module.build_form2 = function (config, pnode, order, startup) {
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
        form = registry.byId(definition.prefix);
        if (! form) {
            form = dom.byId(definition.prefix);
            if (form) {
                form = new Form({id: definition.prefix}, form);
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
        form = new Form(form, pnode);
    }

    domClass.add(form.domNode, 'zc-form');
    if (definition['class']) {
        domClass.add(form.domNode, definition['class']);
    }


    // normalize widget namey data
    widgets = array.map(
        definition.widgets, function (widget) {
            widget = lang.clone(widget);

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
            array.forEach(
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
                        domStyle.set(form.domNode,
                                   {height: '100%', width: '100%'});
                        border = new BorderContainer(
                            {
                                design:"headline",
                                gutters: true,
                                livesplitters: true,
                                style: "height: 100%; width: 100%;"
                            }, domConstruct.create('div', null, form.domNode));

                        border.addChild(
                            new ContentPane(
                                {
                                    id: groups[0].id,
                                    region: "left",
                                    splitter: true,
                                    content: '',
                                    style: "width: 60%"
                                }));
                        border.addChild(
                            new ContentPane(
                                {
                                    id: groups[1].id,
                                    region: "center",
                                    content: '',
                                    splitter: true
                                }));
                        border.addChild(
                            new ContentPane(
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
                    widgets: array.map(
                        widgets, function (widget) {
                            return widget.name;
                        })
                });
        }
    }


    // create a widget index
    widgets_by_name = {};
    array.forEach(widgets, function (widget) {
                     widgets_by_name[widget.name] = widget;
                 });

    flag_changed = function (node, value) {
        domClass.toggle(node, "zc-widget-hidden", !value);
    };

    needed_flags = {};

    handle_bool_flag = function (def, div) {
        var bool_flag, flag_widget;
        if (def.bool_flag) {
            bool_flag = prefix + def.bool_flag;
            flag_widget = registry.byId(bool_flag);
            if (flag_widget) {
                flag_widget.on("change", lang.partial(flag_changed, div));
                flag_changed(div, flag_widget.get('value'));
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
        var group_node, group_data = lang.clone(group);
        delete group_data.widgets;
        if (group_data['class']) {
            group_data['class'] += ' zc-fieldset';
        } else {
            group_data['class'] = 'zc-fieldset';
        }

        if (group.id) {
            group_node = registry.byId(group.id);
            if (group_node) {
                group_node = group_node.containerNode;
            }
            else {
                group_node = dom.byId(group.id);
            }
        }
        if (! group_node) {
            group_node = domConstruct.create('div', group_data, parent);
        }
        parent = group_node;

        handle_bool_flag(group, parent);

        array.forEach(
            group.widgets, function (widget) {
                var class_, div, flag_widget;
                if (!lang.isString(widget)) {
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
                div = domConstruct.create('div', div);

                handle_bool_flag(widget, div);

                if (widget.widget_constructor !==
                    'zc.ajaxform.widgets.Hidden') {
                    domConstruct.create(
                        'label',
                        {innerHTML: widget.label || widget.fieldLabel,
                         'for': widget.id, 'class': 'zc-label'
                        },
                        div);
                }
                module.widgets[widget.widget_constructor](
                    widget, domConstruct.create('div', {}, div), order, [],
                    true
                );
                parent.appendChild(div);

                if (needed_flags[widget.id] !== undefined) {
                    flag_widget = registry.byId(widget.id);
                    array.forEach(
                        needed_flags[widget.id], function (div) {
                            flag_widget.on("change", lang.partial(flag_changed, div));
                            flag_changed.call(div, flag_widget.get('value'));
                        });
                    delete needed_flags[widget.id];
                }
            });
    };

    array.forEach(
        groups, function (group) {
            if (!fields_div && ((! group.id) || ! dom.byId(group.id))) {
                fields_div = domConstruct.create('div', {'class': 'zc-fields'},
                                         form.domNode);
            }
            build_group(group, fields_div);

            if (group.id) {
                var group_widget = registry.byId(group.id);
                if (group_widget && group_widget._started) {
                    array.forEach(
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
        action_div = registry.byId(action_div_id);
        if (action_div) {
            action_div = action_div.containerNode;
        }
        else {
            action_div = dom.byId(action_div_id);
        }

        if (!action_div) {
            action_div = domConstruct.create(
                'div', {id: action_div_id, 'class': 'zc-actions'},
                form.domNode);
        }

        array.forEach(
            definition.actions, function (action) {
                action = lang.mixin(
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
                                module._func_handler(action.handler)(
                                    form.get("value"), action, form);
                            }
                            if (definition.handler && !action.ignore_default) {
                                module._func_handler(definition.handler)(
                                    form.get("value"), action, form);
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
                        action.on("click", definition.onClick);
                    } else {
                        action.onClick = definition.onClick;
                    }
                }
                action_div.appendChild((new Button(action)).domNode);
            });
    }
    if (pnode && startup) {
        form.startup();
    }

    return form;
};

module.session_expired = function () {
   module.alert({
       title: "Session Expired",
       content: "You will need to log-in again." });
};

module.system_error = function (task) {
    module.alert({
        title: "Failed",
        content: task + " failed for an unknown reason"
    });
};

module.parse_config = function (config, order) {
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

        RecordList = declare(
            "zc.RecordList", [_Widget], {

                value: "",

                constructor: function (jsonData, node) {
                    this.config = jsonData.config;
                    this.rc = this.config.record_schema;
                    this.rc.name = this.config.name;
                    this.original = this.config.value;
                    this.dnd__preselect = true;
                    this.dijit_type = jsonData.dijit_type;
                    this.name = this.config.name;
                    this.id = this.config.id;
                    this.domNode = node || domConstruct.create('div');
                    this.containerNode = this.domNode;
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
                        if (widget.widget_constructor ===
                            "zc.ajaxform.widgets.Hidden") {
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
                            wid = module.widgets[
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

                    nodes = query.NodeList([rec_form.domNode, buttons_div]);

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
                        grid.on('oncelldblclick', function (e) {
                            grid.selection.select(e.rowIndex);
                            this._edit_record(
                                this.config.name,
                                grid.selection.getSelected()[0],
                                this.order);
                        });
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
                                    module.alert(
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
                        }, domConstruct.create('div', null, this.domNode));
                        widget = new Button({
                            label: 'Delete',
                            id: this.config.name + '.dojo.delete.btn',
                            tabIndex: this.order,
                            onClick: function (evt) {
                                var selected = grid.selection.getSelected();
                                if (!selected.length) {
                                    module.alert({
                                        title: 'Error!',
                                        content: 'No row selected.'
                                    });
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
                        aspect.before(grid, "postresize", lang.hitch(this,
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
                    var item_list = [], num = 0, data, store;
                    array.forEach(value, lang.hitch(this,
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
                    store = new ItemFileWriteStore(
                        {data: data});
                    // This won't trigger a resize, so we have to keep this
                    // event.
                    aspect.after(store, "onSet", lang.hitch(this, function () {
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

        declare(
            "zc.RangeWidget", _Widget, {

                value: "",

                constructor: function (jsonData, node) {
                    this.config = jsonData.config;
                    this.dijit_type = jsonData.dijit_type;
                    this.convert_to = jsonData.convert_to;
                    this.convert_from = jsonData.convert_from;
                    this.constraints = this.config.constraints;
                    this.name = this.config.name;
                    this.id = this.config.id;
                    this.domNode = node || domConstruct.create('div');
                    this.containerNode = this.domNode;
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

                    domConstruct.create(
                        'label', {
                            'innerHTML': this.config.start_label
                        }, domConstruct.create('div', {}, this.domNode));
                    this.min_value = new this.dijit_type(
                        {
                            constraints: min_constraint,
                            name: this.config.start,
                            value: value[this.config.start],
                            onChange: lang.hitch(
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
                        }, domConstruct.create('div', {}, this.domNode));
                    domConstruct.create('label', {
                                    'innerHTML': this.config.end_label
                                }, domConstruct.create('div', {}, this.domNode));
                    this.max_value = new this.dijit_type(
                        {
                            constraints: max_constraint,
                            name: this.config.end,
                            value: value[this.config.end],
                            onChange: lang.hitch(
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
                        }, domConstruct.create('div', {}, this.domNode));

                    this.value_input = domConstruct.create(
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
                    var value = {}, min = this.min_value.get("value");
                    value[this.config.start] = this.min_value.get("value");
                    if (isNaN(value[this.config.start])) {
                        value[this.config.start] = null;
                    }
                    value[this.config.end] = this.max_value.get("value");
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
                    return json.stringify(value);
                },

                _values_from: function (value) {
                    if (value) {
                        if (!lang.isObject(value)) {
                            value = json.parse(value);
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
                    array.forEach(this.getChildren(), function (w) {
                        w.reset();
                    });
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

    return module;

    });
