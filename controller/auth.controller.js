require("dotenv").config();
const commonService = require("../services/common.services");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const express = require("express");
const app = express();
// const Image = require("./../models/upload.model.js");

app.use("/profile", express.static("uploads"));

const userRegistration = async (req, res) => {
  try {
    let validationRule = {
      first_name: "required|string",
      last_name: "required|string",
      email: "required|email",
      phone_no: "required|integer|mobRegex",
      password: "required|string|min:8|max:8|passwordRegx",
      confirm_password: "required|string|min:8|max:8|passwordRegx"
    };
    let isvalidated = await commonService.validateRequest(
      req.body,
      validationRule
    );
    if (!isvalidated.status) {
      res.status(412).send({
        status: 412,
        message: "Validation failed",
        error: isvalidated.error,
      });
    } else {
      let tblName = "tbl_user";
      let parameters = "*";
      let condition = "email = '" + req.body.email + "'";
      let queryResult = await commonService.sqlSelectQueryWithParametrs(
        tblName,
        parameters,
        condition
      );
      if (queryResult.success && queryResult.result.length > 0) {
        res.status(412).send({
          status: 412,
          message: "Validation failed",
          error: {
            email: [
              "This Email Address is Already Exists.Please Use Different Email Address",
            ],
          },
        });
      }
      if (queryResult.success && queryResult.result.length === 0) {
        if (req.body.password !== req.body.confirm_password) {
          res.status(412).send({
            status: 412,
            message: "Validation failed",
            error: {
              password: [
                "Password And Confirm Password Must be Same!",
              ],
            },
          });
        } else {
          let pass = req.body.password;
          let parameters = req.body;
          delete parameters.confirm_password;
          const salt = await bcrypt.genSalt(10);
          let encryptPassword = await bcrypt.hash(pass, salt);
          parameters.password = encryptPassword;

          let queryResult = await commonService.sqlQueryWithParametrs(
            tblName,
            parameters
          );

          if (queryResult.success) {
            const token = jwt.sign(
              {
                data: queryResult.result[0],
              },
              process.env.secret
            );

            res.status(200).send({
              status: 200,
              message: "Registration Successfully",
              token: token,
            });
          } else {
            res.status(500).send({
              status: 500,
              message: "Something went wrong!",
              error: queryResult.error,
            });
          }
        }
      }
    }
  } catch (e) {
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }
};
const userLogin = async (req, res) => {
  try {
    let validationRule = {
      email: "required|email",
      password: "required|string|min:8|max:8|passwordRegx",
    };
    let isvalidated = await commonService.validateRequest(
      req.body,
      validationRule
    );
    if (!isvalidated.status) {
      res.status(412).send({
        status: 412,
        message: "Validation failed",
        error: isvalidated.error,
      });
    } else {

      let tblName = "tbl_user";
      let parameters = "*";
      let condition = "email = '" + req.body.email + "' AND flag = 0";

      let queryResult = await commonService.sqlSelectQueryWithParametrs(
        tblName,
        parameters,
        condition
      );
      if (queryResult.success && queryResult.result.length > 0) {
        const password = await bcrypt.compare(
          req.body.password,
          queryResult.result[0].password
        );
        if (password == true) {

          const token = jwt.sign(
            {
              data: queryResult.result[0],
            },
            process.env.secret
          );
          res.status(200).send({
            status: 200,
            message: "Login Successfully",
            id: queryResult.result[0].id,
            role: queryResult.result[0].role_id,
            token: token,
          });
        } else {
          res.status(412).send({
            status: 412,
            message: "Invalid Password",
          });
        }
      }
      if (queryResult.success && queryResult.result.length === 0) {
        res.status(412).send({
          status: 412,
          message: "Invalid User",
        });
      }
    }
  } catch (e) {
    console.log(e)
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    let validationRule = {
      email: "required|email",
     // oldPassword: "required|string|min:8|max:8|passwordRegx",
      newPassword: "required|string|min:8|max:8|passwordRegx"
    };
    let isvalidated = await commonService.validateRequest(
      req.body,
      validationRule
    );
    if (!isvalidated.status) {
      res.status(412).send({
        status: 412,
        message: "Validation failed",
        error: isvalidated.error,
      });
    } else {
      let tblName = "tbl_user";
      let parameters = "*";
      let condition = "email = '" + req.body.email + "'";
      let queryResult = await commonService.sqlSelectQueryWithParametrs(
        tblName,
        parameters,
        condition
      );
      if (queryResult.success && queryResult.result.length > 0) {
        // // const password = await bcrypt.compare(
        //   req.body.oldPassword,
        //   queryResult.result[0].id
        // );
        // if (password == true) {
          let newPass = req.body.newPassword;
          const salt = await bcrypt.genSalt(10);
          let encryptPassword = await bcrypt.hash(newPass, salt);
          let newPassword = encryptPassword;

          let tblName = "tbl_user";
          let parameters =
            "password = '" +
            newPassword +
            "' Where id = '" +
            queryResult.result[0].id +
            "'";
          let resetPassword = await commonService.sqlUpdateQueryWithParametrs(
            tblName,
            parameters
          );

          if (!resetPassword.success) {
            res.status(500).send({
              status: 500,
              message: "Something went wrong!",
              error: resetPassword.error,
            });
          } else {

            res.status(200).send({
              status: 200,
              message: "Password reset successfully",
            });
          }
        // } else {
        //   res.status(500).send({
        //     status: 401,
        //     message: "Old password does not match",
        //     error: queryResult.error,
        //   });
        // }
      } else {
        res.status(500).send({
          status: 500,
          message: "Something went wrong!",
          error: queryResult.error,
        });
      }
    }
  } catch {
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }
}

const editUser = async (req, res) => {
  try {
    const updated_at = moment().format("YYYY-MM-DD hh:mm:ss").toString();
    let id = req.params.id;
    let parameters = "";
    if (req.body.first_name) { parameters += "  first_name = '" + req.body.first_name + "'," }
    if (req.body.last_name) { parameters += "  last_name = '" + req.body.last_name + "'," }
    if (req.body.profile_img) { parameters += "  profile_img = '" + req.body.profile_img + "'," }
    if (req.body.phone_no) { parameters += "  phone_no = '" + req.body.phone_no + "'," }
    if (req.body.email) { parameters += "  email = '" + req.body.email + "'," }
    if (req.body.date_of_birth) { parameters += "  date_of_birth = '" + req.body.date_of_birth + "'," }
    if (req.body.street) { parameters += "  street = '" + req.body.street + "'," }
    if (req.body.zipcode) { parameters += "  zipcode = '" + req.body.zipcode + "'," }
    if (req.body.city) { parameters += "  city = '" + req.body.city + "'," }
    parameters += " updated_date = '" + updated_at + "' Where id = " + id + "";

    let tblName = "tbl_user";
    let parameters1 = "Count(id) As count";
    let condition1 = " id ='" +
      id +
      "' AND flag='" +
      0 +
      "' ";
    let queryResult1 = await commonService.sqlSelectQueryWithParametrs(
      tblName,
      parameters1,
      condition1
    );
    if (queryResult1.success) {

      if (queryResult1.result[0].count > 0) {

        let queryResult = await commonService.sqlUpdateQueryWithParametrs(
          tblName,
          parameters
        );
        if (queryResult.success) {
          res.status(200).send({
            status: 200,
            message: "Update Record Successfully",
          });
        } else {
          res.status(500).send({
            status: 500,
            message: "Something went wrong",
            error: queryResult.error,
          });
        }

      } else {
        res.status(403).send({
          status: 403,
          message: "no records found!",
        });
      }

    } else {
      res.status(500).send({
        status: 500,
        message: "Something went wrong",
        error: e,
      });
    }
  } catch (e) {
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }
}

const userList = async (req, res) => {
  try {
    const query = `SELECT id,first_name,last_name, profile_img as profile_path, email, phone_no, date_of_birth, street, city,zipcode ,(SELECT count(id) FROM tbl_lead WHERE user_id = tbl_user.id ) as total_leads FROM tbl_user WHERE flag = 0`
    let getList = await commonService.sqlJoinQuery(query);
    if (getList.result.length > 0) {
      res.status(200).send({
        status: 200,
        result: getList.result,
      });
    } else {
      res.status(500).send({
        status: 500,
        message: "No records Found",
        error: getList.error,
      });
    }
  } catch (e) {
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }
}

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const tblName = 'tbl_user';
    const parameter = '*';
    const condition = `id = ${id} AND flag = 0`;
    const getUser = await commonService.sqlSelectQueryWithParametrs(
      tblName,
      parameter,
      condition
    );
    if (getUser.success) {
      if (getUser.result.length > 0) {
        let parameters = "flag = 1 Where id = " + id + "";
        let queryResult = await commonService.sqlUpdateQueryWithParametrs(
          tblName,
          parameters
        );
        if (queryResult.success) {
          res.status(200).send({
            status: 200,
            message: "deleted Record Successfully",
          });
        } else {
          res.status(500).send({
            status: 500,
            message: "Something went wrong",
            error: queryResult.error,
          });
        }
      } else {
        res.status(500).send({
          status: 500,
          message: "No User for selected Id",
          error: getUser.error
        });
      }
    } else {
      res.status(500).send({
        status: 500,
        message: "No User for selected Id"
      });
    }
  } catch (e) {
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }
}

module.exports = {
  userRegistration,
  userLogin,
  resetPassword,
  editUser,
  userList,
  deleteUser
};
