dojo.provide('zc.dojo');
dojo.require('dijit.form.ValidationTextBox');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.SimpleTextarea');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.form.NumberTextBox');
dojo.require('dijit.Dialog');
dojo.require('dojo.data.ItemFileReadStore');

zc.dojo.widgets = {};

zc.dojo.call_server = function (args) {

    var callback_error = function (error) {
        result = dojo.fromJson(error.responseText);
        if (!('error' in result) && !('session_expired' in result)){
            system_error(args.task);
        }
        else if (result.session_expired) {
            return session_expired(error);
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
                result += errors[error];
            }
            var this_dialog = new dijit.Dialog({
                title: args.task+' failed',
                content: result });
            this_dialog.show();
        }
        else if (args.success) {
            args.success(data);
        }
    };

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
            form: args.form_id,
            load: callback_success,
            error: callback_error
        });
    }
}

zc.dojo.submit_form = zc.dojo.call_server;


zc.dojo.widgets['zope.schema.TextLine'] = function (config, node, order)
{
    wconfig = parse_config(config, order);    
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
    return new dijit.form.ValidationTextBox(wconfig, node);
};

zc.dojo.widgets['zope.schema.Text'] = function (config, node, order) {

    wconfig = parse_config(config, order);
    return new dijit.form.SimpleTextarea(wconfig, node);
}

zc.dojo.widgets['zc.ajaxform.widgets.Hidden'] = function (config, node, order) {
    
    wconfig = parse_config(config, order);
    wconfig.type = 'hidden';
    return new dijit.form.TextBox(wconfig, node);
}

zc.dojo.widgets['zope.schema.Int'] = function (config, node, order) {

    wconfig = parse_config(config, order);    
    constraints = {};
    if (config.field_min != undefined) {
        constraints['min'] = config.field_min;
    }
    if (config.field_max != undefined) {
        constraints['max'] = config.field_max;
    }
    constraints['places'] = 0;
    wconfig.constraints = constraints;
    if (config.custom_type == 'zc.ajaxform.NumberSpinner') {
        return new dijit.form.NumberSpinner(wconfig, node);
    }
    return new dijit.form.NumberTextBox(wconfig, node);
};

zc.dojo.widgets['zope.schema.Decimal'] = function (config, node, order) {

    wconfig = parse_config(config, order);
    constraints = {};
    if (config.field_min != undefined) {
        constraints['min'] = config.field_min;
    }
    if (config.field_max != undefined) {
        constraints['max'] = config.field_max;
    }
    wconfig.constraints = constraints;
    return new dijit.form.NumberTextBox(wconfig, node);
};

zc.dojo.widgets['zope.schema.Bool'] = function (config, node, order) {

    wconfig = parse_config(config, order);    
    wconfig['checked'] = config.value;
    return new dijit.form.CheckBox(wconfig, node);

}

zc.dojo.widgets['zope.schema.Choice'] = function (config, node, order) {

    wconfig = parse_config(config, order);    
    var store_data = {
        identifier: 'value',
        label: 'label'
    };
    var items = [];
    values = config.values;
    for (index in values){
        items.push({
            label: values[index][0],
            value: values[index][1]
        });
    }
    store_data['items'] = items; 
    var select_store = new dojo.data.ItemFileReadStore({
        data: store_data
    })
    wconfig['store'] = select_store;
    wconfig['searchAttr'] = "label";
    return new dijit.form.FilteringSelect(wconfig, node);

}

zc.dojo.build_form = function (config, pnode, orientation, listed, record)
{
    if (orientation){
        var node = new dijit.layout.BorderContainer({
            design:"headline",
            gutters:"false",
        }, pnode);
    }
    else {
        var form = dojo.create('form', {id: config.definition.prefix}, pnode);
        var node = new dijit.layout.BorderContainer({
            design:"headline",
            gutters:"false",
            style:"height:100%;"
        }, form);
    }
    var style = 'float:left;';
    var left_pane = false;
    if (!orientation){
        style = '';
        var right_pane = new dijit.layout.ContentPane({
            region: 'center'
        }, dojo.create('div'));
        node.addChild(right_pane);
        var bottom_pane = new dijit.layout.ContentPane({
            region: 'bottom'
        }, dojo.create('div'));
        node.addChild(bottom_pane);
    }
    for (var i in config.definition.widgets)
    {
        var cp = new dijit.layout.ContentPane({
        }, dojo.create('p',{style: style}));
        var widget = config.definition.widgets[i];
        if (!(left_pane) && (!right_pane)){
            node.addChild(cp);
        }
        else if (config.definition.left_fields[widget.name]){
            if (!left_pane){
                var left_pane = new dijit.layout.ContentPane({
                    region: 'left'
                }, dojo.create('div'));
                node.addChild(left_pane);
            }
            left_pane.domNode.appendChild(cp.domNode);
        }
        else {
            right_pane.domNode.appendChild(cp.domNode);
        }
        var brk = false;
        if (!(widget.widget_constructor == 'zc.ajaxform.widgets.Hidden') &&
            !listed){
            brk = true;
            var label = dojo.create('label', {
                innerHTML: widget.fieldLabel +'<br>'
            }, cp.domNode);
        }
        if (widget.widget_constructor == 'zope.schema.List') {
            var listed_v = 0;
            var values = dojo.fromJson(widget.value);
            var conf = {
                definition: widget.record_schema
            };
            for (record_index in values) {
                var wid = dojo.create('p', {style: 'float:left;'});
                var record_v = values[record_index];
                zc.dojo.build_form(conf, wid, true, listed_v, record_v);
                cp.domNode.appendChild(wid);
                var check_label = dojo.create('label', {
                    innerHTML: 'Add/Delete'
                });
                wid.appendChild(check_label);
                var check =  new dijit.form.CheckBox({
                    id: widget.name + '.'+String(listed_v),
                    name: widget.name + '.'+String(listed_v),
                    checked: false
                },dojo.create('div'));
                wid.appendChild(check.domNode);
                listed_v++;
            }
            var wid = dojo.create('p', {style: 'float:left;'});
            zc.dojo.build_form(conf, wid, true, 'new', 0);
            var check_label = dojo.create('label', {
                innerHTML: 'Add/Delete'
            });
            wid.appendChild(check_label);
            var check =  new dijit.form.CheckBox({
                id: widget.name + '.new',
                name: widget.name + '.new',
                checked: false
            },dojo.create('div'));
            wid.appendChild(check.domNode);
            cp.domNode.appendChild(wid);
        }
        else {
            var widget_conf = dojo.clone(widget);
            if (listed != undefined) {
                widget_conf['name'] += '.'+String(listed); 
            }
            if (record) {
                widget_conf['value'] = record[widget.fieldLabel];
            }
            else if (record == 0){
                delete widget_conf['value'];
            }
            console.log(widget_conf);
            var wid = zc.dojo.widgets[widget.widget_constructor](
                widget_conf,
                dojo.create('div', {}, 
                    dojo.create('div'))).domNode;
            cp.domNode.appendChild(wid);
            if (brk){
                dojo.create('br', null, cp.domNode);
            }
        }
    }
    if (config.definition.actions != undefined){
        actions = config.definition.actions;
        for (action_index in actions) {
            action = actions[action_index];
            var button = new dijit.form.Button({
                label: action.label,
                id: action.name
            }, dojo.create('div', {style: "float:left;"}));
            dojo.connect(button, 'onClick', function () {
               zc.dojo.submit_form({
                   url: action.url,
                   form_id: config.definition.prefix,
                   task: 'Submitting Form'
               });
            });
            bottom_pane.domNode.appendChild(button.domNode);
        }
    }
    node.startup();
};

function session_expired() {
   dijit.Dialog({
       title: "Session Expired",
       content: "You will need to log-in again." }).show();
}

function system_error(task) {
    var this_dialog = new dijit.Dialog({
    title: "Failed",
    content: task+" failed for an unknown reason" })
    this_dialog.show();
}

function parse_config(config, order) {
    readonly = config.readonly;
    if (!readonly){ readonly = false; }
    var wconfig = {
        required: config.required,
        id: config.name,
        name: config.name,
        promptMessage: config.fieldHint,
        tabIndex: order,
        value: config.value,
        readOnly: readonly,
        left: config.left
    };
    return wconfig;
}
