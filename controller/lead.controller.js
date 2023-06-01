const { compareSync } = require("bcrypt");
const commonService = require("../services/common.services");
const moment = require("moment/moment");
const { isNull } = require("underscore");
const { disable } = require("../server");


const showlead = async (req, res) => {
  try {
    let query;
    let searchBy = req.body.searchBy;
    let dataLength = 0;
    let filtertype = req.body.filtertype;
    let sortType = req.body.sortType;
    let sortBy = req.body.sortBy;
    let pageNo = req.body.pageNo;
    let pageLength = req.body.pageLength;
    let user_id = req.body.user_id;

    let todayDate = new Date()
    let todayDate1 = todayDate.toISOString().split('T')[0]

    if (filtertype == 0) {
      query = user_id ? `SELECT * FROM tbl_lead WHERE flag= 0 AND user_id = ${user_id}` : `SELECT * FROM tbl_lead WHERE flag= 0`;
    }
    else if (filtertype == 1) {
      query = user_id ? `SELECT * FROM tbl_lead WHERE create_date='${todayDate1}' AND flag= 0 AND user_id = ${user_id}` : `SELECT * FROM tbl_lead WHERE create_date='${todayDate1}' AND flag= 0`;

    }
    else if (filtertype == 2) {
      let curr = new Date
      let week = []

      for (let i = 1; i <= 7; i++) {
        let first = curr.getDate() - curr.getDay() + i
        let day = new Date(curr.setDate(first)).toISOString().slice(0, 10)
        week.push(`'${day}'`)
      }
      query = user_id ? `SELECT * FROM tbl_lead WHERE create_date IN (${week}) AND flag= 0 AND user_id = ${user_id}` : `SELECT * FROM tbl_lead WHERE create_date IN (${week}) AND flag= 0`;
    }
    else if (filtertype == 3) {
      query = user_id ? `SELECT * FROM tbl_lead WHERE lead_status='New' AND flag= 0 AND user_id = ${user_id}` : `SELECT * FROM tbl_lead WHERE lead_status='New' AND flag= 0`;
    }
    else if (filtertype == 4) {
      query = user_id ? `SELECT * FROM tbl_lead WHERE lead_status='Qualified' AND flag= 0 AND user_id = ${user_id}` : `SELECT * FROM tbl_lead WHERE lead_status='Qualified' AND flag= 0`;
    }
    else if (filtertype == 5) {
      query = user_id ? `SELECT * FROM tbl_lead WHERE favourite='Yes' AND flag= 0 AND user_id = ${user_id}` : `SELECT * FROM tbl_lead WHERE favourite='Yes' AND flag= 0`;
    }
    if(searchBy){
      if(user_id){
        query += ` AND concat(first_name," ",last_name) like "%${searchBy}%" `;
      }else{
        query += ` AND concat(first_name," ",last_name," ",assigned_employee) like "%${searchBy}%" `;
      }
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
  try {
    const tblName = "tbl_lead_source"
    const parameters = "id,lead_source_name,status"
    const condition = ""

    let query = await commonService.sqlSelectQueryWithParametrs(tblName, parameters, condition)
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

//Adding lead
const leadAdd = async (req, res) => {
  try {
    let payload = req.body;

    let parameters = {
      user_id: payload.user_id,
      profile_img: payload.profile_img,
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
      "' , profile_img= '" +
      req.body.profile_img +
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

    let condition1 = "id = '" + id +
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
const followUpListBy_lead = async (req, res) => {
  try {
    let tblName = "tbl_followup"
    let parameter = "*"
    let condition = ""
    if (req.headers.user_id) { condition += "user_id=" + req.headers.user_id + " AND " }
    if (req.headers.lead_id) { condition += "lead_id=" + req.headers.lead_id + " AND " }
    condition += " flag='" + 0 + "' ORDER BY remainder DESC";

    let query = await commonService.sqlSelectQueryWithParametrs(tblName, parameter, condition)
    console.log(query);
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
const followUpList = async (req, res) => {
  try {
    const params = req.params.type;
    if (params == "today") {
      const date = new Date()
      const formatDate = moment(date).format('YYYY-MM-DD')
      const tblName = "tbl_followup"
      const parameter = "*"
      let condition = ""; //= req.headers.user_id ? "user_id="+req.headers.user_id+" AND" : " " + req.headers.lead_id ? "lead_id="+req.headers.lead_id+" AND" : " " + "Date(remainder) = '" + formatDate +"'";
      if (req.headers.user_id) { condition += "user_id=" + req.headers.user_id + " AND " }
      if (req.headers.lead_id) { condition += " lead_id=" + req.headers.lead_id + " AND " }
      condition += " Date(remainder) = '" + formatDate + "'";
      // const condition = `user_id=${req.headers.user_id} AND lead_id=${req.headers.lead_id} AND Date(remainder) ='${formatDate}'`
      console.log(condition);
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
    } else if (params == "overdue") {
      const date = new Date()
      const formatDate = moment(date).format('YYYY-MM-DD')
      const tblName = "tbl_followup"
      const parameter = "*"
      let condition = "";
      // `user_id=${req.headers.user_id} AND lead_id=${req.headers.lead_id} AND Date(remainder) < '${formatDate}' AND outcomes IS NULL`
      if (req.headers.user_id) { condition += "user_id=" + req.headers.user_id + " AND " }
      if (req.headers.lead_id) { condition += " lead_id=" + req.headers.lead_id + " AND " }
      condition += " Date(remainder) < '" + formatDate + "' AND outcomes IS NULL";
      let query = await commonService.sqlSelectQueryWithParametrs(tblName, parameter, condition)
      console.log(query);
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

    } else if (params == "upcoming") {
      const date = new Date()
      const formatDate = moment(date).format('YYYY-MM-DD')
      const tblName = "tbl_followup"
      const parameter = "*"
      let condition = "";
      // `user_id=${req.headers.user_id} AND lead_id=${req.headers.lead_id} AND Date(remainder) > '${formatDate}'`
      if (req.headers.user_id) { condition += "user_id=" + req.headers.user_id + " AND " }
      if (req.headers.lead_id) { condition += " lead_id=" + req.headers.lead_id + " AND " }
      condition += " Date(remainder) > '" + formatDate + "'";
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
    } else if (params == "completed") {
      const date = new Date()
      const formatDate = moment(date).format('YYYY-MM-DD')
      const tblName = "tbl_followup"
      const parameter = "*"
      let condition = "";
      // `user_id=${req.headers.user_id} AND lead_id=${req.headers.lead_id} AND outcomes IS NOT NULL`
      if (req.headers.user_id) { condition += "user_id=" + req.headers.user_id + " AND " }
      if (req.headers.lead_id) { condition += " lead_id=" + req.headers.lead_id + " AND " }
      condition += " outcomes IS NOT NULL ";
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

    }
  } catch (e) {
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }
}
const activityHistory = async (req, res) => {
  try {

    let query = await commonService.sqlJoinQuery(`SELECT tbl_followup.description,tbl_followup.outcomes,tbl_followup.created_at, tbl_user.first_name as Name,tbl_followup.completed,tbl_notes.note_description,tbl_attachments.name from tbl_followup INNER JOIN tbl_user ON tbl_user.id = tbl_followup.user_id INNER JOIN tbl_notes ON tbl_followup.user_id = tbl_notes.id INNER JOIN tbl_attachments ON tbl_followup.id = tbl_attachments.project_id ORDER BY created_at ASC`)
    //  if(req.headers.client_id || req.headers.project_id){
    //    console.log(query.result); 
    //  }

    let data = query.result;
    let newData = []
    data.map((dat) => {
      if (dat.name === "") {
        newData.push(dat)
      } else {
        dat.description = "", dat.note_description = ""
        let { ...others } = dat
        newData.push(others)
      }

      if (dat.outcomes && dat.outcomes !== null) {
        dat.completed = true;
      } else {
        dat.completed = false;
      }
    })
    if (query.success) {
      res.status(200).send({
        status: 200,
        data: newData,
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
const followUpList_Datewise = async (req, res) => {
  try {
    const date = new Date()
    const c_date = date.toLocaleDateString();

    let tblName = "tbl_followup"
    let parameter = "*"
    let condition = "Date(remainder) = " + c_date + " AND user_id = " + req.headers.user_id;

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

  } catch (e) {
    res.status(500).send({
      status: 500,
      message: "Something went wrong!",
      error: e,
    });
  }

}
const lead_created_homePage = async (req, res) => {
  try {

    let id = req.query.user_id
    let query = await commonService.sqlJoinQuery(`SELECT tls.lead_source_name,CASE WHEN tl.countlead_source is null then 0 ELSE tl.countlead_source END AS COUNT from tbl_lead_source tls
        LEFT JOIN (SELECT lead_source,COUNT(lead_source) as countlead_source from tbl_lead GROUP BY lead_source)tl ON tl.lead_source=tls.id ;`)
    console.log(query);
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
const lead_project = async (req, res) => {
  try {
      let id=req.query.user_id;
      let query= await commonService.sqlJoinQuery(`SELECT COUNT(id),MONTH(created_at) FROM tbl_project GROUP BY MONTH(created_at)`)
      if(id){ " WHERE user_id=" +id}
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
const lead_converted = async (req, res) => {

  try {
    let query = await commonService.sqlJoinQuery(`  SELECT u.id,concat(u.first_name," ",u.last_name) AS FullName,(SELECT COUNT(l.id ) FROM tbl_client as l WHERE l.user_id = u.id AND l.lead_id > 0) AS Total_Count FROM tbl_user AS u`)
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
  // followupList,
  statusList,
  industriesList,
  priorityList,
  leadsource,
  followUpList,
  activityHistory,
  followUpListBy_lead,
  followUpList_Datewise,
  lead_created_homePage,
  lead_converted,
  lead_project


};
