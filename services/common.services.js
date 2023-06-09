const db = require("../helpers/db");
const helper = require("../helpers/validate");

const sqlQueryWithParametrs = async (tblName, data) => {
  return new Promise(async (resolve) => {
    let query = "INSERT INTO " + tblName + " SET ?";
    let result = await commonQueryFunction(query, data);

    resolve(result);
  });
};
const sqlDeleteQueryWithParametrs = async (id, tblName) => {
  let sql = "DELETE FROM " + tblName + " WHERE id = " + id + "";
  let data = [];
  return new Promise(async (resolve) => {
    let result = await commonQueryFunction(sql, data);
    resolve(result);
  });
};
const sqlDeleteQueryWithParametrsh = async (id, tblName) => {
  let sql = "DELETE FROM " + tblName + " WHERE holiday_id = " + id + "";
  let data = [];
  return new Promise(async (resolve) => {
    let result = await commonQueryFunction(sql, data);
    resolve(result);
  });
};
const sqlSelectQueryWithParametrs = async (tblName, parameters, condition) => {
  let sql;

  if (condition) {
    sql =
      "SELECT " + parameters + " from " + tblName + " where " + condition + "";
  } else {
    sql = "SELECT " + parameters + " from " + tblName + "";
  }
  let data = [];
  return new Promise(async (resolve) => {
    let result = await commonQueryFunction(sql, data);
    resolve(result);
  });
};

const sqlUpdateQueryWithParametrs = async (tblName, parameters) => {
  let sql = "Update " + tblName + " SET " + parameters + "";
  let data = [];
  return new Promise(async (resolve) => {
    let result = await commonQueryFunction(sql, data);
    resolve(result);
  });
};

//join query
const sqlJoinQuery = (sql) => {
  let data = [];
  return new Promise(async (resolve) => {
    let result = await commonQueryFunction(sql, data);
    resolve(result);
  });
};
const validateRequest = (requestPayload, validationRule) => {
  return new Promise((resolve) => {
    helper.validator(requestPayload, validationRule, {}, (err, status) => {
      if (!status) {
        resolve({
          status: false,
          message: "Validation failed",
          error: err.errors,
          code: 412,
        });
      } else {
        resolve({
          status: true,
        });
      }
    });
  });
};

const commonQueryFunction = (query, data) => {
  return new Promise((resolve) => {
    db.query(query, data, (err, result, filed) => {
      if (err) {
        resolve({
          success: false,
          error: err,
        });
      } else {
        resolve({
          success: true,
          result: result,
        });
      }
    });
  });
};

const sqlImageUpload = (tblName, parameters) => {
  return new Promise(async (resolve) => {
    let query = "Update " + tblName + " SET " + parameters + "";
    let result = await commonQueryFunction(query);
    resolve(result);
  });
};

module.exports = {
  sqlQueryWithParametrs,
  validateRequest,
  sqlDeleteQueryWithParametrsh,
  sqlDeleteQueryWithParametrs,
  sqlSelectQueryWithParametrs,
  sqlUpdateQueryWithParametrs,
  sqlJoinQuery,
  sqlImageUpload,
};
