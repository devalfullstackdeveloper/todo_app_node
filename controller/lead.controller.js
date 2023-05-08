const { compareSync } = require("bcrypt");
const commonService = require("../services/common.services");

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


//Adding lead
const leadAdd = async (req, res) => {
  try {
    let payload = req.body;

    let todayDate = new Date()
    let todayDate1 = todayDate.toISOString().split('T')[0]

    let parameters = {
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
      website: payload.website,
      no_of_employee: payload.no_of_employee,
      lead_source: payload.lead_source,
      annual_revenue: payload.annual_revenue,
      industry: payload.industry,
      create_date: todayDate1

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
    let todayDate = new Date()
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
      "' ,  website = '" +
      req.body.website +
      "' ,  no_of_employee = '" +
      req.body.no_of_employee +
      "' ,  lead_source = '" +
      req.body.lead_source +
      "' ,  annual_revenue = '" +
      req.body.annual_revenue +
      "' ,  industry = '" +
      req.body.industry +
      "' Where id = " +
      id +
      "";

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



//Deleting lead
const leadDelete = async (req, res) => {
  try {

    let id = req.params.id;

    let parameters =
      "flag = 1" +
      " Where id = " +
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






module.exports = {

  showlead,
  leadAdd,
  leadDelete,
  leadEdit,
  favouriteButton
};
