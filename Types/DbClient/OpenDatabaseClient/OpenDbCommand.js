$data.Class.define('$data.dbClient.openDatabaseClient.OpenDbCommand', $data.dbClient.DbCommand, null,
{
    constructor: function (con, queryStr, params) {
        this.query = queryStr;
        this.connection = con;
        this.parameters = params;
    },
    executeNonQuery: function (callback) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    executeQuery: function (callback) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    exec: function (query, parameters, callback, errorhandler) {
		// suspicious code
        /*if (console) {
            //console.log(query);
        }*/
        this.connection.open({
            error: errorhandler,
            success: function (tran) {
                var single = false;
                if (!(query instanceof Array)) {
                    single = true;
                    query = [query];
                    parameters = [parameters];
                }
                
                var results = [];
                var remainingCommands = 0;

                function decClb() {
                    if (--remainingCommands == 0) {
                        callback(single ? results[0] : results);
                    }
                }

                query.forEach(function (q, i) {
                    remainingCommands++;
                    if (q) {
                        tran.executeSql(
                            query[i],
                            parameters[i],
                            function (trx, result) {
                                var r = { rows: [] };
                                try {
                                    r.insertId = result.insertId;
                                } catch (e) {
                                    // If insertId is present, no rows are returned
                                    r.rowsAffected = result.rowsAffected;
                                    var maxItem = result.rows.length;
                                    for (var j = 0; j < maxItem; j++) {
                                        r.rows.push(result.rows.item(j));
                                    }
                                }
                                results[i] = r;
                                decClb();
                            },
                            function (trx, err) {
                                if (errorhandler)
                                    errorhandler(err);
                            }
                        );
                    } else {
                        results[i] = null;
                        decClb();
                    }
                });
            }
        });
    }
}, null);