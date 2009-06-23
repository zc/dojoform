dojo.provide('zc.dojo');

dojo.require('dijit.form.ValidationTextBox');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.form.SimpleTextarea');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.form.NumberTextBox');
dojo.require('dijit.Dialog');
dojo.require('dojo.data.ItemFileReadStore');

zc.dojo.widgets = {}

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
        if (args.success) {
            args.success(data)
        }
    };

    dojo.xhrPost({
        url: args.url,
        handleAs: "json",
        content: args.content,
        load: callback_success,
        error: callback_error
    });
}

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
    wconfig['name'] = "label";
    wconfig['searchAttr'] = "label";
    return new dijit.form.FilteringSelect(wconfig, node);

}

zc.dojo.build_form = function (config, pnode, orientation, listed, record)
{
    var node_style = "height: 100%;";
    if (orientation){
        node_style = '';
    }
    var node = new dijit.layout.BorderContainer({design:"sidebar", gutters:"false",
        style: node_style}, pnode);
    var style = 'float:left;';
    if (!orientation){
        style = '';
        var left_pane = new dijit.layout.ContentPane({
            region: 'center'
        }, dojo.create('div'));
        var right_pane = new dijit.layout.ContentPane({
            region: 'right'
        }, dojo.create('div'));
        node.addChild(left_pane);
        node.addChild(right_pane);
    }
    for (var i in config.definition.widgets)
    {
        var cp = new dijit.layout.ContentPane({
        }, dojo.create('div',{style: style}));
        var widget = config.definition.widgets[i];
        if (!(left_pane) && (!right_pane)){
            node.addChild(cp);
        }
        else if (widget.left){
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
            var conf = {definition: widget.record_schema};
            for (record_index in values) {
                var wid = dojo.create('span');
                var record_v = values[record_index];
                zc.dojo.build_form(conf, wid, true, listed_v, record_v);
                cp.domNode.appendChild(wid);
                dojo.create('br', null, cp.domNode);
                listed_v++;
            }
            var wid = dojo.create('span');
            zc.dojo.build_form(conf, wid, true, '_new', null);
            console.log('yay');
            cp.domNode.appendChild(wid);
            dojo.create('br', null, cp.domNode);
        }
        else {
            if (listed) {
                widget['name'] += String(listed); 
            }
            if (record) {
                widget['value'] = record[widget.fieldLabel];
            }
            else if (record == null){
                delete widget['value'];
            }
            var wid = zc.dojo.widgets[widget.widget_constructor](
                widget,
                dojo.create('div', {}, 
                    dojo.create('div'))).domNode;
            cp.domNode.appendChild(wid);
            if (brk){
                dojo.create('br', null, cp.domNode);
            }
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
