dojo.provide("zc.RangeWidget");

dojo.declare("zc.RangeWidget", dojo._Widget, {

    constructor: function (jsonData, node) {

        this.config = jsonData.config;

        this.value = {'min': null, 'max': null};
        if (this.config.value) {
            this.value = this.config.value;
        }

        this.dijit_type = jsonData.dijit_type;

        this.conversion = jsonData.conversion;

        this.domNode = dojo.create('div', {
            style: "padding:5px;"
        }, node);

        this.constraints = this.config.constraints;

        var min_constraint = {};
        if (this.constraints['min'] != undefined) {
            min_constraint['min'] = this.constraints['min'];
        }

        var max_constraint = {};
        if (this.constraints['max'] != undefined) {
            max_constraint['max'] = this.constraints['max'];
        }

        dojo.create('label', {
            'innerHTML': this.config.start_label
        }, dojo.create('div', {}, this.domNode));
        this.min_value = new this.dijit_type({
            constraints: min_constraint,
            value: this.value[this.config.start],
            onChange: dojo.hitch(this, function (value) {
                this.value_input.value = this.getValue();
                this.max_value.constraints.min = value;
            })
        }, dojo.create('div', {}, this.domNode));
        dojo.create('label', {
            'innerHTML': this.config.end_label
        }, dojo.create('div', {}, this.domNode));
        this.max_value = new this.dijit_type({
            constraints: max_constraint,
            value: this.value[this.config.end],
            onChange: dojo.hitch(this, function (value) {
                this.value_input.value = this.getValue();
                this.min_value.constraints.max = value;
            })
        }, dojo.create('div', {}, this.domNode));
        this.value_input = dojo.create('input', {
            type: 'hidden',
            name: this.config.name
        }, dojo.create('div', {}, this.domNode));
        
        this.value_input.value = this.getValue();

        this.name = this.config.name

        this.id = this.config.id;

        dijit.registry.add(this);

    },

    getValue: function () {
        var value = {};
        value[this.config.start] = this.conversion(this.min_value.value);
        value[this.config.end] = this.conversion(this.max_value.value);
        return dojo.toJson(value);
    }

});
