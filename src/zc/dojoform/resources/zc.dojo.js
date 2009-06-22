dojo.provide('zc.dojo');

dojo.require('dijit.form.ValidationTextBox');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.layout.BorderContainer');
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

zc.dojo.widgets['zope.schema.Int'] = function (config, node, order) {

    wconfig = parse_config(config, order);    
    if (config.field_min || config.field_max) {
        constraints = {};
        if (config.field_min != undefined) {
            constraints['min'] = config.field_min;
        }
        if (config.field_max != undefined) {
            constraints['max'] = config.field_max;
        }
        wconfig.constraints = constraints;
    }
    return new dijit.form.NumberTextBox(wconfig, node);
};


zc.dojo.widgets['zope.schema.Bool'] = function (config, node, order) {

    wconfig = parse_config(config, order);    
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

zc.dojo.build_form = function (config, pnode)
{
    var node = new dijit.layout.BorderContainer({}, pnode);
    for (var i in config.definition.widgets)
    {
        var widget = config.definition.widgets[i];
        console.log(widget);
        var label = dojo.create('label', {
            innerHTML: widget.fieldLabel +'<br>'
        }, node.domNode);
        var wid = zc.dojo.widgets[widget.widget_constructor](
            widget, 
            dojo.create('div', {}, 
                dojo.create('div')));
        node.addChild(wid);
        dojo.create('br', null, node.domNode);
    }
}

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
        alt: config.alt,
        tabIndex: order,
        readOnly: readonly
    };
    return wconfig;
}
