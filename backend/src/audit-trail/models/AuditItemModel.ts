import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/Sequelize';

export const AuditItemModel = sequelize.define('Audit', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    action: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    initiator: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    tool: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: true,
});