## About

RESTful API built with Node, Express, and MongoDB.

The API can be used as a foundation for a note-taking or image-tagging application.

Note that this API is not complete and is intended to serve as a proof of concept to showcase my API design skills.

## Tech Stack

- [Node.js](https://nodejs.org/en/docs/) - an open-source JavaScript runtime environment for building server-side applications
- [Express](https://expressjs.com/) - a web application framework for Node.js that makes it easier to build and manage APIs
- [MongoDB](https://www.mongodb.com/home) - open-source NoSQL database that is well-suited for storing data in JSON-like documents
- [mongoose](https://mongoosejs.com/) - an object data modeling (ODM) library for MongoDB
- [typescript](https://www.npmjs.com/package/typescript) - a typed version of JavaScript that improves code quality and maintenance.

<hr />

- [jest](https://jestjs.io/) - a JavaScript testing framework and test runner
- [supertest](https://www.npmjs.com/package/supertest) - a library for testing HTTP servers in Node.js, providing a high-level abstraction for testing HTTP requests and responses

<hr />

- [bcrypt](https://www.npmjs.com/package/bcrypt) - a library for hashing and encrypting passwords
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - a library for generating and verifying JSON web tokens (JWT)
- [cloudinary](https://github.com/cloudinary/cloudinary_npm) - Node SDK for a cloud-based image and video management platform
- [date-fns](https://date-fns.org/) - a lightweight JavaScript library for working with dates and times
- [dotenv](https://www.npmjs.com/package/dotenv) - a library for loading environment variables from a .env file
- [joi](https://www.npmjs.com/package/joi) - a library for validating JavaScript objects
- [joi-password](https://www.npmjs.com/package/joi-password) - a joi plugin for validating passwords
- [morgan](https://www.npmjs.com/package/morgan) - a middleware for logging HTTP requests
- [multer](https://www.npmjs.com/package/multer) - a middleware for handling HTTP file uploads
- [nodemailer](https://www.npmjs.com/package/nodemailer) - a library for sending email from Node.js
- [nodemon](https://www.npmjs.com/package/nodemon) - a utility that automatically restarts a Node.js server when changes are detected in source files
- [winston](https://www.npmjs.com/package/winston) - a library for logging and managing messages in a Node.js application

## Features

- Token-based user authentication allows users to securely access the API using unique tokens, and ensures that only authorized users can access and manipulate data in the API.
- CRUD (create, read, update, delete) allow users to create, retrieve, update, and delete data in the API.
- Error handling allows the API to gracefully handle and respond to errors, providing helpful messages and guidance to users.
- Integration and unit tests ensure that the API is functioning correctly and provides confidence in its reliability and stability.
- HATEOAS provides links to related resources within the responses, allowing clients to easily navigate and discover the API's capabilities without requiring external documentation.
