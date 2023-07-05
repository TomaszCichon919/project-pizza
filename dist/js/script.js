/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    },

    cart: {
      defaultDeliveryFee: 20,
    },

    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      //console.log('new Product:', thisProduct);
      thisProduct.initAccordin();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();


    }

    renderInMenu() {
      const thisProduct = this;
      /*generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(generatedHTML);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      //console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      //console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      //console.log(thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //console.log(thisProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordin() {
      const thisProduct = this;
      /*Start add event listener to clickable trigger on event click*/
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /*prevent default action for event*/
        event.preventDefault();
        /*find active product (product that has active class)*/
        const activeProduct = document.querySelector(select.menuProduct.clickable);
        console.log(activeProduct);
        /*if there is active porduct and it's not thisProduct.element, remove class active from it */
        if (activeProduct != "null" && activeProduct != thisProduct.element) {
          activeProduct.classList.remove(select.menuProduct.clickable);
        }
        //else {console.log ("test");}
        /* toggle active class on thisProduct.element*/
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        //console.log ("click");
      });
    }

    initOrderForm() {
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });


    }

    processOrder() {
      const thisProduct = this;
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);
      // set price to default price
      let price = thisProduct.data.price;



      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          //find img

          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //console.log(optionImage);
          if (optionImage == null) {
           // console.log("not found");
          } else {
            if (formData[paramId] && formData[paramId].includes(optionId)) {
              optionImage.classList.add(classNames.menuProduct.imageVisible)
            }
            else if (formData[paramId] && !formData[paramId].includes(optionId)) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible)
            }
          }


          // check if there is param with a name of paramId in formData and if it includes optionId
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            // check if the option is not default
            if (!option.default == true) {
              // add option price to price variable
              price = price + option.price
            }
          } else if (formData[paramId] && !formData[paramId].includes(optionId)) {
            // check if the option is not default
            if (option.default == true) {
              // reduce price variable
             price = price - option.price
            }
          }
        }
      }

      //new thisProduct object key priceSingle
      thisProduct.priceSingle = price;
      //multuply price by amount
      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;

    }

    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;

    }

    prepareCartProductParams() {
      const thisProduct = this;
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      //params empty object
      const params = {};
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //create category param in param const eg. params = { ingredients: { name: 'Ingredients', options: {}}}


        params[paramId] = {
          label: param.label,
          options: {}
        }

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);



          // check if there is param with a name of paramId in formData and if it includes optionId
          if (optionSelected) {
            params[paramId].options[optionId] = option.label; 
            
         }
        }

      }
      return params;


    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      console.log('AmountWidget', thisWidget);
      console.log('constructor arguments:', element);
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    announce() {
      const thisWidget = this;
      const event = new CustomEvent('updated', {bubbles: true});
      thisWidget.element.dispatchEvent(event);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      thisWidget.value = settings.amountWidget.defaultValue;

      /*add validation */
      if (thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
      }
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();

    }

    initActions() {

      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () { thisWidget.setValue(thisWidget.input.value) });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }

  }

  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('New Cart', thisCart);
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
      console.log("kamehameha!!!!", payload);

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
  const app = {
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        //console.log(productData);
      }

    },

    initData: function () {
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;
      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
         .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;

          /* execute initMenu method */
          thisApp.initMenu();

         });
          console.log("thisApp.data", JSON.stringify(thisApp.data));
    },

    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },


    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData ();
      thisApp.initCart();

    },

  };


  app.init();
}