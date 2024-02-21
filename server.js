require('dotenv').config();
const express = require("express");
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./model/user');
const crypto = require('crypto');
const ejs = require('ejs');
const app = express();
const port = 3000;

// Подключение к базе данных MongoDB
mongoose.connect('mongodb://localhost:27017/auth_demo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Устанавливаем путь к статическим файлам
app.use(express.static(path.join(__dirname, 'views', 'pages')));

app.set('view engine', 'ejs'); // Устанавливаем EJS как движок шаблонов
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Использование сессий Express
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Маршрут для аутентификации пользователя
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Ищем пользователя по имени
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Проверяем совпадение пароля
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Устанавливаем сессию после успешного входа
        req.session.userLoggedIn = true;
        req.session.username = username;

        // Перенаправляем на главную страницу
        res.redirect('/'); // Перенаправление на главную страницу
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Маршрут для регистрации пользователя
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Проверяем, существует ли уже пользователь с таким именем
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Создаем нового пользователя
        const newUser = new User({
            username,
            password: hashedPassword
        });

        // Сохраняем пользователя в базе данных
        await newUser.save();

        // Устанавливаем сессию после успешной регистрации
        req.session.userLoggedIn = true;
        req.session.username = username;

        // Перенаправляем на главную страницу
        res.redirect('/'); // Перенаправление на главную страницу
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Функция для определения времени
function determineTime(req, res, next) {
    const timeOfDay = new Date().getHours();
    req.session.timeOfDay = timeOfDay;
    next();
}

// Главная страница
app.get('/', determineTime, function (req, res) {
    const { userLoggedIn, username } = req.session;
    res.render('index', { userLoggedIn, username }); // Передача переменных userLoggedIn и username в шаблон EJS
});

// Маршрут для страницы профиля
app.get('/profile', function (req, res) {
    const { username } = req.session;
    res.render('pages/profile', { username });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
