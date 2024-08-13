module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define('Review', {
      review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
          model: 'products', 
          key: 'id', 
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
          model: 'users', 
          key: 'uuid', 
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: DataTypes.STRING(255), 
        allowNull: false,
        validate: {
          len: {
            args: [1, 100], 
            msg: "Review content must be between 1 and 100 words"
          }
        }
      },
      submission_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, 
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 5 
        }
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      isFlagged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
    }, {
      tableName: 'reviews',
      timestamps: false
    });
    Review.associate = models => {
      Review.belongsTo(models.Products, { foreignKey: 'product_id', as: 'Product' });
      Review.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
    };
    return Review;
  };
  