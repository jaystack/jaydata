
var config = require('./application');

var q = require('q');
var bcrypt = require('bcrypt');

var Db = require('mongodb').Db
  , Admin = require('mongodb').Admin
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server
  , ReplSetServers = require('mongodb').ReplSetServers
  , CheckMaster = require('mongodb').CheckMaster;

//var host1 = 'db1.storm.jaystack.com';
var host1 = 'localhost';
var host2 = 'db2.storm.jaystack.com';
var port = Connection.DEFAULT_PORT;
var server1 = new Server(host1, port, {});
var server2 = new Server(host2, port, {});
var servers = new Array();
//servers[0] = server2;
//servers[1] = server1;
servers[0] = server1;

// username, password mongohoz
var replStat = new ReplSetServers(servers);
//var usersdb = new Db(config.application.id + '-Users', replStat, {native_parser:false});
//var usersdb = new Db('Users', replStat, {native_parser:false});
var usersdb = new Db('ApplicationDB', new Server(host1, port, {}), {native_parser:false});
usersdb.open(function(err, db) {
  console.log('users database opened');
});

function mongoAuthenticate(username, password) {
    var defer = q.defer();
    usersdb.collection('Users', function(err, collection) {
      if (err) defer.reject(err);
      collection.find({Login:username}, function(err, cursor) {
        cursor.toArray(function(err, users) {
          if (err) defer.reject(err);
          if (users.length == 0) defer.reject('No such user');
          else if (users.length > 1) defer.reject('Duplicate user');
          else bcrypt.compare(password, users[0].Password, function(err, ok) {
            if (err) defer.reject(err);
            if (!ok) defer.reject('Invalid password');
            defer.resolve(users[0]);
          });
        });
      });
    });
    return defer.promise;
}

module.exports = {

  authenticate: function(username, password) {
    console.log("Authenticating: " + username);
    return mongoAuthenticate(username, password);
  }

}
