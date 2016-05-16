var Main_Model = require('../models/Main.js');

module.exports = {

  getData: function(req, res, next) {
    var startTime = new Date();
    if (req.params.page < 1) return res.redirect('/');
  	Main_Model.getData(req, next, function(data, usersList, page, pageArray) {
      console.log(new Date() - startTime);
      var renderTime = new Date();
      res.render('main', {ses: req.session, users: usersList, data: data, page: page, pageArray: pageArray});
      console.log('Render complete for: '+ (new Date() - renderTime));
    });
  },

  insertData: function(req,res,next) {
    if (req.body.cont.length < 250){
      Main_Model.insertData(req, res, req.db, function(err){
        if (err) return next(err);
        res.redirect('back');
      });
    } else {
      res.redirect('/');
    }
  },

  getOne: function(req,res,next) {
    var startTime = new Date();
    Main_Model.getOne(req, next, function(post, comArray, usersObj, other) {
      res.render('post', {ses: req.session, data: comArray, post: post, usersObj: usersObj, other: other});
      console.log(new Date() - startTime);
    });
  }

};