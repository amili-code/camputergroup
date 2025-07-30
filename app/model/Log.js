const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Log = sequelize.define('Log', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('student', 'teacher', 'groupAdmin', 'communityAdmin'),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        timestamps: true,
        tableName: 'Logs',
    });

    return Log;
};
