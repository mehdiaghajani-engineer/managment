module.exports = (sequelize, DataTypes) => {
    const Entity = sequelize.define('Entity', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      tableName: 'entities',
      timestamps: true,
    });
    return Entity;
  };