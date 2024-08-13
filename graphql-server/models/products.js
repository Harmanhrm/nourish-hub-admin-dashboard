module.exports = (sequelize, DataTypes) => {
    const Products = sequelize.define('Products', {
        id: {
            type: DataTypes.CHAR(36),
            defaultValue: sequelize.literal('UUID()'),
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        isSpecial: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        discount: {
            type: DataTypes.INTEGER,
            allowNull: true, 
            validate: {
                min: 0, 
                max: 100 
            }
        }
    }, {
        tableName: 'products',
        timestamps: false,
    });
    Products.associate = models => {
        Products.hasMany(models.Review, { foreignKey: 'product_id', as: 'Reviews' });
      };
    return Products;
};
