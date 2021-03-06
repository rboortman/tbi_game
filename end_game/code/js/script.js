/**---------------------------------------------------------------------------*
 *                                                                            *
 * Basic javascript file                                                      *
 *                                                                            *
 *----------------------------------------------------------------------------*/

var creature_list = ['blob', 'blieb', 'pakpak', 'same', 'klog'];
var creatures_onscreen = {};
var creatures_index = 0;
var total_spawn_rates = 0;
var speed_numerator = 5000;
var overall_speed = 1;
var level_increasing_rate = 20000;

var animate_duration = 200;
var reduce_ratio = 0.8;
var ease_in = 'easeInBack';
var ease_out = 'easeOutBack';

var intervals = [];
var timeouts  = [];
var game_over_text = "GAME OVER!<br><br>Press 'Retry!' to try again"
var gamma = 2.2;

var undefined;


function isNumber(n) {
   return !isNaN(parseFloat(n)) && isFinite(n);
}

function get_creature (rand) {
   var result;
   var temp_rate = 0;
   $.each(creatures, function search_creature (key, obj) {
      temp_rate += obj.spawn_rate;
      if (temp_rate > rand) {
         result = obj;
         return false;
      }
   })
   return result;
}

function spawn_creature () {
   var width = $('#playfield').width();

   var creature_rand = Math.floor(Math.random() * (total_spawn_rates));
   var creature_obj = get_creature(creature_rand);

   var speed_rand = Math.floor(Math.random() * 3) + creature_obj.speed;
   var place_rand = Math.random() * (width - creature_obj.width.size);

   var index = creatures_index++;

   var creature_div = $('<div>', {
      id: index,
      'class': creature_obj.name + ' creatures',
   })
   creatures_onscreen[index] = creatures_onscreen[index] === undefined ? creature_div : alert('Speed rate too fast! Please adjust and refresh page');
   creature_div.css('top', -creature_obj.height.size);
   creature_div.css('left', place_rand);
   creature_div.appendTo($('#playfield'));
   creature_div.click(click_creature);
   creature_div.animate({
      'top': '+=381px',
   }, {
      duration: (speed_numerator * 2) / creature_obj.speed,
      complete: game_over,
   })

   return creature_div;
}

function playing () {
   intervals.push(setInterval(function add_creature () {
      spawn_creature();
   }, (speed_numerator / overall_speed)));
   spawn_creature();

   timeouts.push(setTimeout(function increase_level () {
      $.each(intervals, function remove_intervals (key, interval) { clearInterval(interval) });
      $.each(timeouts,  function remove_timeouts  (key, timeout)  { clearTimeout (timeout)  });
      $('#level').text(parseInt($('#level').text()) + 1);
      overall_speed++;
      playing();
   }, level_increasing_rate));
}

function start_game () {
   playing();
}

function game_over (event) {
   $.each(intervals, function remove_intervals (key, interval) { clearInterval(interval) });
   $.each(timeouts,  function remove_timeouts  (key, timeout)  { clearTimeout (timeout)  });
   $('#playfield .creatures').each(function stop_animation (key, crt_div) {
      crt_div = $(crt_div);
      crt_div.stop();

      var colour = crt_div.css('background-color');
      col_arr = colour.substring(colour.indexOf('(') + 1, colour.indexOf(')')).split(', ');
      var gray_bgr = parseInt(0.21 * parseInt(col_arr[0]) + 0.71 * parseInt(col_arr[0]) + 0.07 * parseInt(col_arr[0]));
      gray_bgr = gray_bgr.toString(16);

      var colour = crt_div.css('border-color');
      col_arr = colour.substring(colour.indexOf('(') + 1, colour.indexOf(')')).split(', ');
      var gray_bor = parseInt(0.21 * parseInt(col_arr[0]) + 0.71 * parseInt(col_arr[0]) + 0.07 * parseInt(col_arr[0]));
      gray_bor = gray_bor.toString(16);

      crt_div.css('backgroundColor', '#' + gray_bgr + gray_bgr + gray_bgr);
      crt_div.css('border-color',    '#' + gray_bor + gray_bor + gray_bor);
   })

   creatures_onscreen = {};
   creatures_index = 0;
   overall_speed = 1;

   $('#info-text').html(game_over_text);
   $('#button').text('Retry!');
   $('#playfield .creatures').off('click');
   $('#playfield .creatures').css('z-index', '0');
   toggle_button();
}

function click_creature (event) {
   if ($(this).hasClass('clicked')) {
      return true;
   } else {
      $(this).addClass('clicked');
      $(this).stop();
   }
   var classes = this.className.split(' ');
   var creature = '';
   $.each(classes, function go_through_classes (index, name) {
      if (name === 'legend-icons' || name === 'creatures' || name === 'clicked') return true;
      creature = creatures[name];
   });

   if (creature === undefined) return false;
   if (this.className.indexOf('legend-icons') < 0) {
      $('#score').text(parseInt($('#score').text()) + creature.points)
   }

   $(this).animate({
      height: creature.height.reduced_size,
      'margin-top': creature.height.margin,
      'margin-bottom': creature.height.margin,
   }, {
      duration: animate_duration,
      easing: ease_in,
      complete: function animate_back (event) {
         $(this).animate({
            width: creature.width.reduced_size,
            'margin-left': creature.width.margin,
            'margin-right': creature.width.margin,
         }, {
            duration: animate_duration,
            easing: ease_in,
            complete: function animate_back_2 (event) {
               $(this).animate({
                  width: creature.width.size,
                  'margin-left': 0,
                  'margin-right': 0,
               }, {
                  duration: animate_duration,
                  easing: ease_out,
                  complete: function remove_creature (event) {
                     if (this.className.indexOf('legend-icons') < 0) {
                        $(this).fadeOut(animate_duration, function remove_div (event) { $(this).remove() });
                        var index = parseInt(this.id);
                        delete creatures_onscreen[index];
                     } else {
                        $(this).removeClass('clicked');
                     }
                  },
               });
            },
         })

         $(this).animate({
            height: creature.height.size,
            'margin-top': 0,
            'margin-bottom': 0,
         }, {
            duration: animate_duration,
            easing: ease_out,
         });
      },
   })
}

function add_legend_bounce () {
   var legend_icons = $('.legend-icons');

   legend_icons.each(function add_bounce (key, icon) {
      icon = $(icon);
      icon.click(click_creature);
   });
}

function get_size_object (size) {
   return {
      size: size,
      reduced_size: size * reduce_ratio,
      margin: (size - size * reduce_ratio) / 2,
      rest: size - size * reduce_ratio,
   };
}

function save_creatures () {
   $('.legend-icons').each(function save_it (key, icon) {
      var width = get_size_object($(icon).outerWidth(true));
      var height = get_size_object($(icon).outerHeight(true));
      var classes = icon.className.split(' ');
      $.each(classes, function go_through_classes (index, name) {
         if (name === 'legend-icons' || name === 'creatures') return true;
         creatures[name].width = width;
         creatures[name].height = height;
      });
   });

   $.each(creatures, function save_total_spawning (key, obj) {
      total_spawn_rates += obj.spawn_rate;
   })
}

function prepare_game () {
   $('#info-container').fadeOut();
   $('#playfield .creatures').fadeOut(function (event) { $(this).remove(); });
   $('#score').text(0);
}

function toggle_button (event) {
   var button = $('#info-container')
   if (button.is(':visible')) {
      prepare_game();
      start_game();
   } else {
      button.fadeIn();
   }
}

function read_javascript () {
   if (typeof blob   !== 'undefined') { $.extend(creatures.blob,   blob);   }
   if (typeof blieb  !== 'undefined') { $.extend(creatures.blieb,  blieb);  }
   if (typeof pakpak !== 'undefined') { $.extend(creatures.pakpak, pakpak); }
   if (typeof same   !== 'undefined') { $.extend(creatures.same,   same);   }
   if (typeof klog   !== 'undefined') { $.extend(creatures.klog,   klog);   }
}

function ready () {
   save_creatures();
   read_javascript();
   add_legend_bounce();

   $('#button-container').click(toggle_button);
}

// When document is ready, begin scripting
window.onload = ready;
