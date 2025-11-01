'use strict';
const sequelize = require("../config/database");
const Sequelize = require("sequelize");

const OtpVerification = require("../application/models/otpVerification.model");

const models = {
  OtpVerification: OtpVerification(sequelize, Sequelize.DataTypes),
};

Object.values(models)
  .filter((model) => typeof model.associate === "function")
  .forEach((model) => model.associate(models));

const db = {
  models,
  sequelize,
};

module.exports = db;

