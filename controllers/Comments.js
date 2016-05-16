var Comments_Model = require('../models/Comments.js');
var templatePath = require.resolve('../views/comments.jade');
var templateFn = require('jade').compileFile(templatePath);

module.exports = {
  show: function (req, res, next) {
    var startTime = new Date();
    Comments_Model.getComments(req, req.db, next, function(data, usersObj, other){
      console.log('over time: '+ (new Date() - startTime));
       res.write(templateFn({ data: data, usersObj: usersObj, ses: req.session, other: other }));
       res.end();
      //res.render('comments', { data: data, usersObj: usersObj, ses: req.session, other: other });
    });
  },
  add: function (req, res, next) {
    Comments_Model.addComment(req, req.db, next, function(err) {
      if (err) {
        res.end(err);
      } else {
        res.end('ok');
      }
    });
  }
};