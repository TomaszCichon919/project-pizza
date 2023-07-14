import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import {templates, select, settings} from '../settings.js';
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
            console.log('heeey', bookings);
            console.log('heeey2', eventsCurrent);
            console.log('heeey3', eventsRepeat);
        })
    
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
    
    
}

initWidgets() {
    const thisBooking = this;

    thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function (){
    });

    thisBooking.amountWidgetHour = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function (){
    });

    thisBooking.amountDataPicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('updated', function (){

    
    });

    thisBooking.amountHourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('updated', function (){
    
    });


}

}


export default Booking;