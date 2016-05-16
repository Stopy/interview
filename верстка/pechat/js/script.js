$(function(){
  $('#portf-left').click(function(){

    var elemsToScroll = 2, speed = 500, newPos;
    var slider = $(this).parent().children('#portf-slider');
    var li = $(this).parent().children('#portf-slider').children('li');
    var sliderWidth = (parseInt(li.eq(0).css('width')) + parseInt(li.eq(0).css('margin-right'))) * li.length;

    newPos = p(slider.css('margin-left')) + elemsToScroll*(p(li.css('margin-right')) + p(li.css('width')));

    if ( p(slider.css('margin-left')) === 0) {
      newPos = -(sliderWidth - p(slider.parent().css('width')));
    } else {
      if (newPos > 0) {
        newPos = 0;
      }
    }

    slider.animate({'margin-left': newPos + 'px'}, speed);

  });

  $('#portf-right').click(function(){

    var elemsToScroll = 2, speed = 500, newPos;
    var slider = $(this).parent().children('#portf-slider');
    var li = $(this).parent().children('#portf-slider').children('li');
    var sliderWidth = (parseInt(li.eq(0).css('width')) + parseInt(li.eq(0).css('margin-right'))) * li.length;

    newPos = p(slider.css('margin-left')) - elemsToScroll*(p(li.css('margin-right')) + p(li.css('width')));
    if ( p(slider.css('margin-left')) === -(sliderWidth - p(slider.parent().css('width')))) {
      newPos = 0;
    } else {
      if (newPos < -(sliderWidth - p(slider.parent().css('width')))) {
        newPos = -(sliderWidth - p(slider.parent().css('width')));
      }
    }
    slider.animate({'margin-left': newPos + 'px'}, speed);

  });

});

function p(arg) {
  return parseFloat(arg);
}