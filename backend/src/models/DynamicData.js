module.exports = (sequelize, DataTypes) => {
  const DynamicData = sequelize.define('DynamicData', {
    pageId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fieldName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fieldType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fieldValue: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        value: {},
        conditions: [],
        filters: [],
        calculations: [],
        interactions: {
          triggers: [],
          actions: []
        }
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        category: '',
        description: '',
        aiSuggestions: []
      }
    }
  }, {
    tableName: 'dynamic_data',
    timestamps: true // اضافه کردن createdAt و updatedAt به‌طور خودکار
  });

  DynamicData.associate = (models) => {
    DynamicData.belongsTo(models.Page, {
      foreignKey: 'pageId',
      as: 'page'
    });
  };

  return DynamicData;
};