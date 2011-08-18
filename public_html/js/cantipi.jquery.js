(function($){
    $.cantipi = function(el, options){
        var base = this;
        var minutes;  
        var hours;  
        var ctx;
        var ampm = false;
        var size;

        base.$el = $(el);
        base.el = el;
        base.$el.data("cantipi", base);

        base.init = function(){
            base.options = $.extend({},$.cantipi.defaultOptions, options);
            size = base.options.size;
        
            var canvas = document.createElement('canvas');
            canvas.height = size;
            canvas.width = size;
            canvas.tabIndex=1;
            canvas.style.display = 'none';
            canvas.onmousedown = clickclock;
            canvas.addEventListener('blur', function(e){canvas.style.display = 'none'}, true);

            ctx = canvas.getContext('2d');  

            var now = new Date();
            minutes = now.getMinutes();  
            hours  = now.getHours()%12;  
            
            el.onfocus = function(){ 
              canvas.style.display = 'block'
              canvas.focus();
            };
            
            el.parentNode.appendChild(canvas);
            draw();   
        };

        var clickclock = function(e){
          point = getMouse(e);
          sethours(point);
          var hr24 = ampm ? hours : hours + 12;
          base.el.value = ('0'+hr24).substr(-2,2)+':'+('0'+minutes).substr(-2,2);
          draw();
        }


        function draw() {  

          ctx.save();  
          ctx.clearRect(0,0,size,size);  
          ctx.translate(size/2,size/2);  
          ctx.scale(size/100,size/100);  
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
          ctx.rotate( hours*(Math.PI/6) + (Math.PI/360)*minutes)  
          ctx.lineWidth = 2;  
          ctx.beginPath();  
          ctx.moveTo(-12,0);  
          ctx.lineTo(38,0);  
          ctx.stroke();  
          ctx.beginPath();
            
          ctx.beginPath();  
          ctx.arc(28,0,4,0,Math.PI*2,true);  
          ctx.stroke();  

          ctx.restore();  
          
          // write Minutes  
          ctx.save();  
          ctx.rotate( (Math.PI/30)*minutes)  
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
        
        function getTrueOffsetLeft(ele)
        {
          var n = 0;
          while (ele)
          {
              n += ele.offsetLeft || 0;
              ele = ele.offsetParent;
          }
          return n;
        }
        
        function getTrueOffsetTop(ele)
        {
          var n = 0;
          while (ele)
          {
            n += ele.offsetTop || 0;
            ele = ele.offsetParent;
          }
          return n;
        }


        function getMouse(e){
          var x = e.clientX - getTrueOffsetLeft(e.target) + window.pageXOffset - size/2;
          var y = e.clientY - getTrueOffsetTop(e.target) + window.pageYOffset - size/2;
          return { x:x, y:y };
        };

        function sethours(point){
          var tumbler = ctx.isPointInPath(point.x + size/2, point.y + size/2);
          ampm = tumbler ? !ampm : ampm;
          if(tumbler) return;
          
          var angle = Math.atan2(point.y,point.x)  + Math.PI*2;
          var distance = Math.sqrt(Math.pow(point.x,2) + Math.pow(point.y,2));
          if( distance < size*35/100 ){
            hours = (Math.floor(angle / (Math.PI/6))+3)%12;          
          } else {
            minutes = Math.floor((Math.floor((angle / (Math.PI/30))+15)%60)/base.options.roundto)*base.options.roundto;
          }
        }

        base.init();
    };

    $.cantipi.defaultOptions = {
      size:150,
      roundto: 1
    };

    $.fn.cantipi = function(options){
        return this.each(function(){
          var clock =  new $.cantipi(this, options);
        });
    };

})(jQuery);