import 'intersection-observer';
// import "scrollmonitor";
const scrollMonitor = require('scrollmonitor');

const 	pym = require('pym.js');



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


    // Also, let's lazyload the images
    const lazyItems = document.querySelectorAll('.image--lazy, .chart--lazy');

    const lazyObserver = new IntersectionObserver((entry, observer)=>{
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



 
});



window.addEventListener('load', function() {  

    console.log('main window is onloaded');

    const windowHeight = window.innerHeight;


    // First, let's init the non-lazy graphics
    const graphics = document.querySelectorAll(".chart:not(.chart--lazy) .graphic-embed");
    
    for (var graphicCounter = 0; graphicCounter < graphics.length; graphicCounter++){
        const   graphic = graphics[graphicCounter],
                pymId = graphic.id,
                pymUrl = graphic.dataset.iframeUrl;
        
        new pym.Parent(pymId, pymUrl, {});
    }
    
    // POWER THE SIDEBAR TRAVELER
    const sidebars = [].slice.call(document.querySelectorAll('.sidebar'));

    const sidebarWatchers = sidebars.map(el => {

        const watcher = scrollMonitor.create(el, {
            bottom: windowHeight * .4
        });

        watcher.enterViewport(function(){

            const target = el.id;

            // Mute the active link in the traveler
            const activeLink = document.querySelector(`.traveler__link--active`)
            if (activeLink != null) activeLink.classList.remove('traveler__link--active');
            
            // Add the highlight class to the new traveler link
            document.querySelector(`.traveler a[href="#${target}"]`).classList.add('traveler__link--active');
        });
        return watcher;
    });


    // This powers the header 

    const   body = document.querySelector('body'),
            headerPanels = [].slice.call(document.querySelectorAll('.header__panel-text'));

    console.log(windowHeight, windowHeight * -0.4, windowHeight * -0.6);
    const watchers = headerPanels.map(panel => {

        const watcher = scrollMonitor.create(panel, {
            top: windowHeight * -0.5
        });

        watcher.enterViewport(function(){
            const   panelParent = panel.parentElement,
                    id = panelParent.id,
                    activePanel = document.querySelector('.header__panel--active');

            // Toggle text highlight
            if (activePanel != null) activePanel.classList.remove('header__panel--active')
            panelParent.classList.add('header__panel--active');

            // Toggle graphic image with the <body> data attribute.
            body.setAttribute('data-header-panel', id);
        })

        return watcher;
    });

    const videoBreakers = [].slice.call(document.querySelectorAll('.breaker'));

    const videoWatchers = videoBreakers.map(v => {

        const watcher = scrollMonitor.create(v, {
            top: 200
        });

        watcher.enterViewport(function(){
            
            if (v.querySelector('video') != null){
                v.querySelector('video').play()
                    .then( function(el){
                        console.log("Video is playing");
                    })
                    .catch((error) => {
                        console.error("Error: " + error);
                    })
            }
        });

        watcher.exitViewport(function(){
            if (v.querySelector('video') != null) v.querySelector('video').pause();
        });

        return watcher;
    });

});