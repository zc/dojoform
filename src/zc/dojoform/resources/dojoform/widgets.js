/*global define */
define(
[
    "dojo/_base/array",
    "dojo/_base/fx",
    "dojo/_base/lang",
    "dojo/date/stamp",
    "dojo/data/ObjectStore",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/query",
    "dojo/store/Memory",
    "dijit/Editor",
    "dijit/form/CheckBox",
    "dijit/form/ComboBox",
    "dijit/form/DateTextBox",
    "dijit/form/FilteringSelect",
    "dijit/form/MultiSelect",
    "dijit/form/NumberSpinner",
    "dijit/form/NumberTextBox",
    "dijit/form/SimpleTextarea",
    "dijit/form/TextBox",
    "dijit/form/ValidationTextBox",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/registry",
    "dojox/form/TimeSpinner",
    "./util",
    "./RangeWidget"
], function (
    array, fx, lang, stamp, ObjectStore, dom, domClass, domConstruct,
    domStyle, query, MemoryStore, Editor, CheckBox, ComboBox,
    DateTextBox, FilteringSelect, MultiSelect, NumberSpinner, NumberTextBox,
    SimpleTextarea, TextBox, ValidationTextBox, BorderContainer,
    ContentPane, registry, TimeSpinner, util, RangeWidget)
{
    var widgets = {};

    widgets['TextLine'] = function (config, node, order) {
        var wconfig;
        wconfig = util.parse_config(config, order);
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


    widgets['Password'] = function (config, node, order) {
        var wconfig;
        wconfig = util.parse_config(config, order);
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

    widgets['Text'] = function (
        config, node, order, _, nostyle) {
        var wconfig = util.parse_config(config, order);
        if (!nostyle) {
            wconfig.style = 'width:auto';
        }
        return new SimpleTextarea(wconfig, node).domNode;
    };

    widgets['RichText'] =
        function (config, node, order) {

            var wconfig = util.parse_config(config, order),
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

    widgets['Hidden'] = function (config, node, order) {
        var wconfig;
        wconfig = util.parse_config(config, order);
        wconfig.type = 'hidden';
        return new TextBox(wconfig, node).domNode;
    };

    var DateConversion = function (v) {
        if (lang.isString(v)) {
            v = stamp.fromISOString(v);
        } else if (v) {
            v = stamp.toISOString(v).split('T')[0];
        }
        return v;
    };

    widgets['DateRange'] =
        function (config, node, order) {
            var wconfig;
            wconfig = util.parse_range_config(config, order);
            wconfig.start_label = wconfig.start_label || 'Start';
            wconfig.end_label = wconfig.end_label || 'End';
            return new RangeWidget(
                {
                    config: wconfig,
                    dijit_type: DateTextBox,
                    convert_from: DateConversion,
                    convert_to: DateConversion
                }, node).domNode;
        };


    widgets['IntRange'] =
        function (config, node, order) {
            var wconfig;
            wconfig = util.parse_range_config(config, order);
            wconfig.start_label = wconfig.start_label || 'Min';
            wconfig.end_label = wconfig.end_label || 'Max';
            return new RangeWidget(
                {
                    config: wconfig,
                    dijit_type: config.dijit_type || NumberSpinner
                }, node).domNode;
        };


    widgets['Int'] = function (config, node, order) {
        var wconfig;
        wconfig = util.parse_number_config(config, order);
        wconfig.constraints.places = 0;
        return new NumberTextBox(wconfig, node).domNode;
    };

    widgets['NumberSpinner'] = function (
        config, node, order) {
        var wconfig;
        wconfig = util.parse_number_config(config, order);
        return new NumberSpinner(wconfig, node).domNode;
    };

    widgets['Decimal'] = function (config, node, order) {
        var wconfig;
        wconfig = util.parse_number_config(config, order);
        return new NumberTextBox(wconfig, node).domNode;
    };

    widgets['Bool'] = function (config, node, order) {
        var wconfig;
        wconfig = util.parse_config(config, order);
        wconfig.checked = config.value;
        return new CheckBox(wconfig, node).domNode;

    };

    widgets['BasicDisplay'] =
        function (config, node, order) {
            var wconfig;
            wconfig = util.parse_config(config, order);
            wconfig.readOnly = true;
            return new TextBox(wconfig, node).domNode;

        };

    widgets['RangeDisplay'] = function (
        config, node, order) {
        var wconfig, domNode, startbox, endbox;
        wconfig = util.parse_config(config, order);
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

    widgets['BoolDisplay'] = function (
        config, node, order) {
        var wconfig;
        wconfig = util.parse_config(config, order);
        wconfig.checked = config.value;
        wconfig.readOnly = true;
        return new CheckBox(wconfig, node).domNode;
    };

    widgets['RichTextDisplay'] = function (
        config, node, order) {
        var iframe = domConstruct.create(
            'iframe', {
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

    widgets['Date'] = function (config, node, order) {
        var wconfig, widget;
        wconfig = util.parse_config(config, order);
        wconfig.value = stamp.fromISOString(wconfig.value);
        widget = new DateTextBox(wconfig, domConstruct.create('div', {}, node));
        return widget.domNode;
    };

    widgets['Time'] = function (config, node, order) {
        var wconfig, ts, widget;
        wconfig = util.parse_config(config, order);
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

    widgets['Set'] = function (config, node, order) {
        var wconfig = util.parse_config(config, order),
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

    widgets['Choice'] = function (config, node, order) {
        var wconfig = util.parse_choice_config(config, order);
        return new FilteringSelect(wconfig, node).domNode;
    };

    widgets['ComboBox'] = function (
        config, node, order) {
        var wconfig = util.parse_choice_config(config, order);
        return new ComboBox(wconfig, node).domNode;
    };

    widgets['Object'] = function (
        config, pnode, order, widgets) {
        var node, sub_widgets, checkbox, label;

        node = new BorderContainer(
            {
                design: "headline", gutters: true
            });

        pnode.appendChild(node.domNode);

        sub_widgets = new query.NodeList();

        array.forEach(
            config.schema.widgets, function (widget) {
                var cp = new ContentPane({}, domConstruct.create('div')),
                label, span, wid;
                if (widget.widget_constructor !== 'Hidden') {
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
                wid = widgets[widget.widget_constructor](
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
            checkbox.on(
                "click", function () {
                    sub_widgets.forEach(
                        function (widget) {
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

    return widgets;
});
