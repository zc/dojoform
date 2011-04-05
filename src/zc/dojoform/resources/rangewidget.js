/*global dojo, dijit */

dojo.provide("zc.RangeWidget");
dojo.require("dijit._Widget");

dojo.ready(
    function () {
        dojo.declare(
            "zc.RangeWidget", [dijit._Widget], {

                constructor: function (jsonData, node) {
                    this.config = jsonData.config;
                    this.dijit_type = jsonData.dijit_type;
                    this.convert_to = jsonData.convert_to;
                    this.convert_from = jsonData.convert_from;
                    this.constraints = this.config.constraints;
                    this.name = this.config.name;
                    this.id = this.config.id;
                    this.domNode = node || dojo.create('div');
                    this.inherited(arguments);
                },

                buildRendering: function () {
                    var min_constraint = {};
                    if (this.constraints.min !== undefined) {
                        min_constraint.min = this.constraints.min;
                    }

                    var max_constraint = {};
                    if (this.constraints.max !== undefined) {
                        max_constraint.max = this.constraints.max;
                    }
                    var value = this._values_from(this.config.value);

                    dojo.create(
                        'label', {
                            'innerHTML': this.config.start_label
                        }, dojo.create('div', {}, this.domNode));
                    this.min_value = new this.dijit_type(
                        {
                            constraints: min_constraint,
                            value: value[this.config.start],
                            onChange: dojo.hitch(
                                this, function (value) {
                                    this.max_value.constraints.min = value;
                                    this.onChange(this.get('value'));
                                })
                        }, dojo.create('div', {}, this.domNode));
                    dojo.create('label', {
                                    'innerHTML': this.config.end_label
                                }, dojo.create('div', {}, this.domNode));
                    this.max_value = new this.dijit_type(
                        {
                            constraints: max_constraint,
                            value: value[this.config.end],
                            onChange: dojo.hitch(
                                this, function (value) {
                                    this.min_value.constraints.mac = value;
                                    this.onChange(this.get('value'));
                                })
                        }, dojo.create('div', {}, this.domNode));

                    this.value_input = dojo.create(
                        'input',
                        {
                            type: 'hidden',
                            name: this.name,
                            value: this.get('value')
                        },
                        this.domNode);
                },

                onChange: function (value) {
                    this.value_input.value = value;
                    this.inherited(arguments);
                },

                conversion: function (v) {
                    if (v == '') {
                        v = null;
                    }
                    return v;
                },

                _getValueAttr: function () {
                    var value = {};
                    var min = this.min_value.get('value');
                    value[this.config.start] = this.min_value.value;
                    value[this.config.end] = this.max_value.value;
                    if (this.convert_to) {
                        if (value[this.config.start] != null) {
                            value[this.config.start] =
                                this.convert_to(value[this.config.start]);
                        }
                        if (value[this.config.end] != null) {
                            value[this.config.end] =
                                this.convert_to(value[this.config.end]);
                        }
                    }
                    return dojo.toJson(value);
                },

                _values_from: function (value) {
                    if (value) {
                        value = dojo.fromJson(value);
                        if (this.convert_from) {
                            value[this.config.start] =
                                this.convert_from(value[this.config.start]);
                            value[this.config.end] =
                                this.convert_from(value[this.config.end]);
                        }
                    }
                    else {
                        value = {};
                        value[this.config.start] = null;
                        value[this.config.end] = null;
                    }
                    return value;
                },

                _setValueAttr: function (value) {
                    value = this._values_from(value);
                    this.min_value.set('value', value[this.config.start]);
                    this.max_value.set('value', value[this.config.end]);
                },

                isValid: function () {
                    return this.min_value.isValid() &&
                        this.max_value.isValid() &&
                        (this.min_value.get('value') == null ||
                         this.max_value.get('value') == null ||
                         (this.max_value.get('value') >
                          this.min_value.get('value'))
                         );
                },


                // Note that the methods below are superfluous in
                // forms, since dijit forms will call our subwidgets,
                // but we've implemented them here for completeness
                // and to facilitate stand-alone use.

                validate: function () {
                    return this.min_value.validate() &&
                        this.max_value.validate() &&
                        (this.min_value.get('value') == null ||
                         this.max_value.get('value') == null ||
                         (this.max_value.get('value') >
                          this.min_value.get('value'))
                         );
                },

                reset: function () {
                  this.set('value', this.original);
                },

                focus: function () {
                    if (! this.min_value.isValid()) {
                        this.min_value.focus();
                    }
                    else if (! this.max_value.isValid()) {
                        this.max_value.focus();
                    }
                    else {
                        this.min_value.focus();
                    }
                }

            });
});
