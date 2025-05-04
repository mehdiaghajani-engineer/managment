// backend/src/models/Page.js
module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define('Page', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    route: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        startsWithSlash(value) {
          if (!value.startsWith('/')) {
            throw new Error('Route must start with "/"');
          }
        },
      },
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        sections: [],
        fields: {},
        metadata: {
          status: 'draft',
          permissions: {},
          conditions: [],
          filters: [],
          calculations: [],
          layout: 'single-column',
        },
        interactions: {
          triggers: [],
          actions: []
        },
        aiSuggestions: {
          suggestions: [],
          applied: []
        }
      }
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'published', 'archived']],
      },
    },
    categories: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dataSource: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'pages',
    timestamps: true
  });

  Page.associate = (models) => {
    Page.hasMany(models.Section, {
      foreignKey: 'pageId',
      as: 'sections'
    });
    Page.hasMany(models.DynamicData, {
      foreignKey: 'pageId',
      as: 'dynamicData'
    });
    Page.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    Page.belongsTo(models.Entity, { foreignKey: 'dataSource', as: 'entity' });
  };

  return Page;
};