import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/Sequelize';

export const NotificationModel = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    notificationKey: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: true,
});