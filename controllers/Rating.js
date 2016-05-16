var Rating_Model = require('../models/Rating.js');

module.exports = function(req,res,next){

  Rating_Model(req,res,next,function(result){
    res.json(result);
  });
  
}