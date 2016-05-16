var crypto = require('crypto');

module.exports = {
  check: function(req, res, callback) {
    var db = req.db;
    var session = req.session;
    var users = db.collection("users");

    if (!session.auth) {
      var user = {
        login: req.body.login,
        password: req.body.password
      };

      // Если каким-то образом обошли клиентский JS
      if (user.login.length >= 6 && user.login.length < 20 && user.password.length >=6 && user.password.length < 25) {
        user.password = cript(user.password);
        user.token = this.createToken(); // Токен для сохранения авторизации

        users.find({login: user.login, password: user.password}).toArray(function(err, docs) {
          if (err){
            callback('Невозможно соединиться с базой.');
          } else {
            if (docs[0]) {

              users.update(docs[0], user, function(err, result){
                if (err) {
                  callback('Невозможно соединиться с базой');
                } else {
                  res.cookie('token', user.token, {maxAge: 1000*60*60*24*30, httpOnly: true}); // Пишем токен в куки на месяц.
                  session.auth = true;
                  session.login = docs[0].login;   
                  session.uid = docs[0]._id;         
                  callback();
                }
              });

            } else {
              callback('Введен неправильный логин или пароль!');
              // Надо бы написать защиту с накоплением варнингов в сессию или куку
            }
          }
        });

      } else {
        callback('Некорректная длина логина или пароля');
      }
    } else {
      callback('Сначала вам нужно выйти с текущего аккаунта');
    }
  },
  createToken: function() {// Создание токена
    var d = new Date(),
    random = parseInt(Math.random()*100)+d.getDate()+d.getHours()+d.getMilliseconds(),
    token = cript(random.toString());

    return token;
  }
}

// Шифрование пароля
function cript(string) {  
  var sha1 = crypto.createHash('sha1')
  .update(string)
  .digest('hex');
  return sha1;
}