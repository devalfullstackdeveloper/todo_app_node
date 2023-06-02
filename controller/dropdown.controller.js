const commonService = require("../services/common.services");
const { query } = require("express");

const project_status = async (req, res) => {
    try {
        const tblName = "tbl_project_status"
        const parameter = "id,name"
        const condition = ""

        let query = await commonService.sqlSelectQueryWithParametrs(tblName, parameter, condition)
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
    } catch (error) {
        res.status(500).send({
            status: 500,
            message: "Something went wrong!",
            error: error,
        });
    }
}
const outcome = async (req, res) => {
    try {
        const tblName = "tbl_outcome"
        const parameter = "id,name"
        const condition = ""

        let query = await commonService.sqlSelectQueryWithParametrs(tblName, parameter, condition)
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


    } catch (error) {
        res.status(500).send({
            status: 500,
            message: "Something went wrong!",
            error: error,
        });
    }
}
const priority = async (req, res) => {
    try {
        const tblName = "tbl_priority"
        const parameter = "id,name"
        const condition = ""

        let query = await commonService.sqlSelectQueryWithParametrs(tblName, parameter, condition)

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

    } catch (error) {
        res.status(500).send({
            status: 500,
            message: "Something went wrong!",
            error: error,
        });
    }
}
const project_type = async (req, res) => {
    try {
        const tblName = "tbl_project_type"
        const parameter = "id,name"
        const condition = ""

        let query = await commonService.sqlSelectQueryWithParametrs(tblName, parameter, condition)

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


    } catch (error) {
        res.status(500).send({
            status: 500,
            message: "Something went wrong!",
            error: error,
        });
    }
}


module.exports = {
    project_status,
    outcome,
    priority,
    project_type

};