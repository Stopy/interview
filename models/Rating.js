module.exports = function(req,res,next,callback){

  var posts = req.db.collection("posts");
  var idForFind = parseInt(req.body.id);
  var ses = req.session;
  var rateValue, d;

  posts.find({id: idForFind}).toArray(function(err, data) {

    d = data[0];
    if (err) return next(err);
    
    // Если найдено событие
    if (d) {

      // Если отправлен плюс
      if (req.body.rate === '1') {

        if (ses.login && ses.auth && d.pluses.indexOf(ses.login) === -1) {

          if (d.minuses.indexOf(ses.login) !== -1) { // Убираем минус, если он был поставлен до этого
            var index = d.minuses.indexOf(ses.login);
            d.minuses.splice(index, 1);
          }

          d.pluses.push(ses.login);

          posts.update({id: idForFind}, d, function(err, result) {

            if (err) return next(err);
            rateValue = d.pluses.length - d.minuses.length;
            callback({rateValue: rateValue});

          });

        } else {
          callback({hiddenErr: 'You have already rated this post or you are not authorized for this action'});
        }
      }

      // Если отправлен минус
      else {
        if (req.body.rate === '-1') {

          if (ses.login && ses.auth && d.minuses.indexOf(ses.login) === -1) {

            if (d.pluses.indexOf(ses.login) !== -1) { // Снимаем плюс, если был установлен до новой оценки
              var index = d.pluses.indexOf(ses.login);
              d.pluses.splice(index, 1);
            }

            d.minuses.push(ses.login);

            posts.update({id: idForFind}, d, function(err, result) {

              if (err) return next(err);
              rateValue = d.pluses.length - d.minuses.length;
              callback({rateValue: rateValue});

            });

          } else {
            callback({hiddenErr: 'You have already rated this post or you are not authorized for this action'});
          }
        }
      }

    } else {
      callback({hiddenErr: 'Rated post is not found'});
    }
  });
}