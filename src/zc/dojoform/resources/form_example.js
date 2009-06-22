dojo.require('zc.dojo');

dojo.addOnLoad( function () {

    createForm = function (form_data) {
        zc.dojo.build_form(form_data, dojo.body());
    }

    zc.dojo.call_server({
        url: 'ExampleForm',
        task: 'Loading Form',
        success: createForm
    });
   
    console.log('form loaded');
});
