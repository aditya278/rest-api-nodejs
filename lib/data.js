const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");
const util = require("util");

const lib = {};

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

lib.baseDir = path.join(__dirname, "/../.data/");

// Writes data into a JSON File
lib.create = async (dir, file, data) => {
  try {
    const fileName = lib.baseDir + dir + "/" + file + ".json";
    const stringData = JSON.stringify(data);
    await writeFile(fileName, stringData);
    Promise.resolve(false);
  } catch (error) {
    console.error(error); // Debug Only
  }
};

lib.read = async (dir, file) => {
  try {
    const fileName = lib.baseDir + dir + "/" + file + ".json";
    const data = await readFile(fileName, "utf-8");
    const parsedData = helpers.parseJsonToObject(data);
    return Promise.resolve(parsedData);
  } catch (error) {
    console.error(error);
  }
};

lib.update = async (dir, file, data) => {
  try {
    const stringData = JSON.stringify(data);
    await writeFile(lib.baseDir + dir + '/' + file + '.json', stringData);
    return Promise.resolve();
  } catch (err) {
    console.error(err);
    return Promise.reject();
  }
}

lib.delete = (dir, file, callback) => {
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", err => {
    if (!err) {
      callback(false);
    } else {
      callback("Error in Deleting File");
    }
  });
};

lib.allfiles = (dir, callback) => {
  fs.readdir(lib.baseDir + dir, (err, files) => {
    if (!err) {
      let fileData = [];
      files.forEach(file => {
        let data = fs.readFileSync(lib.baseDir + dir + "/" + file, "utf-8");
        let parsedData = helpers.parseJsonToObject(data);
        delete parsedData.terms;
        delete parsedData.hashedPassword;
        fileData.push(parsedData);
      });
      callback(false, fileData);
    } else {
      callback(err, null);
    }
  });
};

module.exports = lib;