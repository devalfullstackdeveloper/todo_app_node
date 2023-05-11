const moment = require("moment/moment");
const commonService = require("../services/common.services");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const checkDir = async (req, res, next) => {
    try {
        if (!fs.existsSync('./Attachments')) {
            fs.mkdirSync('./Attachments');
        } else {
            console.error(
                {
                    message: "Directory Already Exists.",
                });
        }
    } catch (e) {
        console.log(e);
    }
    return next();
}

const uploadDocument = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "./Attachments");
        },
        filename: function (req, file, cb) {
            const fileName = file.originalname + "-" + Date.now();
            const result = fileName.replace(path.extname(file.originalname).toLowerCase(), '');
            cb(null, result + path.extname(file.originalname).toLowerCase());
        },
    }),
    fileFilter: function (req, file, cb) {
        var filetypes = ".exe";
        var extname = path.extname(file.originalname).toLowerCase();
        if (filetypes == extname) {
            return cb("Error: File upload does not supports the "
                + "following filetypes - " + path.extname(file.originalname).toLowerCase(), false);
        }
        else {
            return cb(null, true);
        }
    }
}).array("document_name");

const addDocument = async (req, res) => {
    try {
        const { attachment_for, user_id, client_id, project_id } = req.body;
        const doc = req.files;
        if (user_id && client_id){
            if (!doc || !(attachment_for == 1 || attachment_for == 2 || attachment_for == 3)) {
                res.status(412).send({
                    status: 412,
                    message: "Document not found or type on defined"
                });
            } else {
                let docUrl = [];
                for (let i = 0; i < doc.length; i++) {
                    let url = `Attachments/${doc[i].filename}`;
                    docUrl.push(url);
                    let query = `SELECT * FROM tbl_attachments WHERE flag = 1 AND name = '${doc[i].originalname}'`;
                    let queryResult = await commonService.sqlJoinQuery(query);
                    if (queryResult.result.length == 0) {
                        let Parameter = {
                            name: doc[i].filename,
                            attachment_for,
                            user_id,
                            client_id,
                            project_id,
                            path: url,
                            created_at: moment().format("YYYY-MM-DD hh:mm:ss").toString(),
                            updated_at: moment().format("YYYY-MM-DD hh:mm:ss").toString()
                        }
                        if (Parameter) {
                            let tblName = "tbl_attachments";
                            let queryResult = await commonService.sqlQueryWithParametrs(
                                tblName,
                                Parameter
                            );
                            if (queryResult.result.affectedRows > 0) {
                                res.status(200).send({
                                    status: 200,
                                    message: "Documents successfully added",
                                    documentUrl: docUrl
                                });
                            } else {
                                res.status(500).send({
                                    status: 500,
                                    message: "Something went wrong !",
                                });
                            }
                        }
                    }
                    else {
                        res.status(403).send({
                            status: 403,
                            message: "File Name Already Exists",
                        });
                    }
                }
            }
        } else {
            res.status(500).send({
                status: 500,
                message: "user_id & client_id required!",
            });
        }
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: "Something went wrong!",
            error: e
        });
    }
}

const getDocument = async (req, res) => {
    try {
        let query = `SELECT * FROM tbl_attachments WHERE flag = 0`;
        let queryResult = await commonService.sqlJoinQuery(query);
        let doc = [];
        if (queryResult.result.length > 0) {
            for (i = 0; i < queryResult.result.length; i++) {
                if (fs.existsSync("./Attachments/" + queryResult.result[i].name)) {
                    let fileData = {
                        fileId: queryResult.result[i].id,
                        file_for: queryResult.result[i].attachment_for,
                        user_id: queryResult.result[i].user_id,
                        client_id: queryResult.result[i].client_id,
                        project_id: queryResult.result[i].project_id,
                        fileName: queryResult.result[i].name,
                        filePath: queryResult.result[i].path
                    }
                    doc.push(fileData);
                }
            }
            if (doc) {
                res.status(200).send({
                    status: 200,
                    message: doc,
                });
            } else {
                res.status(500).send({
                    status: 500,
                    message: "There Doesn't Exist Any Document in Local Server.",
                });
            }
        } else {
            res.status(500).send({
                status: 500,
                message: "There Doesn't Exist Any Document.",
            });
        }
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: "Something went wrong!",
            error: e
        });
    }
}

const deleteDocument = async (req, res) => {
    try {
        let query = `SELECT * FROM tbl_attachments WHERE id = '${req.params.id}' AND flag = 0`;
        let result = await commonService.sqlJoinQuery(query);
        if (result.result.length != 0) {
            let tblName = "tbl_attachments";
            let param = "flag = 1" + " Where id = " + req.params.id + "";
            let queryResult = await commonService.sqlUpdateQueryWithParametrs(tblName, param);
            if (queryResult.success) {
                res.status(200).send({
                    status: 200,
                    message: "Document successfully deleted"
                });
            } else {
                res.status(500).send({
                    status: 500,
                    message: "Something went wrong!",
                    error: queryResult.error,
                });
            }
        } else {
            res.status(500).send({
                status: 500,
                message: "Document ID doesn't exist!",
                error: result.error,
            });
        }

    } catch (e) {
        res.status(500).send({
            status: 500,
            message: "Something went wrong !",
            error: e
        })
    }
}

module.exports = {
    checkDir,
    uploadDocument,
    addDocument,
    getDocument,
    deleteDocument
}