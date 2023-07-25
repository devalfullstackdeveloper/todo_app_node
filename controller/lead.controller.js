const { compareSync } = require("bcrypt");
const commonService = require("../services/common.services");
const moment = require("moment/moment");
const { isNull } = require("underscore");
const { disable } = require("../server");
const { query } = require("express");


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
      query = user_id ? `SELECT * FROM tbl_lead WHERE lead_status NOT IN ('Qualified', 'New') AND flag= 0 AND user_id = ${user_id}` : `SELECT * FROM tbl_lead WHERE lead_status NOT IN ('Qualified', 'New') AND flag = 0`;
    }
    else if (filtertype == 6) {
      query = user_id ? `SELECT * FROM tbl_lead WHERE favourite='Yes' AND flag= 0 AND user_id = ${user_id}` : `SELECT * FROM tbl_lead WHERE favourite='Yes' AND flag= 0`;
    }
    if (searchBy) {
      if (user_id) {
        query += ` AND concat(first_name," ",last_name) like "%${searchBy}%" `;
      } else {
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

    query = startPage ? `${query} LIMIT ${startPage},${pageLength}`:query;
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
      referral: payload.referral,
      industry: payload.industry,
      assigned_employee: payload.assigned_employee,
      meet_link:payload.meet_link
    };
    let tblName = "tbl_lead";

    let parameters1 = "Count(id) As count";

    let condition1 = " first_name='" +
      payload.first_name +
      "' AND last_name='" +
      payload.last_name +
      "' AND company='" +
      payload.company +
      "' AND lead_status='" +
      payload.lead_status +
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
      "' ,  referral = '" +
      req.body.referral +
      "' ,  industry = '" +
      req.body.industry +
      "' ,  assigned_employee = '" +
      req.body.assigned_employee +
      "' ,  meet_link = '" +
      req.body.meet_link +
      "' updated_at = '" +
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

const addFollowUp = async (req, res) => {
  try {
    let validationRule = {
      user_id: "required|string",
      remainder: "required|string",
      related_to: "required|string",
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
      let condition = "user_id = '" + payload.user_id + "' AND remainder = '" + payload.remainder + "' AND related_to = '" + payload.related_to + "' AND link = '" + payload.link + "' AND attendees = '" + payload.attendees + "' AND flag = 0";
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
        let paratameters = {
          user_id: payload.user_id,
          lead_id: payload.lead_id,
          client_id: payload.client_id,
          project_id: payload.project_id,
          followup_for: payload.followup_for,
          remainder: payload.remainder,
          description: payload.description,
          link: payload.link,
          related_to: payload.related_to,
          attendees: payload.attendees,
          outcomes: payload.outcomes,
          meet_link:payload.meet_link
        };
        let queryResult = await commonService.sqlQueryWithParametrs(
          tblName,
          paratameters
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
    let sort = req.params.type;
    let payload = req.body;
    let type = 1;
    let query = `SELECT f.* FROM tbl_followup as f `;
    if(payload.user_id){ 
      type = 3;
    }
    if (payload.user_id && payload.lead_id) {
      type = 1;
    } else if (payload.user_id && payload.client_id && payload.project_id) {
      type = 2;
    }
    if (payload.user_id) { query += "WHERE f.flag = 0 AND f.user_id=" + payload.user_id  } else { query += "WHERE f.flag = 0 AND " }
    if (payload.lead_id) { query += " AND f.lead_id=" + payload.lead_id + " AND " }
    if (payload.client_id) { query += " AND f.client_id=" + payload.client_id + " AND " }
    if (payload.project_id) { query += " f.project_id=" + payload.project_id + " AND " }
    if(type == 1 || type == 2){ query += "f.followup_for=" + type} else { query += "" }
    if (sort == 1 || sort == 2 || sort == 3 || sort == 4) {
      query += " AND "
    }
    let date = moment().format('YYYY-MM-DD');
    if (sort == 1) {
      query += `  Date(remainder)='${date}'`;
    } else if (sort == 2) {
      query += `  Date(remainder) < '${date}' AND outcomes IS NULL`;
    } else if (sort == 3) {
      query += `  Date(remainder) > '${date}'`;
    } else if (sort == 4) {
      query += `  Date(remainder) < '${date}' AND outcomes IS NOT NULL`;
    }
    let queryResult = await commonService.sqlJoinQuery(query)
    let data = [];
    data = queryResult.result;
    for (var i = 0; i < data.length; i++) {
      let relate = "";
      let relate1 = "";
      if (type && type == 1) {
        relate += `SELECT id, concat(first_name," ",last_name) as name, profile_img  FROM tbl_lead WHERE id = ${data[i].related_to} AND flag = 0`;
      } else if (type && type == 2) {
        relate += `SELECT  concat(c.first_name," ",c.last_name) as name, profile_img FROM tbl_client as c WHERE c.id = ${data[i].related_to}  AND c.flag = 0`;
        // relate1 += `SELECT id, name from tbl_project where user_id=${data[i].user_id} AND client_id=${data[i].client_id} AND id = ${data[i].project_id} AND flag = 0`
      }
      else if(type && type == 3){
        if(data[i].lead_id != ""){
          relate += `SELECT id, concat(first_name," ",last_name) as name, profile_img  FROM tbl_lead WHERE id = ${data[i].related_to} AND flag = 0`;
        }else{
          relate += `SELECT  concat(c.first_name," ",c.last_name) as name, profile_img FROM tbl_client as c WHERE c.id = ${data[i].related_to}  AND c.flag = 0`;
        }
      }
      let related_to = await commonService.sqlJoinQuery(relate);
      let project;
      if (relate1 != "") {
        project = await commonService.sqlJoinQuery(relate1);
      }
      if (related_to.result.length > 0) {
        data[i].related_to = related_to.result;
      } else {
        data[i].related_to = [];

      }
      if (project && project.result.length > 0) {
        data[i].project = project.result
      } else if (project) {
        data[i].project = [];

      }
      let query = await commonService.sqlJoinQuery(`(SELECT u.id , concat(u.first_name," ",u.last_name) as name, profile_img FROM tbl_user as u WHERE FIND_IN_SET(u.id, REPLACE(REPLACE(REPLACE((SELECT fu.attendees FROM tbl_followup AS fu WHERE fu.id = ${data[i].id}), ' ', ''), '[', ''), ']', '')) > 0)`);
      if (query.result.length > 0) {
        data[i].attendees = query.result;
      } else {
        data[i].attendees = [];
      }
      if (data[i].project_id) {
        let query2 = await commonService.sqlJoinQuery(`SELECT id, name, user_id, client_id FROM tbl_project WHERE id = ${data[i].project_id} AND flag = 0`);
        if (query2.result.length > 0) {
          data[i].projects = query2.result;
        }
      } else {
        data[i].projects = [];

      }
    }
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
    const payload = req.body;
    let type1res = "";
    let type2res = "";
    let type3res = "";
    let type4res = "";
    let type = 0;
    if (payload.user_id && payload.lead_id) {
      type = 1;
    }
    if (payload.user_id && payload.client_id && payload.project_id) {
      type = 3;
    } else if (payload.user_id && payload.client_id) {
      type = 2;
    }
    let type1 = `select * from tbl_followup`
    let type2 = `select * from tbl_attachments`
    let type3 = `select * from tbl_notes`
    let type4 = `select * from tbl_project`
    let user = `select * from tbl_user where id = ${payload.user_id} and flag = 0`;
    if (type == 1) {
      let query = ` WHERE user_id = ${payload.user_id} AND lead_id = ${payload.lead_id} AND flag = 0`
      type1 += query + " ORDER BY updated_at DESC ";
      type2 += query + " ORDER BY updated_at DESC ";
      type3 += query + " ORDER BY update_date DESC ";
      type1res = await commonService.sqlJoinQuery(type1);
      type2res = await commonService.sqlJoinQuery(type2);
      type3res = await commonService.sqlJoinQuery(type3);
    } else if (type == 2) {
      type4 += ` WHERE user_id = ${payload.user_id} AND client_id = ${payload.client_id} AND flag = 0 ORDER BY updated_at DESC `;
      type4res = await commonService.sqlJoinQuery(type4);
    }else if (type == 3) {
      let query = ` WHERE user_id = ${payload.user_id} AND client_id = ${payload.client_id} AND project_id = ${payload.project_id}`
      type1 += query + " ORDER BY updated_at DESC ";
      type2 += query + " ORDER BY updated_at DESC ";
      type3 += query + " ORDER BY update_date DESC ";
      type1res = await commonService.sqlJoinQuery(type1);
      type2res = await commonService.sqlJoinQuery(type2);
      type3res = await commonService.sqlJoinQuery(type3);
    }

    let userres = await commonService.sqlJoinQuery(user);

    let data = [];
    if (type1res.success && type2res.success && type3res.success) {
      type1res.result.map(e => {
        e.uf_name = userres.result[0].first_name;
        e.ul_name = userres.result[0].last_name;
        e.type = 1;
        data.push(e);
      });
      type2res.result.map(e => {
        e.uf_name = userres.result[0].first_name;
        e.ul_name = userres.result[0].last_name;
        e.type = 2;
        data.push(e);
      });
      type3res.result.map(e => {
        e.uf_name = userres.result[0].first_name;
        e.ul_name = userres.result[0].last_name;
        e.updated_at = e.update_date;
        e.type = 3;
        data.push(e);
      });
      data.sort((a, b) => {
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
      res.status(200).send({
        status: 200,
        data: data
      });
    } else if (type4res.success) {
      type4res.result.map(e => {
        e.uf_name = userres.result[0].first_name;
        e.ul_name = userres.result[0].last_name;
        if (moment(e.created_at).format('YYYY-MM-DD hh:mm:ss') == moment(e.updated_at).format('YYYY-MM-DD hh:mm:ss')) {
          e.project_flag = "new project added";
        } else {
          e.project_flag = "project updated";
        }
        data.push(e);
      });
      res.status(200).send({
        status: 200,
        data: data
      });
    } else if (type == 3) {
      type1res.result.map(e => {
        e.uf_name = userres.result[0].first_name;
        e.ul_name = userres.result[0].last_name;
        e.type = 1;
        data.push(e);
      });
      type2res.result.map(e => {
        e.uf_name = userres.result[0].first_name;
        e.ul_name = userres.result[0].last_name;
        e.type = 2;
        data.push(e);
      });
      type3res.result.map(e => {
        e.uf_name = userres.result[0].first_name;
        e.ul_name = userres.result[0].last_name;
        e.updated_at = e.update_date;
        e.type = 3;
        data.push(e);
      });
      data.sort((a, b) => {
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
      res.status(200).send({
        status: 200,
        data: data
      });
    } else {
      res.status(200).send({
        status: 200,
        // message: "No Record Found.",
        data: data
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
    let month = moment().format('MM');
    let fromYear;
    let toYear;
    if (month > 3) {
      fromYear = moment().format('YYYY');
      toYear = parseInt(moment().format('YYYY')) + 1;
    } else {
      fromYear = parseInt(moment().format('YYYY')) - 1;
      toYear = moment().format('YYYY');
    }
    let query = await commonService.sqlJoinQuery(`SELECT ls.lead_source_name, (SELECT COUNT(id) FROM tbl_lead as l where Date(l.create_date) between '${fromYear}-03-31' AND '${toYear}-04-01' AND l.lead_source = ls.lead_source_name AND l.flag = 0) as count FROM tbl_lead_source as ls where ls.status = 1`)
    if (query.success) {
      res.status(200).send({
        status: 200,
        data: query.result,
        CFY: fromYear + "-" + toYear
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
    let month = moment().format('MM');
    let fromYear;
    let toYear;
    if (month > 3) {
      fromYear = moment().format('YYYY');
      toYear = parseInt(moment().format('YYYY')) + 1;
    } else {
      fromYear = parseInt(moment().format('YYYY')) - 1;
      toYear = moment().format('YYYY');
    }
    let query = await commonService.sqlJoinQuery(`SELECT COUNT(tbl_project.id) AS Count, CONCAT(Year(months.date), "-", MONTH(months.date), "-01") AS Date
    FROM (
        SELECT '${fromYear}-03-31' + INTERVAL (seq.n + (10 * seq2.n) + (100 * seq3.n)) MONTH AS date
        FROM (
            SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
        ) AS seq
        CROSS JOIN (
            SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
        ) AS seq2
        CROSS JOIN (
            SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
        ) AS seq3
    ) AS months
    LEFT JOIN tbl_project ON CONCAT(YEAR(tbl_project.created_at), "-", MONTH(tbl_project.created_at), "-01") = CONCAT(YEAR(months.date), "-", MONTH(months.date), "-01") AND tbl_project.flag = 0
    WHERE months.date BETWEEN '${fromYear}-03-31' AND '${toYear}-04-01'
    GROUP BY CONCAT(Year(months.date), "-", MONTH(months.date), "-01")
    ORDER BY CONCAT(Year(months.date), "-", MONTH(months.date), "-01"); `)
    let Month = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
    let data = [];
    query.result.map(item1 => {
      let m = item1.Date.split('-')[1];
      if (m.length == 1) {
        m = "0" + item1.Date.split('-')[1];
      } else {
        m = item1.Date.split('-')[1];
      }
      item1.Date = item1.Date.split('-')[0] +"-"+ m +"-"+ item1.Date.split('-')[2];
    })
    Month.map(item => {
      query.result.map(item1 => {
        if (item == moment(item1.Date).format('MM')) {
          data.push(item1)
        }
      })
    });
    if (query.success) {
      res.status(200).send({
        status: 200,
        data: data,
        CFY: fromYear + "-" + toYear
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
    let month = moment().format('MM');
    let fromYear;
    let toYear;
    if (month > 3) {
      fromYear = moment().format('YYYY');
      toYear = parseInt(moment().format('YYYY')) + 1;
    } else {
      fromYear = parseInt(moment().format('YYYY')) - 1;
      toYear = moment().format('YYYY');
    }
    let query = await commonService.sqlJoinQuery(`SELECT u.id, u.first_name as name,(SELECT COUNT(l.id ) FROM tbl_lead as l WHERE l.lead_status = 'Qualified' AND l.user_id = u.id AND Date(l.create_date) between '${fromYear}-03-31' AND '${toYear}-04-01' AND l.flag=0) AS Total_Converted FROM tbl_user AS u where u.role_id = 2 AND u.flag = 0`)
    if (query.success) {
      res.status(200).send({
        status: 200,
        data: query.result,
        CFY: fromYear + "-" + toYear
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
    if (req.body.client_id) { parameters += "  client_id = '" + req.body.client_id + "'," }
    if (req.body.project_id) { parameters += "  project_id = '" + req.body.project_id + "'," }
    if (req.body.followup_for) { parameters += "  followup_for = '" + req.body.followup_for + "'," }
    if (req.body.remainder) { parameters += "  remainder = '" + req.body.remainder + "'," }
    if (req.body.description) { parameters += "  description = '" + req.body.description + "'," }
    if (req.body.link) { parameters += "  link = '" + req.body.link + "'," }
    if (req.body.related_to) { parameters += "  related_to = '" + req.body.related_to + "'," }
    if (req.body.attendees) { parameters += "  attendees = '" + req.body.attendees + "'," }
    if (req.body.outcomes) { parameters += "  outcomes = '" + req.body.outcomes + "'," }
    if (req.body.meet_link) { parameters += "  meet_link = '" + req.body.meet_link + "'," }
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

const deletefollowup = async (req, res) => {
  try {
    let id = req.params.id;
    let query = `SELECT * FROM tbl_followup WHERE id = ${id}`;
    let queryResult = await commonService.sqlJoinQuery(query);
    if (queryResult.result.length > 0) {
      const updated_at = moment().format("YYYY-MM-DD hh:mm:ss").toString();
      let parameters = "flag = 1" + " ,  updated_at = '" +
        updated_at +
        "' Where id = " +
        id +
        "";
      let tblName = "tbl_followup";
      let queryResult = await commonService.sqlUpdateQueryWithParametrs(
        tblName,
        parameters
      );
      if (queryResult.result.affectedRows > 0) {
        res.status(200).send({
          status: 200,
          message: "Record Deleted Successfully"
        });
      } else {
        res.status(500).send({
          status: 500,
          message: "Something went wrong!"
        });
      }
    } else {
      res.status(500).send({
        status: 500,
        message: "No Record Found"
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
  lead_project,
  deletefollowup
};
