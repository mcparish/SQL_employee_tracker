# SQL_employee_tracker

## Description

This purpose of this application is to use node.js, inquirer, and PostgreSQL to create a database in which the user can access tables with various employee information. In this project I learned how to create a database and store information about various employees.

## Installation

In order to install the database you first need to login to postgres by entering the following command in the integrated terminal:  psql -U postgres

Following this command you will need to install the the schema files:  \i schema.sql

After installing the schema files and seeding the database you will need to start the app by running the following command: node employee.js

## Usage

After the database is created the user will be presented with these various prompts:
    -View all departments
    -View all roles
    -View all employees
    -Add a department
    -Add a role
    -Add an employee
    -Update employee

    By following these prompts the user can add various employee information to the database.  

## Walkthrough Video

https://app.screencastify.com/v2/manage/videos/zHbk98z6mfCqnl24G7vJ

## License

MIT License