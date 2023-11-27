import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/Sequelize';

export const DepartmentModel = sequelize.define('Department', {
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
}, {
    timestamps: true,
});