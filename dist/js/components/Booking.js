import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
class Booking {
constructor(element) {
const thisBooking = this;
thisBooking.render(element);
thisBooking.initWidgets();
thisBooking.getData();
}

getData(){
    const thisBooking  = this;
    const startDataParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.amountDataPicker.minDate);
    const endDataParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.amountDataPicker.maxDate);


    const params = {
        booking: [
            startDataParam, endDataParam 
        ],
        eventsCurrent: [
             settings.db.notRepeatParam, startDataParam, endDataParam
        ],
        eventsRepeat: [
            settings.db.repeatParam, endDataParam
        ],
    };

   // console.log('getData params', params);
     const urls = {
        booking:      settings.db.url + '/' + settings.db.bookings 
                                       + '?' + params.booking.join('&'),
        eventsCurrent: settings.db.url + '/' + settings.db.event    
                                       + '?' + params.eventsCurrent.join('&'),
        eventsRepeat:  settings.db.url + '/' + settings.db.event    
                                       + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
        fetch(urls.booking),
        fetch(urls.eventsCurrent),
        fetch(urls.eventsRepeat),
        ])
        .then(function(allResponses){
            const bookingResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];
            return Promise.all([ 
                bookingResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
            // console.log('heeey', bookings);
            // console.log('heeey2', eventsCurrent);
            // console.log('heeey3', eventsRepeat);
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        })
    
}

parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};

    for(let item of eventsCurrent){
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
    }

    for(let item of bookings){
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
    }

    const minDate = thisBooking.amountDataPicker.minDate;
    const maxDate = thisBooking.amountDataPicker.maxDate;

    for(let item of eventsRepeat){
        if(item.repeat == 'daily'){
            for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
        thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
            }
        }
    }

   console.log("lello", thisBooking.booked);
   thisBooking.updateDOM();
}

makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
        thisBooking.booked[date] = [];
    }

    const startHour = utils.hourToNumber(hour);

  

   for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
       // console.log('loop', hourBlock);

       if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
    }

    thisBooking.booked[date][hourBlock].push(table);
    }
}

updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.amountDataPicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.amountHourPicker.value);

    let allAvaliable = false;

    if(
        typeof thisBooking.booked[thisBooking.date] == 'undefined'
        ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
        allAvaliable = true;
    }

    for(let table of thisBooking.dom.tables){
        let tableId = table.getAttribute(settings.booking.tableIdAttribute);
        if(!isNaN(tableId)){
            tableId = parseInt(tableId);
        }

        if(
            !allAvaliable
            &&
            thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
    }
}


render(element){
const thisBooking = this;
thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    const generatedHTML = templates.bookingWidget();
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    element.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    //console.log('people', thisBooking.dom.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    //console.log('hour', thisBooking.dom.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    
}

initWidgets() {
    const thisBooking = this;

    thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
  

    thisBooking.amountWidgetHour = new AmountWidget(thisBooking.dom.hoursAmount);
   

    thisBooking.amountDataPicker = new DatePicker(thisBooking.dom.datePicker);
 

    thisBooking.amountHourPicker = new HourPicker(thisBooking.dom.hourPicker);
    
    thisBooking.dom.wrapper.addEventListener('updated', function (){
    thisBooking.updateDOM();
    });


}

}


export default Booking;