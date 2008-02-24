Ext.namespace('zc');

zc.extjs = function() {

    // Maybe connections are expensive. Who knows. They appear to want
    // to be reused.
    var server_connection = new Ext.data.Connection();

    function call_server (url, params, task, on_success, on_fail)
    {
        server_connection.request({
            url: url, params: params,
            callback: function (options, success, response) {
                if (! success)
                {
                    system_error(task);
                    if (on_fail)
                        on_fail({});
                }
                else
                {
                    result = eval("("+response.responseText+")");
                    if (result.session_expired)
                        return session_expired();

                    if (result.error)
                    {
                        Ext.MessageBox.alert(task+' failed',
                                             result.error);
                        if (on_fail)
                            on_fail(result);
                    }
                    else
                    {
                        if (on_success)
                            on_success(result);
                    }
                }
            }
        });
    }

    function form_dialog (url, config, after)
    {
        var dialog;
        return function () {
            if (dialog)
                return dialog.show();

            config = Ext.apply(config, {
                modal: true,
                buttons: [{
                    text: 'Cancel',
                    handler: function () {
                        dialog.hide();
                    }
                }]
            });
        
            call_server(
                url, undefined, "Loading form definitions",
                function (result) {
                    dialog = new Ext.Window(
                        Ext.apply(config, {
                            layout: 'fit',
                            items: [
                                form(
                                    {},
                                    result.definitions,
                                    function (form, action)
                                    {
                                        form.hide();
                                        if (after)
                                            after(form, action)
                                    }
                                )
                            ]
                        })
                    );
                    dialog.show();
                }
            );
        };
    }

    function form_failure (form, action)
    {
        if (action.result && action.result.session_expired)
            session_expired();
        else if (action.result && action.result.error)
            Ext.MessageBox.alert("Couldn't submit form", action.result.error);
        else if (! (action.result && action.result.errors))
            system_error("Submitting this form");
    }

    function form(config, definition, after)
    {
        config.items = map(zc.extjs.widgets.Field, definition.widgets);
        if (config.buttons === undefined)
            config.buttons = [];
        for (var i=0; i < definition.actions.length; i++)
            config.buttons.push({
                text: definition.actions[i].label,
                handler: function () 
                {
                    if (! form_valid(form))
                        return;
                    form.submit({
                        url: definition.actions[i].url,
                        waitMsg: '...',
                        failure: zc.extsupport.form_failure,
                        success: after
                    });
                }
            });
        var form = new Ext.form.FormPanel(config);
        return form;
    }
   
    function form_valid(form) 
    {
        if (form.getForm().isValid())
            return true;
        Ext.MessageBox.alert('Errors', 'Please fix the errors noted.');
        return false;
    }

    function init ()
    {
        Ext.QuickTips.init();
    }

    function map (func, sequence)
    {
        var result = [];
        for (var i=0; i < sequence.length; i++)
            result.push(func(sequence[i]));
        return result;
    }

    function session_expired () 
    {
        Ext.MessageBox.alert(
            'Session Expired',
            "You will need to log-in again.",
            window.location.reload.createDelegate(window.location)
        );
    }
        
    function system_error (task)
    {
        Ext.MessageBox.alert("Failed",task+" failed for an unknown reason");
    }

    return {
        call_server: call_server,
        form_dialog: form_dialog,
        form_failure: form_failure,
        form: form,
        form_valid: form_valid,
        init: init,
        map: map,
        system_error: system_error
    };
}();

zc.extjs.widgets = function() {

    return {
        Field: function (widget)
        {
            return zc.extjs.widgets[widget.widget](widget);
        },

        InputBool: function (widget)
        {
            return Ext.apply({xtype: 'checkbox'}, widget);
        },

        InputInt: function (widget)
        {
            config = Ext.apply({xtype: 'textfield'}, widget);
            config.validator = function (value) {
                if (config.field_min !== undefined && value < config.field_min)
                    return "The value must be at least "+config.field_min;
                if (config.field_max !== undefined && value > config.field_max)
                    return ("The value must be less than or equal to "
                            +config.field_max);
                return true;
            };
            if (config.field_min !== undefined && config.field_min >= 0)
                config.maskRe = /[0-9]/;
            else
            {
                config.maskRe = /[-0-9]/;
                config.regex = /^-?[0-9]+$/;
                config.regexText = 'The input must be an integer.';
            }
            return config;
        },

        InputTextLine: function (widget)
        {
            return Ext.apply({xtype: 'textfield'}, widget);
        },

        InputChoice: function (widget)
        {
            var config = Ext.apply({xtype: 'combo'}, widget);
            if (config.values)
                config.store = new Ext.data.SimpleStore({
                    fields: [{name: 'data', mapping: 1}],
                    id: 0,
                    data: config.values
                });
            config = Ext.apply(config, {
                displayField: 'data',
                triggerAction: 'all',
                emptyText:'Select...',
                selectOnFocus:true,
                editable: false,
                mode: 'local'
            });
            return config;
        }
    };    
}();

Ext.form.Field.prototype.msgTarget = 'under';
Ext.onReady(zc.extjs.init);
