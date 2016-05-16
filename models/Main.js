module.exports = {
	getData: function(req, next, callback) {
    var db = req.db;
		var posts = db.collection("posts");
    var users = db.collection("users");
    var page = req.params.page;
    var options = {};
    if (req.params.tag) {
      options.tags = req.params.tag;
    }
    if (page === undefined) {
      page = 1;
    } else {
      page = parseInt(page);
    }

    // Если это действительно номер страницы и он не длинней 5 символов
    if (!isNaN(parseInt(page)) && page.toString().length <= 6) {
      posts.ensureIndex({time: 1}, {}, function(err){ // Индекс для постов по времени создания
        if (err) return next(err);

        posts.count(options, function(err, count){ // Сколько всего страниц
          if (err) return next(err);
          if (page > Math.ceil(count/10) && !options.tags) return next();

          // Запрос к конкретной странице
      		posts.find(options).sort({time: -1}).skip((page-1)*10).limit(10).toArray(function(err, data) {
      			if (err) return next(err);

            var usersArray = [];
            data.forEach(function(item){
              usersArray.push(item.author);
            });

            users.ensureIndex({_id: 1},{}, function(err) {
              if (err) return next(err);

              users.find({_id: {$in: usersArray}}).toArray(function(err, usersData){
                if (err) return next(err);
                var usersList = {};

                usersData.forEach(function(el){
                  usersList[el._id] = el;
                });
                callback(data, usersList, page, paginate(page, Math.ceil(count/10)));
              });
            });
      		});

        });
      });

    } else {
      next();
    }
	},
  insertData: function(req, res, db, callback) {
    var posts = db.collection("posts");
    var count = db.collection("counters");
    var tags = JSON.parse(req.body.tags);
    if (!tags.length) tags = ['личное'];
    if (!req.session.auth) return res.redirect('/'); // Нарушителей редиректим
    count.findAndModify({_id: 'postid'},[],{$inc: {seq: 1}},{},function (err, object) {
      if (err){
        callback(new Error('Невозможно подключиться к базе'));
      } else {
        var post = {
          time: new Date(),
          cont: req.body.cont,
          id: object.value.seq,
          comments_count: 0,
          author: req.session.uid,
          tags: tags,
          minuses: [],
          pluses: []
        };
        posts.insert(post, function(err, data){
          if (err) {
            callback(new Error('Невозможно подключиться к базе'));
          } else {
            callback();
          }
        });

      }
    });
  },
  getOne: function(req, next, callback) {
    var db = req.db;
    var posts = db.collection("posts");
    var com = db.collection("comments");
    var users = db.collection("users");
    var post_id = parseInt(req.params.id);
    var other = {};
    var post = {};

    posts.ensureIndex({id: 1}, {}, function(err) {
      if (err) return next(err);

      posts.findOne({id: post_id},{}, function(err, pdata) {
        if (err) return next(err);
        if (!pdata) { return next(); }
        post.data = pdata;
        other.post_id = pdata.id;

        users.findOne({_id: pdata.author}, {}, function(err, user) {
          if (err) return next(err);
          post.user = user;

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

              callback(post, comArray, usersObj, other);
            }

          });
        });

      });
    });
  }
};

function paginate(page, count) {
  var i = -2;
  var array = [];
  for (; i<=2; i++) {
      if (page + i >= 1 && page + i <= count) {
          array.push(page+i);
      }
  }
  return array;
}