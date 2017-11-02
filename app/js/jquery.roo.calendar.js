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
            $(this.element).on('mousedown', '.event', function(){
                $('.event').removeClass('focused');
                $(this).addClass('focused');
            })
            
            $(this.element).on('click','.rc-col-header', function(){
                $('.rc-col-header').removeClass('focused');
                $(this).addClass('focused');
            })
            
            $(this.element).addClass(pluginName);

            $(document).keydown(function(e){
    
                if(e.which===67 && e.ctrlKey === true){
                    let $f = $(self.element).find('.event.focused');
                    
                    self.clipboard = [{y:$f.data('pos-y'), x:$f.data('pos-x')}]
                    console.log(self.clipboard)
                }
                if(e.which===86 && e.ctrlKey === true){
                    // let $f = $(self.element).find('.event.focused');
                    
                    // self.clipboard = [{y:$f.data('pos-y'), x:$f.data('pos-x')}]
                    let xPos = $('.rc-col-header.focused').data('pos');
                    if(self.clipboard.length>0 && xPos){
                        let copied = self.clipboard[0]
                        self.add(xPos, copied.y,null)
                        console.log('paste')
                    }
                   
                }
                
            })

           


            // if (this.settings.mode === "edit") {
            //     // bind event
            //     $(this.element).on("click", ".jqs-wrapper", function (event) {
            //         // add a new selection
            //         if ($(event.target).hasClass("jqs-period") || $(event.target).parents(".jqs-period").length > 0) {
            //             return false;
            //         }

            //         var position = Math.round(event.offsetY / 20);
            //         if (position >= 48) {
            //             position = 47;
            //         }

            //         $this.add($(this), "id_" + event.timeStamp, position, 1);
            //     });

            //     // delete a selection
            //     if ($this.settings.confirm) {
            //         $(this.element).on("click", ".jqs-remove", function () {
            //             var element = $(this).parents(".jqs-period");
            //             $this.dialogOpen($this.settings.removePeriod, function () {
            //                 element.remove();
            //             });
            //         });
            //     } else {
            //         $(this.element).on("click", ".jqs-remove", function () {
            //             $(this).parents(".jqs-period").remove();
            //         });
            //     }
            // }

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
                $tbody.append(`<tr class="rc-label" data-time="${t}"><td class="rc-label time" style="height:${this.settings.cellHeight}px">${this.formatHour(t)}</td>${$colContent}</tr>`)
                $tbody.append(`<tr class="rc-label rc-minor" data-time="${t + .5}"><td class="rc-label rc-half" style="height:${this.settings.cellHeight}px">&nbsp</td>${$colContent}</tr>`)
            }
            $(`<div class="rc-event-container">
                <div class="rc-event-list">
                    <div class="event">1</div><div class="event">2</div>
                </div>
                </div>`).css({'top':self.settings.cellHeight+1}).appendTo(this.element);
         
            $table.appendTo(this.element)
            var x = Math.ceil($('.rc-event-container').width()/ (this.settings.resource || this.settings.days).length);
            $('.event').css('width',(x-3)+'px');
            

            $.each($('.event'), function(index, eve){
                console.log(eve)
                $(eve).draggable({
                    grid:[x,self.settings.cellHeight], 
                    containment:'parent',
                    drag:function(){
                        let $this = $(this);
                        let yPos = Math.round(this.offsetTop/self.settings.cellHeight);
                        let xPos = Math.round(this.offsetLeft/self.settings.cellWidth);
                        $this.attr('data-pos-y', yPos);
                        $this.attr('data-pos-x', xPos);
                        console.log(this.offsetTop, this.offsetLeft, col[xPos], yPos)
                    }
                }).resizable({
                    grid:[0,self.settings.cellHeight],
                    handles: "n, s",
                    containment:'parent'
                })
    
            })

           
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
        resize:function(){

        },
        eventSize:function(){

        },
        add:function(x,y, timelenght){
            console.log(x,y, timelenght)
            let col = this.settings.resource || this.settings.days;
            let $event = $('<div class="event"></div>');
            let self = this;
            let position = {
                top: (y*self.settings.cellHeight) + 'px',
                left: (x*self.settings.cellWidth) + 'px',
                width:(self.settings.cellWidth - 3) + 'px'
            }
            
            $event.css(position)
            $event.attr('data-pos-y', y);
            $event.attr('data-pos-x', x);
            $(this.element).find('.rc-event-list').append($event);
            $event.draggable({
                grid:[self.settings.cellWidth,self.settings.cellHeight], 
                containment:'parent',
                drag:function(){
                    let $this = $(this);
                    let yPos = Math.round(this.offsetTop/self.settings.cellHeight);
                    let xPos = Math.round(this.offsetLeft/self.settings.cellWidth);
                    $this.attr('data-pos-y', yPos);
                    $this.attr('data-pos-x', xPos);
                    console.log(this.offsetTop, this.offsetLeft, col[xPos], yPos)
                }
            }).resizable({
                grid:[0,self.settings.cellHeight],
                handles: "n, s",
                containment:'parent'
            })
            
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