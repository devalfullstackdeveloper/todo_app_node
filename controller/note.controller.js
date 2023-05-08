const { compareSync } = require("bcrypt");
const commonService = require("../services/common.services");


const showNotes = async (req, res) => {
    try {
      let id = req.params.client_id;
      let tblName = "tbl_notes";
      let parameters = "*";
      let condition  = " client_id='" +
     id +
      "' AND flag='" +
0 +
            "' ";
      let queryResult = await commonService.sqlSelectQueryWithParametrs(
        tblName,
        parameters,
        condition
      );
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

    let todayDate = new Date()
    let todayDate1 = todayDate.toISOString().split('T')[0]

    let parameters = {
        note_description: payload.note_description,
        client_id: payload.client_id,
        user_id: payload.user_id,
      create_date: todayDate1,
      update_date: todayDate1

    };

    let tblName = "tbl_notes";

    let parameters1 = "Count(id) As count";

    let condition1 = " note_description='" +
      payload.note_description +
      "' AND client_id='" +
      payload.client_id +
      "' AND user_id='" +
      payload.user_id +
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
    let parameters =
      "note_description= '" +
      req.body.note_description +
      "' , client_id = '" +
      req.body.client_id +
      "' ,  user_id = '" +
      req.body.user_id +
      "' ,  update_date = '" +
      todayDate1+
      "' Where id = " +
      id +
      "";

    let tblName = "tbl_notes";

    let parameters1 = "Count(id) As count";

    let condition1 = " note_description='" +
      payload.note_description +
      "' AND client_id='" +
      payload.client_id +
      "' AND user_id='" +
      payload.user_id +
      "' AND id!='" +
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
    if (queryResult.success) {
      res.status(200).send({
        status: 200,
        message: "Deleted Record Successfully",
      });
    } else {
      res.status(500).send({
        status: 500,
        message: "Something went wrong2!",
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
