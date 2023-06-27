const { compareSync } = require("bcrypt");
const commonService = require("../services/common.services");


const showNotes = async (req, res) => {
  try {
    let uid = req.query.user_id;
    let pid = req.query.project_id;
    let lid = req.query.lead_id;
    let cid = req.query.client_id;
    let queryResult1;
    if (lid) {
      queryResult1 = `SELECT n.*,concat(l.first_name," ",l.last_name) AS Lead_Name from tbl_notes AS n LEFT JOIN tbl_lead AS l ON n.lead_id = l.id WHERE n.flag = 0 `;
      if (lid) { queryResult1 += "AND n.lead_id=" + lid + "" }
    }
    if (cid && pid) {
      queryResult1 = `SELECT n.*,p.name AS Project_Name from tbl_notes AS n LEFT JOIN tbl_project AS p ON n.project_id = p.id WHERE n.flag = 0 `
      if (pid) { queryResult1 += "AND n.project_id=" + pid + "" }
      if (cid) { queryResult1 += " AND n.client_id=" + cid + "" }
    }
    if (uid) { queryResult1 += " AND n.user_id=" + uid + "" }
    let queryResult = await commonService.sqlJoinQuery(queryResult1)

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
  } catch (e) {
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }
};

//Adding note
const noteAdd = async (req, res) => {
  try {
    let payload = req.body;
    let notes_for = payload.notes_for;
    let todayDate = new Date();
    let todayDate1 = todayDate.toISOString().split('T')[0];
    let parameters;
    if (notes_for == 1 || notes_for == 2 || notes_for == 3) {
      parameters = {
        note_description: payload.note_description,
        client_id: payload.client_id ? payload.client_id : "",
        user_id: payload.user_id,
        lead_id: payload.lead_id ? payload.lead_id : "",
        create_date: todayDate1,
        update_date: todayDate1,
        notes_for: notes_for,
        project_id: payload.project_id ? payload.project_id : ""
      };
    }

    let tblName = "tbl_notes";

    let parameters1 = "Count(id) As count";

    let condition1 = " note_description='" +
      payload.note_description +
      "' AND client_id='" +
      payload.client_id +
      "' AND user_id='" +
      payload.user_id +
      "' AND lead_id='" +
      payload.lead_id +
      "' AND notes_for='" +
      notes_for +
      "'AND project_id='" +
      payload.project_id +
      "' AND flag='" +
      0 +
      "' ";

    let queryResult1 = await commonService.sqlSelectQueryWithParametrs(
      tblName,
      parameters1,
      condition1
    );

    if (queryResult1.success) {

      if (queryResult1.result[0].count == 0) {

        let queryResult = await commonService.sqlQueryWithParametrs(
          tblName,
          parameters
        );

        if (queryResult.success) {
          res.status(200).send({
            status: 200,
            message: "note successfully Added",
          });
        } else {
          res.status(500).send({
            status: 500,
            message: "Something went wrong1!",
            error: e,
          });
        }


      } else {
        res.status(403).send({
          status: 403,
          message: "Data Already Present!",
        });
      }

    } else {
      res.status(500).send({
        status: 500,
        message: "Something went wrong!",
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

};

//Editing note
const noteEdit = async (req, res) => {
  try {
    let id = req.params.id;
    let payload = req.body;
    let todayDate = new Date()
    let todayDate1 = todayDate.toISOString().split('T')[0]
    let parameters = "";
    if (req.body.note_description) { parameters += "note_description= '" + req.body.note_description + "'," }
    if (req.body.client_id) { parameters += "client_id= '" + req.body.client_id + "'," }
    if (req.body.user_id) { parameters += "user_id= '" + req.body.user_id + "'," }
    if (req.body.notes_for) { parameters += "notes_for= '" + req.body.notes_for + "'," }
    if (req.body.project_id) { parameters += "project_id= '" + req.body.project_id + "'," }
    parameters += "  update_date = '" + todayDate1 + "' Where id = " + id + "";

    let tblName = "tbl_notes";

    let parameters1 = "Count(id) As count";

    let condition1 = " note_description='" +
      payload.note_description +
      "' AND client_id='" +
      payload.client_id +
      "' AND user_id='" +
      payload.user_id +
      "' AND notes_for='" +
      payload.notes_for +
      "' AND id ='" +
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
};



//Deleting note
const noteDelete = async (req, res) => {
  try {

    let id = req.params.id;

    let parameters =
      "flag = 1" +
      " Where id = " +
      id +
      "";

    let tblName = "tbl_notes";

    let queryResult = await commonService.sqlUpdateQueryWithParametrs(
      tblName,
      parameters
    );
    if (queryResult.result.affectedRows > 0) {
      res.status(200).send({
        status: 200,
        message: "Deleted Record Successfully",
      });
    } else {
      res.status(500).send({
        status: 500,
        message: "record not found!",
        error: queryResult.error,
      });
    }

  } catch (e) {
    res.status(500).send({
      status: 500,
      message: "Something went wrong1!",
      error: e,
    });
  }
};

module.exports = {

  noteAdd,
  noteDelete,
  noteEdit,
  showNotes

};
