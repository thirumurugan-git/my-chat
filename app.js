var express=require('express');
var url=require('url');
var cookieParser = require('cookie-parser');
var ses = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);



sharedsession = require("express-socket.io-session");


app.use(express.static(__dirname));
app.set('view engine','ejs');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(cookieParser());

var session = ses({
    key: 'your-key',
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
});

app.use(session);

io.use(sharedsession(session));

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.your_key) {
        res.redirect('/chat');
    } else {
        next();
    }    
};

app.use((req, res, next) => {
    if (req.cookies.your_key && !req.session.user) {
        res.clearCookie('your_key');        
    }
    next();
});

const users = [{
  user: 'user',
  password: 'password',
}];

online=[];
offline=[];
users.forEach(e => {
	offline.push(e.user);
});

app.get('/', sessionChecker,function(req, res) {
	res.render('login',{cred:'none',login:'none'});
});

app.post('/', urlencodedParser,function(req, res) {
	const username= req.body.user;
	const password= req.body.pwd;
	req.session.user=username;
	req.session.pwd=password;
	const found = users.find(user => user.user===username && user.password===password);
	if(!found){
		res.render('login',{cred:'block',login:'none'});
	}
	const check = online.find(user => user===username);
	if(check){
		res.render('login',{cred:'none',login:'block'});
	}
	res.redirect('/chat');
	
	
});

app.get('/chat',urlencodedParser,(req, res) => {
	if(!req.session.user){
		req.redirect("/");
	}
	res.render('chat',{name:req.session.user});
});

// initialize express-session to allow us track the logged-in user across sessions.


/*-----------------------------

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.






app.get('/style.css', sessionChecker,function(req, res) {
  res.sendFile(__dirname + "/" + "style.css");
});

------------------------------------*/


/*----------------------------------------------------

// middleware function to check for logged-in users



// route for Home-Page



// route for user signup
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/signup.html');
    })
    .post((req, res) => {
        User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        .then(user => {
            req.session.user = user.dataValues;
            res.redirect('/dashboard');
        })
        .catch(error => {
            res.redirect('/signup');
        });
    });


// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        User.findOne({ where: { username: username } }).then(function (user) {
            if (!user) {
                res.redirect('/login');
            } else if (!user.validPassword(password)) {
                res.redirect('/login');
            } else {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            }
        });
    });


// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.sendFile(__dirname + '/public/dashboard.html');
    } else {
        res.redirect('/login');
    }
});

*/
// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.your_key) {
        res.clearCookie('your_key');
    }
    res.redirect('/');
});


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});




io.on('connection', function(socket) {
   const curr=socket.handshake.session.user;
   const pass=socket.handshake.session.pwd;
   const found = users.find(user => user.user===curr && user.password===pass);
   const onl = online.find(user => user===curr);
   if(found && !onl){
   	socket.emit("you",socket.handshake.session.user);
   	online.push(socket.handshake.session.user);
   	var ind=offline.indexOf(socket.handshake.session.user);
   	if(ind!=-1){
   		offline.splice(ind,1);
   	}
   	io.sockets.emit("status",{on:online,off:offline});
   	socket.on("msg",function(data){
		socket.broadcast.emit("othersMsg",{user:socket.handshake.session.user,msg:data});
   	});
   }
   else{
 	socket.emit("redirect",true);
   }
   socket.on("logout",function(data){
	//
   });

   socket.on('disconnect', function () {
      offline.push(socket.handshake.session.user);
      var ind=online.indexOf(socket.handshake.session.user);
      if(ind!=-1){
      	online.splice(ind,1);
      }
      io.sockets.emit("status",{on:online,off:offline});
   });
});


http.listen(process.env.PORT || 3000, function() {
   console.log('listening on *:3000');
});
