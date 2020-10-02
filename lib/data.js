const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");
const util = require("util");

const lib = {};

const writeFile = util.promisify(fs.writeFile);

// Sharath's Branch - Dependency - to be deleted - Start
const readFile = util.promisify(fs.readFile);
// Sharath's Branch - Dependency - to be deleted - End

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

// Sharath's Branch - Dependency - to be deleted - Start
lib._read = async (dir, file) => {
  try {
    const fileName = lib.baseDir + dir + "/" + file + ".json";
    const data = await readFile(fileName, "utf-8");
    const parsedData = helpers.parseJsonToObject(data);
    return Promise.resolve(parsedData);
  } catch (error) {
    console.error(error);
  }
};
// Sharath's Branch - Dependency - to be deleted - End

lib.read = (dir, file, callback) => {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf-8",
    (err, data) => {
      if (!err && data) {
        const parsedData = helpers.parseJsonToObject(data);
        callback(false, parsedData);
      } else {
        callback(err, data);
      }
    }
  );
};

lib.update = (dir, file, data, callback) => {
  const stringData = JSON.stringify(data);
  fs.writeFile(lib.baseDir + dir + "/" + file + ".json", stringData, err => {
    if (!err) {
      callback(false);
    } else {
      callback("Error in Updating Existing File");
    }
  });
};

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