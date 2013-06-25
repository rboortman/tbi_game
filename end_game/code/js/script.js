/**---------------------------------------------------------------------------*
 *                                                                            *
 * Basic javascript file                                                      *
 *                                                                            *
 *----------------------------------------------------------------------------*/

var creature_list = ['blob', 'blieb', 'pakpak', 'same', 'klog'];
var creatures_onscreen = {};
var total_spawn_rates = 0;
var speed_numerator = 5000;
var overall_speed = 1;

var animate_duration = 200;
var reduce_ratio = 0.8;
var ease_in = 'easeInBack';
var ease_out = 'easeOutBack';

var intervals = [];
var game_over_text = 'GAME OVER!<br><br>Press \'Start!\' to retry'
var gamma = 2.2;

var undefined;


function count (obj) {
   var counted = 0;
   $.each(obj, function count_obj (key, thing) { counted++; });
   return counted;
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

   var index = count(creatures_onscreen);

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

function start_game () {
   intervals.push(setInterval(function add_creature () {
      spawn_creature();
   }, (speed_numerator / overall_speed)));
   spawn_creature();
}

function game_over (event) {
   $.each(intervals, function remove_intervals (key, interval) { clearInterval(interval) });
   $.each(creatures_onscreen, function stop_animation (key, crt_div) {
      crt_div = $(crt_div);
      crt_div.stop();
      var colour = crt_div.css('background');
      col_arr = colour.substring(colour.indexOf('(') + 1, colour.indexOf(')')).split(', ');
      var gray = 0.21 * parseInt(col_arr[0]) + 0.71 * parseInt(col_arr[0]) + 0.07 * parseInt(col_arr[0]);
      console.log(gray);
      crt_div.css('background-color', 'rbg(' + gray + ', ' + gray + ', ' + gray + ')');
      console.log(crt_div)
   })

   $('#info-text').html(game_over_text);
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

   console.log(creature);
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
   console.log(creatures);

   $.each(creatures, function save_total_spawning (key, obj) {
      total_spawn_rates += obj.spawn_rate;
   })
}

function toggle_button (event) {
   var button = $('#info-container')
   if (button.is(':visible')) {
      button.fadeOut();
      start_game();
   } else {
      button.fadeIn();
   }
}

function ready () {
   save_creatures();
   add_legend_bounce();

   $('#button-container').click(toggle_button);
}

// When document is ready, begin scripting
window.onload = ready;
