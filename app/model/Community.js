const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Community = sequelize.define('Community', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'students',
                key: 'id'
            },
            comment: 'آیدی دانشجو (عضو انجمن)'
        },
        isAccepted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'آیا درخواست عضویت تایید شده؟'
        },
        isManager: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'آیا این دانشجو مدیر گروه است؟'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'توضیحات دانشجو برای علت عضویت در انجمن'
        }
    }, {
        tableName: 'community',
        timestamps: true
    });

    return Community;
};
