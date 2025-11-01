"use strict";
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from project root (two levels up from src/config/)
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

// Validate that environment variables are loaded
if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST) {
  console.error("❌ [SMS Server Database] Missing required environment variables!");
  console.error(`   DB_NAME: ${process.env.DB_NAME ? '✅' : '❌'}`);
  console.error(`   DB_USER: ${process.env.DB_USER ? '✅' : '❌'}`);
  console.error(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '✅' : '❌'}`);
  console.error(`   DB_HOST: ${process.env.DB_HOST ? '✅' : '❌'}`);
  console.error(`   .env file path: ${envPath}`);
  console.error(`   .env file exists: ${require('fs').existsSync(envPath) ? '✅' : '❌'}`);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false, // Disable logging; set to true for debugging
    pool: {
      max: 10, // Maximum number of connections in pool
      min: 0, // Minimum number of connections in pool
      acquire: 30000, // Maximum time (ms) that pool will try to get connection before throwing error
      idle: 10000, // Maximum time (ms) that a connection can be idle before being released
    },
    dialectOptions: {
      connectTimeout: 60000, // 60 seconds
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    },
    define: {
      timestamps: true,
      underscored: true,
    }
  }
);

sequelize.authenticate().then(() => {
    console.log("SMS Server: Database connection established successfully.");
  }).catch((err) => {
    console.error("SMS Server: Unable to connect to the database:", err);
  }
);

module.exports = sequelize;

