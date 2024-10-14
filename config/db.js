const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Cambia por tu usuario de MySQL
    password: 'Nemesis30@', // Cambia por tu contraseña de MySQL
    database: 'empresa'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

module.exports = db;