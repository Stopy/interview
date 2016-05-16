$(function(){

  $('#m-slider-select li').click(function(){ // Смена слайда
    var index = $(this).index();
    $(this).parent().children('.m-slider-select').removeClass('m-slider-selected');
    $(this).addClass('m-slider-selected');
    $('#m-slider li').stop().animate({'opacity': '0'}, 500);
    $('#m-slider li').eq(index).stop().animate({'opacity': '1'}, 1000);
  });

  $('#top-arrow').click(function () {
    $('body,html').animate({scrollTop: 0}, 800);
  });

  $(document).scroll(function(){

    if($(window).scrollTop() > 400) { // Появление кнопки "НАВЕРХ"
      $('#top-arrow').stop().animate({'opacity': 1}, 300);
    } else {
      $('#top-arrow').stop().animate({'opacity': 0}, 300);
    }

  });


  // Чтобы на страницах, на которых нет этого блока в консоль не летела ошибка
  if ($().slider) {
    $( "#price-range" ).slider({
      range: true,
      min: 0,
      max: 30000, // Значения для инпутов
      values: [ 0, 30000 ], // Значения для handlers'ов
      slide: function( event, ui ) {
        // Обновление значений после перетаскиваний ползунков
        $( "#amount-sl .min-count" ).val(ui.values[ 0 ]);
        $( "#amount-sl .max-count" ).val(ui.values[ 1 ]);
      }
    });

    $( "#width-range" ).slider({
      range: true,
      min: 0,
      max: 2000, // Значения для инпутов
      values: [ 0, 2000 ], // Значения для handlers'ов
      slide: function( event, ui ) {
        // Обновление значений после перетаскиваний ползунков
        $( "#width-sl .min-count" ).val(ui.values[ 0 ]);
        $( "#width-sl .max-count" ).val(ui.values[ 1 ]);
      }
    });
  }

  $('.sl-w-head').click(function(){ // Раскрытие фильтров
    var widget = $(this).parent().parent();
    if (widget.css('height') == '39px') {

      widget.css('height', 'auto');
      widget.children('.sl-widget').children('.sl-w-arrow').css('transform', 'rotate(0deg)').css('-webkit-transform', 'rotate(0deg)').css('-ms-transform', 'rotate(0deg)').css('-o-transform', 'rotate(0deg)');

    } else {

      widget.css('height', '39px');
      widget.children('.sl-widget').children('.sl-w-arrow').css('transform', 'rotate(-90deg)').css('-webkit-transform', 'rotate(-90deg)').css('-ms-transform', 'rotate(-90deg)').css('-o-transform', 'rotate(-90deg)');

    }
  });

  $('.sort-type').click(function(){ // Переключение сортировки

    if (!$(this).hasClass('sort-selected')) { // Если не выбран
      $('.sort-type').removeClass('sort-selected'); // Убираем все выбранные
      $(this).addClass('sort-selected'); // А кликнутому добавляем
    } else {

      // Ссылка на черную галочку
      var switcher = $(this).children('.sort-selection').children('.sort-changed');

      if (switcher.data('type') === 'decr') { // Атрибут data-type на черной галочки

        switcher.data('type', 'incr');
        switcher.css('transform', 'rotate(180deg)').css('-webkit-transform', 'rotate(180deg)').css('-ms-transform', 'rotate(180deg)').css('-o-transform', 'rotate(180deg)');

      } else {

        switcher.data('type', 'decr');
        switcher.css('transform', 'rotate(0deg)').css('-webkit-transform', 'rotate(0deg)').css('-ms-transform', 'rotate(0deg)').css('-o-transform', 'rotate(0deg)');   

      }
    }

  });

  $('.goods-compare input[type="checkbox"]').change(function(){
    var parent = $(this).parent();
    if (parent.hasClass('compare-changed')) {
      parent.removeClass('compare-changed');
    } else {
      parent.addClass('compare-changed');
    }
  });

  $('.q-head').click(function(){ // Открытие вопросов
    var parent = $(this).parent();
    if (parent.hasClass('q-opened')) {
      parent.removeClass('q-opened');
    } else {
      parent.addClass('q-opened');
    }
  });

  $('.ls-menu-item').click(function(e){ // Открытие подменю в меню для маленького разрешения экрана
    var value = $(this).data('value'), currentItem;
    if (value) {
      e.preventDefault(); // Если у этого раздела есть сабменю, то отменяем переход по ссылке
      currentItem = $('#ls-submenu'+value);
      if (currentItem.css('display') === 'block') {
        currentItem.css('display', 'none');
      } else {
        $('.ls-submenu').css('display', 'none');
        $('#ls-submenu'+value).css('display', 'block');
      }
    }
  });
  $('#ls-open-menu').click(function(){
    if ($('#ls-menu-list').css('display') === 'block') {
      $('#ls-menu-list').css('display', 'none');
    } else {
      $('#ls-menu-list').css('display', 'block');
    }
  });

  $('#ls-filters-open').click(function(){
    var filter = $('#filters');
    if (filter.css('display') === 'block') {
      filter.css('display','none');
    } else {
      filter.css('display', 'block');
    }
  });

});