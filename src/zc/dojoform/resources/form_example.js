dojo.require('zc.dojo');

dojo.addOnLoad( function () {

    createForm = function (form_data) {
        result = zc.dojo.build_form(form_data,
            dojo.create('div', {}, dojo.body())
        );
        create_buttons(form_data, result.button_locale);
        result.form_node.startup();
    };

    zc.dojo.call_server({
        url: 'ExampleForm',
        task: 'Loading Form',
        success: createForm
    });
   
    console.log('form loaded');

    create_buttons = function (config, button_locale) {
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
                        task: 'Submitting Form',
                    });
                });
                button_locale.appendChild(button.domNode);
            }
        }
    }

});
