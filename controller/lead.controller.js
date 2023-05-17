const { compareSync } = require("bcrypt");
const commonService = require("../services/common.services");
const moment = require("moment/moment");


const showlead = async (req, res) => {
  try {
    let query;
    let dataLength = 0;
    let filtertype = req.body.filtertype;
    let sortType = req.body.sortType;
    let sortBy = req.body.sortBy;
    let pageNo = req.body.pageNo;
    let pageLength = req.body.pageLength;

    let todayDate = new Date()
    let todayDate1 = todayDate.toISOString().split('T')[0]

    if (filtertype == 0) {
      query = `SELECT * FROM tbl_lead WHERE flag= 0`;
    }
    else if (filtertype == 1) {
      query = `SELECT * FROM tbl_lead WHERE create_date='${todayDate1}' AND flag= 0`;

    }
    else if (filtertype == 2) {
      let curr = new Date
      let week = []

      for (let i = 1; i <= 7; i++) {
        let first = curr.getDate() - curr.getDay() + i
        let day = new Date(curr.setDate(first)).toISOString().slice(0, 10)
        week.push(`'${day}'`)
      }
      query = `SELECT * FROM tbl_lead WHERE create_date IN (${week}) AND flag= 0`;
    }
    else if (filtertype == 3) {
      query = `SELECT * FROM tbl_lead WHERE lead_status='New' AND flag= 0`;
    }
    else if (filtertype == 4) {
      query = `SELECT * FROM tbl_lead WHERE lead_status='Qualified' AND flag= 0`;
    }
    else if (filtertype == 5) {
      query = `SELECT * FROM tbl_lead WHERE favourite='Yes' AND flag= 0`;
    }

    if (sortBy == 'None') {
      if (sortType == 'asc') {
        query = `${query} ORDER BY create_date ASC`;
      }
      if (sortType == 'desc') {
        query = `${query} ORDER BY create_date DESC`;
      }
    }
    else if (sortBy == 'name') {
      if (sortType == 'asc') {
        query = `${query} ORDER BY first_name ASC`;
      }
      if (sortType == 'desc') {
        query = `${query} ORDER BY first_name DESC`;
      }
    }
    else if (sortBy == 'create_date') {
      if (sortType == 'asc') {
        query = `${query} ORDER BY create_date ASC`;
      }
      if (sortType == 'desc') {
        query = `${query} ORDER BY create_date DESC`;
      }
    }
    let totaldataquery = await commonService.sqlJoinQuery(query);
    let leadslist = [];
    for (let item1 of totaldataquery.result) {
      leadslist.push(item1)
      dataLength = dataLength + 1;
    }

    let startPage = (pageNo * pageLength) - pageLength;

    query = `${query} LIMIT ${startPage},${pageLength}`;

    let queryResult = await commonService.sqlJoinQuery(query);

    let leadslist1 = [];
    for (let item1 of queryResult.result) {
      leadslist1.push(item1)
    }

    if (queryResult.success) {
      res.status(200).send({
        status: 200,
        data: leadslist1,
        totalLeads: dataLength
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

const leadsource = async (req, res) => {
  try{
  const tblName = "tbl_lead_source"
  const parameters = "id,lead_sources_name,status"
  const condition = ""

  let query = await commonService.sqlSelectQueryWithParametrs(tblName, parameters, condition)
     if (query.success) 
     {
      res.status(200).send({
        status:200,
        data:query.result
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

//Adding lead
const leadAdd = async (req, res) => {
  try {
    let payload = req.body;

    let parameters = {
      user_id: payload.user_id,
      first_name: payload.first_name,
      last_name: payload.last_name,
      company: payload.company,
      title: payload.title,
      lead_status: payload.lead_status,
      phone_number: payload.phone_number,
      email: payload.email,
      priority: payload.priority,
      street: payload.street,
      city: payload.city,
      zipcode: payload.zipcode,
      country: payload.country,
      website: payload.website,
      lead_source: payload.lead_source,
      industry: payload.industry,
      assigned_employee: payload.assigned_employee
    };
    let tblName = "tbl_lead";

    let parameters1 = "Count(id) As count";

    let condition1 = " email='" +
      payload.email +
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
            message: "lead successfully Added",
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


//Editing lead
const leadEdit = async (req, res) => {
  try {
    let id = req.params.id;
    let payload = req.body;
    const updated_at = moment().format("YYYY-MM-DD hh:mm:ss").toString();
    let parameters =
      "first_name= '" +
      req.body.first_name +
      "' , last_name = '" +
      req.body.last_name +
      "' ,  company = '" +
      req.body.company +
      "' ,  title = '" +
      req.body.title +
      "' ,  lead_status = '" +
      req.body.lead_status +
      "' ,  phone_number = '" +
      req.body.phone_number +
      "' ,  email = '" +
      req.body.email +
      "' ,  priority = '" +
      req.body.priority +
      "' ,  street = '" +
      req.body.street +
      "' ,  city = '" +
      req.body.city +
      "' ,  zipcode = '" +
      req.body.zipcode +
      "' ,  country = '" +
      req.body.country +
      "' ,  website = '" +
      req.body.website +
      "' ,  lead_source = '" +
      req.body.lead_source +
      "' ,  industry = '" +
      req.body.industry +
      "' ,  assigned_employee = '" +
      req.body.assigned_employee +
      "' ,  updated_at = '" +
      updated_at +
      "' Where id = " +
      id +
      " AND flag = 0";

    let tblName = "tbl_lead";

    let parameters1 = "Count(id) As count";

    let condition1 = "id = '" + id + "'AND email='" +
      payload.email +
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

      }
      else {
        res.status(403).send({
          status: 403,
          message: "Data Not Present!",
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



//Deleting lead
const leadDelete = async (req, res) => {
  try {

    let id = req.params.id;
    const updated_at = moment().format("YYYY-MM-DD hh:mm:ss").toString();

    let parameters =
      "flag = 1" + " ,  updated_at = '" +
      updated_at +
      "' Where id = " +
      id +
      "";


    let tblName = "tbl_lead";

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


//favourite button
const favouriteButton = async (req, res) => {
  try {
    let id = req.params.id;
    let parameters;

    let tblName = "tbl_lead";

    let parameters1 = "*";

    let condition1 = " id='" +
      id +
      "'";

    let queryResult1 = await commonService.sqlSelectQueryWithParametrs(
      tblName,
      parameters1,
      condition1
    );

    if (queryResult1.success) {

      if (queryResult1.result[0].favourite == "Yes") {
        parameters =
          "favourite= '" +
          "No" +
          "' Where id = " +
          id +
          "";

      }
      else {
        parameters =
          "favourite= '" +
          "Yes" +
          "' Where id = " +
          id +
          "";
      }
      let queryResult = await commonService.sqlUpdateQueryWithParametrs(
        tblName,
        parameters
      );
      if (queryResult.success) {
        res.status(200).send({
          status: 200,
          message: "favourite Record Changed",
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

//favourite button
// const favouriteButton = async (req, res) => {
//   try {
//     let id = req.params.id;
//     let parameters;

//     let tblName = "tbl_lead";

//     let parameters1 = "*";

//     let condition1 = " id='" +
//       id +
//       "'";

//     let queryResult1 = await commonService.sqlSelectQueryWithParametrs(
//       tblName,
//       parameters1,
//       condition1
//     );

//     console.log(queryResult1.result);


//     if (queryResult1.success) {

//       if (queryResult1.result[0].favourite == "Yes") {
//         parameters =
//           "favourite= '" +
//           "No" +
//           "' Where id = " +
//           id +
//           "";

//       }
//       else {
//         parameters =
//           "favourite= '" +
//           "Yes" +
//           "' Where id = " +
//           id +
//           "";
//       }
//       let queryResult = await commonService.sqlUpdateQueryWithParametrs(
//         tblName,
//         parameters
//       );
//       if (queryResult.success) {
//         res.status(200).send({
//           status: 200,
//           message: "favourite Record Changed",
//         });
//       } else {
//         res.status(500).send({
//           status: 500,
//           message: "Something went wrong",
//           error: queryResult.error,
//         });
//       }

//     } else {
//       res.status(500).send({
//         status: 500,
//         message: "Something went wrong",
//         error: e,
//       });
//     }
//   } catch (e) {
//     res.status(500).send({
//       status: 500,
//       message: "Something went wrong!",
//       error: e,
//     });
//   }
// };

const addFollowUp = async (req, res) => {
  try {
    let validationRule = {
      user_id: "required|string",
      lead_id: "required|string",
      remainder: "required|string",
      related_to: "required|string",
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
      const payload = req.body;
      let tblName = "tbl_followup";
      let parameters = "*";
      let condition = "user_id = '" + payload.user_id + "' AND lead_id = '" + payload.lead_id + "' AND remainder = '" + payload.remainder + "' AND related_to = '" + payload.related_to + "' AND link = '" + payload.link + "' AND attendees = '" + payload.attendees + "' AND flag = 0";
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
              "Follow Up Already Exists",
            ],
          },
        });
      } else {
        parameters = {
          user_id: payload.user_id,
          lead_id: payload.lead_id,
          remainder: payload.remainder,
          description: payload.description,
          link: payload.link,
          related_to: payload.related_to,
          attendees: payload.attendees
        };
        let queryResult = await commonService.sqlQueryWithParametrs(
          tblName,
          parameters
        );
        if (queryResult.success) {
          res.status(200).send({
            status: 200,
            message: "Follow Up successfully Added",
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

const updateFollowUp = async (req, res) => {
  try {
    const id = req.params.id;
    const updated_at = moment().format("YYYY-MM-DD hh:mm:ss").toString();
    let parameters = "";
    if (req.body.lead_id) { parameters += "  lead_id = '" + req.body.lead_id + "'," }
    if (req.body.remainder) { parameters += "  remainder = '" + req.body.remainder + "'," }
    if (req.body.description) { parameters += "  description = '" + req.body.description + "'," }
    if (req.body.link) { parameters += "  link = '" + req.body.link + "'," }
    if (req.body.related_to) { parameters += "  related_to = '" + req.body.related_to + "'," }
    if (req.body.attendees) { parameters += "  attendees = '" + req.body.attendees + "'," }
    if (req.body.outcomes) { parameters += "  outcomes = '" + req.body.outcomes + "'," }
    if (req.body.completed) { parameters += "  completed = '" + req.body.completed + "'," }
    parameters += "  updated_at = '" + updated_at + "' Where id = " + id + "";
    let tblName = "tbl_followup";
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


const statusList = async (req, res) => {
  try {
    const event = req.params.event
    let condition;
    if (event == 'All') {
      condition = '';
    } else if (event == 1) {
      condition = 'flag = 0';
    } else {
      condition = 'flag = 1';
    }
    const query = await commonService.sqlSelectQueryWithParametrs("tbl_status", "id, name", condition);
    if (query.result.length > 0) {
      res.status(200).send({
        status: 200,
        data: query.result,
      });
    } else {
      res.status(500).send({
        status: 500,
        message: "No Records Found",
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
const industriesList = async (req, res) => {
  try {
    const event = req.params.event
    let condition;
    if (event == 'All') {
      condition = '';
    } else if (event == 1) {
      condition = 'flag = 0';
    } else {
      condition = 'flag = 1';
    }
    const query = await commonService.sqlSelectQueryWithParametrs("tbl_industries", "id, name", condition);
    if (query.result.length > 0) {
      res.status(200).send({
        status: 200,
        data: query.result,
      });
    } else {
      res.status(500).send({
        status: 500,
        message: "No Records Found",
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
const priorityList = async (req, res) => {
  try {
    const event = req.params.event
    let condition;
    if (event == 'All') {
      condition = '';
    } else if (event == 1) {
      condition = 'flag = 0';
    } else {
      condition = 'flag = 1';
    }
    const query = await commonService.sqlSelectQueryWithParametrs("tbl_priority", "id, name", condition); if (query.result.length > 0) {
      res.status(200).send({
        status: 200,
        data: query.result,
      });
    } else {
      res.status(500).send({
        status: 500,
        message: "No Records Found",
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

module.exports = {
  showlead,
  leadAdd,
  leadDelete,
  leadEdit,
  favouriteButton,
  addFollowUp,
  updateFollowUp,
  followupList,
  statusList,
  industriesList,
  priorityList,
  leadsource
};
