var async = require('async');

module.exports = {
  get: function(req,callback){
    var db = req.db;
    var users = db.collection('users');
    var posts = db.collection('posts');
    var login = req.params.login;
    var user = {};

    async.series([
      function(cb) {
        users.findOne({login: login}, {}, function(err, data){
          if (err) return callback(err);
          if (!data) return callback(404);
          user.profile = data;
          cb();
        });
      },
      function(cb){
        posts.find({author: user.profile._id}).toArray(function(err, posts){
          if (err) return callback(err);
          user.posts = posts;
          callback(null, user);
        });
      },
    ]);
  }
};