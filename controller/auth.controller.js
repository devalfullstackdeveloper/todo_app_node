require("dotenv").config();
const commonService = require("../services/common.services");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const express = require("express");
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const app = express();

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
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss").toString();
    let validationRule = {
      email: "required|email",
      password: "required|string|min:8|max:8|passwordRegx",
      fcm_token: "required"
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
          let tblName2 = "tbl_notification";
          let parameters2 = "*";
          let condition2 = "token = '" + req.body.fcm_token + "'";
          let queryResult2 = await commonService.sqlSelectQueryWithParametrs(
            tblName2,
            parameters2,
            condition2
          );
          if (queryResult2.success && queryResult2.result.length > 0) {
            let parameters2 = `flag = 1, updated_at = "${updated_at}" Where token = "${req.body.fcm_token}"`;
            let condition3 = "token = '" + req.body.fcm_token + "'";
            await commonService.sqlUpdateQueryWithParametrs(
              tblName2,
              parameters2,
              condition3
            );
          } else {
            let payload = req.body;
            let tblName1 = "tbl_notification";

            let parameters1 = {
              user_id: queryResult.result[0].id,
              token: payload.fcm_token,
              flag: 1,
              updated_at: updated_at
            }
            await commonService.sqlQueryWithParametrs(
              tblName1,
              parameters1
            );
          }
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
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }
};


//user logout
const userlogout = async (req, res) => {
  try {
    let todayDate = moment().format("YYYY-MM-DD HH:mm:ss").toString();
    let id = req.params.id;
    let queryResult1 = await commonService.sqlJoinQuery(`select user_id from tbl_notification where user_id = ${id} AND flag = 1`);
    if (queryResult1.result.length !== 0) {
      let parameters =
        "flag = 0," +
        " updated_at = '" + todayDate +
        "' Where user_id = " +
        id;
      let tblName = "tbl_notification";
      let queryResult = await commonService.sqlUpdateQueryWithParametrs(
        tblName,
        parameters
        );  
      if (queryResult.result.affectedRows > 0) {
        res.status(200).send({
          status: 200,
          message: "User Logout Successfully",
        });
      } else {
        res.status(500).send({
          status: 500,
          message: "record not found!",
        });
      }
    } else {
      res.status(500).send({
        status: 500,
        message: "record not found!!",
      });
    }
  } catch (e) {
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
    let id = req.query.id;
    let query = `SELECT id,first_name,last_name, profile_img as profile_path, email, phone_no, date_of_birth, street, city,zipcode ,(SELECT count(id) FROM tbl_lead WHERE user_id = tbl_user.id ) as total_leads FROM tbl_user WHERE flag = 0`
    if (id) { query += " AND tbl_user.id=" + id + "" }
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

function generateOTP() {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}
const sendOtp = async (req, res) => {
  try {
    const email = req.body.email;
    let query = `SELECT email
    FROM tbl_user
    WHERE email = '${email}' AND flag = 0`;
    let getList = await commonService.sqlJoinQuery(query);
    if(getList.result.length > 0){
    const otp = generateOTP();
    // Create a nodemailer transport object
    const transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: 'app@itidoltechnologies.com', // replace with your Gmail email address
        pass: 'hGVgm2putU37' // replace with your Gmail password
      }
    });
    let tblName = "tbl_otp";
    parameters = {
      email: req.body.email,
      otp: otp,
  };
  let queryResult = await commonService.sqlQueryWithParametrs(
      tblName,
      parameters
  );
    // Configure email options
    const mailOptions = {
      from: 'app@itidoltechnologies.com', // replace with your Gmail email address
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is: ${otp}`
    };
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(500).send({
          status: 500,
          message: "Something went wrong!",
          error: error,
        });
      } else {
        res.status(200).send({
          status: 200,
          message: "OTP sent successfully!",
          // otp: otp
        });
      }
    });
  }else{
    res.status(400).send({
      status: 400,
      message: "Invalid E-mail"
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
function isWithinOneMinute1(date) {
  const currentTime = new Date((moment().format("YYYY-MM-DD HH:mm:ss").toString().replace(" ","T")+".000Z"));
  const differenceInMilliseconds = currentTime - date;
  const differenceInSeconds = differenceInMilliseconds / 1000;
  return differenceInSeconds <= 180;
}

const MatchOtp = async (req, res) => {
  try {
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss").toString();
    const { email, otp } = req.body;
    let query = `SELECT id, otp, created_date
    FROM tbl_otp
    WHERE email = '${email}' AND flag = 0 ORDER BY id DESC LIMIT 1`;
    let getList = await commonService.sqlJoinQuery(query);
    if(getList.result.length > 0){
    const createdDate = new Date(moment(getList.result[0].created_date).format("YYYY-MM-DD HH:mm:ss").toString());
    const isWithinOneMinute = isWithinOneMinute1(createdDate);
    let tblName = "tbl_otp"
    let parameters =
      "updated_date = '" +
      updated_at +
      "', flag = 1 WHERE id = " +
      getList.result[0].id;
    if (isWithinOneMinute && (otp === getList.result[0].otp)) {
      let queryResult = await commonService.sqlUpdateQueryWithParametrs(
        tblName,
        parameters
      );
      if (queryResult.success) {
        res.status(200).send({
          status: 200,
          message: "OTP matched successfully!",
        });
      }else{
        res.status(500).send({
          status: 500,
          message: "Something went wrong!",
          error: e,
        });
      }
    } else {
      res.status(400).send({
        status: 400,
        message: "Invalid OTP",
      });
    }
    
  } else{
    res.status(400).send({
      status: 400,
      message: "Invalid E-mail",
    });
  }
}catch (e) {
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
  userlogout,
  resetPassword,
  editUser,
  userList,
  deleteUser,
  sendOtp,
  MatchOtp
};
