exports.LoadJson = function (filePath, defaultData) {
    try {
        var data = require(filePath);
        if (data) {
            var keys = Object.keys(data);
            if (keys.length === 1)
                return data[keys[0]];
            else
                return data;
        }
    } catch (e) {
        if (typeof defaultData === 'function')
            return defaultData();
        else
            return defaultData;
    }
}