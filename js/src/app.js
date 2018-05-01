import 'intersection-observer';
const 	pym = require('pym.js'), 
        inView = require('in-view');



function isMobile(){
    // returns true if I think we're on mobile.
    return window.innerWidth < 850 ? true : false;
}

function toggleDrawer(drawerShouldOpen=false){
    if (drawerShouldOpen){
        // The drawer should be opened
        document.querySelector('.carousel').classList.add('carousel--open');
        document.querySelector('#hamburger').classList.add('carousel__button--open');
    } else {
        // the drawer should be closed
        document.querySelector('.carousel').classList.remove('carousel--open');
        document.querySelector('#hamburger').classList.remove('carousel__button--open');
    }
}
window.addEventListener('DOMContentLoaded', function(e){

	// Handle the carousel opening/closing
	[].slice.call(document.querySelectorAll('.carousel__opener')).forEach(opener => {
		opener.addEventListener('click', function(e){
			if (document.querySelector('#hamburger').classList.contains('carousel__button--open')){
				toggleDrawer();
			} else {
                toggleDrawer(true);
			}
		});
	});

    [].slice.call(document.querySelectorAll('.carousel__stories-list .story__link')).forEach(link => {
        link.addEventListener('click', e => toggleDrawer());
    });
    


    // Open the sidebars
    [].slice.call(document.querySelectorAll('.read-more')).forEach(button => {
        button.addEventListener('click', function(e){
            // Which sidebar do we want to open?
            const sidebar = this.dataset.target;

            // Add the open class to that sidebar, found by ID.
            document.querySelector(`#${sidebar}`).classList.add('sidebar--open');

            // Remove the button
            this.remove();
        })
    });

/*
    // Activate interaction between traveler and the sidebars

    const sidebars = [].slice.call(document.querySelectorAll('.sidebar'));

    const sidebarObserver = new IntersectionObserver((entry, observer)=>{
        if(entry[0].intersectionRatio > 0){
            // If the ratio > 0, then the element is more than 0% visible in the viewport
            const target = entry[0].target.getAttribute('id');
            console.log('entry target:', target, entry);

            // Mute the active link in the traveler
            const activeLink = document.querySelector(`.traveler__link--active`)
            if (activeLink != null) activeLink.classList.remove('traveler__link--active');
            
            // Add the highlight class to the new traveler link
            document.querySelector(`.traveler a[href="#${target}"]`).classList.add('traveler__link--active');
        }
    }, {
        rootMargin: `50% 0px -50% 0px`, // Move the trigger line from the bottom of the screen to half-way up from the bottom
        threshold: 0 // Trigger when the items are 50% visible
    });

    sidebars.forEach(sidebar => sidebarObserver.observe(sidebar));
*/

    // Also, let's lazyload the images
    const lazyItems = document.querySelectorAll('.image--lazy, .chart--lazy');

    const lazyObserver = new IntersectionObserver((entry, observer)=>{
        console.log(entry);
        // This is the object of our lazy-loading afecction for the moment
        const el = entry[0].target;

        if (el.classList.contains('image--lazy')){
            // If we're dealing with an image
            const   newWidth = entry[0].boundingClientRect.width,
                    fullResSrc = el.querySelector('img').getAttribute("src").replace("10", newWidth);

            // let src = isMobile ? el.dataset.fullResSrc.replace('/1200', "/850") : el.dataset.fullResSrc ;
            el.querySelector('img').setAttribute('src', fullResSrc);

        } else if (el.classList.contains('chart--lazy')){
            // if we're dealing with a graphic

            const   chartContainer = el.querySelector('.graphic-embed'),
                    pymId = chartContainer.id,
                    pymUrl = chartContainer.dataset.iframeUrl;
                    new pym.Parent(pymId, pymUrl, {});
        }

        // now that the image or graphic has been loaded, we don't need to observe anymore
        // This ensures we only lazy load an item once.
        lazyObserver.unobserve(el);
    }, {
        rootMargin: `0px 0px 500px 0px`, // Move the trigger line from the bottom of the screen to 500px below
    });
    lazyItems.forEach(i => lazyObserver.observe(i));



    // This is th header stub
    document.querySelector('body').setAttribute('data-header-panel', "true");
});



window.addEventListener('load', function() {  

    // First, let's init the non-lazy graphics
    const graphics = document.querySelectorAll(".chart:not(.chart--lazy) .graphic-embed");
    
    for (var graphicCounter = 0; graphicCounter < graphics.length; graphicCounter++){
        const   graphic = graphics[graphicCounter],
                pymId = graphic.id,
                pymUrl = graphic.dataset.iframeUrl;
        
        new pym.Parent(pymId, pymUrl, {});
    }
    
    // Let's set our lazyload offset to ~ 40% up the screen.
    const windowHeight = window.innerHeight;

    inView.offset(windowHeight * .4);
    
    // Let's track the sidebars
    const sidebars = inView('.sidebar')
        .on('enter', el => {

            const target = el.id;

            // Mute the active link in the traveler
            const activeLink = document.querySelector(`.traveler__link--active`)
            if (activeLink != null) activeLink.classList.remove('traveler__link--active');
            
            // Add the highlight class to the new traveler link
            document.querySelector(`.traveler a[href="#${target}"]`).classList.add('traveler__link--active');
        });
});