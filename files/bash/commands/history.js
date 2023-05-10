const fs = require("fs");
const path = require("path");
const filePath = path.join(process.cwd(), 'files', 'bash', 'history', '.bash_history');

module.exports = function () {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) throw err; console.log("\n" + data + "\n[Press Enter]");
  });
};