module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define('Section', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        value: {},
        conditions: [],
        filters: [],
        interactions: {
          triggers: [],
          actions: []
        },
        metadata: {
          category: '',
          description: '',
          aiSuggestions: []
        }
      }
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    pageId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'sections',
    timestamps: true // اضافه کردن createdAt و updatedAt به‌طور خودکار
  });

  Section.associate = (models) => {
    Section.belongsTo(models.Page, {
      foreignKey: 'pageId',
      as: 'page'
    });
  };

  return Section;
};