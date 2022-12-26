'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.insert('users', ['name', 'username', 'email', 'password', 'contact_number', 'role_id'], 
  ['Administrator', 'admin99', 'admin99@gmail.com', '96kp:=zPa`&<~*#,?=K)!`uz1nL#^H', '81234567', 3]);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
