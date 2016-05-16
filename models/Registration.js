var crypto = require('crypto');
var ObjectId = require('mongodb').ObjectID;

module.exports = {

  // Создание пользователя
  create: function(req, res, next, callback) {
    var db = req.db;
    var user = {
      login: req.body.login,
      password: req.body.password,
      email: req.body.email
    }

    //if (email) проверка через regexp на валидность мейла
    if (req.session.auth) {
      callback('Сначала нужно выйти с текущего аккаунта');
    } else {

      // Если каким-то образом обошли клиентский JS
      if (user.login.length >= 6 && user.password.length >=6 && user.login.length < 20 && user.password.length < 25) {
        var users = db.collection("users");
        user.time = new Date(),
        user.password = cript(user.password);
        user._id = ObjectId().toHexString();
        user.token = this.createToken(); // Токен для сохранения авторизации

        users.find({login: user.login}).toArray(function(err, docs) {
          if (err){
            next(err);
          } else {
            if (!docs[0]) {

              users.insert(user, function(err, data) {
                if (err) {
                  callback('Невозможно соединиться с базой.');
                } else {
                  res.cookie('token', user.token, {maxAge: 1000*60*60*24*30, httpOnly: true}); // Пишем токен в куки на 15 мин.
                  callback();
                }
              });

            } else {
              callback('Логин уже занят');
            }
          }
        });

      } else {
        callback('Неправильный размер логина или пароля');
      }
    }
  },
  // Создание токена
  createToken: function() {
    var d = new Date(),
    random = parseInt(Math.random()*100)+d.getDate()+d.getHours()+d.getMilliseconds(),
    token = cript(random.toString());

    return token;
  },
  check: function(req, res, next) {
    var db = req.db;
    var session = req.session;
    var token = req.cookies.token;

    if (!session.auth) {
      if (!token) {
        // Нет не токена, ни сессии. Неавторизованный пользователь
        session.auth = false;
        next();
      } else {
        var users = db.collection('users');

        users.find({token: token}).toArray(function(err, docs){
          if (err) return next(err);
          if (docs[0]) {
            // Токен есть в куках, сессия восстановлена!
            session.auth = true;
            session.login = docs[0].login;
            session.uid = docs[0]._id;
            next();
          } else {
            // Куки подделаны, сессия и куки удаляются
            res.clearCookie('token');
            session.auth = false;
            next();
          }
        });

      }
    } else {
      // Уже авторизован, не требуется новый токен
      next();
    }
  }
};

// Шифрование пароля
function cript(string) {  
  var sha1 = crypto.createHash('sha1')
  .update(string)
  .digest('hex');
  return sha1;
}