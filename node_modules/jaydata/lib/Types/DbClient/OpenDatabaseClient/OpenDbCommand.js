$data.Class.define('$data.dbClient.openDatabaseClient.OpenDbCommand', $data.dbClient.DbCommand, null,
{
    constructor: function (con, queryStr, params) {
        this.query = queryStr;
        this.connection = con;
        this.parameters = params;
    },
    executeNonQuery: function (callback, tran, isWrite) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error, tran, isWrite);
    },
    executeQuery: function (callback, tran, isWrite) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error, tran, isWrite);
    },
    exec: function (query, parameters, callback, errorhandler, transaction, isWrite) {
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
                        callback(single ? results[0] : results, transaction);
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
                                } catch (e) {}
                                if (typeof r.insertId !== 'number') {
                                    // If insertId is present, no rows are returned
                                    r.rowsAffected = result.rowsAffected;
                                    var maxItem = result.rows.length;
                                    for (var j = 0; j < maxItem; j++) {
                                        r.rows.push(result.rows.item(j));
                                    }
                                }
                                results[i] = r;
                                decClb(trx);
                            },
                            function (trx, err) {
                                var _q = q;
                                var _i = i;

                                if (errorhandler)
                                    errorhandler(err);

                                return true;
                            }
                        );
                    } else {
                        results[i] = null;
                        decClb();
                    }
                });
            }
        }, transaction, isWrite);
    }
}, null);