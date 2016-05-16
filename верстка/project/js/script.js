$(function(){
	$('.club-select').click( function() { // Всплывание списка
		$('.club-arrow').css('display','none');
		$(this).css('display', 'none')
		$('.club-select-open').css('display','block');
	});
	$('.club-close').click( function() { // Всплывание списка
		$('.club-arrow').css('display','block');
		$('.club-select').css('display','block');
		$('.club-select-open').css('display','none');
	});

	function dysTime() { // Реализация аналоговых часов
		var d = new Date();
		var sek = d.getSeconds();
		var minut = d.getMinutes();
		var hour = d.getHours();
		var s = sek*6;  //градус отклонения секундной стрелки
		var m = minut*6;  //градус отклонения минутной стрелки
		var Hm = minut*0.5;
 
		if (hour > 12) {   //градус отклонения часовой стрелки
			h = (hour - 12 )* 30;
		}
		else {
			h = hour * 30;
		}

		var divS = document.getElementById("sec");
		divS.style.webkitTransform = "rotate("+ s +"deg)"; // для Chrome
		divS.style.MozTransform = "rotate("+ s +"deg)";  // для Firefox
		divS.style.OTransform = "rotate("+ s +"deg)";  // для Opera
		divS.style.msTransform = "rotate("+ s +"deg)";  // для IE
		 
		var divM = document.getElementById("min");
		divM.style.webkitTransform = "rotate("+ m +"deg)";
		divM.style.MozTransform = "rotate("+ m +"deg)";
		divM.style.OTransform = "rotate("+ m +"deg)";
		divM.style.msTransform = "rotate("+ m +"deg)";
		 
		var divH = document.getElementById("hour");
		divH.style.webkitTransform = "rotate("+ (h+Hm) +"deg)";
		divH.style.MozTransform = "rotate("+ (h+Hm) +"deg)";
		divH.style.OTransform = "rotate("+ (h+Hm) +"deg)";
		divH.style.msTransform = "rotate("+ (h+Hm) +"deg)";		

		if ((minut+'').length === 1) { // Добавление нуля к цифровым числам, если они меньше 10ти
			minut = '0' + minut;
		}
		if ((sek+'').length === 1) { // Добавление нуля к цифровым числам, если они меньше 10ти
			sek = '0' + sek;
		}

		$('#time').text(hour+':'+minut+':'+sek); // Цифровые часы
	}
	dysTime();
	setInterval(dysTime, 1000);
	//$( ".calendar" ).datepicker();
	//$(".ui-datepicker-inline.ui-datepicker.ui-widget.ui-widget-content.ui-helper-clearfix.ui-corner-all").css('width','250px');
	//$(".track").selectable();
	// Свой selectable. -->
	// При выделении элементов появляются кружки для увеличения/уменьшения интервала
	// выделения, но так как они сделаны с помощью ::after и ::before, на них нельзя вешать
	// события	
	function trackHover(){
		$(".track").bind('mousemove', function(e){
			var pos = (e.clientX - $('.club-wrap')[0].offsetLeft - $('.track')[0].offsetLeft - 49),
			timeOutput;

			if ((Math.round(pos/44) + 10) >= 24) {
				timeOutput =  (Math.round(pos/44) + 10) - 24 + ':00';
			}
			else {
				 timeOutput = (Math.round(pos/44) + 10) + ':00';
			}

			$(".track").children('div.track-hover').remove();

			if (pos >= -15 && pos <= 895)
			{
				if (!$(this).children().is('.track-hover'))
				{
					var posHover = 44*(Math.round(pos / 44));
					$(this).append('<div class="track-hover">'+timeOutput+'</div>');
					$('.track-hover').css('left', posHover + 40 + 'px');
				}
			}
		});
	}
	trackHover();
	$(".track").bind('mousedown', function(e){

		e = e || event;
		var curPos = {}, // Здесь будем хранить позицию мыши на момент нажатия/отпускания
		liStart, // Начальный элемент
		liEnd, // Конечный
		startTime, // Время для отображения начала
		endTime; // Для конца

		curPos.start = e.clientX - $('.club-wrap')[0].offsetLeft - $('.track li')[0].offsetLeft; // Сохраняем место нажатия
		if (curPos.start >= 0) // Делаем только в случае если позиция мыши находится в рабочей области
		{
			liStart = parseInt(curPos.start / 44); // Записываем в переменную какой элемент был началом выделения
		}


		$(".track").bind('mousemove', function(e){
			var mouseMoveStart = Math.round(curPos.start / 44),
			mouseMoveEnd = Math.round((e.clientX - $('.club-wrap')[0].offsetLeft - $('.track li')[0].offsetLeft) / 44);
			console.log(mouseMoveStart + " - " + mouseMoveEnd)
			$('.track-hover').css('display','none');
			$(this).children('li').removeClass();
			if (mouseMoveStart < mouseMoveEnd){				
				for ( var l = mouseMoveStart; l < mouseMoveEnd; l++ )
				{
					$(this).children('li')[l].className = 'selected';
				}
			} else {
				if (mouseMoveEnd < mouseMoveStart){									
					for ( var l = mouseMoveEnd; l < mouseMoveStart; l++ )
					{
						$(this).children('li')[l].className = 'selected';
					}
				}
			}
		});

		$(".track").bind('mouseup', function(e){

			curPos.end = e.clientX - $('.club-wrap')[0].offsetLeft - $('.track li')[0].offsetLeft; // Сохраняем место отпускания мыши
			if(curPos.start > 0 && curPos.start < 880 && curPos.end > 0 && curPos.end < 880 ) // Защита от лагов, так как блок .track больше чем длинна всех элементов li внутри его
			{
				liEnd = parseInt(curPos.end / 44); // Элемент который был концом выделения
				for (var i = 0; i < 20; i++)	{
					$(this).children('li')[i].className = ''; // Обнуляем все классы	
					$(this).children('li').children('div.hour-top')[i].innerText = ''; // Обнуляем текст в прошлых выделенных областях
					$(this).children('li').children('div.hour-bottom')[i].innerText = ''; // Обнуляем текст в прошлых выделенных областях
				}			
				startTime = liStart + 10;
				endTime = liEnd + 11;

				if(startTime > 23) startTime = startTime - 24; // Потому что в сутках меньше 24 часов
				if(endTime > 23) endTime = endTime - 24; // Потому что в сутках меньше 24 часов

				if(liStart < liEnd){ // Если элементы были выбраны слево направо (->)
					for (var i = liStart; i <= liEnd; i++){
						$(this).children('li')[i].className = 'selected'; // Вешаем класс
						$(this).children('li')[liStart].className = 'selected-left'; // Вешаем класс для появления кружка для перетаскивания
						$(this).children('li')[liEnd].className = 'selected-right'; // Вешаем класс для появления кружка для перетаскивания				
					}
					$(this).children('li').children('div.hour-top')[liStart].innerText = startTime+':00'; // Отмечаем начальное время
					$(this).children('li').children('div.hour-bottom')[liEnd].innerText = endTime+':00'; // Отмечаем конечное время
				}
				else{
					if(liStart === liEnd){ // Если начальный элемент равен конечному (выбран 1 элемент)
						$(this).children('li')[liStart].className = 'selected-one-elem'; // Вешаем класс для появления кружков для перетаскивания
						$(this).children('li').children('div.hour-top')[liStart].innerText = startTime+':00'; // Отмечаем начальное время
						if(startTime+1 === 24){
							$(this).children('li').children('div.hour-bottom')[liStart].innerText = 0+':00'; // Чтобы было 00, вместо 24
						}
						else{
							$(this).children('li').children('div.hour-bottom')[liStart].innerText = startTime+1+':00'; // Отмечаем начальное время
						}
					}
					else{ // Все остальные случаи, тоесть, когда элементы выбраны справа налево (<-)
						for (var i = liEnd; i <= liStart; i++){
							$(this).children('li')[i].className = 'selected'; // Вешаем класс
							$(this).children('li')[liEnd].className = 'selected-left'; // Вешаем класс для появления кружка для перетаскивания
							$(this).children('li')[liStart].className = 'selected-right'; // Вешаем класс для появления кружка для перетаскивания
							$(this).children('li').children('div.hour-bottom')[liStart].innerText = startTime+1+':00'; // Отмечаем начальное время
							if(endTime - 1 == -1) endTime = 24;
							if(endTime - 1 == 24) endTIme = 0;
							$(this).children('li').children('div.hour-top')[liEnd].innerText = endTime-1+':00'; // Отмечаем конечное время
						}
					}
				}

				$('.modal-balls').html(""); // Сброс шариков
				for ( var i = 0; i < $('.track').length; i++ )
				{
					if ($('.track').eq(i).children('li').hasClass("selected-left") || $('.track').eq(i).children('li').hasClass("selected-one-elem")) // Если на дорожке имеются выделенные элементы
					{
						$('.modal-balls').append("<div class='modal-ball'><div class='ball-delete'></div>"+(i+1)+"</div>"); // Добавляем шарик с порядковым номером
					}
				}
				$('.modal-wrap').css('display','block'); // Открываем модальное окно
			}

			$('.ball-delete').click(function(){ // Функция удаления выбранных дорожек (кнопка на шариках в мод. окне)
				var deletable = parseInt($(this).parent().text()) - 1;
				for ( var k = 0; k < 20; k++ ) // Циклом проходимся по всем элементам li данной дорожки
				{
					$('.track').eq(deletable).children('li')[k].className = ''; // Сбрасываем классы всех li
					$('.track').eq(deletable).children('li').children('div').text(''); // Сбрасываем классы всех li
				}
				$(this).parent().css('display', 'none'); // Удаляем шарик
			});

			$(".track").unbind('mouseup'); // Для производительности
			$(".track").unbind('mousemove'); // Для производительности
			trackHover();
		});
	});
	$('.modal-time-select').click(function(){
		if($(this).children('div.other-options').css('display') == 'block'){
			$(this).children('div.other-options').css('display','none');
			$(this).children('div.modal-time-arrow').css('transform','rotate(0deg)');
		}
		else{			
			$(this).children('div.other-options').css('display','block');
			$(this).children('div.modal-time-arrow').css('transform','rotate(180deg)');
		}
	});
	$('.time-option').click(function(){
		$(this).parent().parent().children('div.changed-time').text($(this).text());
	});
	$('.modal-exit').click(function(){
		$('.modal-wrap').css('display', 'none');
	});
});