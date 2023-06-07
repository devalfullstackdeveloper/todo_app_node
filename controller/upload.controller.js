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
const maxSize = 20 * 1024 * 1024;
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
    limits: {fileSize: maxSize},
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
        const { attachment_for, user_id, client_id, project_id , lead_id} = req.body;
        const doc = req.files;
        console.log(doc);
        if ((user_id && client_id && project_id) || (user_id && lead_id)) {
            if (!doc || !(attachment_for == 1 || attachment_for == 2 || attachment_for == 3)) {
                res.status(412).send({
                    status: 412,
                    message: "Document not found or type on defined",
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
                            lead_id,
                            attachment_size:((doc[i].size)/(1024*1024)),
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
    try{
        let tblName = "tbl_attachments";
        let parameters = "*";
        let condition = "";
        if (req.query.user_id && req.query.lead_id) { condition += "user_id=" + req.query.user_id + " AND lead_id=" +  req.query.lead_id} else if(req.query.user_id && req.query.client_id && req.query.project_id) {
          condition += "user_id=" + req.query.user_id + " AND client_id=" + req.query.client_id+ " AND project_id=" + req.query.project_id
        }
        condition ? condition += " AND flag='" + 0 + "' " : condition += " flag='" + 0 + "' ";
        let queryResult = await commonService.sqlSelectQueryWithParametrs(
          tblName,
          parameters,
          condition
        );
        let data = queryResult.result;
        data.map(e=>{
            if(e.attachment_size && e.attachment_size != ""){
                e.attachment_size +=" Mb";
            }
        })
        if (queryResult.success) {
          res.status(200).send({
            status: 200,
            data: queryResult.result,
          });
        } else {
          res.status(500).send({
            status: 500,
            message: "Something went wrong!",
            error: queryResult.error,
          });
        }
    }
    catch (e) {
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

const checkDirPro = async (req, res, next) => {
    try {
        if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads');
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

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "uploads");
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + "-" + Date.now() + ".jpg");
        },
    }),
}).single("files");

const uploadFile = async function (req, res) {
    try {
        const images = req.file;
        if (!images && images != "") {
            res.status(412).send({
                status: 412,
                message: "Image not found",
            });
        } else {
            let url = `profile/${images.filename}`;
            res.status(200).send({
                status: 200,
                message: "Image uploaded successfully",
                imgUrl: url
            });
        }
    } catch (e) {
        res.status(500).send({
            status: 500,
            message: "Something went wrong!",
            error: e
        });
    }
};

module.exports = {
    checkDir,
    uploadDocument,
    addDocument,
    getDocument,
    deleteDocument,
    checkDirPro,
    upload,
    uploadFile
}