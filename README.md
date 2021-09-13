# Authentication and Testing Sprint Challenge

**Read these instructions carefully. Understand exactly what is expected _before_ starting this Sprint Challenge.**

This challenge allows you to practice the concepts and techniques learned over the past sprint and apply them in a concrete project. This sprint explored **Authentication and Testing**. During this sprint, you studied **authentication, JSON web tokens, unit testing, and backend testing**. In your challenge this week, you will demonstrate your mastery of these skills by creating **a dad jokes app**.

This is an individual assessment. All work must be your own. All projects will be submitted to Codegrade for automated review. You will also be given feedback by code reviewers on Monday following the challenge submission. For more information on the review process [click here.](https://www.notion.so/lambdaschool/How-to-View-Feedback-in-CodeGrade-c5147cee220c4044a25de28bcb6bb54a)

You are not allowed to collaborate during the sprint challenge.

## Project Setup

- [ ] Run `npm install` to install your dependencies.
- [ ] Run tests locally executing `npm test`.

For a step-by-step on setting up Codegrade see [this guide.](https://www.notion.so/lambdaschool/Submitting-an-assignment-via-Code-Grade-A-Step-by-Step-Walkthrough-07bd65f5f8364e709ecb5064735ce374)

## Project Instructions

Dad jokes are all the rage these days! In this challenge, you will build a real wise-guy application.

Users must be able to call the `[POST] /api/auth/register` endpoint to create a new account, and the `[POST] /api/auth/login` endpoint to get a token.

We also need to make sure nobody without the token can call `[GET] /api/jokes` and gain access to our dad jokes.

We will hash the user's password using `bcryptjs`, and use JSON Web Tokens and the `jsonwebtoken` library.

### MVP

Your finished project must include all of the following requirements (further instructions are found inside each file):

- [ ] An authentication workflow with functionality for account creation and login, implemented inside `api/auth/auth-router.js`.
- [ ] Middleware used to restrict access to resources from non-authenticated requests, implemented inside `api/middleware/restricted.js`.
- [ ] A minimum of 2 tests per API endpoint, written inside `api/server.test.js`.

**IMPORTANT Notes:**

- Do not exceed 2^8 rounds of hashing with `bcryptjs`.
- If you use environment variables make sure to provide fallbacks in the code (e.g. `process.env.SECRET || "shh"`).
- You are welcome to create additional files but **do not move or rename existing files** or folders.
- Do not alter your `package.json` file except to install extra libraries. Do not update existing packages.
- The database already has the `users` table, but if you run into issues, the migration is available.
- In your solution, it is essential that you follow best practices and produce clean and professional results.
- Schedule time to review, refine, and assess your work and perform basic professional polishing.

## Submission format

- [ ] Submit via Codegrade by pushing commits to your `<firstName-lastName>` branch on Github.
- [ ] Check Codegrade before the deadline to compare its results against your local tests.
- [ ] Check Codegrade on the days following the Sprint Challenge for reviewer feedback.
- [ ] New commits will be evaluated by Codegrade if pushed _before_ the sprint challenge deadline.

## Interview Questions

Be prepared to demonstrate your understanding of this week's concepts by answering questions on the following topics.

1. Differences between using _sessions_ or _JSON Web Tokens_ for authentication.

A session is stored inside the server and a session id is attached to the header of the http requests and responses, and the client is storing the session id. 

A session allows the server to have full control over the authentication
However, it is also susceptable to hacking since the session id is attached automatically to the header. 

Extra security is added to protect from cross-origin requests but it also makes it difficult for mobile apps. 

A json web token is signed with a secret string in the server and sent to the client. The client will then need to attach the token in the header and the server will verify its validity. 

A downside of this is that the client controls the logging out since the client can be authenticated as long as a token is stored. 

cross-origin requests is much easier because as long as a valid token is sent, the user will be authenticated in the server

2. What does `bcryptjs` do to help us store passwords in a secure manner?

it hashes the password so that a user passwords are not immediately compromised if the database is hacked. Hashing is a one way function and the hashed password can only be obtained through guessing. This will take too much time for hackers to do.

3. How are unit tests different from integration and end-to-end testing?

Unit tests are implementation specific and they are the tests on functions.

Integration tests are for testing how each component of the software communicate with each other.

End-to-end is testing the entire application, often by simulating end-users' actions

4. How does _Test Driven Development_ change the way we write applications and tests?

It is defined as the process of writing tests, writing code to pass the tests, then refactor the code, and finally passing the tests again. 

Refactoring is easier because bugs can be caught with tests

starting with the end in mind so that the desired behavior can be clearly defined before the implementation of the code.
