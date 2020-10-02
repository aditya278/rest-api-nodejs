const http = require('http');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const port = process.env.PORT || 3000;
const handlers = require('./lib/handlers');
const helpers = require("./lib/helpers");


const server = http.createServer((req, res) => {
    try{
        const parsedURL = url.parse(req.url, true);
        const path = parsedURL.pathname;
        const method = req.method.toLowerCase();
        const queryStringObject = parsedURL.query;
        const headers = req.headers;
        const trimmedPath = path.replace(/^\/+|\/+$/g, '');
        const decoder = new stringDecoder('utf-8');
        let buffer = '';
    
        req.on('data', (data) => {
            buffer += decoder.write(data);
        });
        req.on('end', async () => {
            buffer += decoder.end();
            const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
            const data = {
                trimmedPath,
                queryStringObject,
                method,
                headers,
                "payload": helpers.parseJsonToObject(buffer)
            }
            
            const response = await chosenHandler(data);
            if(!response) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(500);
                res.end("Server Error");
            }

            let statusCode = typeof (response.statusCode) == 'number' ? response.statusCode : 200;
            let payload = typeof (response.message) == 'object' ? response.message : (typeof response.message === 'string' ? {'message' : response.message} : {});
            let payloadString = JSON.stringify(payload);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log(statusCode, payloadString);
        });
    }
    catch(err){
        console.error(err);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(500);
        res.end("Server Error from index");
    }
});

server.listen(port, () => {
    console.log(`Server Started on ${port}`);
});


const router = {
    "users": handlers.users,
    "": handlers.home,
    "allusers": handlers.allusers,
    "hobby": handlers.hobby,
    "age": handlers.age
}
