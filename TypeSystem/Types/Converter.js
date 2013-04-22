$data.Container.registerConverter('$data.Boolean', {
    '$data.String': function(value){
        if (value.toLowerCase() == 'true') return true;
        if (value.toLowerCase() == 'false') return false;
        
        return !!value;
    },
    'default': function(value){
        return !!value;
    }
});

$data.Container.registerConverter('$data.Integer', {
    '$data.Boolean': function(value){
        return value ? 1 : 0;
    },
    '$data.Number': function(value){
        return value | 0;
    },
    '$data.String': function(value){
        var r = parseInt(value, 10);
        if (isNaN(r)) throw 0;
        return r | 0;
    },
    '$data.Date': function(value){
        var r = value.valueOf();
        if (isNaN(r)) throw 0;
        return r;
    }
});

$data.Container.registerConverter('$data.Number', {
    '$data.Boolean': function(value){
        return value ? 1 : 0;
    },
    '$data.String': function(value){
        var r = parseFloat(value);
        if (isNaN(r)) throw 0;
        return r;
    },
    '$data.Date': function(value){
        var r = value.valueOf();
        if (isNaN(r)) throw 0;
        return r;
    }
});

$data.Container.registerConverter('$data.Byte', {
    '$data.Boolean': function(value){
        return value ? 1 : 0;
    },
    '$data.Number': function(value){
        return (value | 0) & 0xff;
    },
    '$data.String': function(value){
        var r = parseInt(value);
        if (isNaN(r)) throw 0;
        return r & 0xff;
    },
    '$data.Decimal': function(value){
        var r = parseInt(value.split('.')[0]);
        if (isNaN(r)) throw 0;
        return r & 0xff;
    },
    '$data.Date': function(value){
        var r = value.valueOf();
        if (isNaN(r)) throw 0;
        return r & 0xff;
    }
});

$data.Container.registerConverter('$data.Date', {
    'default': function(value){
        var d = new Date(value);
        if (isNaN(d)) throw 0;
        return d;
    }
});

$data.Container.registerConverter('$data.DateTimeOffset', {
    'default': function (value) {
        var d = new Date(value);
        if (isNaN(d)) throw 0;
        return d;
    }
});

$data.Container.registerConverter('$data.Time', {
    '$data.String': function (value) {
        try {
            var d = new Date(value);
            if (!isNaN(d)) return d;
        } catch (e) { }

        var s = new Date().toISOString();
        var r = new Date(s.split('T')[0] + 'T' + value + 'Z');
        if (isNaN(r)) throw 0;
        return r;
    },
    'default': function (value) {
        var d = new Date(value);
        if (isNaN(d)) throw 0;
        return d;
    }
});

$data.Container.registerConverter('$data.Decimal', {
    '$data.Boolean': function(value){
        return value ? '1' : '0';
    },
    '$data.Number': function(value){
        return value.toString();
    },
    '$data.String': function(value){
        if (!/^\-?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) throw 0;
        return value;
    },
    '$data.Date': function(value){
        var r = value.valueOf();
        if (isNaN(r)) throw 0;
        return r.toString();
    }
});

$data.Container.registerConverter('$data.Float', {
    '$data.Boolean': function(value){
        return value ? 1 : 0;
    },
    '$data.Number': function(value){
        return new Float32Array([value])[0];
    },
    '$data.String': function(value){
        if (!/^\-?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) throw 0;
        return new Float32Array([parseFloat(value)])[0];
    },
    '$data.Date': function(value){
        var r = value.valueOf();
        if (isNaN(r)) throw 0;
        return new Float32Array([r])[0];
    }
});

$data.Container.registerConverter('$data.Int16', {
    '$data.Boolean': function(value){
        return value ? 1 : 0;
    },
    '$data.Number': function(value){
        var r = value & 0xffff;
        if (r >= 0x8000) return r - 0x10000;
        return r;
    },
    '$data.String': function(value){
        if (!/^\-?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) throw 0;
        var r = parseInt(value, 10) & 0xffff;
        if (r >= 0x8000) return r - 0x10000;
        return r;
    },
    '$data.Date': function(value){
        var r = value.valueOf();
        if (isNaN(r)) throw 0;
        r = r & 0xffff;
        if (r >= 0x8000) return r - 0x10000;
        return r;
    }
});

/*$data.Container.registerConverter('$data.Int32', {
    '$data.Boolean': function(value){
        return value ? 1 : 0;
    },
    '$data.Number': function(value){
        var r = value & 0xffffffff;
        return r;
    },
    '$data.String': function(value){
        if (!/^\-?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) throw 0;
        var r = parseInt(value, 10) & 0xffffffff;
        return r;
    },
    '$data.Date': function(value){
        var r = value.valueOf();
        if (isNaN(r)) throw 0;
        r = r & 0xffffffff;
        return r;
    }
});*/

$data.Container.registerConverter('$data.Int64', {
    '$data.Boolean': function(value){
        return value ? '1' : '0';
    },
    '$data.Number': function(value){
        return value.toString();
    },
    '$data.String': function(value){
        if (!/^\-?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) throw 0;
        return value;
    },
    '$data.Date': function(value){
        var r = value.valueOf();
        if (isNaN(r)) throw 0;
        return r.toString();
    }
});

$data.Container.registerConverter('$data.SByte', {
    '$data.Boolean': function(value){
        return value ? 1 : 0;
    },
    '$data.Number': function(value){
        var r = value & 0xff;
        if (r >= 0x80) return r - 0x100;
        return r;
    },
    '$data.String': function(value){
        if (!/^\-?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) throw 0;
        var r = parseInt(value, 10) & 0xff;
        if (r >= 0x80) return r - 0x100;
        return r;
    },
    '$data.Date': function(value){
        var r = value.valueOf();
        if (isNaN(r)) throw 0;
        r = r & 0xff;
        if (r >= 0x80) return r - 0x100;
        return r;
    }
});

$data.Container.registerConverter('$data.String', {
    '$data.Date': function(value){
        return value.toISOString();
    },
    '$data.ObjectID': function(value){
        return btoa(value.toString());
    },
    'default': function(value){
        return value.toString();
    }
});

$data.Container.registerConverter('$data.Object', {
    '$data.String': function(value){
        return JSON.parse(value);
    }
});

$data.Container.registerConverter('$data.Array', {
    '$data.String': function(value){
        return JSON.parse(value);
    }
});

$data.Container.registerConverter('$data.ObjectID', {
    '$data.ObjectID': function(value){
        try{
            return btoa(value.toString());
        }catch(e){
            return value;
        }
    },
    '$data.String': function(id){
        return id;
        /*if (id && typeof id === 'string'){
            try{
                return new $data.ObjectID(id);
            }catch(e){
                try{
                    return new $data.ObjectID(new Buffer(id, 'base64').toString('ascii'));
                }catch(e){
                    console.log(e);
                    return id;
                }
            }
        }else return id;*/
    }
});

$data.Container.proxyConverter = function(v){ return v; };
$data.Container.defaultConverter = function(type){ return function(v){ return $data.Container.convertTo(v, type); }; };
