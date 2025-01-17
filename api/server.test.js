const request = require("supertest");
const db = require("../data/dbConfig");
const server = require("./server");
const mockData = require("./jokes/jokes-data");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = require("./auth/secrets");



const user1 = {username:"chris",password:"123456"};
const user2 = {username:"eve",password:"654321"};

const user1hashed = {...user1,password:bcrypt.hashSync(user1.password)};
const user2hashed = {...user2,password:bcrypt.hashSync(user2.password)};
// Write your tests here
test('sanity check', () => {
  expect(true).toBe(true)
});
describe("Server Endpoint Tests",()=>{
  beforeAll(async()=>{
    await db.migrate.rollback();
    await db.migrate.latest();
  });
  beforeEach(async()=>{
    await db("users").truncate();
    await db("users").insert(user1hashed);
    await db("users").insert(user2hashed);
  });
  afterAll(async()=>{
    await db.destroy();
  });
  describe("[POST] /api/auth/register",()=>{
    test("responds with 400 if invalid body",async()=>{
      const invalid_bodies = [
        {username:"",password:""},
        {username:"poo",password:""},
        {username:"",password:"12334534"},
        {username:"poo"},
        {password:"12334534"}
      ];
      for(let invalid of invalid_bodies){
        const res = await request(server).post("/api/auth/register").send(invalid);
        expect(res.status).toBe(400);
        expect(res.body.message).toEqual("username and password required");
      }
    });
    test("responds with 400 if username already exists",async()=>{
      const res = await request(server).post("/api/auth/register").send({username:"chris",password:"10394578"});
      expect(res.status).toBe(400);
      expect(res.body.message).toEqual("username taken");
    });
    test("user added to db and password hashed",async()=>{
      const res = await request(server).post("/api/auth/register").send({username:"nicole",password:"10394578"});
      const newUser = await db("users").where({username:"nicole"}).first();
      expect(newUser.username).toEqual("nicole");
      expect(bcrypt.compareSync("10394578",newUser.password)).toBe(true);
    });
    test("responds with 201",async()=>{
      const res = await request(server).post("/api/auth/register").send({username:"nicole",password:"10394578"});
      expect(res.status).toBe(201);
    });
    test("responds with correct object",async()=>{
      const res = await request(server).post("/api/auth/register").send({username:"nicole",password:"10394578"});
      expect(res.body).toHaveProperty("password");
      expect(res.body).toMatchObject({username:"nicole",id:3});
    });
  });
  describe("[POST] /api/auth/login",()=>{
    test("responds with 400 if invalid body",async()=>{
      let invalid = {username:"chris"};
      let res = await request(server).post("/api/auth/login").send(invalid);
      expect(res.status).toBe(400);
      expect(res.body.message).toEqual("username and password required");
      invalid = {password:"12334534"};
      res = await request(server).post("/api/auth/login").send(invalid);
      expect(res.status).toBe(400);
      expect(res.body.message).toEqual("username and password required");
      invalid = {username:"",password:""};
      expect(res.status).toBe(400);
      expect(res.body.message).toEqual("username and password required");

      // invalid = {username:"chris",password:""};
      // res = await request(server).post("/api/auth/login").send(invalid);
      // expect(res.body).toEqual({})
      // expect(res.status).toBe(400);
      
      invalid = {username:"",password:"12334534"};
      res = await request(server).post("/api/auth/login").send(invalid);
      expect(res.status).toBe(400);
      
      invalid = {username:"chris"};
      res = await request(server).post("/api/auth/login").send(invalid);
      expect(res.status).toBe(400);
      
      invalid = {password:"12334534"};
      res = await request(server).post("/api/auth/login").send(invalid);
      expect(res.status).toBe(400);
    });
    test("responds with 401 if password is incorrect",async()=>{
      const res = await request(server).post("/api/auth/login").send({...user1,password:"this is incorrect"});
      expect(res.status).toBe(401);
    });
    test("responds with 404 if username is not found",async()=>{
      const res = await request(server).post("/api/auth/login").send({...user1,username:"randomname"});
      expect(res.status).toBe(404);
    });
    test("responds with 200 and the created token",async()=>{
      const res = await request(server).post("/api/auth/login").send(user1);
      expect(res.status).toBe(200);
      const token = res.body.token;
      const decoded = jwt.verify(token,secret); //will throw error if invalid
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toMatchObject({username:"chris"});
    });
  });
  describe("[GET] /api/jokes",()=>{
    test("responds with 401 if token is missing or invalid",async()=>{
      const res = await request(server).get("/api/jokes").set("Authorization","invalid token");
      expect(res.status).toBe(401);
    });
    test("responds with 200 the correct number of rows",async()=>{
      let res = await request(server).post("/api/auth/login").send(user1);
      const token = res.body.token;
      res = await request(server).get("/api/jokes").set("Authorization",token);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(mockData.length);
    });
    test("responds with the correct format",async()=>{
      let res = await request(server).post("/api/auth/login").send(user1);
      const token = res.body.token;
      res = await request(server).get("/api/jokes").set("Authorization",token);
      expect(res.body[0]).toMatchObject(mockData[0]);
    });
  });
});

