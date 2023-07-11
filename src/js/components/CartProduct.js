import AmountWidget from './AmountWidget.js';
import {select} from '../settings.js';
class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget ();
      thisCartProduct.initActions ();
      console.log(thisCartProduct);

    }

    getElements (element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidgetElem = select.cartProduct.amountWidget;
      thisCartProduct.dom.price = select.cartProduct.price;
      thisCartProduct.dom.edit =  thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove =  thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
      thisCartProduct.dom.amountWid = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.priceNew = thisCartProduct.dom.wrapper.querySelector(thisCartProduct.dom.price);
    }
     initAmountWidget () {
     const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWid);
      thisCartProduct.dom.amountWid.addEventListener('updated', function () {
      const amount = thisCartProduct.amountWidget.value;
      thisCartProduct.amount = amount;
       const price = thisCartProduct.priceSingle * amount;
        thisCartProduct.dom.priceNew.innerHTML = price;
      });
     }

     remove () {
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
      
        },
        
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
      
     }

     initActions () {
      const thisCartProduct = this;
     thisCartProduct.dom.edit.addEventListener('click', function (event){
      event.preventDefault ();
    });
      thisCartProduct.dom.remove.addEventListener('click', function (event){
      event.preventDefault ();
      thisCartProduct.remove();
    
     });

     }

     getData () {
      const thisCartProduct = this;
      const dataSummary = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
      };
      return dataSummary;
     }

    }

    export default CartProduct;