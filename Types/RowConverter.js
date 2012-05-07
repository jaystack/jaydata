$data.Class.define('$data.RowConverter', null, null,
{
    ///<signature>
    ///<summary>Row converter helper class</summary>
    ///</signature>
    constructor: function(){
        
    },
    toJSON: function (rows, metadata) {
        ///<signature>
        ///<summary>Converts flat rows to JSON object data</summary>
        ///<param name="rows" type="Array">Array of objects containing the data fields</param>
        ///<param name="metadata" type="Array">Array of entity descriptors ex. { keys: ['Id'], propertyName: 'Articles', mapping: { Id: 'Articles__Id', Title: 'Articles__Title' }</param>
        ///</signature>
        //return array of root objects
        var ret = [];
        //will contain unique entity data
        var cache = {};

        //recursive uploader of the result object
        var deepExtend = function(ta, c){
            if (!this[ta[0]]) this[ta[0]] = [];
            if (ta.length > 1) deepExtend.apply(this[ta[0]][this[ta[0]].length - 1], [ta.slice(1), c]);
            else this[ta[0]].push(c);
        }

		var deepExtendObject = function(ta, c){
            if (!this[ta[0]]) this[ta[0]] = [];
            if (ta.length > 1) deepExtendObject.apply(this[ta[0]][this[ta[0]].length - 1], [ta.slice(1), c]);
            else this[ta[0]] = c;
        }

        //generating unique cache data
        for (var i = 0; i < rows.length; i++){
            var a = rows[i];

            for (var j = 0; j < metadata.length; j++){
                var d = metadata[j];
                //primary key of cache data
                var pk = '';
                for (var k = 0; k < d.keys.length; k++){
                    pk += ('_' + a[d.keys[k]]);
                }
                //new object data
                var node = {};
                for (var k in d.mapping){
                    node[k] = a[d.mapping[k]];
                }
                //cache key
                var ck = ('_' + (d.propertyName || '') + pk);
                //store in cache
                if (!cache[ck]) cache[ck] = node;
            }
        }

        for (var i = 0; i < rows.length; i++){
            var a = rows[i];
            //root object data
            var root;
            for (var j = 0; j < metadata.length; j++){
                var d = metadata[j];
                //primary key of cache data
                var pk = '';
                for (var k = 0; k < d.keys.length; k++){
                    pk += ('_' + a[d.keys[k]]);
                }
                //cache key
                var ck = ('_' + (d.propertyName || '') + pk);
                if (!d.propertyName){
                    //assign root object
                    root = cache[ck];
                    //push root into result set
                    if (ret.indexOf(cache[ck]) < 0) ret.push(cache[ck]);
                }else{
                    //call uploader
                    //split property name to make chain
                    var ta = d.propertyName.split('.');
                    //extend root object on chain
					if (d.propertyType == 'object') deepExtendObject.apply(root, [ta, cache[ck]]);
                    else deepExtend.apply(root, [ta, cache[ck]]);
                }
            }
        }

        //return result set
        return ret;
    }
});