const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config');
const db = {};

const sequelize = new Sequelize(
    config.db.uri,
    config.db.options,
);

// Loop through all files in models folder and add them to db object
fs
 .readdirSync(__dirname)
 .filter((file) => 
   file !== 'index.js' && file.endsWith('.js')
 )
 .forEach((file) => {
     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
     db[model.name] = model;
 });

 // Create associations for models
 Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

 db.sequelize = sequelize;
 db.Sequelize = Sequelize;

module.exports = db;