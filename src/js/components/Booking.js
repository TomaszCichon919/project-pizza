import AmountWidget from './AmountWidget.js';
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
}

initWidgets() {
    const thisBooking = this;

    thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function (){
        console.log('people click');
    });

    thisBooking.amountWidgetHour = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function (){
        console.log('hours click');
    });


}

}


export default Booking;