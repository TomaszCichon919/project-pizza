import {settings, select, classNames, templates} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';
class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      //console.log('New Cart', thisCart);
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrices = document.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
      thisCart.dom.form = document.querySelector(select.cart.form);
      thisCart.dom.adress = document.querySelector(select.cart.address);
      thisCart.dom.phone = document.querySelector(select.cart.phone);
      
    }
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function (event){
        event.preventDefault();
        thisCart.sendOrder();
      })

    }

    update () {
      const thisCart = this;
 
       const deliveryFee = settings.cart.defaultDeliveryFee;
       thisCart.totalNumber = 0;
       thisCart.subtotalPrice = 0;
 
       for (let product of thisCart.products) {
      
           thisCart.totalNumber = thisCart.totalNumber + product.amount;
           thisCart.subtotalPrice = thisCart.subtotalPrice + (product.priceSingle * product.amount);
       }
 
       if (thisCart.totalNumber != 0) {
         thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
       }
       else {
         thisCart.totalPrice = 0;
       }
      //  console.log('total number', totalNumber);
      //  console.log('total price', thisCart.totalPrice);
      //  console.log('sub total', subtotalPrice);
       thisCart.dom.deliveryFee.innerHTML = deliveryFee;
       thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
       thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

       for (let total of thisCart.dom.totalPrices) {
       total.innerHTML = thisCart.totalPrice;}


     }

    add(menuProduct) {
      const thisCart = this;

      // /*generate HTML based on template*/
       const generatedHTML = templates.cartProduct(menuProduct);
    
      /* create element using utils.createElementFromHTML */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
     
      // /* add element to menu */
      thisCart.dom.productList.appendChild(generatedDOM);

       //console.log('add product', menuProduct);
       thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products', thisCart.products);
      thisCart.update ();
    }

    remove (menuProduct) {
      const thisCart = this;
 
      menuProduct.dom.wrapper.remove();

     
      console.log('what????', menuProduct);
      const indexOfProduct = thisCart.products.indexOf(menuProduct); 
      thisCart.products.splice(indexOfProduct, 1);
      console.log("no way!!!!!", thisCart.products);
      thisCart.update ();

    }

    sendOrder () {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;


      const payload = {
        adress: thisCart.dom.adress.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.dom.deliveryFee,
        products: [],
      }
      //console.log("kamehameha!!!!", payload);

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
        });

    }

  }
  export default Cart;