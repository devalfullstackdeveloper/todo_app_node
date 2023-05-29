const commonService = require("../services/common.services");
const { query } = require("express");

const callLog_Add = async (req, res) => {
    try {
        let payload = req.body;
        let parameter = {
            user_id: payload.user_id,
            client_id: payload.client_id,
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
        if (req.body.call_type) { parameters += "call_type= '" + req.body.call_type + "'," }
        if (req.body.meet_type) { parameters += "meet_type= '" + req.body.meet_type + "'," }
        if (req.body.outcome) { parameters += "outcome= '" + req.body.outcome + "'," }
        if (req.body.notes) { parameters += "notes= '" + req.body.notes + "'," }
        parameters += "  updated_date = '" + todayDate1 + "' Where id = " + id + "";
    
    
        let tblName = "tbl_call_log";
    
        let parameters1 = "Count(id) As count";
    
        let condition1 = " call_type='" +
          payload.call_type +
          "' AND meet_type='" +
          payload.meet_type +
          "' AND outcome='" +
          payload.outcome +
          "' AND notes='" +
          payload.notes +
          "' AND id =" +
          id ;
    
        let queryResult1 = await commonService.sqlSelectQueryWithParametrs(
          tblName,
          parameters1,
          condition1
        );
        console.log(queryResult1);
        if (queryResult1.success) {
    
          if (queryResult1.result[0].count == 0) {
    
            let queryResult = await commonService.sqlUpdateQueryWithParametrs(
              tblName,
              parameters
            );
            console.log(queryResult);
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
module.exports = {
    callLog_Add,
    callLog_Delete,
    callLog_Updated
}