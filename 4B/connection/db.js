const mysql = require('mysql2')

const connectionPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_task_collection'
})

module.exports = connectionPool