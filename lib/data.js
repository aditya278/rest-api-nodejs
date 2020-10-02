const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
const util = require("util");

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, callback) => {
  const stringData = JSON.stringify(data);
  fs.writeFile(lib.baseDir + dir + '/' + file + '.json', stringData, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error Creating a new File');
    }
  });
};


const readFile = util.promisify(fs.readFile)
lib.read = async (dir, file, callback) => {
  try {
    const data = await readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8')
    const parsedData = helpers.parseJsonToObject(data);
    callback(false, parsedData);

  } catch (err) {
    callback(401, { "Error": "Not able to read file " })
  }
};

lib.update = (dir, file, data, callback) => {
  const stringData = JSON.stringify(data);
  fs.writeFile(lib.baseDir + dir + '/' + file + '.json', stringData, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error in Updating Existing File');
    }
  });
};

lib.delete = (dir, file, callback) => {
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error in Deleting File');
    }
  });
};
const readdir = util.promisify(fs.readdir)
lib.allfiles = async (dir, callback) => {

 const files = await readdir(lib.baseDir + dir) ;
 try {
 
    let fileData = [];
    files.forEach((file) => {
      let data = fs.readFileSync(lib.baseDir + dir + '/' + file, 'utf-8');
      let parsedData = helpers.parseJsonToObject(data);
      delete parsedData.terms;
      delete parsedData.hashedPassword;
      fileData.push(parsedData);
    });
    callback(false, fileData);
}catch{
  callback(401, {'error' : "in reading all files"})
}
 }
 


module.exports = lib;
