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
  return db.createTable('dimensions',{
    id:{
      type: 'int',
      unsigned: true,
      primaryKey: true,
      autoIncrement: true
    },
    dimension: {
      type: 'string',
      length: 100,
      notNull: true,
    },
  });
};

exports.down = function(db) {
  return db.dropTable('dimensions');
};

exports._meta = {
  "version": 1
};