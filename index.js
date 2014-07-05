'use strict';

(function(undefined) {

    var validators = {
        '*': function() {
            return true;
        },
        'array': function(o) {
            return o instanceof Array;
        },
        'function': function(o) {
            return typeof o === 'function';
        },
        'hash': function(o) {
            return Object.prototype.toString.call(o) === '[object Object]';
        },
        'string': function(o) {
            return Object.prototype.toString.call(o) === '[object String]';
        },
        'number': function(o) {
            return !(a === null || isNaN(a));
        },
        'int': function(o) {
            return o == parseInt(o);
        },
        'n-int': function(o) {
            return o == parseInt(o) && o < 0;
        },
        'p-int': function(o) {
            return o == parseInt(o) && o > 0;
        },
        'nn-int': function(o) {
            return o == parseInt(o) && o >= 0;
        },
        'np-int': function(o) {
            return o == parseInt(o) && o <= 0;
        },
        'decimal': function(o) {
            return o == parseFloat(o);
        },
        'n-decimal': function(o) {
            return o == parseFloat(o) && o < 0;
        },
        'p-decimal': function(o) {
            return o == parseFloat(o) && o > 0;
        },
        'nn-decimal': function(o) {
            return o == parseFloat(o) && o >= 0;
        },
        'np-decimal': function(o) {
            return o == parseFloat(o) && o <= 0;
        }
    };

    function getPcs(list) {
        // possible configurations
        var pcs = [];
        pcs.push([]);
        list.forEach(function(item) {
            var _pcs = [];
            pcs.forEach(function(pc, j) {
                for (var i = 0; i < item.types.length; i++) _pcs.push(pc.slice());
            });
            _pcs.forEach(function(pc, i) {
                var type = item.types[i % item.types.length];
                pc.push({
                    name: item.name,
                    type: type,
                    validator: validators[type]
                });
            });
            if (item.optional) {
                pcs = pcs.concat(_pcs);
            } else {
                pcs = _pcs;
            }
        });
        return pcs;
    }

    function match(pcs, args) {
        var res = [];
        pcs.filter(function(pc) {
            return pc.length === args.length;
        }).forEach(function(pc) {
            for (var i = 0; i < pc.length; i++)
                if (!pc[i].validator(args[i]))
                    return;
            res.push(pc);
        });
        return res;
    }

    module.exports = function(list) {
        var pcs = getPcs(list.map(function(item) {
            if (!item.types) item.types = [item.type];
            return item;
        }));
        return function dis(args, success, error) {
            args = Array.prototype.slice.call(args, 0);
            var matchedPcs = match(pcs, args);
            if (matchedPcs.length === 1) {
                var mpc = matchedPcs[0];
                var _args = [];
                list.forEach(function(item) {
                    for (var i = 0; i < mpc.length; i++) {
                        if (mpc[i].name === item.name) {
                            _args.push(args[i]);
                            return;
                        }
                    }
                    _args.push(item.default);
                });
                success.apply(null, _args);
            } else if (matchedPcs.length === 0) {
                error("Unkown arguments configuration");
            } else {
                error("Arguments ambiguity");
            }
        };
    };

})(void 0);
