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
  return db.createTable('luggages',{
    id: {
      type: 'int',
      unsigned: true,
      primaryKey: true,
      autoIncrement: true
    },
    model: {
      type: 'string',
      length: 100,
      notNull: true,
    },
    cost: {
      type: 'int',
      unsigned: true,
      notNull: true
    },
    description: {
      type: 'text',
      notNull: true
    },
    image_url: {
      type: 'string',
      length: 2048,
      notNull: true
    },
    thumbnail_url: {
      type: 'string',
      length: 2048,
      notNull: true
    }
  })
};

exports.down = function(db) {
  return db.dropTable('luggages');
};

exports._meta = {
  "version": 1
};
