var User_Model = require('../models/User.js');

module.exports = {
  get: function(req,res,next){
    User_Model.get(req, function(err, user){
      if (err === 404) return next();
      if (err) return next(err);
      console.log(user);
      res.render('user', {ses: req.session});
    });
  }
};