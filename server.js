var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'panel'
};

var mysql = require('mysql');
var connection = mysql.createConnection(options);

var sessionStore = new MySQLStore(options);

app.use(session({
	key: 'sid',
	secret: 'F3n1xLaurent',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

connection.connect();

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

app.post("/clearcookie", function(req, res){
	req.session.destroy();
	res.redirect('/');
});

app.get("/", function(req, res){
	//console.log(cookie);
	if(req.session.auth){
		//console.log(req.cookies['login']);
		res.render('panel.ejs',{user: req.session.auth});
	} else {
		//console.log(req.cookies['login']);
		res.sendFile(`${__dirname}/public/startpage.html`);
	}
});



app.post("/signup", function(req, res){
	var login = req.body.login;
	var password = req.body.password;
	var email = req.body.email;

			connection.query("SELECT * FROM users WHERE login = '" + login + "' OR email = '" + email + "'", function(err,rows,fields){
				if(rows.length > 0){
					res.send('Пользователь с таким именем или почтой уже существует!');
				} else {
					connection.query("INSERT INTO `users` (`id`, `login`, `pass`, `email`) VALUES (NULL, '"+ login +"', '"+ password +"', '"+ email +"')", function(err,rows,fields){
						if(err){
							res.send('Ошибка в регистрации, попробуйте позже!');
						} else {
						res.send('Вы успешно зарегистрированны!');
						}
					})
				}
			});
});

app.post("/login", function(req, res){
	var login = req.body.login;
	var password = req.body.password;

	connection.query("SELECT * FROM users WHERE login = '" + login + "'", function(err,rows,fields){
		if(!rows.length == 0){
			if(password == rows[0].pass){
				//res.clearCookie('login');
				req.session.auth = {'login':login,'pass':password};
				res.locals.login = login; 
				res.send('Авторизованы!');
				//console.log(req.cookies['login']);
			} else {
				res.send('Ошибка в логине или пароле');
			}
		}
	});
});


app.listen(3000, function(){
	console.log("Server was started on port :3000");
})

//connection.end();