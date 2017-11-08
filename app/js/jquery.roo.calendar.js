(function($, window, document){

    var pluginName = "rooCalendar",
    defaults = {
        debug: false,
        mode: "edit", // read
        confirm: true,
        hour: 24,
        fromTime:7,
        toTime:14,
        cellHeight:30,
        cellWidth:118,
        data: [],
        days: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        ],
        resource: undefined,
        timePos :[],
        invalidPeriod: "Invalid period.",
        invalidPosition: "Invalid position.",
        removePeriod: "Remove this period ?",
        dialogYes: "Yes",
        dialogNo: "No"
    };

    // Plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.clipboard = [];
        this.init();
    }

    $.extend(Plugin.prototype, {
        /**
         * Plugin init
         */
        init: function () {
            let self = this;
            $(this.element).on('mousedown', '.event', function(e){
                $('.event').removeClass('focused');
                $(this).addClass('focused');
                e.stopPropagation();
            })
            
            $(this.element).on('click','.rc-col-header', function(){
                $('.rc-col-header').removeClass('focused');
                $(this).addClass('focused');
            })

            $(this.element).on('click','.remove-event', function(){
                $(this).closest('.event').remove();
                self.eventResizeWidth();
            })

           
            $(this.element).on('click', '.event', function(e){
                e.stopPropagation();
            })
            $(this.element).on('click', '.rc-event-list', function(e){
                $('.event').removeClass('focused');
            })

            $(this.element).on('dblclick', '.event', function(e){
                e.stopPropagation();
            })
            $(this.element).on('dblclick', '.rc-event-list', function(e){
                const y = Math.floor(e.offsetY/self.settings.cellHeight);
                const x = Math.floor(e.offsetX/self.settings.cellWidth);
                // console.log(Math.floor(e.offsetY/self.settings.cellHeight), Math.floor(e.offsetX/self.settings.cellWidth))
                self.add(x, y, 1)
            })
            
            
            
            $(this.element).addClass(pluginName);

            $(document).keydown(function(e){
    
                if(e.which===67 && e.ctrlKey === true){
                    let $f = $(self.element).find('.event.focused');
                    self.clipboard = [];
                    $.each($f, function(index, ev){
                        let height = $(ev)[0].clientHeight/self.settings.cellHeight
                      
                        // console.log();
                        self.clipboard.push({y:$(ev).data('pos-y'), x:$(ev).data('pos-x'), height:height})
                    })
                    // self.clipboard = [{y:$f.data('pos-y'), x:$f.data('pos-x')}]
                    console.log(self.clipboard)
                }
                if(e.which===86 && e.ctrlKey === true){
                    // let $f = $(self.element).find('.event.focused');
                    
                    // self.clipboard = [{y:$f.data('pos-y'), x:$f.data('pos-x')}]
                    let xPos = $('.rc-col-header.focused').data('pos');
                    if(self.clipboard.length>0 && xPos!==undefined){
                        let copied = self.clipboard[0]
                        self.add(xPos, copied.y,copied.height)
                        console.log('paste')
                    }
                   
                }
                
            })

            this.create();
          
            // this.generate();
        },
        create : function(){
            var self = this;
            let col = this.settings.resource || this.settings.days
            let $table = $(`<table class="rc-tbl">
                <thead>
                    <tr class="rc-header">
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>`);
            $colContent = "";
           
            let $header = $table.find('.rc-header');
            $header.append(`<th class="rc-label">Time</th>`)
            $.each(col, function(index, c){
                $header.append(`<th class="rc-col-header" data-pos=${index}>${c}</th>`)
                $colContent+=`<td class="" data-data-resource="${c}"></td>`
            })

            let $tbody = $table.find('tbody');
            for(t = this.settings.fromTime;t<=this.settings.toTime; t++){
                self.settings.timePos.push(`${t}:00`);
                self.settings.timePos.push(`${t}:30`);
                
                $tbody.append(`<tr class="rc-label" data-time="${t}"><td class="rc-label time" style="height:${this.settings.cellHeight}px">${this.formatHour(t)}</td>${$colContent}</tr>`)
                $tbody.append(`<tr class="rc-label rc-minor" data-time="${t + .5}"><td class="rc-label rc-half" style="height:${this.settings.cellHeight}px">&nbsp</td>${$colContent}</tr>`)
            }
            self.settings.timePos.push(`${this.settings.toTime + 1}:00`);

            var $rcContent = $('<div class="rc-content"></div>')

            $(`<div class="rc-event-container">
                <div class="rc-event-list"></div>
            </div>`).css({'top':self.settings.cellHeight+1}).appendTo($rcContent);
         
            $table.appendTo($rcContent)

            $(`<div class="rc-header-content"></div>`).appendTo(this.element)
            $rcContent.appendTo(this.element)
            var x = Math.ceil($('.rc-event-container').width()/ (this.settings.resource || this.settings.days).length);
            self.settings.cellWidth = x;
          
           
        },
        formatHour: function (hour) {
            if (this.settings.hour === 12) {
                switch (hour) {
                    case 0:
                    case 24:
                        hour = "12 am";
                        break;
                    case 12:
                        hour = "12 pm";
                        break;
                    default:
                        if (hour > 12) {
                            hour = (hour - 12) + " pm";
                        } else {
                            hour += " am";
                        }
                }
            } else {

                if (hour >= 24) {
                    hour = 0;
                }

                if (hour < 10) {
                    hour = "0" + hour;
                }
                hour += ":00";
            }

            return hour;
        },
        periodFormat: function (position) {
            var hour = 0;

            if (this.settings.hour === 12) {
                var calc = Math.floor(position / 2);

                var min = ":30";
                if (position % 2 === 0) {
                    min = "";
                }

                hour = calc + min + "am";
                if (calc > 12) {
                    hour = (calc - 12) + min + "pm";
                }

                if (calc === 0 || calc === 24) {
                    hour = 12 + min + "am";
                }

                if (calc === 12) {
                    hour = 12 + min + "pm";
                }
            } else {

                if (position >= 48) {
                    position = 0;
                }

                hour = Math.floor(position / 2);
                if (hour < 10) {
                    hour = "0" + hour;
                }

                if (position % 2 === 0) {
                    hour += ":00";
                } else {
                    hour += ":30";
                }
            }

            return hour;
        },
        resizeEvent:function(event){
            let $event = $(event);
            const pStart = event.offsetTop;
            const pEnd = event.clientHeight + event.offsetTop;
            let colCount = 1;
            let self = this;

            $event.css('width',this.settings.cellWidth- 3) + 'px',

            $eventGroup = $(this.element).find(`.event[data-pos-x="${$event.data('pos-x')}"]`);
            let group = [];
           $.each($eventGroup, function(index, ev){   
                let $ev = $(ev);
               const cStart = ev.offsetTop;
               const cEnd = ev.clientHeight + ev.offsetTop;
               $ev.css('width',self.settings.cellWidth- 3) + 'px';
               if(ev != event){
                    if((pStart<=cStart && pEnd<=cEnd) || (pStart>=cStart && pEnd<=cEnd) || (pStart<=cStart && pEnd>=cEnd) || (pEnd>=cStart && pStart<=cEnd)){
                        console.log(pStart, cStart, pEnd, cEnd)
                        group.push(ev);
                    }
               }else{
                   console.log('same')
               }
           })
           group.push(event);
           colCount = group.length;
           colWidth = Math.floor(self.settings.cellWidth/colCount);
           $.each(group, function(i,ge){
                let $ge = $(ge);
                $ge.css({
                    'width':colWidth + 'px',
                    'margin-left': (colWidth * i) + 'px'
                });

           })
           
        },
        eventResizeWidth:function(){
            let self = this;
            $.each($('.event'), function(index, event){

                let $event = $(event);
                const pStart = event.offsetTop;
                const pEnd = event.clientHeight + event.offsetTop;
                let colCount = 1;
                

                $event.css('width',self.settings.cellWidth- 3) + 'px',

                $eventGroup = $(self.element).find(`.event[data-pos-x="${$event.data('pos-x')}"]`);
                let group = [];
                
                $.each($eventGroup, function(index, ev){   
                        let $ev = $(ev);
                    const cStart = ev.offsetTop;
                    const cEnd = ev.clientHeight + ev.offsetTop;
                    $ev.css('width',self.settings.cellWidth- 3) + 'px';
                    if(ev != event){
                            if((pStart>=cStart && pEnd<=cEnd) || (pStart<=cStart && pEnd>=cEnd) || (pEnd>=cStart && pStart<=cEnd)){
                                console.log(pStart, cStart, pEnd, cEnd)
                                group.push(ev);
                            }
                    }else{
                        console.log('same')
                    }
                })
                group.push(event);
                colCount = group.length;
                colWidth = Math.floor(self.settings.cellWidth/colCount);
                $.each(group, function(i,ge){
                        let $ge = $(ge);
                        $ge.css({
                            'width':(colWidth - 3) + 'px',
                            'margin-left': (colWidth * i) + 'px'
                        });

                })
            })
        },
        printDetails:function(event){
            $event = $(event)
            let yPos = Math.round(event.offsetTop/this.settings.cellHeight);
            let xPos = Math.round(event.offsetLeft/this.settings.cellWidth);
            let height = Math.round(event.clientHeight/this.settings.cellHeight);
            $event.attr('data-pos-y', yPos);
            $event.attr('data-pos-x', xPos);
            $event.data({'pos-y':yPos, 'pos-x':xPos});
            $event.find('span').text(this.settings.timePos[yPos] + ' - ' + this.settings.timePos[yPos + height])
        },
        add:function(x,y, timelenght){
            
            
            let col = this.settings.resource || this.settings.days;
            let $event = $(`<div class="event">
            <div class="remove-event pull-right">x</div>
                <span></span>
            </div>`);
            let self = this;
            let position = {
                top: (y*self.settings.cellHeight) + 'px',
                left: (x*self.settings.cellWidth) + 'px',
                width:(self.settings.cellWidth - 3) + 'px',
                height: (timelenght*self.settings.cellHeight) + 'px'
            }
            
            $event.css(position)
            $event.attr('data-pos-y', y);
            $event.attr('data-pos-x', x);
            $event.find('span').text(self.settings.timePos[y] + ' - ' + self.settings.timePos[y + timelenght])
            $(this.element).find('.rc-event-list').append($event);
            $event.draggable({
                grid:[self.settings.cellWidth,self.settings.cellHeight], 
                containment:'parent',
                drag:function(){
                    let $this = $(this);
                    self.printDetails(this);
                },
                stop:function(){
                    self.eventResizeWidth();
                    console.log('drag stop')
                }
            }).resizable({
                grid:[0,self.settings.cellHeight],
                handles: "n, s",
                containment:'parent',
                minHeight:self.settings.cellHeight,
                resize:function(){
                    self.printDetails(this);
                },
                stop:function(){
                    self.eventResizeWidth();
                    console.log('resize stop')
                }
            })
            this.eventResizeWidth();
        },
        addEntry:function(args){

            this.add(args[1],args[2], args[3]);
        }
    });

    



    $.fn[pluginName] = function(options){
        var ret = false;
        var args = Array.prototype.slice.call(arguments);
        var loop = this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            } else if ($.isFunction(Plugin.prototype[options])) {
                ret = $.data(this, "plugin_" + pluginName)[options](args);
            }
        });

        if (ret) {
            return ret;
        }

        return loop;
    }
})(jQuery, window, document)