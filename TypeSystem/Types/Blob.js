$data.Blob = function Blob(value){
    this.value = new Uint8Array(value);
};

$data.Blob.prototype = {
    valueOf: function(){
        return this.value;
    },
    toString: function(){
        var s = '';
        for (var i = 0; i < this.value.length; i++){
            s += String.fromCharCode(this.value[i]);
        }
        
        return s;
    },
    toJSON: function(){
        return btoa(this.toString());
    },
    toHexString: function(){
        var s = '';
        for (var i = 0; i < this.value.length; i++){
            s += this.value[i].toString(16);
        }
        
        return s.toUpperCase();
    }
};

$data.Blob.createFromHexString = function(value){
    if (value != value.match(new RegExp('[0-9a-fA-F]+'))[0]){
        Guard.raise(new Exception('TypeError: ', 'value not convertable to $data.Date', value));
    }else{
        if (value.length & 1) value = '0' + value;
        var arr = new Uint8Array(value.length >> 1);
        for (var i = 0, j = 1, k = 0; i < value.length; i += 2, j += 2, k++){
            arr[k] = parseInt('0x' + value[i] + value[j], 16);
        }
        
        return new $data.Blob(arr);
    }
};

$data.Container.registerType(["$data.Blob", "blob", "JayBlob"], $data.Blob);
$data.Container.registerConverter('$data.Blob',{
    '$data.String': function (value){
        if (value && value.length){
            var blob = new $data.Blob(value.length);
            for (var i = 0; i < value.length; i++){
                blob.value[i] = value.charCodeAt(i);
            }
            
            return blob;
        }else return null;
    },
    '$data.Array': function(value){
        return new $data.Blob(value);
    },
    '$data.Number': function(value){
        return new $data.Blob(new Uint8Array(new Float64Array([value]).buffer));
    },
    'default': function(value){
        throw 0;
    }
}, {
    '$data.String': function(value){
        return value.toString();
    },
    '$data.Array': function(value){
        var src = value.valueOf();
        var arr = new Array(src.length);
        for (var i = 0; i < src.length; i++){
            arr[i] = src[i];
        }
        
        return arr;
    }
});
