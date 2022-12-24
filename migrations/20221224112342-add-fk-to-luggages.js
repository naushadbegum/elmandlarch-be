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
  return db.addColumn('luggages', 'brand_id', {
    type:'int',
    unsigned: true,
    notNull: true,
   })
};

// exports.up = function(db) {

  
  // db.addColumn('luggages', 'brand_id', {
  //   type: 'int',
  //   unsigned: true,
  //   notNull: true,
  //   foreignKey: {
  //     name: 'luggages_brand_fk',
  //     table: 'brands',
  //     mapping: 'id',
  //     rules: {
  //       onDelete: 'restrict',
  //       onUpdate: 'restrict'
  //     }
  //   }
  // });
  // db.addColumn('luggages', 'material_id', {
  //   type: 'int',
  //   unsigned: true,
  //   notNull: true,
  //   foreignKey: {
  //     name: 'luggages_material_fk',
  //     table: 'materials',
  //     mapping: 'id',
  //     rules: {
  //       onDelete: 'restrict',
  //       onUpdate: 'restrict'
  //     }
  //   }
  // })


// };

exports.down = function(db) {
  db.removeColumn('luggages', 'brand_id');
  db.removeColumn('luggages', 'material_id');
  return null;
};

exports._meta = {
  "version": 1
};
