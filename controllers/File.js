var multiparty = require('multiparty');
var http = require('http');
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var cfg = require('config');
var crypto = require('crypto');
var util = require('util');

module.exports = {
  send: function(req,res,next) {
    if (req.headers['content-length'] > 1024*1024*3) {
      console.log('Слишком большой файл');
      res.end('Слишком большой файл');
      return false;
    }

    var form = new multiparty.Form({
      autoFiles: true,
      uploadDir: './upload/'
    });

    form.on('file', function(name, file) {
      var mime = file.headers['content-type'];
      if (mime != 'image/jpeg' && mime != 'image/png') {
        console.log(mime);
        fs.unlink(file.path);
        res.end('Неправильный тип файла');
      } else {
        var filename = unicName();

        gm(file.path)
        .quality(cfg.quality)
        .background('#FFF')
        .mosaic()
        .write("./public/images/"+filename+'.jpg', function (err) {

          fs.unlink(file.path, function(){});
          if (err) {
            res.end('Ошибка при загрузке изображения!');
          } else {
            console.log('Done!');
            res.end(filename+'.jpg');
          }

        });
      }
    });

    form.on('error', function(err) {
      next(err);
      console.log('Error parsing form: ' + err.stack);
    });
     
    form.on('part', function(part) {     
      part.on('error', function(err) {
        next(err);
      });
    });
     
    form.on('close', function() {
      console.log('Upload completed!');
    });
     
    form.parse(req, function(){ console.log('Parsed'); });

  },

  // send: multer({
  //   dest: './upload/',
  //   limits: {
  //     fileSize: 3*1024*1024
  //   },
  //   onFileUploadData: function(chunk, req, res) {
  //     if (chunk.size > 1024*3) {
  //       return false;
  //       console.log('limit');
  //     }
  //   },
  //   onFileUploadStart: function (file, req, res) {
  //     if (req.headers['content-length'] > 1024*1024*3) {
  //       console.log('limit');
  //       return false;
  //     }
  //     console.log('Upload started');
  //     var mime = file.mimetype;
  //     if (mime != 'image/jpeg' && mime != 'image/png') {
  //       res.end('Неправильный тип файла.');
  //       return false;
  //     }
  //   },
  //   onFileSizeLimit: function (file) {
  //     console.log('Failed: ', file.originalname);
  //     fs.unlink('./' + file.path);
  //   },
  //   onFileUploadComplete: function (file, req, res) {

  //     var rand = unicName();

  //     gm('./upload/'+file.name)
  //     .quality(cfg.quality)
  //     .background('#FFF')
  //     .mosaic()
  //     .write("./public/images/"+rand+'.jpg', function (err) {

  //       fs.unlink('./upload/'+file.name, function(error){
  //         if (error) res.end('Не удается работать с файлом');
  //       });
  //       if (err) {
  //         res.end('Ошибка при загрузке изображения!');
  //       } else {
  //         console.log('Done!');
  //         res.end(rand+'.jpg');
  //       }

  //     });

  //   }
  // }),
  send_url: function(req,res,next){
    var rand = unicName();
    console.log(req.body);
    var file = fs.createWriteStream('./upload/'+rand+'.jpg');
    var request = http.get(req.body.url, function(response) {

      response.pipe(file);

      response.on('end', function() {

        gm('./upload/'+rand+'.jpg').size(function (err, size) {
          if (!size || size.width == 0 || size.height == 0) {
            fs.unlink('./upload/'+rand+'.jpg', function(error){ if (error) return next(error); });
            res.end('Не удалось загрузить изображение!');
          }
          else {
            gm('./upload/'+rand+'.jpg').quality(cfg.quality)
            .write("./public/images/"+rand+'.jpg', function (err) {

              fs.unlink('./upload/'+rand+'.jpg', function(error){ if (error) return next(error); });
              if (err) {
                console.log(err);
                next(err);
              } else {
                console.log('Done!');
                res.end(rand+'.jpg');
              }
            });
          }
        });

      });
    }).on('error', function(err) { // Handle errors

      fs.unlink('./upload/'+rand+'.jpg', function(err){ // Delete the file async.
        if (err) return next(err);
        res.end('Ошибка при загрузке изображения!');
      });

    });
  }
};

function unicName() {
  var d = new Date();
  var sha1 = crypto.createHash('sha1')
  .update((Math.random()*10000+d.getMonth()+d.getDate()+d.getYear()+d.getHours())+'')
  .digest('hex');
  sha1 = sha1.substr(0,10);
  return sha1;
}