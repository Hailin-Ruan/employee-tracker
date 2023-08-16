const inquirer = require('inquirer');
const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3001;

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "asdfghjkl;'",
        database: "employee_db"
    });

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
    promptForAction();
});

// GET /departments
app.get('/departments', (req, res) => {
    const query = 'SELECT department_id, department_name FROM departments;';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

//can add other endpoints

function promptForAction() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'what would you like to do?',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role',
                    'Exit',
                ],
            },
        ])
        .then((answers) => {
            handleAction(answers.action);
        })
        .catch((error) => {
            console.error('An error occurred:', error);
        });
}

function handleAction(action) {
    switch (action) {
        case 'View all departments':
            const selectDepartmentsQuery = `
            SELECT department_id, department_name FROM departments
            `;
            db.query(selectDepartmentsQuery, (err, results) => {
                if (err) {
                    console.error('Error retrieving departments:', err);
                } else {
                    console.log('\nDepartments:');
                    results.forEach((department) => {
                        console.log(`${department.department_id}: ${department.department_name}`);
                    });
                }
                promptForAction();
            });
            break;

        case 'View all roles':
            const selectRolesQuery = `
            SELECT roles.role_id, roles.job_title, roles.salary, departments.department_name
            FROM roles
            INNER JOIN departments ON roles.department_id = departments.department_id
            `;
            db.query(selectRolesQuery, (err, results) => {
                if (err) {
                    console.error('Error retrieving roles:', err);
                } else {
                    console.log('\nRoles:');
                    results.forEach((role) => {
                        console.log(`${role.role_id}: ${role.job_title} - ${role.department_name} - Salary: ${role.salary}`);
                    });
                }
                promptForAction();
            });
            break;

        case 'View all employees':
            const selectEmployeesQuery = `
            SELECT employees.employee_id, employees.first_name, employees.last_name, roles.job_title, roles.salary, departments.department_name
            FROM employees
            INNER JOIN roles ON employees.role_id = roles.role_id
            INNER JOIN departments ON roles.department_id = departments. department_id
            `;
            db.query(selectEmployeesQuery, (err, results) => {
                if (err) {
                    console.error('Error retrieving employees:', err);
                } else {
                    console.log('\nEmployees:');
                    results.forEach((employee) => {
                        console.log(`${employee.employee_id}; ${employee.first_name} ${employee.job_title} - ${employee.department_name} - Salary: ${employee.salary}`);
                    });
                }
                promptForAction();
            });
            break;

        case 'Add a department':
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'departmentName',
                    message: 'Enter the name of the department:',
                },
            ])
                .then((answers) => {
                    const departmentName = answers.departmentName;

                    const insertQuery = 'INSERT INTO departments (department_name) VALUES (?)';
                    db.query(insertQuery, [departmentName], (err, result) => {
                        if (err) {
                            console.error('Error inserting department:', err);
                        } else {
                            console.log('Department added successfully.')
                        }
                        promptForAction();
                    });
                })
                .catch((error) => {
                    console.error('An error occurred:', error);
                    promptForAction();
                });
            break;

        case 'Add a role':
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'jobTitle',
                    message: 'Enter the job title:',
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'Enter the salary:',
                },
                {
                    type: 'input',
                    name: 'departmentId',
                    message: 'Enter the department ID:',
                },
            ])
                .then((answers) => {
                    const jobTitle = answers.jobTitle;
                    const salary = parseFloat(answers.salary);
                    const departmentId = parseInt(answers.departmentId);

                    const insertRoQuery = 'INSERT INTO roles (job_title, salary, department_id) VALUES (?, ?, ?)';
                    db.query(insertRoQuery, [jobTitle, salary, departmentId], (err, result) => {
                        if (err) {
                            console.error('Error inserting role:', err);
                        } else {
                            console.log('Role added successfully.');
                        }
                        promptForAction();
                    });;
                })
                .catch((error) => {
                    console.error('An error occurred:', err);
                    promptForAction();
                });
            break;

        case 'Add an employee':
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'Enter the first name:',
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'Enter the last name:',
                },
                {
                    type: 'input',
                    name: 'roleId',
                    message: 'Enter the role ID:',
                },
                {
                    type: 'input',
                    name: 'managerId',
                    message: 'Enter the manager ID (or leave empty if none):',
                },
            ])
                .then((answers) => {
                    const firstName = answers.firstName;
                    const lastName = answers.lastName;
                    const roleId = parseInt(answers.roleId);
                    const managerId = answers.managerId !== '' ? parseInt(answers.managerId) : null;

                    const insertEmQuery = 'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
                    db.query(insertEmQuery, [firstName, lastName, roleId, managerId], (err, result) => {
                        if (err) {
                            console.error('Error inserting employee:', err);
                        } else {
                            console.log('Employee added successfully.');
                        }
                        promptForAction();
                    });
                })
                .catch((error) => {
                    console.error('An error occurred:', error);
                    promptForAction();
                });
            break;

        case 'Update an employee role':
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'employeeId',
                    message: 'Enter the employee ID:',
                },
                {
                    type: 'input',
                    name: 'newRoleId',
                    message: 'Enter the new role ID:',
                },
            ])
            .then((answers) => {
                const employeeId = parseInt(answers. employeeId);
                const newRoleId = parseInt(answers.newRoleId);

                const updateQuery = 'UPDATE employees SET role_id = ? WHERE employee_id = ?';
                db.query(updateQuery, [newRoleId, employeeId], (err, result) => {
                    if (err) {
                        console.error('Error updating employee role:', err);
                    } else {
                        console.log('Employee role updated successfully.');
                    }
                    promptForAction();
                });
            })
            .catch((error) => {
                console.error('An error occurred:', error);
                promptForAction();
            });
            break;

        case 'Exit':
            console.log('Exiting...');
            process.exit(0);
            break;

        default:
            console.log('Invalid action');
            promptForAction();
    }
}

// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
