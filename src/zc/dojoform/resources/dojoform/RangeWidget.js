/*global define */
define(
[
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/data/ObjectStore",
    "dojo/dom-construct",
    "dojo/json",
    "dijit/_Container",
    "dijit/_Widget",
    "dijit/form/_FormMixin"
], function (declare, lang, ObjectStore, domConstruct,
             json, _Container, _Widget, _FormMixin)
{
    return declare(
        [_Widget, _Container, _FormMixin], {

            value: "",

            declaredClass: "zc.dojoform.RangeWidget",

            constructor: function (params, srcNodeRef) {
                this.config = params.config;
                this.dijit_type = params.dijit_type;
                this.convert_to = params.convert_to;
                this.convert_from = params.convert_from;
                this.constraints = this.config.constraints;
                this.name = this.config.name;
                this.id = this.config.id;
            },

            buildRendering: function () {
                this.inherited(arguments);
                var min_constraint = {}, max_constraint = {}, value;
                if (this.constraints.min !== undefined) {
                    min_constraint.min = this.constraints.min;
                    max_constraint.min = this.constraints.min;
                }

                if (this.constraints.max !== undefined) {
                    min_constraint.max = this.constraints.max;
                    max_constraint.max = this.constraints.max;
                }
                value = this._values_from(this.config.value);

                domConstruct.create(
                    'label', {
                        'innerHTML': this.config.start_label
                    }, domConstruct.create('div', {}, this.domNode));
                this.min_value = new this.dijit_type(
                    {
                        constraints: min_constraint,
                        name: this.config.start,
                        value: value[this.config.start],
                        onChange: lang.hitch(
                            this, function (value) {
                                if (value || value === 0) {
                                    var min_con = value;
                                    if (this.constraints.min) {
                                        if (this.constraints.min >
                                            min_con) {
                                            min_con = this.constraints.min;
                                        }
                                    }
                                    this.max_value.constraints.min =
                                        min_con;
                                    this.onChange(this.get('value'));
                                    this.max_value.validate();
                                }
                            })
                    }, domConstruct.create('div', {}, this.domNode));
                domConstruct.create(
                    'label', {
                        'innerHTML': this.config.end_label
                    }, domConstruct.create('div', {}, this.domNode));
                this.max_value = new this.dijit_type(
                    {
                        constraints: max_constraint,
                        name: this.config.end,
                        value: value[this.config.end],
                        onChange: lang.hitch(
                            this, function (value) {
                                if (value || value === 0) {
                                    var max_con = value;
                                    if (this.constraints.max) {
                                        if (this.constraints.max <
                                            max_con) {
                                            max_con = this.constraints.max;
                                        }
                                    }
                                    this.min_value.constraints.max =
                                        max_con;
                                    this.onChange(this.get('value'));
                                    this.min_value.validate();
                                }
                            })
                    }, domConstruct.create('div', {}, this.domNode));

                this.value_input = domConstruct.create(
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
                if (v === '') {
                    v = null;
                }
                return v;
            },

            _getValueAttr: function () {
                var value = this.inherited(arguments);

                if (isNaN(value[this.config.start])) {
                    value[this.config.start] = null;
                }

                if (isNaN(value[this.config.end])) {
                    value[this.config.end] = null;
                }
                if (this.convert_to) {
                    if (value[this.config.start] !== null) {
                        value[this.config.start] =
                            this.convert_to(value[this.config.start]);
                    }
                    if (value[this.config.end] !== null) {
                        value[this.config.end] =
                            this.convert_to(value[this.config.end]);
                    }
                }
                return json.stringify(value);
            },

            _values_from: function (value) {
                if (value) {
                    if (!lang.isObject(value)) {
                        value = json.parse(value);
                    }
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
                this.inherited(arguments, [this._values_from(value)]);
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
