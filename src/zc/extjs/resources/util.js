Ext.namespace('zc.extjs');

zc.extjs.util = function() {

    // Maybe connections are expensive. Who knows. They appear to want
    // to be reused.
    var server_connection = new Ext.data.Connection();

    return {
        array: function (wannabe)
        {
            var result = [];
            for(var i=0; i < wannabe.length; i++)
                result.push(wannabe[i]);
            return result;
        },

        system_error: function (task) {
            Ext.MessageBox.alert("Failed", task + " failed for an unknown reason");
        },

        div: function (id, result)
        {
            if (! result)
                result = {};
            result.tag = 'div';
            result.id = id;
            if (arguments.length > 2)
                result.children = array(arguments).slice(2);
            return result;
        },

        call_server: function (url, params, task, on_success, on_fail) {
            server_connection.request({
                url: url, params: params,
                callback: function (options, success, response) {
                    if (! success) {
                        system_error(task);
                        if (on_fail)
                            on_fail({});
                    } else {
                        result = eval("("+response.responseText+")");
                        if (result.error) {
                            Ext.MessageBox.alert(task+' failed',
                                                 result.error);
                            if (on_fail)
                                on_fail(result);
                        } else {
                            if (on_success)
                                on_success(result);
                        }
                    }
                }
            });
        },

        init: function () {
            Ext.QuickTips.init();
        }
    };
}();

Ext.form.Field.prototype.msgTarget = 'under';
