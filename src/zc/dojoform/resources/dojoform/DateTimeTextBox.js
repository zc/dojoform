/*global define */
define(
[
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/date/stamp",
    "dojo/dom-construct",
    "dijit/_Container",
    "dijit/_Widget",
    "dijit/form/_FormMixin",
    "dijit/form/DateTextBox",
    "dijit/form/TimeTextBox",
    "dojox/form/TimeSpinner",
    "./widgets",
    "./util"
], function (
    declare, lang, stamp, domConstruct, _Container, _Widget, _FormMixin,
    DateTextBox, TimeTextBox, TimeSpinner, widgets, util)
{
    var DateTimeTextBox = declare(
        [_Widget, _Container, _FormMixin], {
            declaredClass: "zc.dojoform.DateTimeTextBox",
            value: null,
            buildRendering: function () {
                this.inherited(arguments);
                this.value_node = domConstruct.create(
                    "input",
                    {
                        type: "hidden",
                        name: this.name,
                        value: stamp.toISOString(this.value)},
                    this.containerNode);
                var node = domConstruct.create("div", null, this.containerNode),
                onChange = lang.hitch(this, "onChange");
                domConstruct.create("span", {innerHTML: "Date:"}, node);
                this.date_box = new DateTextBox(
                    {
                        name: "date",
                        value: this.value,
                        onChange: onChange
                    }).placeAt(node);
                node = domConstruct.create("div", null, this.containerNode);
                domConstruct.create("span", {innerHTML: "Time:"}, node);
                this.time_box = new TimeSpinner(
                    {
                        name: "time",
                        value: this.value,
                        onChange: onChange
                    }).placeAt(node);
            },
            _getValueAttr: function () {
                return this.value_node.value;
            },
            onChange: function () {
                var date = this.date_box.get("value"),
                time = this.time_box.get("value"),
                d = new Date(date.getFullYear(),
                             date.getMonth(),
                             date.getDate(),
                             time.getHours(),
                             time.getMinutes(),
                             time.getSeconds());
                this.value_node.value = stamp.toISOString(d);
            }
        });

    widgets['Datetime'] = function (
        config, node, order, readOnly) {
        var wconfig = util.parse_config(config, order),
        widget;
        wconfig.value = wconfig.value ?
            stamp.fromISOString(wconfig.value) : new Date();
        widget = new DateTimeTextBox(
            wconfig, domConstruct.create('div', null, node));
        return widget.domNode;
    };


    return DateTimeTextBox;
});
