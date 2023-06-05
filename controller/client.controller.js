const moment = require("moment/moment");
const commonService = require("../services/common.services");
const { query } = require("express");

const addClientInfo = async (req, res) => {
    try {
        const payload = req.body;
        let validationRule = {
            first_name: "required|string",
            last_name: "required|string",
            company: "required|string",
            client_status: "required|string",
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
            let tblName = "tbl_client";
            let parameters = "*";
            let condition = "user_id = '" + payload.user_id + "' AND email = '" + payload.email + "' AND first_name = '" + payload.first_name + "' AND first_name = '" + payload.first_name + "' AND company = '" + payload.company + "' AND flag = 0";
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
                            "Client Already Exists",
                        ],
                    },
                });
            } else {
                parameters = {
                    user_id: payload.user_id,
                    lead_id: payload.lead_id,
                    profile_img: payload.profile_img,
                    first_name: payload.first_name,
                    last_name: payload.last_name,
                    company: payload.company,
                    title: payload.title,
                    client_status: payload.client_status,
                    phone_no: payload.phone_no,
                    email: payload.email,
                    priority: payload.priority,
                    street: payload.street,
                    city: payload.city,
                    zip_code: payload.zip_code,
                    country: payload.country,
                    website: payload.website,
                    client_source: payload.client_source,
                    industry: payload.industry,
                    description: payload.description
                };
                let queryResult = await commonService.sqlQueryWithParametrs(
                    tblName,
                    parameters
                );
                if (queryResult.success) {
                    res.status(200).send({
                        status: 200,
                        message: "client successfully Added",
                    });
                } else {
                    res.status(500).send({
                        status: 500,
                        message: "Something went wrong1!",
                        error: e,
                    });
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
}

const updateClientInfo = async (req, res) => {
    try {
        let id = req.params.id;
        const updated_at = moment().format("YYYY-MM-DD hh:mm:ss").toString();
        let parameters = "";
        if (req.body.first_name) { parameters += "first_name= '" + req.body.first_name + "'," }
        if (req.body.user_id) { parameters += "user_id = '" + req.body.user_id + "'," }
        if (req.body.last_name) { parameters += " last_name = '" + req.body.last_name + "'," }
        if (req.body.company) { parameters += "  company = '" + req.body.company + "'," }
        if (req.body.title) { parameters += "  title = '" + req.body.title + "'," }
        if (req.body.client_status) { parameters += "  client_status = '" + req.body.client_status + "'," }
        if (req.body.phone_no) { parameters += "  phone_no = '" + req.body.phone_no + "'," }
        if (req.body.email) { parameters += "  email = '" + req.body.email + "'," }
        if (req.body.priority) { parameters += "  priority = '" + req.body.priority + "'," }
        if (req.body.street) { parameters += "  street = '" + req.body.street + "'," }
        if (req.body.city) { parameters += "  city = '" + req.body.city + "'," }
        if (req.body.zip_code) { parameters += "  zip_code = '" + req.body.zip_code + "'," }
        if (req.body.country) { parameters += "  country = '" + req.body.country + "'," }
        if (req.body.website) { parameters += "  website = '" + req.body.website + "'," }
        if (req.body.client_source) { parameters += "  client_source = '" + req.body.client_source + "'," }
        if (req.body.industry) { parameters += "  industry = '" + req.body.industry + "'," }
        if (req.body.description) { parameters += "  description = '" + req.body.description + "'," }
        parameters += "  updated_at = '" + updated_at + "' Where id = " + id + "";

        let tblName = "tbl_client";
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

const getClientList = async (req, res) => {
    try {
        let id=req.query.user_id; 
        let query = `SELECT id, concat(first_name," ",last_name) as full_name, updated_at as Date, email, phone_no as phone FROM tbl_client WHERE flag = 0`
        if(id){ query +=" AND user_id="+id+""}
        console.log(query);
        let getList = await commonService.sqlJoinQuery(query);
        let data = [];
        getList.result.map(item => {
            data.push(item);
        });

        data.map(item => {
            item.Date = moment(item.Date).format('YYYY-MM-DD');
        });
        if (getList.result.length > 0) {
            res.status(200).send({
                status: 200,
                result: data,
            });
        } else {
            res.status(500).send({
                status: 500,
                message: "Something went wrong!",
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

const getClientListById = async (req, res) => {
    try {
        const id = req.params.id;
        const query = `SELECT * FROM tbl_client WHERE flag = 0 AND id = ${req.params.id}`
        let getList = await commonService.sqlJoinQuery(query);
        if (getList.result.length > 0) {
            res.status(200).send({
                status: 200,
                result: getList.result
            });
        } else {
            res.status(500).send({
                status: 500,
                message: "Something went wrong!",
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

const addClientProject = async (req, res) => {
    try {
        const payload = req.body;
        let validationRule = {
            user_id: "required|string",
            client_id: "required|string",
            name: "required|string",
            project_type:"required|string",
            project_month_rate:"string",
            project_hour_rate:"string",
            project_value:"required|string",
            enter_hours:"string",
            enter_months:"string",
            project_status: "required|string",
            related_to: "required|string",
            description:"required|string"
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
            let tblName = "tbl_project";
            let parameters = "*";
            let condition = "user_id = '" + payload.user_id + "' AND client_id = '" + payload.client_id + "' AND name = '" + payload.name + "' AND flag = 0";
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
                            "project Already Exists",
                        ],
                    },
                });
            } else {
                let queryResult = await commonService.sqlQueryWithParametrs(
                    tblName,
                    payload
                );
                if (queryResult.success) {
                    res.status(200).send({
                        status: 200,
                        message: "project successfully Added",
                    });
                } else {
                    res.status(500).send({
                        status: 500,
                        message: "Something went wrong1!",
                        error: e,
                    });
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
}

const updateClientProject = async (req, res) => {
    try {
        let id = req.params.id;
        const updated_at = moment().format("YYYY-MM-DD hh:mm:ss").toString();
        let parameters = "";
        if (req.body.client_id) { parameters += "client_id= '" + req.body.client_id + "'," }
        if (req.body.name) { parameters += "  name = '" + req.body.name + "'," }
        if (req.body.project_type) { parameters += "   project_type = '" + req.body.project_type + "'," }
        if (req.body.project_value) { parameters += "  project_value = '" + req.body.project_value + "'," }
        if (req.body.project_hour_rate) { parameters +="  project_hour_rate = '" + req.body.project_hour_rate + "',"}
        if (req.body.project_month_rate) { parameters +="  project_month_rate = '" + req.body.project_month_rate + "',"}
        if (req.body.enter_hours) { parameters += "   enter_hours = '" + req.body.enter_hours + "'," }
        if (req.body.enter_months) { parameters += "   enter_months = '" + req.body.enter_months + "'," }
        if (req.body.project_status) { parameters += "   project_status = '" + req.body.project_status + "'," }
        if (req.body.related_to) { parameters += "   related_to = '" + req.body.related_to + "'," }
        if (req.body.description) { parameters += "   description = '" + req.body.description + "'," }
        parameters += "  updated_at = '" + updated_at + "' Where id = " + id + "";

        let tblName = "tbl_project";
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
                    message: "Project not found!",
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
const meettingBy_project = async (req,res) =>{
try {
        let tblName="tbl_followup"
        let parameter="*"
        let condition=""
        if (req.headers.client_id) { condition += "client_id=" + req.headers.client_id + " AND " }
        if (req.headers.project_id) { condition += "project_id=" + req.headers.project_id + " AND " }
        condition += " flag='" + 0 + "' ORDER BY remainder DESC"
        const query = await commonService.sqlSelectQueryWithParametrs(tblName,parameter,condition)
        if (query.success) {
            res.status(200).send({
              status: 200,
              data: query.result
            });
          } else {
            res.status(500).send({
              status: 500,
              message: "No Record Found.",
              error: query.error,
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
const deleteClientProject = async (req, res) => {
    try {
        let id = req.params.id;
        if (id) {
            let tblName = "tbl_project";
            let parameters1 = "Count(id) As count";
            let condition1 = " id ='" +
                id +
                "' AND flag='" +
                0 +
                "' ";
            const checkid = await commonService.sqlSelectQueryWithParametrs(
                tblName,
                parameters1,
                condition1
            );
            if (checkid.success) {
                if (checkid.result[0].count > 0) {
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
                    res.status(403).send({
                        status: 403,
                        message: "record not found!",
                    });
                }

            } else {
                res.status(500).send({
                    status: 500,
                    message: "records not found!",
                    error: e,
                });
            }
        } else {
            res.status(500).send({
                status: 500,
                message: "id undefined!",
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

const getProjectById = async (req, res) => {
    try {
        let id = req.params.id;
        let tblName = "tbl_project";
        let parameters1 = "*";
        let condition1 = " client_id ='" +
            id +
            "' AND flag='" +
            0 +
            "' ";
        const queryResult = await commonService.sqlSelectQueryWithParametrs(
            tblName,
            parameters1,
            condition1
        );
        if (queryResult.result.length > 0) {
            res.status(200).send({
                status: 200,
                result: queryResult.result
            });
        } else {
            res.status(500).send({
                status: 500,
                message: "project not found!",
                error: queryResult.error,
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
    addClientInfo,
    updateClientInfo,
    getClientList,
    getClientListById,
    addClientProject,
    updateClientProject,
    deleteClientProject,
    getProjectById,
    meettingBy_project
}