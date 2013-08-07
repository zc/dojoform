define(
[
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dijit/form/Button",
    "dijit/form/Form",
    "dijit/registry",
    "./widgets"
],
function (
    array, lang, dom, domClass, domConstruct, domStyle,
    Button, Form, registry, widget_constructors)
{
    return function (config, pnode, order, startup) {
        var definition = config.definition || config,
        prefix, suffix, legacy, form,
        widgets_by_name, build_group,
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
            groups = [
                {
                    id: 'zc.dojoform.zc-fields' + suffix,
                    'class': 'zc-fields',
                    widgets: array.map(
                        widgets, function (widget) {
                            return widget.name;
                        })
                }];
        }


        // create a widget index
        widgets_by_name = {};
        array.forEach(widgets, function (widget) {
                          widgets_by_name[widget.name] = widget;
                      });

        var conditions = [];

        var save_condition = function(def, div) {
            if (def.condition || def.condition_on) {
                if (! (def.condition && def.condition_on)) {
                    console.errror("Need both condition and condition_on", def);
                }
                else {
                    var condition = def.condition;
                    if (typeof(condition) == 'string') {
                        condition = eval("("+condition+")");
                    }
                    var cond = {
                        condition: condition,
                        condition_on: def.condition_on,
                        div: div
                    };
                    try {
                        setup_condition(cond);
                    } catch (e) {
                        if (e.error == "no such widget") {
                            conditions.push(cond);
                        }
                        else {
                            console.error(e);
                        }
                    }
                }
            }
        };

        var setup_condition = function (cond) {
            var widgets = array.map(
                cond.condition_on,
                function (id) {
                    var widget = registry.byId(prefix+id);
                    if (! widget) {
                        throw {error: "no such widget", id: id};
                    }
                    return widget;
                });

            function changed() {
                if (cond.condition.apply(
                        null,
                        array.map(
                            widgets,
                            function (widget) {
                                return widget.get('value');
                            })
                    )) {
                        domClass.remove(cond.div, 'zc-widget-hidden');
                    }
                else {
                    domClass.add(cond.div, 'zc-widget-hidden');

                }
            }

            array.forEach(
                widgets,
                function (widget) {
                    widget.on("change", changed);
                    changed();
                }
            );
        };

        var setup_conditions = function () {
            array.forEach(conditions, setup_condition);
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

            save_condition(group, parent);

            array.forEach(
                group.widgets, function (widget) {
                    var class_, div;
                    if (!lang.isString(widget)) {
                        build_group(widget, parent);
                        return;     // continue
                    }
                    widget = widgets_by_name[widget];

                    class_ = ('zc-field ' +
                              'zc-field-' +
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

                    save_condition(widget, div);

                    if (widget.widget_constructor !== 'Hidden') {
                        domConstruct.create(
                            'label',
                            {innerHTML: widget.label || widget.fieldLabel,
                             'for': widget.id, 'class': 'zc-label'
                            },
                            div);
                    }
                    widget_constructors[widget.widget_constructor](
                        widget, domConstruct.create('div', {}, div), order, [],
                        true
                    );
                    parent.appendChild(div);
                });
        };

        array.forEach(
            groups, function (group) {
                if (!fields_div && ((! group.id) || ! dom.byId(group.id))) {
                    fields_div = domConstruct.create(
                        'div', {'class': 'zc-fields'},
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

        // All the widgets have been created, so we can wire up conditions
        // that weren't able to set up right away.
        setup_conditions();

        if (definition.actions) {
            action_div_id = 'zc.dojoform.actions' + suffix;
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

            var _func_handler = function (func) {
                return lang.isString(func) ? lang.getObject(func, false) : func;
            };

            array.forEach(
                definition.actions, function (action) {
                    action = lang.mixin(
                        {
                            id: action.id ||
                                (prefix &&
                                 action.name.slice(0, prefix.length) ===
                                 prefix ?
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
                                    _func_handler(action.handler)(
                                        form.get("value"), action, form);
                                }
                                if (definition.handler &&
                                    !action.ignore_default) {
                                    _func_handler(definition.handler)(
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
});
