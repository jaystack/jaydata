
var strategy = {
    name: 'empty',
    condition: function (provider, convertedItems) {
        return true;
    },
    save: function (provider, convertedItems, callBack) {
        callBack.success(0);
    }
}


export { strategy }