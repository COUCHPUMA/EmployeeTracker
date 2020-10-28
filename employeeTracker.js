var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require("console.table");
var figlet = require('figlet');

//code from figlet module
figlet('EMPLOYEE TRACKER!!', function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data)
});

var connection = mysql.createConnection({
    host: "localhost",

    //port default - 8080
    port: 8080,

    // username
    user: "root",

    //password
    password: "Ollie2019",
    database: "employeeDb"
});

connection.connect(function(err) {
    if (err) throw err;
    startApp();
});

//function for app start