dojo.require('zc.dojo');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.Button');

dojo.addOnLoad( function () {

        function setValue(result)
        {
            dojo.byId('value').innerHTML = result.value;
        }

        zc.dojo.call_server({
            url: 'calc/value',
            task: 'Getting value',
            success: setValue
        });

        var BC = new dijit.layout.BorderContainer({}, dojo.body());
        var result = dojo.create('div', {
            id: 'value',
            }, BC.domNode);
        var input = new dijit.form.TextBox({
            id: 'input',
            regExp: '/[0-9]/',
            value: 1
        });

        var AddButton = new dijit.form.Button({
            label: '+'
        });
        dojo.connect(AddButton, 'onClick', function () {
            zc.dojo.call_server({
                url: 'calc/add',
                content: {'value:int': input.getValue()},
                task: 'Adding',
                success: setValue
            });
        });

        var SubtractButton = new dijit.form.Button({
            label: '-'
        });
        dojo.connect(SubtractButton, 'onClick', function () {
            zc.dojo.call_server({
                url: 'calc/subtract',
                content: {'value:int': input.getValue()},
                task: 'Subtracting',
                success: setValue
            });
        });

        BC.addChild(input);
        BC.addChild(AddButton);
        BC.addChild(SubtractButton);
        console.log('container loaded');
});
