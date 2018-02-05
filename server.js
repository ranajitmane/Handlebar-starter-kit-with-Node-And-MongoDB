var express = require('express');
var app = express();
var expressSession = require('express-session');
var expressHbs = require('express3-handlebars');
var mongoUrl = 'mongodb://localhost:27017/dbname';
var MongoStore = require('connect-mongo')(expressSession);
var mongo = require('./mongo');
var port = 3000; // for heroku you would use process.env.PORT instead
const nodemailer = require('nodemailer');


app.use( require('body-parser')() );



app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs' , partialsDir: 
        'views/assets'
    }));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
  var coll = mongo.collection('users');
  coll.find({}).toArray(function(err, users){
    res.render('login', {users:users});  
  })
});

app.get('/login', function(req, res){
  res.render('login');
});

app.get('/logout', function(req, res){
  delete req.session.username;
  res.redirect('/');
});



app.get('/signup', function(req,res){
  res.render('signup');
});


function createUser(username, password, password_confirmation, callback){
  var coll = mongo.collection('users');
  console.log('inside the createUser');
  // if (password !== password_confirmation) {
    // var err = 'The passwords do not match';
    // callback(err);
  // } else {
    var userObject = {username: username, email: password,password: password_confirmation};
    

        coll.insert(userObject, function(err,user){
          callback(err,user);
        });
      
  // }
}

app.post('/signup', function(req, res){
  // The 3 variables below all come from the form
  // in views/signup.hbs
  console.log(req.body);
  var username = req.body.username;
  var password = req.body.password;
  var password_confirmation = req.body.password_confirmation;
  
  createUser(username, password, password_confirmation, function(err, user){
    if (err) {
      res.render('signup', {error: err});
    } else {
      
   
   var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: '', // Your email id
            pass: '' // Your password
        }
    });


// setup email data with unicode symbols
let mailOptions = {
    from: '"Ranjeet Mane 👻" <ranjeetmane6613@gmail.com>', // sender address
    to: 'ranjeetmane6613@gmail.com', // list of receivers
    subject: 'OTP ✔', // Subject line
    text: 'Hello', // plain text body
    html: '<b>Hello Your OTP is 9561 ?</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
});
      
      res.render('index');  
    }
  });
});

// This finds a user matching the username and password that
// were given.
function authenticateUser(username, password, callback){
  var coll = mongo.collection('users');
  
  coll.findOne({username: username, password:password}, function(err, user){
    callback(err, user);
  });
}

app.post('/login', function(req, res){
  // These two variables come from the form on
  // the views/login.hbs page
  var username = req.body.username;
  var password = req.body.password;
  
  authenticateUser(username, password, function(err, user){
    if (user) {
      // This way subsequent requests will know the user is logged in.

      res.render('index');
    } else {
      res.render('login', {badCredentials: true});
    }
  });
});

app.use( express.static('views/assets'));

mongo.connect(mongoUrl, function(){
  console.log('Connected to mongo at: ' + mongoUrl);
  app.listen(port, function(){
    console.log('Server is listening on port: '+port);
  });  
})
