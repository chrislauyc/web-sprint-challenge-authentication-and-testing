const {header,validationResult} = require("express-validator");
const secret = require("../auth/secrets");
const jwt = require("jsonwebtoken");
module.exports = [
  header("Authorization").isString().withMessage({status:401,message:"token required"}).custom((value,{req})=>{
    req.decoded = jwt.verify(value,secret);
    return true;
  }).withMessage({status:401,message:"token invalid"}),
  (req, res, next) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
      next();
    }
    else{
      const {status,message} = errors.array()[0].msg;
      res.status(status || 401).json({message:message||errors.array()[0].msg})
    }
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
  }
];
