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
            let condition = "user_id = '" + payload.user_id + "' AND email = '" + payload.email + "' AND phone_no = '" + payload.phone_no + "' AND company = '" + payload.company + "' AND flag = 0";
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
        if (req.body.profile_img) { parameters += "  profile_img = '" + req.body.profile_img + "'," }
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
        let query;
        let user_id = req.body.user_id;
        let searchBy = req.body.searchBy;
        let pageNo = req.body.pageNo;
        let pageLength = req.body.pageLength;

        query = `SELECT c.id , c.first_name, c.last_name ,c.profile_img,u.first_name as BD_first_mame, u.last_name as BD_last_mame, c.updated_at as Date, c.email, c.phone_no as phone ,(SELECT COUNT(p.id) FROM tbl_project as p WHERE p.client_id = c.id ) as projects FROM tbl_client as c LEFT JOIN tbl_user as u ON c.user_id = u.id WHERE c.flag = 0`
        if (searchBy) {
            query += ` AND concat(c.first_name," ",c.last_name) like "%${searchBy}%"`;
        }
        if (user_id) {
            query += ` AND c.user_id = ${user_id}`;
        }
        let getList1 = await commonService.sqlJoinQuery(query);
        let startPage = (pageNo * pageLength) - pageLength;
        if (pageNo && pageLength) { query = ` ${query} LIMIT ${startPage},${pageLength}`; }
        let getList = await commonService.sqlJoinQuery(query);
        let data = [];
        getList.result.map(item => {
            data.push(item);
        });

        data.map(item => {
            item.Date = moment(item.Date).format('YYYY-MM-DD');
        });

        if (getList.success) {
            res.status(200).send({
                status: 200,
                result: data,
                total_Client: getList1.result.length
            });
        } else {
            res.status(500).send({
                status: 500,
                message: "There Is No Record Found"
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
        const query = `SELECT c.*,u.first_name as BD_first_mame, u.last_name as BD_last_mame FROM tbl_client as c LEFT JOIN tbl_user as u ON c.user_id = u.id WHERE c.flag = 0 AND c.id = ${req.params.id}`
        let getList = await commonService.sqlJoinQuery(query);
        if (getList.success) {
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
            project_type: "required|string",
            project_status: "required|string",
            related_to: "required|string"
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
            let condition = "user_id = '" + payload.user_id + "' AND client_id = '" + payload.client_id + "' AND name = '" + payload.name + "' AND project_type = '" + payload.project_type + "' AND flag = 0";
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
                let parameters = {
                    user_id: payload.user_id,
                    client_id: payload.client_id,
                    name: payload.name,
                    project_type: payload.project_type,
                    project_value: payload.project_value,
                    enter_hours: payload.enter_hours,
                    hour_rate: payload.hour_rate,
                    enter_months: payload.enter_months,
                    month_rate: payload.month_rate,
                    project_status: payload.project_status,
                    related_to: payload.related_to,
                    description: payload.description
                };
                let queryResult = await commonService.sqlQueryWithParametrs(
                    tblName,
                    parameters
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
        if (req.body.enter_hours) { parameters += "   enter_hours = '" + req.body.enter_hours + "'," }
        if (req.body.hour_rate) { parameters += "  hour_rate = '" + req.body.hour_rate + "'," }
        if (req.body.enter_months) { parameters += "   enter_months = '" + req.body.enter_months + "'," }
        if (req.body.month_rate) { parameters += "  month_rate = '" + req.body.month_rate + "'," }
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
const meettingBy_project = async (req, res) => {
    try {
        let tblName = "tbl_followup"
        let parameter = "*"
        let condition = ""
        if (req.headers.client_id) { condition += "client_id=" + req.headers.client_id + " AND " }
        if (req.headers.project_id) { condition += "project_id=" + req.headers.project_id + " AND " }
        condition += " flag='" + 0 + "' ORDER BY remainder DESC"
        const query = await commonService.sqlSelectQueryWithParametrs(tblName, parameter, condition)
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
        let tblName = "tbl_project as p LEFT JOIN tbl_client as c ON p.client_id = c.id ";
        let parameters1 = `p.*,concat(c.first_name," ",c.last_name) as related_to,c.profile_img`;
        let condition1 = " p.id ='" +
            id +
            "' AND p.flag='" +
            0 +
            "' ";
        let queryResult = await commonService.sqlSelectQueryWithParametrs(
            tblName,
            parameters1,
            condition1
        );
        if (queryResult.success) {
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

const projectList = async (req, res) => {
    try {
        let user_id = req.query.user_id ? req.query.user_id : "";
        let query = `SELECT p.*, concat(c.first_name," ",c.last_name) as related_to, c.profile_img as Image  FROM tbl_project as p LEFT JOIN tbl_client as c ON p.client_id = c.id  WHERE p.flag = 0`;
        console.log(user_id);
        if (user_id) {
            query += ` and p.user_id = ${user_id}`;
        }
        const queryResult = await commonService.sqlJoinQuery(query);
        if (queryResult.success) {
            res.status(200).send({
                status: 200,
                data: queryResult.result
            });
        } else {
            res.status(500).send({
                status: 500,
                message: "Something went wrong!"
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
    meettingBy_project,
    projectList
}