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
  db.insert('colors', ['color'], ['Black']);
  db.insert('colors', ['color'], ['Brown']);
  db.insert('colors', ['color'], ['Blue']);
  db.insert('colors', ['color'], ['Green']);
  db.insert('colors', ['color'], ['Pink']);
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
