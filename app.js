// Add module dependencies
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const path = require('path');
const cors = require('cors');
// const logger = require('morgan');
const { sequelize } = require('./models');
const config = require('./config/config');
const { engine } = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const User = require('./models').User;
require('./config/passport')(passport); 

// Make io accessible to routes
app.set('io', io);

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(logger('combined'));
app.use(session({
    secret: config.session.keys,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000,
        secure: false // set to true if using HTTPS
    }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Set templating engine
app.engine('hbs', engine({
    defaultLayout: 'main', 
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));

// Define routes
app.use('/', require('./routes/web.js'));
app.use('/api', require('./routes/api.js'));
// Since this is the last middleware used, assume 404, as nothing else responded.
app.use('*', require('./routes/404.js'));

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join a specific dashboard room
    socket.on('join-dashboard', (dashboardId) => {
        socket.join(`dashboard-${dashboardId}`);
        console.log(`Client ${socket.id} joined dashboard ${dashboardId}`);
    });

    // Join a session room for real-time data
    socket.on('join-session', (sessionId) => {
        socket.join(`session-${sessionId}`);
        console.log(`Client ${socket.id} joined session ${sessionId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Export io for use in controllers
global.io = io;

// Connect to database and sync models
sequelize.sync(
    // {force:true}
    )
    .then(() => {
        console.log('Connection to database successfully established');  
        
        // User.create({
        //     email: 'test@contoso.com',
        //     password : 'heslo'
        // });

        // Start server
        server.listen(config.port, () => {
            console.log(`Listening on port ${config.port}`);
            console.log(`WebSocket server ready`);
        });

    }).catch((err) => {
        console.log('Error connecting to the database:', err.message);
});


