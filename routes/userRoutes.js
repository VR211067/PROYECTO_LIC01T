const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

// Crear nuevo usuario (Registro)
router.post('/register', (req, res) => {
    const { username, password, role } = req.body; // Añadimos el rol que llega del frontend

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios (nombre de usuario, contraseña y rol)' });
    }

    // Verifica si el usuario ya existe
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en la consulta de usuario existente' });
        if (results.length > 0) return res.status(409).json({ message: 'El usuario ya existe' });

        // Hashear la contraseña
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ message: 'Error al encriptar la contraseña' });

            // Insertar el nuevo usuario
            db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role], (err) => {
                if (err) return res.status(500).json({ message: 'Error al registrar el usuario en la base de datos' });
                res.status(201).json({ message: 'Usuario registrado exitosamente' });
            });
        });
    });
});

// Leer todos los usuarios
router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al obtener usuarios' });
        res.json(results);
    });
});



// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error en la consulta' });
        if (results.length === 0) return res.status(401).json({ message: 'Credenciales incorrectas' });
    
        const user = results[0];
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) return res.status(500).json({ message: 'Error al comparar contraseñas' });
            if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });
    
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, role: user.role }); // Asegúrate de incluir el rol en la respuesta
        });
    });
    
});

// Editar usuario
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { username, role } = req.body;

    console.log(`Updating user with ID: ${userId}`, req.body); // Agrega esta línea

    if (!username || !role) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    db.query('UPDATE users SET username = ?, role = ? WHERE id = ?', [username, role, userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar el usuario' });
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario actualizado correctamente' });
    });
});

// Eliminar usuario
router.delete('/:id', (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al eliminar usuario' });
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente' });
    });
});

router.get('/test', (req, res) => {
    res.json({ message: 'La ruta de prueba está funcionando' });
});



module.exports = router;

