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
  return db.createTable('luggages_types',{
    id: {
      type: 'int',
      unsigned: true,
      primaryKey: true,
      autoIncrement: true
    },
    luggage_id: {
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'luggages_types_luggage_fk',
        table: 'luggages',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        }
      }
    },
    type_id: {
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey:{
        name: 'luggages_types_type_fk',
        table: 'types',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        }
      }
    }
  });
};

exports.down = function(db) {
  return db.dropTable('luggages_types');
};

exports._meta = {
  "version": 1
};
