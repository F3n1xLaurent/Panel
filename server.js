var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'panel'
});

connection.connect();

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

app.post("/clearcookie", function(req, res){
	res.cookie('login', '', { maxAge: 900000, httpOnly: true });
	res.redirect('/');
});

app.get("/", function(req, res){
	//console.log(cookie);
	if(req.cookies['login'] !== ""){
		console.log(req.cookies['login']);
		res.render('panel.ejs');
	//} else if (!(cookie == "")){
	//	res.render('panel.ejs');
	} else {
		console.log(req.cookies['login']);
		res.sendFile(`${__dirname}/public/startpage.html`);
	}
});



app.post("/signup", function(req, res){
	var login = req.body.login;
	var password = req.body.password;
	var email = req.body.email;

	connection.query("INSERT INTO `users` (`id`, `login`, `pass`, `email`) VALUES (NULL, '"+ login +"', '"+ password +"', '"+ email +"')", function(err,rows,fields){
		if(err){
			res.send('Ошибка в регистрации, попробуйте позже!');
		} else {
			res.send('Вы успешно зарегистрированны!');
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
				res.cookie('login', login, { maxAge: 900000, httpOnly: true });
				res.send('Авторизованы!');
				console.log(req.cookies['login']);
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