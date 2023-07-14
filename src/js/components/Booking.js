import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import {templates, select} from '../settings.js';
import utils from '../utils.js';
class Booking {
constructor(element) {
const thisBooking = this;
thisBooking.render(element);
thisBooking.initWidgets();
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
    thisBooking.dom.dataPicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
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

    thisBooking.amountDataPicker = new DatePicker(thisBooking.dom.dataPicker);
    thisBooking.dom.dataPicker.addEventListener('updated', function (){

    
    });

    thisBooking.amountHourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('updated', function (){
    
    });


}

}


export default Booking;