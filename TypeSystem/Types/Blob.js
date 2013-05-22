$data.Blob = function Blob(){};

$data.Blob.createFromHexString = function(value){
    if (value != value.match(new RegExp('[0-9a-fA-F]+'))[0]){
        Guard.raise(new Exception('TypeError: ', 'value not convertable to $data.Blob', value));
    }else{
        //if (value.length & 1) value = '0' + value;
        var arr = new (typeof Buffer != 'undefined' ? Buffer : Uint8Array)(value.length >> 1);
        for (var i = 0, j = 1, k = 0; i < value.length; i += 2, j += 2, k++) {
            arr[k] = parseInt('0x' + value[i] + value[j], 16);
        }

        return arr;
    }
};

$data.Blob.toString = function(value){
    if (!value || !value.length) return null;
    var s = '';
    for (var i = 0; i < value.length; i++){
        s += String.fromCharCode(value[i]);
    }
    
    return s;
};

$data.Blob.toBase64 = function(value){
    if (!value || !value.length) return null;
    return btoa($data.Blob.toString(value));
};

$data.Blob.toArray = function(src){
    if (!src || !src.length) return null;
    var arr = new Array(src.length);
    for (var i = 0; i < src.length; i++){
        arr[i] = src[i];
    }
    
    return arr;
};

/*$data.Blob.toJSON = function(value){
    return JSON.stringify($data.Blob.toArray(value));
};*/

$data.Blob.toHexString = function(value){
    if (!value || !value.length) return null;
    var s = '';
    for (var i = 0; i < value.length; i++){
        s += ('00' + value[i].toString(16)).slice(-2);
    }
    
    return s.toUpperCase();
};

$data.Blob.toDataURL = function(value){
    if (!value || !value.length) return null;
    return 'data:application/octet-stream;base64,' + btoa($data.Blob.toString(value));
};

$data.Container.registerType(["$data.Blob", "blob", "JayBlob"], $data.Blob);
$data.Container.registerConverter('$data.Blob',{
    '$data.String': function (value){
        if (value && value.length){
            var blob = new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)(value.length);
            for (var i = 0; i < value.length; i++){
                blob[i] = value.charCodeAt(i);
            }
            
            return blob;
        }else return null;
    },
    '$data.Array': function(value){
        return new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)(value);
    },
    '$data.Number': function(value){
        return new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)($data.packIEEE754(value, 11, 52).reverse());
    },
    '$data.Boolean': function(value){
        return new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([value | 0]);
    },
    'default': function(value){
        if (typeof Blob !== 'undefined' && value instanceof Blob){
            var req = new XMLHttpRequest();
            req.open('GET', URL.createObjectURL(value), false);
            req.responseType = 'arraybuffer';
            req.send(null);
            return $data.Container.convertTo(req.response, $data.Blob);
        } else if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
            return new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)(new Uint8Array(value));
        }else if (value instanceof Uint8Array){
            if (typeof Buffer !== 'undefined') return new Buffer(value);
            else return value;
        }else if (typeof Buffer !== 'undefined' ? value instanceof Buffer : false){
            return value;
        }else if (value.buffer){
            return new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)(value);
        }else if (typeof value == 'object' && value instanceof Object){
            var arr = [];
            for (var i in value){
                arr[i] = value[i];
            }
            if (!arr.length) throw 0;
            return new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)(arr);
        }
        throw 0;
    }
}, {
    '$data.String': function(value){
        return $data.Blob.toString(value);
    },
    '$data.Array': function(value){
        return $data.Blob.toArray(value);
    }
});
