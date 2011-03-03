djConfig.hostEnv = 'ff_ext';
djConfig.locale = 'en-us';
//navigator.language = "en-US";

var Components = function () {

    var defile_url = function (uri) {
        if (uri.slice(0, 7) == 'file://') {
            return uri.slice(7);
        }
        else if (uri.slice(0, 5) == 'file:') {
            // dojo is wack.
            return uri.slice(5);
        }
        return uri;
    };

    var Channel = function (uri) {
        this.uri = uri;
    };
    Channel.prototype = {
        open: function () {return this; },
        available: function () {},
        close: function () {}
    };
    var stream_uri;

    var services = {
        nsIConsoleService: {
            logStringMessage: print
        },
        nsIIOService: {
            newChannel: function (uri) {
                console.debug('Opening: '+uri);
                return new Channel(defile_url(uri));
            }
        },
        nsIScriptableInputStream: {
            init: function (ios) {
                stream_uri = ios.uri;
            },
            read: function () {
                var f = python.open(stream_uri);
                var r = f.read();
                f.close();
                return r;
            },
            close: function () {}
        },
        mozIJSSubScriptLoader: {
            loadSubScript: function (uri, g) {
                console.debug('mozloading '+uri);
                return load(defile_url(uri));
            }
        },
        z: 0
    };
    var service_gettr = {
        getService: function (i) {
            return services[i];
        }
    };

    return {
        classes: {
            "@mozilla.org/consoleservice;1": service_gettr,
            "@mozilla.org/moz/jssubscript-loader;1": service_gettr,
            "@mozilla.org/network/io-service;1":  service_gettr,
            "@mozilla.org/scriptableinputstream;1": service_gettr
        },
        interfaces: {
            nsIConsoleService: 'nsIConsoleService',
            nsIIOService: 'nsIIOService',
            nsIScriptableInputStream: 'nsIScriptableInputStream',
            mozIJSSubScriptLoader: 'mozIJSSubScriptLoader'
        }
    };
}();

var own_properties = function (o, sort) {
    var name, result = [];
    for (name in o) {
        if (o.hasOwnProperty(name)) {
            result.push(name);
        }
    }
    if (sort) {
        result.sort();
    }
    return result;
};


function pprint(pname, ob, indent) {
    var print = ! indent, out = [], i, name, names;

    if (! indent) {
        indent = pname ? '  ' : '';
    }
    if (pname) {
        out.push(pname+': ');
    }
    else {
        out.push(indent);
    }
    if (dojo.isArray(ob)) {
        if (ob.length == 0) {
            out.push('[]');
        }
        else {
            out.push('[\n');
            for(i = 0; i < ob.length; i++) {
                out.push(pprint('', ob[i], indent+'  '));
                out.push(',\n');
            }
            out.pop();
            out.push(' ]');
        }
    }
    else if (dojo.isFunction(ob) || ! ob || ! dojo.isObject(ob)) {
        out.push(dojo.toJson(ob));
    }
    else {
        names = [];
        for (name in ob) {
            if (ob.hasOwnProperty(name)) {
                names.push(name);
            }
        }
        if (names.length == 0)
            out.push('{}');
        else {
            names.sort();
            if (pname) {
                out.push('{\n');
                i = indent+'  ';
            }
            else {
                out.push('{');
                i = ' ';
            }
            dojo.forEach(
                names, function (name) {
                    out.push(i);
                    out.push(pprint(name, ob[name], indent+'  '));
                    i = indent+'  ';
                    out.push(',\n');
                });
            out.pop();
            out.push(' }');
            }
    }
    out = out.join('');
    if (print) {
        console.log(out);
        return undefined;
    }
    return out;
}
