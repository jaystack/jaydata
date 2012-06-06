$data.Class.define('$data.dbClient.jayStorageClient.JayStorageCommand', $data.dbClient.DbCommand, null,
{
    constructor: function (con, queryStr, params) {
        this.query = queryStr;
        this.connection = con;
        this.parameters = params;
    },
    executeNonQuery: function (callback) {
        // TODO
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    executeQuery: function (callback) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    exec: function (query, parameters, callback, errorhandler) {
        if (parameters == null || parameters == undefined) {
            parameters = {};
        }
        var single = false;
        if (!(query instanceof Array)) {
            single = true;
            query = [query];
            parameters = [parameters];
        }

        var provider = this;
        var results = [];
        var remainingCommands = query.length;
        var decClb = function () {
            if (--remainingCommands == 0) {
                callback(single ? results[0] : results);
            }
        };

		query.forEach(function(q, i){
			if (q){
				$data.ajax({
					url: 'http' + (this.connection.connectionParams.storage.ssl ? 's' : '') + '://' + this.connection.connectionParams.storage.src.replace('http://', '').replace('https://', '') + '?db=' + this.connection.connectionParams.storage.key,
					type: 'POST',
					headers: {
						'X-PINGOTHER': 'pingpong'
					},
					data: { query: q, parameters: parameters[i] },
					dataType: 'json',
					contentType: 'application/json;charset=UTF-8',
					success: function(data){
						if (data && data.error){
							console.log('JayStorage error', data.error);
							errorhandler(data.error);
							return;
						}
						if (this.lastID){
							results[i] = { insertId: this.lastID, rows: (data || { rows: [] }).rows };
						}else results[i] = { rows: (data || { rows: [] }).rows };
 						decClb();
					}
				});
			}else{
				results[i] = null;
				decClb();
			}
		}, this);
    }
}, null);