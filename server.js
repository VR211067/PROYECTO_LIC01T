const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Importa path

const userRoutes = require('./routes/userRoutes'); // Asegúrate de que esta línea esté correcta
const db = require('./config/db'); // Asegúrate de importar db
const app = express();

dotenv.config();

// Configura CORS para permitir solicitudes desde tu frontend
app.use(cors());
app.use(bodyParser.json()); // Mueve esta línea antes de las rutas para que funcione correctamente

// Rutas de tu API
app.use('/api/users', userRoutes); // Cambia userRouter a userRoutes
app.get('/api/test', (req, res) => {
    res.send('El servidor está funcionando correctamente');
});

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Enrutar todas las demás solicitudes a index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;

db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1); // Salir del proceso si no se puede conectar
    } else {
        console.log('Conectado a la base de datos MySQL');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    }
});

