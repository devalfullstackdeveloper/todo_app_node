require("dotenv").config();
const jwt = require('jsonwebtoken')
const secret = process.env.secret;

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, secret);
      
        next();
      //     if(req.headers.userid == decoded.data.id) {
   
      // } else {
      //   res.send(401);
      // }
      }
      catch(ex){
        res.send(401);
      }
}
module.exports = {
    verifyToken
}