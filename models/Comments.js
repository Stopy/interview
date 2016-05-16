var ShowComments_Model = {

  getComments: function(req, db, next, callback) {
    var com = db.collection("comments");
    var users = db.collection("users");
    var posts = db.collection("posts");
    var post_id = parseInt(req.body.id);
    var other = { post_id: post_id };

    com.find({post_id: post_id}).toArray(function(err, data) {
      if (err) return next(err);

      // Информация о комментаторах
      var userArray = [];
      data.forEach(function(user){
        if (userArray.indexOf(user.author) === -1) {
          userArray.push(user.author);
        }
      });
      users.find({_id: {$in: userArray}}).toArray(function(err, usersList) {
        if (err) return next(err);
        var usersObj = {};
        usersList.forEach(function(item) {
          usersObj[item._id] = item;
        });
        nextStepComments(usersObj);
      });

      function nextStepComments(usersObj){
        // Древовидные комментарии
        var newObj = {}; // Объект для распехивания комментариев по их id (ассоц. массив)
        for (var i = 0; i < data.length; i++) {
          newObj[data[i].id] = data[i]; // Циклом делаем объект из массива
        }

        var comArray = []; // Новый массив для вывода
        Object.keys(newObj).forEach(function(id) {

          var parent = newObj[id].parent;
          if (parent) { // Если у объекта есть родитель
            if (newObj[parent]) { // Если такой родитель существует
              newObj[parent].children = newObj[parent].children || [];
              newObj[parent].children.push(newObj[id]); // Даем родителю ссылку на ребенка
            }
          } else {
            // Если родителя нет, то просто даем ссылку новому массиву на коммент
            comArray.push(newObj[id]);
          }

        });
        callback(comArray, usersObj, other);
      }

    });
  },

  addComment: function(req, db, next, callback) {
    var ses = req.session;
    var com = db.collection("comments");    
    var posts = db.collection("posts");
    var count = db.collection("counters");
    var body = req.body;
    body.post_id = Number(body.post_id);

    var comment = {
      text: body.text,
      post_id: body.post_id,
      time: new Date(),
      author: ses.uid,
      parent: parseInt(body.parent) || 0
    };

    if (ses.auth && ses.login && !isNaN(body.post_id) && body.text) { // Проверки

      if (comment.parent !== 0) {
        com.find({id: comment.parent}).toArray(function(err, data) {
          if (err) return next(err);
          if (data[0]) { // Если найден такой parent
            var parent = data[0];

            posts.find({id: comment.post_id}).toArray(function(err, data) { // Определяем есть ли такой пост
              if (data[0]) {

                count.findAndModify({_id: 'commentid'},[],{$inc: {seq: 1}},{},function (err, object) { // Присваивание ун. id комментарию
                  if (err) return next(err);
                  comment.id = object.value.seq; // Ловим уникальный ID
                  comment.margin = parent.margin + 1;

                  com.insert(comment, function(err, data) {
                    if (err) return next(err);
                    posts.findAndModify({id: comment.post_id},[],{$inc: {comments_count: 1}},{}, function (err, object) {
                      if (err) return next(err);
                      callback();
                    });
                  });
                });

              } else {
                callback('Такой пост не найден');
              }

            });

          } else { // Если parent не найден
            callback('Комментарий на который вы отвечаете не существует или был удален!');
          }

        });
      } else { // Если parent был 0
        posts.find({id: comment.post_id}).toArray(function(err, data) { // Определяем есть ли такой пост
          if (data[0]) {
            count.findAndModify({_id: 'commentid'},[],{$inc: {seq: 1}},{},function (err, object) { // Присваивание ун. id комментарию
              if (err) return next(err);
              comment.id = object.value.seq; // Ловим уникальный ID
              comment.margin = 0;

              com.insert(comment, function(err, data) {
                if (err) return next(err);
                posts.findAndModify({id: comment.post_id},[],{$inc: {comments_count: 1}},{}, function (err, object) {
                  if (err) return next(err);
                  callback();
                });
              });
            });
          } else {
            callback('Такой пост не найден')
          }
        });

      }
    } else {
      callback('Некорректный запрос');
    }
  }
};

module.exports = ShowComments_Model;