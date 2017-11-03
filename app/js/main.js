$(document).ready(function(){

    $('.app').rooCalendar({
        fromTime:7,
        toTime:14,
        resource:['Rowi', 'Domz', 'Darren', 'Dash', 'Jeff', 'Aaron','Mike', 'Jepoy','Ervin']
    });
    
    $('.app').rooCalendar('addEntry',4,2,4);
    $('.app').rooCalendar('addEntry',1,5,8);
    $('.app').rooCalendar('addEntry',7,7,5);
})