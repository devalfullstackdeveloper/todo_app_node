const commonService = require("../services/common.services");
const { query } = require("express");

const callLog_Add = async (req, res) => {
  try {
    let payload = req.body;
    let parameter = {
      user_id: payload.user_id,
      client_id: payload.client_id,
      lead_id: payload.lead_id,
      project_id: payload.project_id,
      call_type: payload.call_type,
      meet_type: payload.meet_type,
      outcome: payload.outcome,
      notes: payload.notes
    }
    let tblName = "tbl_call_log";

    let query = await commonService.sqlQueryWithParametrs(
      tblName,
      parameter
    );

    if (query.success) {
      res.status(200).send({
        status: 200,
        message: "callLog successfully Added",
      });
    } else {
      res.status(500).send({
        status: 500,
        message: "Something went wrong1!",
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
const callLog_Delete = async (req, res) => {
  try {
    let id = req.params.id;
    let tblName = "tbl_call_log"


    let query = await commonService.sqlDeleteQueryWithParametrs(id, tblName)
    if (query.success) {
      res.status(200).send({
        status: 200,
        message: "callLog successfully Deleted",
      });
    } else {
      res.status(500).send({
        status: 500,
        message: "Something went wrong1!",
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
const callLog_Updated = async (req, res) => {
  try {
    let id = req.params.id;
    let payload = req.body;
    let todayDate = new Date()
    let todayDate1 = todayDate.toISOString().split('T')[0]
    let parameters = "";
    if (req.body.user_id) { parameters += "user_id= '" + req.body.user_id + "'," }
    if (req.body.client_id) { parameters += "client_id= '" + req.body.client_id + "'," }
    if (req.body.lead_id) { parameters += "lead_id= '" + req.body.lead_id + "'," }
    if (req.body.project_id) { parameters += "project_id= '" + req.body.project_id + "'," }
    if (req.body.call_type) { parameters += "call_type= '" + req.body.call_type + "'," }
    if (req.body.meet_type) { parameters += "meet_type= '" + req.body.meet_type + "'," }
    if (req.body.outcome) { parameters += "outcome= '" + req.body.outcome + "'," }
    if (req.body.notes) { parameters += "notes= '" + req.body.notes + "'," }
    parameters += "  updated_date = '" + todayDate1 + "' Where id = " + id + "";


    let tblName = "tbl_call_log";

    let parameters1 = "Count(id) As count";

    let condition1 = "project_id='" + payload.project_id + "' AND lead_id='" + payload.lead_id + "' AND client_id='" + payload.client_id + "' AND user_id='" + payload.user_id + "' AND call_type='" +
      payload.call_type +
      "' AND meet_type='" +
      payload.meet_type +
      "' AND outcome='" +
      payload.outcome +
      "' AND notes='" +
      payload.notes +
      "' AND id =" +
      id;

    let queryResult1 = await commonService.sqlSelectQueryWithParametrs(
      tblName,
      parameters1,
      condition1
    );
    if (queryResult1.success) {

      if (queryResult1.result[0].count == 0) {

        let queryResult = await commonService.sqlUpdateQueryWithParametrs(
          tblName,
          parameters
        );
        if (queryResult.result.affectedRows > 0) {
          res.status(200).send({
            status: 200,
            message: "Update Record Successfully",
          });
        } else {
          res.status(500).send({
            status: 500,
            message: "record not found",
            error: queryResult.error,
          });
        }
      }
      else {
        res.status(403).send({
          status: 403,
          message: "Data Already Present!",
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

const callLog_List = async (req, res) => {
  try {
    let payload = req.body;
    let query = `SELECT c.*, concat(tb.first_name," ",tb.last_name) as client_name, concat(le.first_name," ",le.last_name) as lead_name, pro.name as project_name, concat(u.first_name," ",u.last_name) as user_name FROM tbl_call_log as c LEFT JOIN tbl_client AS tb ON c.client_id = tb.id LEFT JOIN tbl_lead AS le ON c.lead_id = le.id LEFT JOIN tbl_project AS pro ON c.project_id = pro.id LEFT JOIN tbl_user AS u ON c.user_id = u.id `;
    if (payload.user_id && payload.client_id && payload.project_id) {
      query += "WHERE c.user_id=" + payload.user_id + " AND c.client_id=" + payload.client_id + " AND c.project_id=" + payload.project_id
    }
    else if (payload.user_id && payload.lead_id) {
      query += "WHERE c.user_id=" + payload.user_id + " AND c.lead_id=" + payload.lead_id
    }
    else if (payload.user_id) {
      query += "WHERE c.user_id =" + payload.user_id
    }
    let queryResult = await commonService.sqlJoinQuery(query)
    let data = [];
    data = queryResult.result;

    if (queryResult.success) {
      res.status(200).send({
        status: 200,
        data: data
      });
    } else {
      res.status(500).send({
        status: 500,
        message: "No Record Found.",
      });
    }
  }
  catch (e) {
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }
}
module.exports = {
  callLog_Add,
  callLog_Delete,
  callLog_Updated,
  callLog_List
}