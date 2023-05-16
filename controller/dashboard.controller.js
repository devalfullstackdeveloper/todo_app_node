const commonService = require("../services/common.services");
const { query } = require("express");


  const dashboard = async (req, res) => {
    try{
    
        let query = await commonService.sqlJoinQuery(`SELECT 
        (SELECT COUNT(*) FROM tbl_lead) as Total_lead,
        (SELECT COUNT(*) FROM tbl_project) as Total_project,
        (SELECT COUNT(*) FROM tbl_client) as Total_client,
        (SELECT COUNT(*) FROM tbl_user) as Total_user`);
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
  module.exports={dashboard}