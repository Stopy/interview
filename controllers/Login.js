var Login_Model = require('../models/Login.js');

module.exports = {
  check: function(req, res, next) {
    Login_Model.check(req, res, function(err){
      if (err) {
        res.render('login', {ses: req.session, err: err});
      } else {
        res.redirect('/');
      }
    });
  }
}