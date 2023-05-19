const commonService = require("../services/common.services");
const { query } = require("express");

const attachments = async (req, res) => {
  try {
    const id = req.params.id
    const tblName = "tbl_attachments"
    const parameters = "*"
    const condition = `id = ${id}`

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
const followup = async (req, res) => {
  try {
    const id = req.params.id
    const tblName = "tbl_followup"
    const parameters = "*"
    const condition = `id = ${id}`

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

const notes = async (req, res) => {
  try {
    const id = req.params.id
    const tblName = "tbl_notes"
    const parameters = "*"
    const condition = `id = ${id}`

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

const leaddetail = async (req, res) => {
  try {
    const id = req.params.id
    const tblName = "tbl_lead"
    const parameters = "*"
    const condition = `id = ${id}`

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

module.exports = { leaddetail, notes, followup, attachments };