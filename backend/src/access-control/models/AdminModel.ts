import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/Sequelize';

export const AdminModel = sequelize.define('Admin', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    addedByName: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    addedByEmail: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    externalId: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: true,
});