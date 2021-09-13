const router = require('express').Router();
const {body,validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require('../../data/dbConfig');
const jwt = require("jsonwebtoken");
const secret = require("./secrets")
const requiredError= {status:400,message:`username and password required`};
router.post('/register', 
  body("username").isString().withMessage(requiredError).trim().isLength({min:1}).withMessage(requiredError),
  body("password").isString().withMessage(requiredError).trim().isLength({min:1}).withMessage(requiredError),
  body("username").custom(async(value,{req})=>{
    const rows = await db("users").where({username:value});
    return new Promise((resolve,reject)=>{
      if(rows.length===0){
        resolve();
      }
      else{
        reject({status:400,message:"username taken"});
      }
    })
  }),
  async(req, res, next) => {
    try{
      const errors = validationResult(req);
      if(errors.isEmpty()){
        req.body.password = bcrypt.hashSync(req.body.password);
        const [id] = await db("users").insert(req.body);
        res.status(201).json({...req.body,id});
      }
      else{
        const {status,message} = errors.array()[0].msg;
        res.status(status || 400).json({message:message||errors.array()[0].msg})
      }
    }
    catch(e){
      next(e);
    }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});


router.post('/login', 
  body("username").isString().withMessage(requiredError).trim()
  .isLength({min:1}).withMessage(requiredError),
  body("password").isString().withMessage(requiredError).trim().isLength({min:1}).withMessage(requiredError),
  body("username").custom(async(value,{req})=>{
    const user = await db("users").where({username:value}).first();
    req.user = user;
    if(!user){
      return Promise.reject({status:404,message:`invalid credentials`});
    }
    const valid = bcrypt.compareSync(req.body.password,user.password);
    return valid?Promise.resolve():Promise.reject({status:401,message:`invalid credentials`});
  }),


  (req, res, next) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
      const {id,username} = req.user;
      const payload = {
        id,
        username
      };
      const options = {
        expiresIn:"1d"
      }
      const token = jwt.sign(payload,secret,options);
      res.status(200).json({message:`welcome, ${req.body.username}`,token})
    }
    else{
      const {status,message} = errors.array()[0].msg;
      res.status(status || 400).json({message:message||errors.array()[0].msg})
    }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

module.exports = router;
