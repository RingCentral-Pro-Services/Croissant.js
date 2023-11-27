import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
    dialect: "postgres",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: false
});