'use strict';

var fs = require('fs');
var path = require('path');

// Loading all BCG files
var folder = path.join(__dirname, 'lib');
var files = fs.readdirSync(folder);
files.forEach(function (file) {
    if (file.substr(file.length - 3) === '.js') {
        module.exports[path.basename(file, '.js')] = require(path.join(folder, file));
    }
});