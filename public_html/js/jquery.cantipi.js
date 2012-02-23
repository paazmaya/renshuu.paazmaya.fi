/* This plugin was made by Sergey Balykov aka Bormotun */
/* http://code.google.com/p/cantipi/ */

(function($){
    $.cantipi = function(el, options){
        var base = this;
        var minutes;  
        var hours;  
        var ctx;
        var ampm = true;
        var drag = false;
        var canvas;

        var _h, _m;

        base.$el = $(el);
        base.el = el;
        base.$el.data("cantipi", base);

        base.init = function(){
            base.options = $.extend({},$.cantipi.defaultOptions, options);
        
            canvas = document.createElement('canvas');
            canvas.height = base.options.size;
            canvas.width = base.options.size;
            // Without this canvas can't get focus and can't fire blur event
            canvas.tabIndex=1;
            canvas.style.display = 'none';
            canvas.style.position = 'absolute';
            canvas.style.background = '#FFF';
          
            var offset = base.$el.offset();
            canvas.style.top = offset.top + el.offsetHeight+'px';
            canvas.style.left = offset.left+'px';

            canvas.onmousedown = clickclock;
            canvas.onmouseup = function(){
              canvas.onmousemove = null;
              drag = false;
            }
            canvas.onblur = function(e){canvas.style.display = 'none'};

            var now = new Date();
            _m = now.getMinutes();
            _h  = (now.getHours())%12;

            el.onfocus = function(){ 

              minutes = _m * 2 * Math.PI / 60 ;
              hours = _h * 2 * Math.PI / 12 + _m * 2 * Math.PI / (60 * 12);

              canvas.style.display = 'block';
              canvas.focus();
              draw();
            };

            ctx = canvas.getContext('2d');  

            base.$el.after(canvas);
            draw();
        };

        var clickclock = function(e){
          var point = {};
          point.x = e.clientX - $(canvas).offset().left + window.pageXOffset - base.options.size/2;
          point.y = e.clientY - $(canvas).offset().top + window.pageYOffset - base.options.size/2;
          point.d = Math.sqrt(point.x * point.x + point.y * point.y);
          point.a = Math.PI - Math.atan2(point.x,point.y) ;
          point.h_angle = hours;
          point.m_angle = minutes;

          var h_dist = 28*base.options.size/100;
          var m_dist = 34*base.options.size/100;

          if(Math.abs(point.d - h_dist) < 8*base.options.size/100  && Math.abs(point.a - point.h_angle)  < 0.104) { // +-6 deg 
            drag = true;
            canvas.onmousemove = sethours;
          }

          if(Math.abs(point.d - m_dist) < 88*base.options.size/100  && Math.abs(point.a - point.m_angle)  < 0.104) { // +-6 deg 
            drag = true;
            canvas.onmousemove = setminutes;
          }

          if(point.d < 10) {
            ampm = !ampm;
            draw();
          }

        }

        var  sethours = function(e){
          var point = {};
            point.x = e.clientX - $(canvas).offset().left + window.pageXOffset - base.options.size/2;
            point.y = e.clientY - $(canvas).offset().top + window.pageYOffset - base.options.size/2;
        
          var angle = Math.PI - Math.atan2(point.x,point.y) ;;
          angle = angle - angle % (base.options.roundto*2*Math.PI/(12*60));

          hours = angle ;// (Math.PI/6) ;//(Math.floor(angle / (Math.PI/6))+3)%12;

          minutes = (hours  * 12)  % (2 * Math.PI) ;         
          
          _h = Math.floor((6*hours/Math.PI) % 12);
          _m = Math.round((30*minutes/Math.PI) % 60);
          
          draw();
        
        }
        
        var  setminutes = function(e){
          var point = {};
            point.x = e.clientX - $(canvas).offset().left + window.pageXOffset - base.options.size/2;
            point.y = e.clientY - $(canvas).offset().top + window.pageYOffset - base.options.size/2;
        
          var angle = Math.PI - Math.atan2(point.x,point.y) ;;
          angle = angle -  (angle) % (base.options.roundto*2*Math.PI/60);

          if(minutes - angle > 4) {
            _h = (_h+1)%12;
          } else if(minutes - angle < -4) {
            _h = (12+(_h-1)%12)%12;
          }

          minutes = angle;
          hours = _h * Math.PI/6 + minutes /12;
          _m = Math.round((30*minutes/Math.PI) % 60);

          draw();
                        
        }

        
        function draw() {  
          var hr24 = ampm ? _h : _h + 12;
          base.el.value = ('0'+hr24).substr(-2,2)+':'+('0'+_m).substr(-2,2);

          ctx.save();  
          ctx.clearRect(0,0,base.options.size,base.options.size);  
          ctx.translate(base.options.size/2,base.options.size/2);  
          ctx.scale(base.options.size/100,base.options.size/100);  
          ctx.rotate(-Math.PI/2);  
          ctx.strokeStyle = "#20";  
          ctx.fillStyle = "white";  
          ctx.lineWidth = 2;  
          ctx.lineCap = "round";
          
          ctx.beginPath();  
          ctx.lineWidth = 2;  
          ctx.fillStyle = '#BABA00';
          ctx.arc(0,0,35,0,Math.PI*2,true);  
          ctx.fill();  


            // Hour marks  
          ctx.save();  
          for (var i=0;i<12;i++){  
            ctx.beginPath();  
            ctx.rotate(Math.PI/6);  
            ctx.moveTo(41,0);  
            ctx.lineTo(47,0);  
            ctx.stroke();  
          }  
          ctx.restore();  
          
          // Minute marks  
          ctx.save();  
          ctx.lineWidth = 1;  
          for (i=0;i<60;i++){  
            if (i%5!=0) {  
              ctx.beginPath();  
              ctx.moveTo(47,0);  
              ctx.lineTo(44,0);  
              ctx.stroke();  
            }  
            ctx.rotate(Math.PI/30);  
          }  
          ctx.restore();  
            
          // write Hours  
          ctx.save();  

          ctx.rotate( hours )  
          ctx.lineWidth = 2;  
          ctx.beginPath();  
          ctx.moveTo(-12,0);  
          ctx.lineTo(35,0);  
          ctx.stroke();  
          ctx.beginPath();
            
          ctx.beginPath();  
          ctx.arc(28,0,4,0,Math.PI*2,true);  
          ctx.stroke();  

          ctx.restore();  
          
          // write Minutes  
          ctx.save();  
          ctx.rotate( minutes)  
          ctx.lineWidth = 1;  
          ctx.beginPath();  
          ctx.moveTo(-14,0);  
          ctx.lineTo(44,0);  
          ctx.stroke();  
          ctx.beginPath();  
          ctx.arc(34,0,5,0,Math.PI*2,true);  
          ctx.stroke();  
          ctx.restore();  
            
          ctx.beginPath();  
          ctx.lineWidth = 1;  
          ctx.strokeStyle = '#BABA00';  
          ctx.arc(0,0,49,0,Math.PI*2,true);  
          ctx.stroke();  

          ctx.save();
          ctx.beginPath();  
          ctx.fillStyle = "white";  
          ctx.arc(0,0,10,0,Math.PI*2,true);  
          ctx.fill();  
          ctx.rotate(Math.PI/2);  
          var i = ampm ? 'AM':'PM';
          ctx.font = 'normal 900 9px Lucida Grande';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = "black";  
          ctx.fillText(i, 0, 0);
          ctx.restore();

          ctx.restore();  

        }
        

        base.init();
    };

    $.cantipi.defaultOptions = {
      size:150,
      roundto: 1
    };

    $.fn.cantipi = function(options){
        return this.each(function(){
          return new $.cantipi(this, options);
        });
    };

})(jQuery);