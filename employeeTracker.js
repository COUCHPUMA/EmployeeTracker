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

    //port default - 3306
    port: 3306,

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
function startApp() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "what would you like to do?",
            choices: [
                "View all Employees",
                "View All Employees By Department",
                "View departments",
                "View roles",
                "Add department",
                "Add role",
                "Add Employee",
                "Remove Employee",
                "Update Employee Role",
                "Update Employee Manager",
                "EXIT"
            ]
        })
        .then(function(answer) {
            switch (answer.action) {
                case "View All Employees":
                    viewEmployees();
                    break;

                case "View All Employees By Department":
                    viewEmployeesByDept();
                    break;

                case "View departments":
                    viewDept();
                    break;

                case "View roles":
                    viewRoles();
                    break;

                case "Add Employee":
                    addEmployee();
                    break;

                case "Add department":
                    addDept();
                    break;

                case "Add role":
                    addRole();
                    break;

                case "Remove Employee":
                    removeEmployee();
                    break;

                case "Update Employee Role":
                    updateEmployeeRole();
                    break;

                case "Update Employee Manager":
                    updateEmployeeMng();
                    break;

                case "EXIT":
                    console.log("Thanks for using Employee Tracker! Have a nice day!")
                    process.exit();
            }
        });
}

//view all employess
function viewEmployees() {
    var query = `SELECT employees.id, employees.first_name, employees.last_name, role.title, departments.name AS department, role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS Manager FROM employees LEFT JOIN role on employees.role_id = role.id 
    LEFT JOIN departments on role.department_id = departments.id LEFT JOIN employees manager on manager.id = employees.manager_id;`;
    connection.query(query, function(err, query) {
        console.table(query);
        startApp();
    });
};

// view all emplyees by department
function viewEmployeesByDept() {
    var query = `SELECT departments.name AS department, employees.id, employees.first_name, employees.last_name, role.title FROM employees LEFT JOIN role on 
    employees.role_id = role.id LEFT JOIN departments departments on role.department_id = departments.id WHERE departments.id;`;
    connection.query(query, function(err, query) {
        console.table(query);
        startApp();
    });
};

//view all departments
function viewDept() {
    var query = `select id AS Dept_ID, name AS departments from departments;`;
    connection.query(query, function(err, query) {
        console.table(query);
        startApp();
    });
};

//view all rules
function viewRoles() {
    var query = `select id AS Role_ID, title, salary AS Salaries from role;`;
    connection.query(query, function(err, query) {
        console.table(query);
        startApp();
    });
};

//add employee
function addEmployee() {
    //
    var rolechoice = [];
    connection.query("SELECT * FROM role", function(err, resRole) {
        if (err) throw err;
        for (var i = 0; i < resRole.length; i++) {
            var roleList = resRole[i].title;
            roleChoice.push(roleList);
        };

        var deptChoice = [];
        connection.query("SELECT * FROM departments", function(err, resDept) {
            if (err) throw err;
            for (var i = 0; i < resDept.length; i++) {
                var deptList = resDept[i].name;
                deptChoice.push(deptList);
            }

            inquirer
                .prompt([{
                        name: "firstName",
                        type: "input",
                        message: "Enter employee's first name:"
                    },
                    {
                        name: "lastName",
                        type: "input",
                        message: "Enter employee's last name:"
                    },
                    {
                        name: "role_id",
                        type: "rawlist",
                        message: "Select employee role:",
                        choices: roleChoice
                    },
                    {
                        name: "department_id",
                        type: "rawlist",
                        message: "Select employee's department:",
                        choices: deptChoice
                    },

                ])
                .then(function(answer) {
                    //for loop to retun 
                    var chosenRole;
                    for (var i = 0; i < resRole.length; i++) {
                        if (resRole[i].title === answer.role_id) {
                            chosenRole = resRole[i];
                        }
                    };

                    var chosenDept;
                    for (var i = 0; i < resDept.length; i++) {
                        if (resDept[i].name === answer.department_id) {
                            chosenDept = resDept[i];
                        }
                    };
                    //insert into db
                    connection.query(
                        "INSERT INTO employees SET ?", {
                            first_name: answer.firstName,
                            last_name: answer.lastName,
                            role_id: chosenRole.id,
                            department_id: chosenDept.id
                        },
                        function(err) {
                            if (err) throw err;
                            console.log("Employee " + answer.firstName + " " + answer.lastName + " successfully added!");
                            startApp();
                        }
                    );
                })
        });
    })
};

//add departments
function addDept() {
    inquirer
        .prompt([{
            name: "dept",
            type: "input",
            message: "Enter new department's name:"
        }])
        .then(function(answer) {
            connection.query(
                "INSERT INTO departments SET ?", {
                    name: answer.dept
                },
                function(err) {
                    if (err) throw err;
                    console.log("Department " + answer.dept + " successfully added!");
                    startApp();
                }
            );
        });
};

// function add role
function addRole() {
    var deptChoice = [];
    connection.query("SELECT * FROM departments", function(err, resDept) {
        if (err) throw err;
        for (var i = 0; i < resDept.length; i++) {
            var deptList = resDept[i].name;
            deptChoice.push(deptList);
        }

        inquirer
            .prompt([{
                    name: "title",
                    type: "input",
                    message: "Enter new role's name:"
                },
                {
                    name: "salary",
                    type: "number",
                    message: "Enter new role's salary:"
                },
                {
                    name: "department_id",
                    type: "rawlist",
                    message: "Select employee's department:",
                    choices: deptChoice
                }
            ])
            .then(function(answer) {

                var chosenDept;
                for (var i = 0; i < resDept.length; i++) {
                    if (resDept[i].name === answer.department_id) {
                        chosenDept = resDept[i];
                    }
                };

                connection.query(
                    "INSERT INTO role SET ?", {
                        title: answer.title,
                        salary: answer.salary,
                        department_id: chosenDept.id
                    },
                    function(err) {
                        if (err) throw err;
                        console.log("New role " + answer.title + " successfully added!");
                        startApp();
                    }
                );
            });
    })
};