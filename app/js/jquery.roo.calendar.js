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
            });
            
            $(this.element).on('click','.rc-col-header', function(){
                $('.rc-col-header').removeClass('focused');
                $(this).addClass('focused');
            });

            $(this.element).on('click','.remove-event', function(){
                $(this).closest('.event').remove();
                self.eventResizeWidth();
            });

           
            $(this.element).on('click', '.event', function(e){
                e.stopPropagation();
            });

            $(this.element).on('click', '.rc-event-list', function(e){
                $('.event').removeClass('focused');
            });

            $(this.element).on('dblclick', '.event', function(e){
                e.stopPropagation();
            });

            $(this.element).on('dblclick', '.rc-event-list', function(e){
                const y = Math.floor(e.offsetY/self.settings.cellHeight);
                const x = Math.floor(e.offsetX/self.settings.cellWidth);
                // console.log(Math.floor(e.offsetY/self.settings.cellHeight), Math.floor(e.offsetX/self.settings.cellWidth))
                self.add(x, y, 1);
            });
            
            
            
            $(this.element).addClass(pluginName);

            $(document).keydown(function(e){
    
                if(e.which===67 && e.ctrlKey === true){
                    let $f = $('.event.focused', self.element);
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
            $rcContent.appendTo(this.element);
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
        getEventSE: function(event) {
            const start = event.offsetTop;
            const end = event.clientHeight + event.offsetTop;
            return {start:start, end:end};
        },
        eventResizeWidth:function(){
   
            const self = this;
            const columns = self.settings.resource || self.settings.days;
            let counter = 0;
            $('.event', this.element).attr('data-group-x',"");
            for(colI = 0; colI < columns.length; colI++){
                self.sortEvents($(`.event[data-pos-x="${colI}"]`, self.element));
                $eventGroup = $(`.event[data-pos-x="${colI}"]`, self.element);
                this.updateEvents($eventGroup);
              
            }

          
        },
        
        collidesWith: function (a, b) {
            return (a.end >= b.start && a.start <= b.end) || (a.start>=b.start && a.end<=b.end) || (a.start<=b.start && a.end>=b.end);
        },
        checkCollision: function (eventArr) {
            var arr = [];
            for (var i = 0; i < eventArr.length; i++) {
                arr[i] = {cols:[],colsBefore:[]}
                eventArr[i].cols = [];
                eventArr[i].colsBefore=[];
                for (var j = 0; j < eventArr.length; j++) {
                    if (this.collidesWith(this.getEventSE(eventArr[i]), this.getEventSE((eventArr[j])))) {
                        eventArr[i].cols.push(j);
                        arr[i].cols.push(j);
                        if(i>j) {
                            arr[i].colsBefore.push(j);
                            eventArr[i].colsBefore.push(j); //also list which of the conflicts came before
                        }
                    }
                }
            }
            if(arr.length){
                console.log(arr);
            }
           
            return eventArr;
        },
        getEventColumn:function(arr, elemIndex){
            var colGroup =arr;
            finalCount = 0;
            for(let i=0;i<colGroup.length;i++){
                if(elemIndex!==i&& colGroup[elemIndex]){
                    var counter = 0;
                    for (var c = 0; c < colGroup[elemIndex].cols.length; c++) {
                        var evCol = colGroup[elemIndex].cols[c]; // [0,1,2] c = index
                        if(colGroup[i].cols.indexOf(evCol)>-1)counter++;
                    }
                    // colGroup[elemIndex]
                }
                finalCount = finalCount < counter ? counter : finalCount;
            }
            return finalCount || 1;
        },
        getEventLeft:function(arr, index){
            var initialCol = arr[index].column;
            var event = arr[index];

                for (var c = 0; c < event.cols.length; c++) {
                    let cevent = arr[event.cols[c]];

                    let h = cevent.column;
                    
                    if(h > initialCol){
                        initialCol = h;
                    }
                    
                }
                
            return initialCol;
        },
        getHigherColumn:function(arr, index){
            var initialCol = arr[index].column;
            var event = arr[index];

                for (var c = 0; c < event.cols.length; c++) {
                    let cevent = arr[event.cols[c]];

                    let h = cevent.column;
                    
                    if(h > initialCol){
                        initialCol = h;
                    }
                    
                }
                
            return initialCol;
            
        },
        updateEvents:function(eventArr) {
            updateEvents = $('.events')
            arr = this.checkCollision(eventArr);
            
            // Insert all column
            for (let i = 0; i < arr.length; i++) {
                arr[i].column = this.getEventColumn(arr, i);
            }
            //Insert all left
            for (let i = 0; i < arr.length; i++) {
                arr[i].left = this.getEventLeft(arr, i);
            }

            for(i=0; i<arr.length;i++){
                
                $event = $(arr[i]);
                $event.css({
                    "width":this.settings.cellWidth -3 + 'px', 
                    "margin-left":0 + 'px'
                })
                // arr[i].column = this.getEventColumn(arr, i);
                
                var beforeColumn = arr[i].column;
                var beforeElement = null;
                if(arr[i].colsBefore.length>0){
                    beforeColumn = arr[arr[i].colsBefore[0]].column
                    beforeElement = arr[arr[i].colsBefore[0]]
                }
                var higherColumn = this.getHigherColumn(arr, i);
                var beforeColumnWidth = Math.floor(this.settings.cellWidth/higherColumn);
                var left = (beforeColumnWidth * arr[i].colsBefore.length);
                var width = Math.floor(this.settings.cellWidth/higherColumn);
                // if(higherColumn<=3){
                    if(beforeElement && beforeElement.colsBefore.length===1 && arr[i].colsBefore.length<2){
                        left = 0;
                    }
                    
                // }else{
                //     // left = (beforeColumnWidth * arr[i].colsBefore.length + (beforeColumn||beforeElement.colsBefore.length));
                // }
                
                console.log("Index : ", i, 'left : ', left, 'higherColumn : ',higherColumn, 'column : ', arr[i].column, 'beforeColumnWidth' , beforeColumnWidth, "cols : ", arr[i].cols, 'colsBefore : ', arr[i].colsBefore);
                $event.css({
                    "width":width + 'px', 
                    // "margin-left":(beforeElement && beforeElement.colsBefore.length===1?
                    //     arr[i].colsBefore.length>=2?
                    //     left:0:left) + 'px'
                    "margin-left":left + 'px'
                })
                
            }
            // // console.log('eventArr',eventArr);
            // var arr=eventArr; //clone the array
            // for(var i=0; i<arr.length; i++){
            //     var el=arr[i];
            //     // el.color = getRandomColor();
            //     // el.height = (el.end - el.start) * 2 + 'px';
            //     // el.top = (el.start) * 2 + 'px';
                
            //     if(i>0 && el.colsBefore.length>0){ //check column if not the first event and the event has collisions with prior events
            //         if(arr[i-1].column>0){ //if previous event wasn't in the first column, there may be space to the left of it
            //             for(var j=0;j<arr[i-1].column;j++){ //look through all the columns to the left of the previous event
            //                 if(el.colsBefore.indexOf(i-(j+2))===-1){ //the current event doesn't collide with the event being checked...
            //                 el.column=arr[i-(j+2)].column; //...and can be put in the same column as it
            //                 }
            //             }
            //             if(typeof el.column==='undefined') el.column=arr[i-1].column+1; //if there wasn't any free space, but it ito the right of the previous event
            //         }else{
            //             var column=0;
            //         for(var j=0;j<el.colsBefore.length;j++){ //go through each column to see where's space...
            //             if(arr[el.colsBefore[el.colsBefore.length-1-j]].column==column) column++;
            //         }
            //             el.column=column;
            //         }
            //     }else el.column=0;
            // }
            // //We need the column for every event before we can determine the appropriate width and left-position, so this is in a different for-loop:
            // for(var i=0; i<arr.length; i++){
            //     arr[i].totalColumns=0;
            //     if(arr[i].cols.length>1){ //if event collides
            //         var conflictGroup=[]; //store here each column in the current event group
            //         var conflictingColumns=[]; //and here the column of each of the events in the group
            //         addConflictsToGroup(arr[i]);
            //         function addConflictsToGroup(a){
            //             for(k=0;k<a.cols.length;k++){
            //                 if(conflictGroup.indexOf(a.cols[k])===-1){ //don't add same event twice to avoid infinite loop
            //                 conflictGroup.push(a.cols[k]);
            //                 conflictingColumns.push(arr[a.cols[k]].column);
            //                 addConflictsToGroup(arr[a.cols[k]]); //check also the events this event conflicts with
            //                 }
            //             }
            //         }
            //         arr[i].totalColumns=Math.max.apply(null, conflictingColumns); //set the greatest value as number of columns
            //     }
            //     console.log(arr[i].column)
            //     var width = Math.floor(((this.settings.cellWidth) /(arr[i].totalColumns+1)) - 5);
            //     var left = (width * arr[i].column);
            
            //     $(arr[i]).css({"width":width + 'px', "margin-left":left + 'px'});
            // }
            return arr;
        },
        sortEvents($events){

            $('.rc-event-list').append($events.sort(function(a, b) {
                return a.offsetTop - b.offsetTop;
              }));

            // $events.each(function(i, event){
            //     $events.each(function(i, cEvent){
            //         if(event.offsetTop<cEvent.offsetTop){
            //             $(event).after($(cEvent))
            //         }else if(event.offsetTop>cEvent.offsetTop){
            //              $(event).before($(cEvent))
            //         }else{

            //         }
            //     })
            // })
        },
        printDetails:function(event){
            $event = $(event)
            
            let yPos = (event.offsetTop/this.settings.cellHeight);
            let xPos = Math.floor(event.offsetLeft/this.settings.cellWidth);
            let height = Math.round(event.clientHeight/this.settings.cellHeight);
            // console.log(event.offsetLeft, (event.offsetLeft/this.settings.cellWidth))
            $event.attr('data-pos-y', yPos);
            $event.attr('data-pos-x', xPos);
            $event.data({'pos-y':yPos, 'pos-x':xPos});
            $('span', $event).text(this.settings.timePos[yPos] + ' - ' + this.settings.timePos[yPos + height])
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
            $('span',$event).text(self.settings.timePos[y] + ' - ' + self.settings.timePos[y + timelenght])
            $('.rc-event-list', this.element).append($event);
            $event.draggable({
                grid:[self.settings.cellWidth,self.settings.cellHeight], 
                containment:'parent',
                drag:function(){
                    let $this = $(this);
                    self.printDetails(this);
                },
                stop:function(){
                    self.eventResizeWidth();
                    // console.log('drag stop')
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