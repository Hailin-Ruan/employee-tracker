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
        user: DB_USER,
        password: DB_PASSWORD,
        database: "employee_db"
    },
    console.log(`Connected to the employee_db database.`)
);

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
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

//other endpoints

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
            SELECT employees.employee_id, employees.first_name, employees.last_name, roles.job_title, roles.salary, deaprtments.department_name
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
            break;

        case 'Add an employee':
            break;

        case 'Update an employee role':
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
