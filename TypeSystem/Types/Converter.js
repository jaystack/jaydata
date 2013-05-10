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
    'default': function(value){
        return value | 0;
    }
});

$data.Container.registerConverter('$data.Number', {
    'default': function(value){
        var r = +value;
        if (isNaN(r)) throw 0;
        return r;
    }
});

$data.Container.registerConverter('$data.Byte', {
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
    '$data.Date': function(value){
        return value;
    },
    'default': function(value){
        var d = new Date(value);
        if (isNaN(d)) throw 0;
        return d;
    }
});

$data.Container.registerConverter('$data.Time', {
    'default': function (value) {
        var d = new Date("0000-01-01T00:00:00.000Z");
        var v = d.getTimezoneOffset();
        var s;

        var timeVal;
        if (value instanceof Date) {
            timeVal = value.toTimeString().split(' ')[0];
            if (value.toISOString().indexOf('.')) {
                timeVal += '.' + ('000' + value.getMilliseconds()).slice(-3);
            }

        } else if (typeof value === 'string' && /^\d\d:\d\d:\d\d(\.\d+)?$/.test(value)) {
            timeVal = value;
        } else {
            var date;
            if ((typeof value === 'string'&& /^(-)?\d{4,6}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)) || 
                (typeof value === 'number' && value >= 0 && value < 24 * 60 * 60 * 1000)) {
                date = new Date(value);
            }

            if(!date || isNaN(date)){
                throw 1;
            } 

            if (typeof value !== 'string')
                date = new Date(date.valueOf() + (v * 60 * 1000));

            timeVal = date.toTimeString().split(' ')[0];
            if (date.toISOString().indexOf('.')) {
                timeVal += '.' + ('000' + date.getMilliseconds()).slice(-3);
            }
        }

        var offset = (v > 0 ? '-' : '+') + ('00' + Math.abs(Math.floor(v / 60))).slice(-2) + ('00' + Math.abs(Math.floor(v % 60))).slice(-2);
        var r = new Date("0000-01-01T" + timeVal + offset);
        if (isNaN(r)) {
            var time = timeVal.split('.');
            r = new Date('Thu Jan 01 1900 ' + time[0] + ' GMT' + offset);
            if (isNaN(r)) throw 0;
              
            if (time[1])
                r.setMilliseconds(parseInt(time[1], 10));
            r.setFullYear(0);

            if (isNaN(r)) throw 0;
        }
        if (value instanceof Date && r.toISOString() === value.toISOString())
            return value;
        else
            return r;
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
    'default': function(value){
        var r = +value;
        if (isNaN(r)) throw 0;
        return $data.IEEE754(r, 8, 23);
    }
});

$data.Container.registerConverter('$data.Int16', {
    'default': function(value){
        var r = (value | 0) & 0xffff;
        if (r >= 0x8000) return r - 0x10000;
        return r;
    }
});

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
    }
});

$data.Container.proxyConverter = function(v){ return v; };
$data.Container.defaultConverter = function(type){ return function(v){ return $data.Container.convertTo(v, type); }; };
