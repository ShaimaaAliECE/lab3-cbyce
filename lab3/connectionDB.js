const mysql = require('mysql');

function newConnection()
{
    let conn = mysql.createConnection({
        host:'34.134.24.133',
        user: 'root',
        password:'password!',
        database:'usersDB'
    });
    return conn;
}
module.exports = newConnection;
