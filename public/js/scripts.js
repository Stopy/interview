$(function(){

  // Новый пост
  var newPostTags = [];
  $('#new-tag button').click(function(e){
    e.preventDefault();
    var inp = $('#new-tag input');
    var num = newPostTags.indexOf(inp.val())

    if (num === -1 &&
       inp.val().length > 2 &&
       inp.val().length <= 15 &&
       newPostTags.length < 10) {
      /**
      * Добавляем в DOM и в массив, input -> value чистим
      */
      $('#added-tags').append('<div class="new-tag">' + inp.val() + '</div>')
      newPostTags.push(inp.val());
      inp.val('');
    } else {
      if (num !== -1) {
        /**
        * Если такой уже добавлен, даем об этом знать
        */
        $('.new-tag').eq(num).css('box-shadow', '0px 0px 25px 5px white');
        setTimeout(function(){
          $('.new-tag').eq(num).css('box-shadow', '0px 0px 0px 0px transparent');
        }, 600);
      } else {
        /**
        * Если тег не найден, но слишком короткий или количество тегов преувеличено
        */
        if (newPostTags.length >= 10) {
          alert('Вы уже добавили 10 тегов (10 макс.)');
        } else {
          alert('Неправильная длина тега! (от 3 до 15)');
        }
      }
    }
  });
  $('#np-send').click(function(){ // Отправка поста
    var tags = JSON.stringify(newPostTags);

    $.post('/post/new', {tags: tags, cont: $('#np-body')[0].value},function(){
      window.location = '/';
    });
  });
  function newPostTagsUpdate() {
    if (newPostTags.length != 0) {
      $('#added-tags').html('<div class="new-tag">' +
        newPostTags.join('</div><div class="new-tag">') +
        '</div>');
    } else {
      $('#added-tags').html('');
    }
  }


  // Открыть комменты
  $('.comment-button').click(function(){
    if ($(this).parent().children('.comments').css('display') == 'none'){
      var self = $(this);
      $.post('/comments', {id: parseInt($(this).parent().data('id'))}, function(data){
        self.parent().children('div.comments').html(data);
        self.parent().children('.comments').fadeIn(400);
      });
    } else {
      $(this).parent().children('.comments').fadeOut(400);
    }
  });

  // Отправка комментария
  $('body').on('submit', '.new-c-form', function(e){
    e.preventDefault(); // Отменяем default событие
    var self = $(this); // Ссылка на форму

    $.post('/comments/new',
      {
        post_id: $(this).children('input[name="post_id"]').val(), // id поста
        parent: $(this).children('input[name="parent"]').val() || 0,
        text: $(this).children('textarea[name="text"]').val() // Текст комментария
      },
      function(data){ // Ответ на комментарий
        if (data === 'ok') { // Если комментарий добавился
          $.post('/comments', {id: parseInt(self.parents('.post').data('id'))}, function(res){
            self.parents('.comments').html(res); // Заменяем комментарии
          });
        } else {
          alert(data); // Ошибка
        }
      }
    );
  });


  $(document).on("click", ".reply", function(){
    var commentId = $(this).parent().parent().data('id');
    var postId = $(this).parents(".post").data('id');

    $('#com-reply').remove();

    $(this).parent().after(
      '<form method="post" id="com-reply" class="new-c-form">'+
        '<input type="hidden" name="parent" value="'+commentId+'">'+
        '<input type="hidden" name="post_id" value="'+ postId +'">'+
        '<textarea type="text" name="text"></textarea>'+
        '<button class="new-comment">Отправить</button>'+
      '</form>'
    );

  });

  $('#np-modal_wrap').on('click', '.new-tag',function(){
    var num = newPostTags.indexOf($(this).text());
    if (num !== -1) {
      newPostTags.splice(num, 1);
      $('.new-tag').eq(num).css('margin-top', '-50px').css('opacity', '0');
      setTimeout(newPostTagsUpdate, 500);
    } else {
      newPostTagsUpdate();
    }
  });

  // Отправка изображения
  $('input#file').change(function(){
    $(this).parent().submit();
  });

  var framed;
  (!FormData) ? framed = true : framed = false;
  $('#imgForm').ajaxForm({
    iframe: framed,
    dataType: 'json',
    beforeSend: function(){
      console.log('Upload started!');
    },
    uploadProgress: function(e, position, total, perc){
      console.log(perc+'%');
    },
    complete: function(res){
      $('#np-image-list').append('<li><p>'+res.responseText+'</p>'+
        '<div class="np-img-preview" style="background-image: url(images/'+res.responseText+')">'+
        '</div></li>');
      console.log(res.responseText);
      updateHandlers();
    }
  });

  // Отправка через url
  $('#imgUrlSub').click(function(e){
    e.preventDefault();
    var url = $('#file_url').val();
    $.post('/file_url', {url: url}, function(data) {
      $('#np-image-list').append('<li><p>'+data+'</p><div class="np-img-preview" style="background-image: url(images/'+data+')"></div></li>');
      updateHandlers();
      console.log(data);
    })
    .fail(function() {
      alert("Ошибка при отправке");
    });
  });

  // Рейтинг
  $('.rating div').click(function(){
    var self = $(this);
    var rate = $(this).data('rating');
    var id = $(this).parent().parent().data('id');

    if (rate != '-1' && rate != '1') {
      console.log('Unknown rate');
      return false;
    } else {
      $.post('/post/rate', { id: id, rate: rate }, function(result) {
        if (result.err) {
          alert(result.err);
        } else {
          if (result.hiddenErr) {
            console.log(result.hiddenErr);
          } else {
            self.parent().children('.post-rating').text(result.rateValue);
          }
        }
      });
    }
  });

  // Замена невидимого отступа на <br>
  $('.p-cont span').each(function(){
    var s = replace($(this).html());
    $(this).html(s);
  });

  // Замена [IMG] на реальную картинку
  $('.p-cont span').each(function(){
    var s = replace($(this).html());
    $(this).html(imageInsert($(this).html()));
  });

  // Поиск по тегу
  $('#tag-search-form').on('submit', function(e){
    e.preventDefault();
    document.location.href = '/tag/'+$('#tag-search').val()+'/1';
  });

  // Простые анимации
  $('#np-modal_exit').click(function(){
    $('#np-modal_wrap').fadeOut(300);
  });

  $('button#new-post').click(function(){
    $('#np-modal_wrap').fadeIn(300);
  });

  $('#np-btns-open').click(function(){
    $(this).fadeOut(150, function(){
      $('.down-hidden').fadeIn(150);
    });
  });

});


/**
* Вспомогательные функции
*/

function updateHandlers() {
  $('#np-image-list li p').click(function(){
    var imageInsert = $(this).text();
    var textarea = $('#np-body')[0].value;
    $('#np-body')[0].value = textarea + '[IMG]' + imageInsert + '[/IMG]';
  });
}

function replace(s){
  s = s.split("\u000A").join("<br>");
  return s;
}

function imageInsert(s) {
  var r = /\[IMG\].+?\[\/IMG\]/g;
  var j = /\[IMG\].+?\[\/IMG\]/;
  var l = s.match(r);
  if (l) {
    for (var i = 0; i < l.length; i++) {
      l[i] = l[i].slice(5, -6);
      s = s.replace(j, '<img src="/images/'+l[i]+'">');
    }
  }
  return s;
}
