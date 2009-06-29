dojo.require('zc.dojo');

dojo.addOnLoad( function () {

    createForm = function (form_data) {
        result = zc.dojo.build_form(form_data,
            dojo.create('div', {}, dojo.body())
        );
        result.form_node.startup();
    };

    zc.dojo.call_server({
        url: 'ExampleForm',
        task: 'Loading Form',
        success: createForm
    });
   
    console.log('form loaded');
});
