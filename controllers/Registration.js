var Registration_Model = require('../models/Registration.js');

module.exports = {
  create: function(req, res, next) {    
    Registration_Model.create(req, res, next, function(err, data){
      if (err) {
        res.render('registration', {ses: req.session, err: err});
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  },
  check: function(req, res, next) {
    Registration_Model.check(req, res, next);
  }
}