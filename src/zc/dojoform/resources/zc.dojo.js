dojo.provide('zc.dojo');
dojo.require('dijit.form.ValidationTextBox');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.SimpleTextarea');
dojo.require('dijit.Editor');
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

zc.dojo.widgets['zope.schema.Text'] = function (config, node, order, disabled) {

    wconfig = zc.dojo.parse_config(config, order);
    var total_editor = dojo.create('div', {}, node);
    console.log(wconfig.value);
    var editor_for_form = new dijit.form.TextBox({
        type: 'hidden',
        name: wconfig.name,
        value: wconfig.value
    });
    // iframes = :[
    wconfig['style'] = 'width:400px; height:200px;';
    wconfig['height'] = '100%';
    if (disabled) {
        wconfig['disabled'] = true;
    }
    var editor = new dijit.Editor(wconfig);
    total_editor.appendChild(editor_for_form.domNode);
    total_editor.appendChild(editor.domNode);
    editor.value = editor_for_form.getValue();
    dojo.connect(editor, 'onBlur', function() {
            editor_for_form.setValue(editor.getValue());
            console.log(editor_for_form.value);
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
    wconfig['disabled'] = true;
    return new dijit.form.TextBox(wconfig, node).domNode;

};

zc.dojo.widgets['zc.ajaxform.widgets.RichTextDisplay'] = function (config, node, order) {

    return zc.dojo.widgets['zope.schema.Text'](config, node, null, true);

};

zc.dojo.widgets['zope.schema.Choice'] = function (config, node, order) {

    wconfig = zc.dojo.parse_config(config, order);    
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
    return new dijit.form.FilteringSelect(wconfig, node).domNode
};

var build_record = function (record, pnode, suffix, record_value){

    var cp = new dijit.layout.ContentPane({
    }, dojo.create('p',{}));
    pnode.addChild(cp);

    var c_label = 'Delete';
    if (suffix == '.new') {
        c_label = 'Add';
    }

    for (rc_wid in record.widgets) {
        rc_wid = dojo.clone(rc.widgets[rc_wid]);
        indexed_name = rc_wid.name+suffix;
        rc_wid.name = indexed_name;
        rc_wid.id = indexed_name;
        var inner = dojo.create('div', {style:'float:left;'}, cp.domNode);
        var label = dojo.create('label', {
             innerHTML: rc_wid.fieldLabel +'<br>'
        }, inner);
        if (record_value){
            var id_list = rc_wid.id.split('.');
            var id = id_list[id_list.length-2];
            rc_wid.value = record_value[id];
        }
        var wid = zc.dojo.widgets[rc_wid.widget_constructor](
            rc_wid,
            dojo.create('div', {},
                dojo.create('div', {})));
        inner.appendChild(wid);
    }
    if (!record.readonly) {
        var check_label = dojo.create('label', {
            innerHTML: c_label
        });
        cp.domNode.appendChild(check_label);
        var check =  new dijit.form.CheckBox({
            id: record.name + suffix,
            name: record.name + suffix,
            checked: false
        });
        cp.domNode.appendChild(check.domNode);
    }
};

zc.dojo.widgets['zope.schema.List'] = function (config, pnode) {

    var node = new dijit.layout.BorderContainer({
            design:"headline",
            gutters:"false",
        }, pnode);
    rc = config.record_schema;
    rc.name = config.name;
    build_record(rc, node, '.new');
    records = dojo.fromJson(config.value);
    var num = 0;
    for (record in records) {
        record = records[record];
        build_record(rc, node, '.'+String(num), record);
        num++;
    }
    node.startup();
    return pnode;
};

zc.dojo.build_form = function (config, pnode)
{
    var form = dojo.create('form', {
        id: config.definition.prefix,
        style:'position:absolute;'
    }, pnode);
    var node = new dijit.layout.BorderContainer({
        design:"headline",
        gutters:"false",
        liveSplitters: true,
        style:"height:100%; width:100%;"
    }, form);
    var left_pane = false;
    var right_pane = new dijit.layout.ContentPane({
        region: 'center',
        splitter: true
    }, dojo.create('div'));
    node.addChild(right_pane);
    var bottom_pane = new dijit.layout.ContentPane({
        region: 'bottom'
    }, dojo.create('div'));
    node.addChild(bottom_pane);
    for (var i in config.definition.widgets)
    {
        var cp = new dijit.layout.ContentPane({
        }, dojo.create('p',{}));
        var widget = config.definition.widgets[i];
        if (!(left_pane) && (!right_pane)){
            node.addChild(cp);
        }
        else if (config.definition.left_fields[widget.name]){
            if (!left_pane){
                var left_pane = new dijit.layout.ContentPane({
                    region: 'left',
                    splitter: true
                }, dojo.create('div'));
                node.addChild(left_pane);
            }
            left_pane.domNode.appendChild(cp.domNode);
        }
        else {
            right_pane.domNode.appendChild(cp.domNode);
        }

        var brk = false;
        if (!(widget.widget_constructor == 'zc.ajaxform.widgets.Hidden')){
            brk = true;
            var label = dojo.create('label', {
                innerHTML: widget.fieldLabel +'<br>'
            }, cp.domNode);
        }
        var wid = zc.dojo.widgets[widget.widget_constructor](
            widget,
            dojo.create('div', {}, 
                dojo.create('div')));
        cp.domNode.appendChild(wid);
        if (brk){
            dojo.create('br', null, cp.domNode);
        }
    }
    if (bottom_pane) {
        return {'button_locale':bottom_pane.domNode, 'form_node':node};
    }
    else {
        node.startup();
    }
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
