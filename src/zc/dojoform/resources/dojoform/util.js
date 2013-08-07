/*global define */
define(
["dojo/_base/array", "dojo/data/ObjectStore", "dojo/store/Memory"],
function (array, ObjectStore, MemoryStore)
{
    var parse_config = function (config, order) {
        var readonly, wconfig;
        readonly = config.readonly !== undefined ? config.readonly : false;
        wconfig = {
            required: config.required,
            id: config.id,
            name: config.name,
            promptMessage: config.hint || config.fieldHint,
            tabIndex: order,
            value: config.value,
            readonly: readonly,
            readOnly: readonly,     // dijit use camels
            left: config.left,
            'class': 'zc-widget'
        };
        return wconfig;
    };

    var parse_number_config = function (config, order) {
        var wconfig, constraints;
        wconfig = parse_config(config, order);
        constraints = {};
        if (config.field_min !== undefined) {
            constraints.min = config.field_min;
        }
        if (config.field_max !== undefined) {
            constraints.max = config.field_max;
        }
        wconfig.constraints = constraints;
        return wconfig;
    };

    var parse_range_config = function (config, order) {
        var wconfig;
        wconfig = parse_number_config(config, order);
        wconfig.start = config.start;
        wconfig.end = config.end;
        wconfig.start_label = config.start_label;
        wconfig.end_label = config.end_label;
        return wconfig;
    };

    var parse_choice_config = function (config, order) {
        var wconfig, data, store;
        wconfig = parse_config(config, order);
        data = array.map(config.values, function (value) {
                             return {id: value[0], label: value[1]};
                         });
        store = new MemoryStore({data: data});

        if (wconfig.value === undefined) {
            wconfig.value = null;
        }
        wconfig.store = new ObjectStore({objectStore: store});
        wconfig.searchAttr = "label";
        return wconfig;
    };

    return {
        parse_config: parse_config,
        parse_number_config: parse_number_config,
        parse_range_config: parse_range_config,
        parse_choice_config: parse_choice_config
    };
});
