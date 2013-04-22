$data.Blob = function Blob(){};

$data.Blob.createFromHexString = function(value){
    if (value != value.match(new RegExp('[0-9a-fA-F]+'))[0]){
        Guard.raise(new Exception('TypeError: ', 'value not convertable to $data.Blob', value));
    }else{
        if (value.length & 1) value = '0' + value;
        var arr = new Uint8Array(value.length >> 1);
        for (var i = 0, j = 1, k = 0; i < value.length; i += 2, j += 2, k++){
            arr[k] = parseInt('0x' + value[i] + value[j], 16);
        }
        
        return new $data.Blob(arr).toString();
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
        s += value[i].toString(16);
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
        return new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)(new Float64Array([value]).buffer);
    },
    'default': function(value){
        if (typeof Blob !== 'undefined' && value instanceof Blob){
            var req = new XMLHttpRequest();
            req.open('GET', URL.createObjectURL(value), false);
            req.send(null);
            return $data.Container.convertTo(req.responseText, $data.Blob);
        } else if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
            return new $data.Blob(value);
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
