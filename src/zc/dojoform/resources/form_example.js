/*global dijit, dojo, zc */
/*jslint devel: true */
dojo.require('zc.dojo');

dojo.addOnLoad( function () {

    var success_handler = function (res) {
        if (res.success && res.message) {
            zc.dojo.alert('Success!', res.message);
        }
    };

    var actionify_buttons = function (config, success_handler) {
        dojo.forEach(config.definition.actions, function (action) {
            dojo.connect(dijit.byId(action.name), 'onClick', function () {
                if (action.name == 'ExampleForm.actions.validate') {
                    if (!dijit.byId(config.definition.prefix).validate()) {
                        return;
                    }
                }
                zc.dojo.submit_form({
                url: action.url,
                form_id: config.definition.prefix,
                task: 'Submitting Form',
                success: success_handler
                });
            });
        });
    };

    var createForm = function (form_data) {
        zc.dojo.build_form(form_data, dojo.create('div', {}, dojo.body()));
        actionify_buttons(form_data, success_handler);
        dijit.byId(form_data.definition.prefix).startup();
    };

    zc.dojo.call_server({
        url: 'ExampleForm',
        task: 'Loading Form',
        success: createForm
    });

    console.log('form loaded');

});
