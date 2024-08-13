module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    uuid: {
      type: DataTypes.CHAR(36),
      defaultValue: sequelize.literal('UUID()'),
      primaryKey: true,
      allowNull: false
    },
    user_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    mail: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    sign_up_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
  }, {
    tableName: 'users',
    timestamps: false
  });
  User.associate = models => {
    User.hasMany(models.Review, { foreignKey: 'user_id', as: 'Reviews' });
  };
  return User;
};
