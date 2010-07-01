dojo.require('zc.dojo');

dojo.addOnLoad( function () {

    createForm = function (form_data) {
        result = zc.dojo.build_form(form_data,
            dojo.create('div', {}, dojo.body())
        );
        actionify_buttons(form_data);
        dijit.byId(form_data.definition.prefix).startup();
    };

    zc.dojo.call_server({
        url: 'ExampleForm',
        task: 'Loading Form',
        success: createForm
    });

    console.log('form loaded');

    actionify_buttons = function (config, success_handler) {
      for (action_i in config.definition.actions) {
        // overcome the wrong values being captured by the closure
        var _ = function (action_index) {
          var action = config.definition.actions[action_index];
          button = dijit.byId(action.name);
          dojo.connect(button, 'onClick', function () {
            zc.dojo.submit_form({
              url: action.url,
              form_id: config.definition.prefix,
              task: 'Submitting Form',
              success: success_handler
            });
          });
        }(action_i);
      }
    };

});
