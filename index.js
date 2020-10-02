const http = require("http");
const url = require("url");
const config = require("./config");
const stringDecoder = require("string_decoder").StringDecoder;
const port = process.env.PORT || 3000;
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");

const server = http.createServer((req, res) => {
  const parsedURL = url.parse(req.url, true);
  const path = parsedURL.pathname;
  const method = req.method.toLowerCase();
  const queryStringObject = parsedURL.query;
  const headers = req.headers;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const decoder = new stringDecoder("utf-8");
  let buffer = "";

  req.on("data", data => {
    buffer += decoder.write(data);
  });
  req.on("end", () => {
    buffer += decoder.end();
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer)
    };
    chosenHandler(data)
      .then(resp => {
        let payloadStatus =
          typeof resp.statusCode === "number" ? resp.statusCode : 422;

        let payloadString =
          typeof resp.Message === "object"
            ? JSON.stringify(payload)
            : JSON.stringify({ Message: resp.Message });

        res.writeHead(payloadStatus, { "Content-Type": "application/json" });
        res.end(payloadString);
      })
      .catch(error => {
        console.error(error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ Message: "Server Error" }));
      });
  });
});

server.listen(port, () => {
  console.log(`Server Started on ${port}`);
});

const router = {
  users: handlers.users,
  "": handlers.home,
  allusers: handlers.allusers,
  hobby: handlers.hobby,
  age: handlers.age
};
