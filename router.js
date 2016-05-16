var Main = require('./controllers/Main.js'),
    Comments = require('./controllers/Comments.js'),
    Registration = require('./controllers/Registration.js'),
    User = require('./controllers/User.js'),
    Login = require('./controllers/Login.js'),
    File = require('./controllers/File.js'),
    Rating = require('./controllers/Rating.js');


module.exports = function(app, config, db) {

  var attachDB = function(req, res, next) {
    req.db = db;
    next();
  };

  // Обработчики
  app.get('/', attachDB, Registration.check, function(req,res,next) {
    Main.getData(req, res, next);
  });

  app.get('/:page', attachDB, Registration.check, function(req,res,next) {
    Main.getData(req, res, next);
  });

  app.post('/post/new', attachDB, function(req,res,next) {
    Main.insertData(req, res, next);
  });

  app.get('/post/:id', attachDB, Registration.check, function(req,res,next) {
    Main.getOne(req,res,next);
  });

  app.get('/tag/:tag/:page', attachDB, Registration.check, function(req,res,next) {
    req.timee = new Date();
    Main.getData(req, res, next);
  });

  app.post('/comments', attachDB, Registration.check, function(req,res,next) {
    Comments.show(req, res, next);
  });

  app.post('/comments/new', attachDB, function(req,res,next) {
    Comments.add(req, res, next);
  });

  app.get('/login', attachDB, Registration.check, function(req,res,next) {
    res.render('login', {ses: req.session});
  });

  app.post('/login', attachDB, function(req, res, next) {
    Login.check(req, res, next);
  });

  app.get('/registration', attachDB, Registration.check, function(req,res,next) {
    res.render('registration', {ses: req.session});
  });

  app.post('/registration', attachDB, function(req,res,next) {
    Registration.create(req, res, next);
  });

  app.get('/user/:login', attachDB, function(req,res,next) {
    User.get(req,res,next);
  });

  app.get('/logout', function(req,res,next) {
    res.clearCookie('token');
    req.session.login = false;
    req.session.auth = false;
    res.redirect('back');
  });

  app.get('/cookie', function(req,res,next){
    console.log(req.cookies);
    console.log('+++++++');
    console.log(req.session);
    res.end();
  });

  // file upload
  app.post('/file/upload', function(req,res,next){
    File.send(req,res,next);
  });

  app.post('/file/url', function(req,res,next){
    File.send_url(req,res,next)
  });

  // rating
  app.post('/post/rate', attachDB, function(req,res,next){
    Rating(req,res,next);
  });

  app.get('/add', function(req, res, next){
    var i = 0;    
    var posts = db.collection("posts");
    function add(){
      if (i < 15) {
        var post = {
          time: new Date(),
          cont: 'Comment number: ' + i,
          id: i,
          comments_count: 0,
          author: '55d3832eb2ad6d401ba1e3d8',
          tags: ['try'],
          minuses: [],
          pluses: []
        };
        posts.insert(post, function(err, data) {
          if (err) {
            console.log('Something go wrong');
            next(err);
          } else {
            i++;
            console.log(i);
            add();
          }
        });
      }
    }
    add();
    res.end('Started');
  });

  // Ошибка 404
  app.use(function(req, res, next) {
    res.render('404', {ses: req.session});
  });

  // Обработка исключений
  app.use(function(err, req, res, next) {
    if (config.env === 'development') {
      console.log(err);
      res.end();
    } else {
      var errstat = err.status || 500;
      console.log(err);
      res.status(errstat);
      res.end(errstat+', Internal Server Error');
    }
  });
}