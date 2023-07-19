import utils from '../utils.js';
import { templates, select } from '../settings.js';
class Home {
    constructor(element) {
        const thisHome = this;
        thisHome.render(element);
        thisHome.initWidgets();
    
}
    

    render (element){
        const thisHome = this;
        thisHome.dom = {};
        thisHome.dom.wrapper = element;
        const generatedHTML = templates.homePage();
        thisHome.element = utils.createDOMFromHTML(generatedHTML);
        element.innerHTML = generatedHTML;
        thisHome.dom.carousel = document.querySelector(select.homePage.carousel);
    }


  initWidgets (){
    const thisHome = this;
    // eslint-disable-next-line no-undef
    thisHome.carouselWidget = new Flickity(thisHome.dom.carousel, {
        cellAlign: 'left',
        contain: true,
        autoPlay: true,
        pauseAutoPlayOnHover: false,
    
        
      })
    }
}  



export default Home;