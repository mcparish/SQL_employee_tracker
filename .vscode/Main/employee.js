const { Pool } = require('pg');
const inquirer = require('inquirer');
require('dotenv').config();
console.log(process.env.DB_PASSWORD);

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'employee_db',
    password: process.env.DB_PASSWORD
});

pool.connect();

const promptUser = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee',
                'Exit'
            ]
        }
    ])
        .then(response => {
            switch (response.action) {
                case 'View all departments':
                    viewAllDepartments();
                    break;
                case 'View all roles':
                    viewAllRoles();
                    break;
                case 'View all employees':
                    viewAllEmployees();
                    break;
                case 'Add a department':
                    addDepartment();
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update an employee':
                    updateEmployee();
                    break;
                case 'Exit':
                    console.log('Goodbye!');
                    process.exit(0);
                    break;
            }
        });
};

async function viewAllDepartments() {
    try {
        const result = await pool.query('SELECT * FROM department');
        console.table(result.rows);
        promptUser();
    } catch (error) {
        console.error(error);
        promptUser();
    }
}

async function viewAllRoles() {
    try {
        const result = await pool.query('SELECT * FROM role');
        console.table(result.rows);
        promptUser();
    } catch (error) {
        console.error(error);
        promptUser();
    }
}

async function viewAllEmployees() {
    try {
        const result = await pool.query('SELECT * FROM employee');
        console.table(result.rows);
        promptUser();
    } catch (error) {
        console.error(error);
        promptUser();
    }
}

async function addDepartment() {
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the department?'
        }
    ]);
    try {
        const result = await pool.query('INSERT INTO department (name) VALUES ($1) RETURNING *', [response.name]);
        console.table(result.rows);
        promptUser();
    } catch (error) {
        console.error(error);
        promptUser();
    }
}

async function addRole() {
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the role?'
        },
        {
            type: 'list',
            name: 'department_id',
            message: 'Which department does this role belong to?',
            choices: await getDepartmentChoices()
        }
    ]);
    try {
        const result = await pool.query('INSERT INTO role (name, department_id) VALUES ($1, $2) RETURNING *', [response.name, response.department_id]);
        console.table(result.rows);
        promptUser();
    } catch (error) {
        console.error(error);
        promptUser();
    }
}

async function addEmployee() {
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'What is the employee\'s first name?'
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'What is the employee\'s last name?'
        },
        {
            type: 'list',
            name: 'role_id',
            message: 'What role does this employee hold?',
            choices: await getRoleChoices()
        },
        {
            type: 'input',
            name: 'manager_id',
            message: 'If this employee is a manager, enter their ID. Otherwise, leave blank.',
            validate: value => {
                if (value === '' || !isNaN(parseInt(value))) {
                    return true;
                }
                return 'Please enter a valid ID or leave blank.';
            }
        }
    ]);
    try {
        const result = await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *', [response.first_name, response.last_name, response.role_id, response.manager_id]);
        console.table(result.rows);
        promptUser();
    } catch (error) {
        console.error(error);
        promptUser();
    }
}

async function updateEmployee() {
    // Add logic to select an employee and update their details
}

async function getDepartmentChoices() {
    const result = await pool.query('SELECT id, name FROM department');
    return result.rows.map(dept => ({ name: dept.name, value: dept.id }));
}

async function getRoleChoices() {
    const result = await pool.query('SELECT id, name FROM role');
    return result.rows.map(role => ({ name: role.name, value: role.id }));
}

promptUser();
