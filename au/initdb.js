
var bcrypt = require('bcrypt');

var Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server;

var host1 = 'localhost';
var port = Connection.DEFAULT_PORT;

var usersdb = new Db('Users', new Server(host1, port, {}), {native_parser:false});
usersdb.open(function(err, db) {
  console.log('users database opened');

  usersdb.collection('users', function(err, collection) {
    if (err) { console.log(err); return; }
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync('alma', salt);
    collection.insert({username:'agdolla', hash: hash, salt: salt, 
	   roles: [ { rolename: 'admin', roleid: 1 }, { rolename: 'user', roleid: 2 } ]
    }, function(docs) {
      console.log("inserted");
    });
  });
});

