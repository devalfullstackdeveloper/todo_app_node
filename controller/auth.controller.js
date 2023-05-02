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
      full_name: "required|string",
      // last_name: "required|string",
      email: "required|email",
      phone_no: "required|integer|mobRegex",
      password: "required|string|min:8|max:8|passwordRegx",
      confirm_password: "required|string|min:8|max:8|passwordRegx",
      date_of_joining:"required|string",
      designation_id:"required|integer",
      dev_role:"required|integer",
      emp_code:"required|integer"
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
      let tblName = "tbl_employee";
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
        if(req.body.password !== req.body.confirm_password){
          res.status(412).send({
            status: 412,
            message: "Validation failed",
            error: {
              password: [
                "Password And Confirm Password Must be Same!",
              ],
            },
          });
        }
         let pass = req.body.password;
         let cpass = req.body.confirm_password;
        let parameters = req.body;
        // delete parameters?.password;
      //   if (req.body.isAdmin) {
      //     parameters.role_id = 1;
      //   } else {
      //     parameters.role_id = 2;
      //   }
        parameters.role_id = 2;
        parameters.created_date = moment().format("YYYY-MM-DD").toString();
        parameters.updated_date = moment().format("YYYY-MM-DD").toString();
        const salt = await bcrypt.genSalt(10);
        let encryptPassword = await bcrypt.hash(pass, salt);
        parameters.password = encryptPassword;

        let encryptCPassword = await bcrypt.hash(cpass, salt);
        parameters.confirm_password = encryptCPassword;

        console.log(parameters);
        let queryResult = await commonService.sqlQueryWithParametrs(
          tblName,
          parameters
        );

        if (queryResult.success) {
          // const secret = "secret";
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
  } catch (e) {
    console.log(e)
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
  
        let tblName = "tbl_employee";
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
              id:queryResult.result[0].id,
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
        oldPassword: "required|string|min:8|max:8|passwordRegx",
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
        let tblName = "tbl_employee";
        let parameters = "*";
        let condition = "email = '" + req.body.email + "'";
        let queryResult = await commonService.sqlSelectQueryWithParametrs(
          tblName,
          parameters,
          condition
        );
        if (queryResult.success && queryResult.result.length > 0) {
          const password = await bcrypt.compare(
            req.body.oldPassword,
            queryResult.result[0].password
          );
          if (password == true) {          
            let newPass = req.body.newPassword;
            const salt = await bcrypt.genSalt(10);
            let encryptPassword = await bcrypt.hash(newPass, salt);
            let newPassword = encryptPassword;
  
              let tblName = "tbl_employee"; 
              let parameters =
                "password = '" +
                newPassword +
                "',confirm_password = '" +
                newPassword +
                "' Where email = '" +
                req.body.email +
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
          } else {
            res.status(500).send({
              status: 401,
              message: "Old password does not match",
              error: queryResult.error,
            });
          }
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


module.exports = {
  userRegistration,
  userLogin,
  resetPassword
};
 