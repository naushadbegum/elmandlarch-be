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
  return db.createTable('variants', {
    id: {
      type: 'int',
      unsigned: true,
      primaryKey: true,
      autoIncrement: true,
    },
    image_url: {
      type: 'string',
      length: 2048,
      notNull: true,
    },
    thumbnail_url:{
      type: 'string',
      length: 2048,
      notNull: true,
    },
    stock: {
      type: 'smallint',
      unsigned: true,
      notNull: true,
    },
    color_id: {
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'variants_color_fk',
        table: 'colors',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT',
        }
      }
    },
    dimension_id: {
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'varaints_dimension_fk',
        table: 'dimensions',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        }
      }
    },
    luggage_id: {
      type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'variants_luggage_fk',
        table: 'luggages',
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
  return db.dropTable('variants');
};

exports._meta = {
  "version": 1
};
