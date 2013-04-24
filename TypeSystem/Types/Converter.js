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
    /*'$data.Boolean': function(value){
        return value ? 1 : 0;
    },*/
    'default': function(value){
        return value | 0;
    }
    /*'$data.Number': function(value){
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
    }*/
});

$data.Container.registerConverter('$data.Number', {
    /*'$data.Boolean': function(value){
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
    }*/
    'default': function(value){
        var r = +value;
        if (isNaN(r)) throw 0;
        return r;
    }
});

$data.Container.registerConverter('$data.Byte', {
    /*'$data.Boolean': function(value){
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
    }*/
    'default': function(value){
        return (value | 0) & 0xff;
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
    'default': function(value){
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

        var s = new Date(0, 0, 0).toISOString();
        var r = new Date(s.split('T')[0] + 'T' + value + 'Z');
        if (isNaN(r)) throw 0;
        return r;
    },
    'default': function(value){
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

$data.packIEEE754 = function(v, ebits, fbits){
    var bias = (1 << (ebits - 1)) - 1, s, e, f, ln, i, bits, str, bytes;

    // Compute sign, exponent, fraction
    if (v !== v){
        // NaN
        // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
        e = (1 << bias) - 1; f = Math.pow(2, fbits - 1); s = 0;
    }else if (v === Infinity || v === -Infinity){
        e = (1 << bias) - 1; f = 0; s = (v < 0) ? 1 : 0;
    }else if (v === 0){
        e = 0; f = 0; s = (1 / v === -Infinity) ? 1 : 0;
    }else{
        s = v < 0;
        v = Math.abs(v);

        if (v >= Math.pow(2, 1 - bias)){
            // Normalized
            ln = Math.min(Math.floor(Math.log(v) / Math.LN2), bias);
            e = ln + bias;
            f = Math.round(v * Math.pow(2, fbits - ln) - Math.pow(2, fbits));
        }else{
            // Denormalized
            e = 0;
            f = Math.round(v / Math.pow(2, 1 - bias - fbits));
        }
    }

    // Pack sign, exponent, fraction
    bits = [];
    for (i = fbits; i; i -= 1) { bits.push(f % 2 ? 1 : 0); f = Math.floor(f / 2); }
    for (i = ebits; i; i -= 1) { bits.push(e % 2 ? 1 : 0); e = Math.floor(e / 2); }
    bits.push(s ? 1 : 0);
    bits.reverse();
    str = bits.join('');

    // Bits to bytes
    bytes = [];
    while (str.length){
        bytes.push(parseInt(str.substring(0, 8), 2));
        str = str.substring(8);
    }
    
    return bytes;
};

$data.unpackIEEE754 = function(bytes, ebits, fbits){
    // Bytes to bits
    var bits = [], i, j, b, str, bias, s, e, f;

    for (i = bytes.length; i; i -= 1){
        b = bytes[i - 1];
        for (j = 8; j; j -= 1){
            bits.push(b % 2 ? 1 : 0); b = b >> 1;
        }
    }
    bits.reverse();
    str = bits.join('');

    // Unpack sign, exponent, fraction
    bias = (1 << (ebits - 1)) - 1;
    s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
    e = parseInt(str.substring(1, 1 + ebits), 2);
    f = parseInt(str.substring(1 + ebits), 2);

    // Produce number
    if (e === (1 << ebits) - 1){
        return f !== 0 ? NaN : s * Infinity;
    }else if (e > 0){
        // Normalized
        return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
    }else if (f !== 0){
        // Denormalized
        return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
    }else{
        return s < 0 ? -0 : 0;
    }
};

$data.IEEE754 = function(v, e, f){
    return $data.unpackIEEE754($data.packIEEE754(v, e, f), e, f);
};

$data.Container.registerConverter('$data.Float', {
    /*'$data.Boolean': function(value){
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
    }*/
    'default': function(value){
        var r = +value;
        if (isNaN(r)) throw 0;
        return $data.IEEE754(r, 8, 23);
    }
});

$data.Container.registerConverter('$data.Int16', {
    /*'$data.Boolean': function(value){
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
    }*/
    'default': function(value){
        var r = (value | 0) & 0xffff;
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
        var r = value.toString();
        if (r.indexOf('.') > 0) return r.split('.')[0];
        if (r.indexOf('.') == 0) throw 0;
        return r;
    },
    '$data.String': function(value){
        if (!/^\-?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) throw 0;
        if (value.indexOf('.') > 0) return value.split('.')[0];
        if (value.indexOf('.') == 0) throw 0;
        return value;
    },
    '$data.Date': function(value){
        var r = value.valueOf();
        if (isNaN(r)) throw 0;
        return r.toString();
    }
});

$data.Container.registerConverter('$data.SByte', {
    /*'$data.Boolean': function(value){
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
    }*/
    'default': function(value){
        var r = (value | 0) & 0xff;
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
        if (typeof value === 'object') return JSON.stringify(value);
        return value.toString();
    }
});

$data.Container.registerConverter('$data.Object', {
    '$data.String': function(value){
        return JSON.parse(value);
    },
    '$data.Function': function(){
        throw 0;
    }
});

$data.Container.registerConverter('$data.Array', {
    '$data.String': function(value){
        var r = JSON.parse(value);
        if (!Array.isArray(r)) throw 0;
        return r;
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
