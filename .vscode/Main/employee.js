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

const promptUser = async () => {
    try {
        const response = await inquirer.prompt([
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
        ]);

        switch (response.action) {
            case 'View all departments':
                await viewAllDepartments();
                break;
            case 'View all roles':
                await viewAllRoles();
                break;
            case 'View all employees':
                await viewAllEmployees();
                break;
            case 'Add a department':
                await addDepartment();
                break;
            case 'Add a role':
                await addRole();
                break;
            case 'Add an employee':
                await addEmployee();
                break;
            case 'Update an employee':
                await updateEmployee();
                break;
            case 'Exit':
                console.log('Goodbye!');
                process.exit(0);
                break;
        }
    } catch (error) {
        console.error(`Error in prompt: ${error.message}`);
    }
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
            message: 'What is the title of the role?'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary for this role?'
        },
        {
            type: 'list',
            name: 'department_id',
            message: 'Which department does this role belong to?',
            choices: await getDepartmentChoices()
        }
    ]);
    try {
        const result = await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *', [response.name, response.salary, response.department_id]);
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
            type: 'input',
            name: 'role_id',
            message: 'What role does this employee hold?',
            // choices: await getRoleChoices()
        },
        
    ]);
    try {
        const result = await pool.query('INSERT INTO employee (first_name, last_name, role_id) VALUES ($1, $2, $3) RETURNING *', [response.first_name, response.last_name, response.role_id]);
        console.table(result.rows);
        promptUser();
    } catch (error) {
        console.error(error);
        promptUser();
    }
}

async function getDepartmentChoices() {
    const result = await pool.query('SELECT id, name FROM department');
    return result.rows.map(dept => ({ name: dept.name, value: dept.id }));
}

async function updateEmployee() {
    const response = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Which employee would you like to update?',
            choices: await getEmployeeChoices()
        },
        {
            type: 'list',
            name: 'attribute',
            message: 'What attribute would you like to update?',
            choices: [
                'First name',
                'Last name',
                'Role',
                'Salary'
            ]
        },
        {
            type: 'input',
            name: 'newValue',
            message: 'What is the new value?'
        }
    ]);

    const { employee_id, attribute, newValue } = response;
    let query = '';
    let values = [];

    // Constructing the appropriate SQL query based on the attribute to update
    switch (attribute) {
        case 'First name':
            query = 'UPDATE employee SET first_name = $1 WHERE id = $2';
            values = [newValue, employee_id];
            break;
        case 'Last name':
            query = 'UPDATE employee SET last_name = $1 WHERE id = $2';
            values = [newValue, employee_id];
            break;
        case 'Role':
            query = 'UPDATE employee SET role_id = $1 WHERE id = $2';
            values = [newValue, employee_id];
            break;
        case 'Salary':
            // Assuming the salary is part of the role table, and you want to update the role associated with the employee
            query = 'UPDATE role SET salary = $1 WHERE id = (SELECT role_id FROM employee WHERE id = $2)';
            values = [newValue, employee_id];
            break;
    }

    try {
        await pool.query(query, values);
        console.log(`Updated ${attribute} for employee ID ${employee_id} to ${newValue}`);
    } catch (error) {
        console.error(`Error updating employee: ${error.message}`);
    }

    promptUser();
}
    async function getEmployeeChoices() {
        const result = await pool.query('SELECT id, first_name, last_name FROM employee');
        return result.rows.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
    }

async function getDepartmentChoices() {
    const result = await pool.query('SELECT id, name FROM department');
    return result.rows.map(dept => ({ name: dept.name, value: dept.id }));
}


promptUser();
