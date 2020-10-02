const _data = require("./data");
const helpers = require("./helpers");

const handlers = {};

/* Not Found Route */
handlers.notFound = (data, callback) => {
  callback(404, { Error: "Not Found" });
};

/* Home Page Route */
handlers.home = (data, callback) => {
  callback(200, { Status: "Home Page" });
};

/* Users Router Handler */
// Sharath's Branch - Dependency - to be deleted - Start
handlers.users = async data => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    return await handlers._users[data.method](data);
  } else {
    Promise.reject({
      statusCode: 405,
      Error: "Invalid HTTP Method. Method Not Allowed."
    });
  }
};
// Sharath's Branch - Dependency - to be deleted - End

handlers._users = {};

/*
  POST Method for /users
  Required Data(Users Schema) from body : firstname,lastname,phone(unique),email,password,terms,_id
  Optional Data : none
*/

handlers._users.post = async data => {
  try {
    const firstName =
      typeof data.payload.firstName === "string" &&
      data.payload.firstName.trim().length > 0
        ? data.payload.firstName.trim()
        : false;
    const lastName =
      typeof data.payload.lastName === "string" &&
      data.payload.lastName.trim().length > 0
        ? data.payload.lastName.trim()
        : false;
    const phone =
      typeof data.payload.phone === "string" &&
      data.payload.phone.trim().length === 10
        ? data.payload.phone.trim()
        : false;
    const password =
      typeof data.payload.password === "string" &&
      data.payload.password.trim().length >= 6
        ? data.payload.password.trim()
        : false;
    const email =
      typeof data.payload.email === "string" &&
      data.payload.email.trim().length > 0
        ? data.payload.email.trim()
        : false;
    const terms =
      typeof data.payload.terms === "boolean" && data.payload.terms === true
        ? true
        : false;
    const _id = Date.now();

    if (
      !(firstName && lastName && phone && terms && password && email && _id)
    ) {
      return Promise.resolve({
        statusCode: 400,
        Message: "Validation Failed. Missing Fields"
      });
    }
    // Sharath's Branch - Dependency - to be changed to _data.read - Start
    const parsedData = await _data._read("users", phone);
    // Sharath's Branch - Dependency - to be changed to _data.read - End

    if (parsedData) {
      return Promise.resolve({
        statusCode: 400,
        Message: "A User with that Phone Number Already Exists"
      });
    }
    const hashedPassword = helpers.hash(password);
    const userObject = {
      firstName,
      lastName,
      phone,
      hashedPassword,
      email,
      terms,
      _id,
      hobby: []
    };

    await _data.create("users", phone, userObject);
    return Promise.resolve({
      statusCode: 200,
      Message: "User was created Successfully"
    });
  } catch (error) {
    console.error(error); // For Debug Only
    return Promise.reject({ statusCode: 500, Message: "Server Error" });
  }
};

/*
  GET Method for /users
  Required Data(Query Params) : Phone Number
  Optional Data : none
*/
handlers._users.get = (data, callback) => {
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (phone) {
    _data.read("users", phone, (err, data) => {
      if (!err && data) {
        delete data.hashedPassword;
        delete data.terms;
        callback(200, data);
      } else {
        callback(400, { Error: "User Not Found" });
      }
    });
  } else {
    callback(400, { Error: "Missing Required Fields" });
  }
};

/*
  UPDATE/put Method for /users
  Required Data(Body) : Phone Number
  Optional Data : Rest of the fields except terms and _id
*/
handlers._users.put = (data, callback) => {
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;

  const firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length >= 6
      ? data.payload.password.trim()
      : false;
  const email =
    typeof data.payload.email === "string" &&
    data.payload.email.trim().length > 0
      ? data.payload.email.trim()
      : false;

  if (phone) {
    if (firstName || lastName || password || email) {
      _data.read("users", phone, (err, userData) => {
        if (!err && userData) {
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }
          if (email) {
            userData.email = email;
          }
          _data.update("users", phone, userData, err => {
            if (!err) {
              callback(200, { Status: "User Profile Updated" });
            } else {
              console.log(err);
              callback(500, {
                Error: "Server Error. Issue in Updating the Error"
              });
            }
          });
        } else {
          callback(400, { Error: "The Specified User doens not exist" });
        }
      });
    } else {
      callback(400, { Error: "Missing Fields to Update" });
    }
  } else {
    callback(400, { Error: "Missing Required Fields" });
  }
};

/*
  DELETE Method for /users
  Required Data(Query Params) : Phone Number
  Optional Data : none
*/
handlers._users.delete = (data, callback) => {
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    _data.read("users", phone, (err, data) => {
      if (!err && data) {
        _data.delete("users", phone, err => {
          if (!err) {
            callback(200, { Status: "User Account Deleted" });
          } else {
            callback(500, { Error: "Server Error" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the Specified User" });
      }
    });
  } else {
    callback(400, { Error: "Missing Required Fields" });
  }
};

/*
 GET /allusers
 API, which will Consolidate all the users data in one response(Excluding Password)
*/
handlers.allusers = (clientData, callback) => {
  _data.allfiles("users", (err, data) => {
    if (!err) {
      callback(200, data);
    } else {
      callback(500, { Error: "Server Error" });
    }
  });
};

/*
 PUT /hobby?phone=983857894	
 API, To add multiple hobbies to the User (Array of strings will be the schema of hobby)
 Required Fields : phone,hobby
*/
handlers.hobby = (data, callback) => {
  const acceptableMethods = ["put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._hobby[data.method](data, callback);
  } else {
    callback(405, { Error: "Invalid HTTP Method. Method Not Allowed." });
  }
};
handlers._hobby = {};
handlers._hobby.put = (clientData, callback) => {
  const phone =
    typeof clientData.queryStringObject.phone == "string" &&
    clientData.queryStringObject.phone.trim().length === 10
      ? clientData.queryStringObject.phone.trim()
      : false;
  const hobby =
    typeof clientData.payload.hobby === "string"
      ? clientData.payload.hobby
      : false;
  if (phone && hobby) {
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        userData.hobby.push(hobby);
        _data.update("users", phone, userData, err => {
          if (!err) {
            callback(200, { Status: "User Profile Updated" });
          } else {
            callback(500, { Error: "Server Error." });
          }
        });
      } else {
        callback(400, { Error: "The Specified User doens not exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing Required Fields" });
  }
};

/*
 DELETE /hobby?phone=983857894&hobby=value	
 API, To Delete A hobby(one hobby at a time) for a particular User
 Required Fields : phone,hobby_to_be_deleted
*/
handlers._hobby.delete = (clientData, callback) => {
  const phone =
    typeof clientData.queryStringObject.phone == "string" &&
    clientData.queryStringObject.phone.trim().length === 10
      ? clientData.queryStringObject.phone.trim()
      : false;
  const hobby =
    typeof clientData.queryStringObject.hobby === "string"
      ? clientData.queryStringObject.hobby
      : false;
  if (phone && hobby) {
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        const index = userData.hobby.indexOf(hobby);
        if (index > -1) {
          userData.hobby.splice(index, 1);
          _data.update("users", phone, userData, err => {
            if (!err) {
              callback(200, { Status: "User Hobby Deleted" });
            } else {
              callback(500, {
                Error: "Server Error. Issue in Updating the Error"
              });
            }
          });
        } else {
          callback(400, { Error: "Hobby Not Found To Delete" });
        }
      } else {
        callback(400, { Error: "The Specified User doens not exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing Required Fields" });
  }
};

/*
 GET  /age?phone=xxxxxx	
 API, To Calculate the age of a particular User
 Required Fields : phone in param
*/

handlers.age = (clientData, callback) => {
  const phone =
    typeof clientData.queryStringObject.phone == "string" &&
    clientData.queryStringObject.phone.trim().length === 10
      ? clientData.queryStringObject.phone.trim()
      : false;
  if (phone) {
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        const date1 = new Date(userData._id).getTime();
        const date2 = new Date().getTime();
        const difference_ms = date2 - date1;
        const days = Math.round(difference_ms / (1000 * 60 * 60 * 24));
        const hours = Math.round(difference_ms / (1000 * 60 * 60));
        if (days > 0) {
          const age = `${days} days.`;
          callback(200, { Age: age });
        } else {
          const age = `${hours} hours.`;
          callback(200, { Age: age });
        }
      } else {
        callback(400, { Error: "The Specified User does not exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing Required Fields" });
  }
};
module.exports = handlers;
