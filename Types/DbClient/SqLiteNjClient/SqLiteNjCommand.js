$data.Class.define('$data.dbClient.sqLiteNJClient.SqLiteNjCommand', $data.dbClient.DbCommand, null,
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
		if (!this.connection._executeHelper.isRunning){
			//console.log('not running, executing query');
			this.exec(this.query, this.parameters, callback.success, callback.error);
		} else {
			//console.log('running, queue query');
			this.connection._executeHelper.queue.push({
				that : this,
				callback : callback
			});			
		}
    },
	_executeNext : function(){
		//console.log('running, dequeue query');
		var next = this.connection._executeHelper.queue.shift();
		var that = next.that;
		var callback = next.callback;
		setTimeout(function(){
			that.exec(that.query, that.parameters, callback.success, callback.error);
		},0);
	},
    exec: function (query, parameters, callback, errorhandler) {
		this.connection._executeHelper.isRunning = true;
        if (!this.connection.isOpen()) {
            this.connection.open();
        }
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
        var remainingCommands = 0;
		var isErrorHappened = false;
        var decClb = function () {
            if (--remainingCommands == 0) {
				if(isErrorHappened){
					provider.connection.database.exec('ROLLBACK');
					if (provider.connection._executeHelper.queue.length){
						provider._executeNext();
					} else {
						provider.connection._executeHelper.isRunning = false;
						//console.log('finish queque');
					}
				} else {
					provider.connection.database.exec('COMMIT');
					try {
						callback(single ? results[0] : results);
					} finally {
						if (provider.connection._executeHelper.queue.length){
							provider._executeNext();
						} else {
							provider.connection._executeHelper.isRunning = false;
							//console.log('finish queque');
						}
					}
				}
            }
        };
        provider.connection.database.exec('BEGIN');
		remainingCommands = query.length;
        query.forEach(function (q, i) {
            if (q) {
                var sqlClb = function (error, rows) {
                    if (error != null) {
						try {
							isErrorHappened = true;
							errorhandler(error);
						} finally {
							//console.log('error',error,q);
							decClb();
						}
                        return;
                    }
                    if (this.lastID) {
                        results[i] = { insertId: this.lastID, rows: [] };
                    } else {
                        results[i] = { rows: rows };
                    }
                    decClb();
                };

                var stmt = provider.connection.database.prepare(q, parameters[i]);
                if (q.indexOf('SELECT') == 0) {
                    stmt.all(sqlClb);
                } else {
                    stmt.run(sqlClb);
                }
                stmt.finalize();
            } else {
                results[i] = null;
                decClb();
            }
        }, this);
    }
}, null);