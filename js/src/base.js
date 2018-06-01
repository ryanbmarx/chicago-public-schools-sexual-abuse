import 'intersection-observer'; // A polyfill that comes highly recommended
import clickTrack from "./click-track.js";
import smoothscroll from 'smoothscroll-polyfill';

const   scrollMonitor = require('scrollmonitor'),
        pym = require('pym.js'),
        throttle = require('lodash.throttle');

smoothscroll.polyfill(); // kick off the polyfill!

function loadElement(el){
    // Function we use for loading graphics and lazyloading images.
    if (el.classList.contains('chart--lazy')){
        // if we're dealing with a graphic
        const   chartContainer = el.querySelector('.graphic-embed'),
                pymId = chartContainer.id,
                pymUrl = chartContainer.dataset.iframeUrl;
                new pym.Parent(pymId, pymUrl, {});
    } else {
        // If we're dealing with an image
        const   elBox = el.getBoundingClientRect(),
                newDimension = elBox.width > elBox.height ? Math.round(elBox.width) : Math.round(elBox.height),
                fullResSrc = el.querySelector('img').getAttribute("src").replace("/10", `/${newDimension}`).replace(/’/g, ""); // Damn smart quotes are appearing again
        console.log('lazy loading ', fullResSrc);
        el.querySelector('img').setAttribute('src', fullResSrc);
    }
}




function isMobile(){
    // returns true if I think we're on mobile.
    return window.innerWidth < 850 ? true : false;
}

function doesUserWantAnimations(){
    // returns true if user wants animations
    return document.querySelector(`[data-animate="true"]`) == null ? false : true;
}


// document.querySelector('#animation-toggle').addEventListener("click", function(e){
//     const body = document.querySelector('body');

//     if (body.dataset.animate.toLowerCase() == "true"){
//         clickTrack("CPS abuse - animations toggled off", true, true);
//         body.dataset.animate = "false";
//     } else {
//         clickTrack("CPS abuse - animations toggled on", true, true);
//         body.dataset.animate = "true";
//     }
// })

function toggleDrawer(drawerShouldOpen=false){
    if (drawerShouldOpen){
        // The drawer should be opened
        document.querySelector('.carousel').classList.add('carousel--open');
        document.querySelector('#hamburger').classList.add('carousel__button--open');
        document.querySelector('body').classList.add('noscroll');
        clickTrack("CPS abuse - nav drawer is opened", true, true);
        if (document.querySelector('#nav-drawer-note') !== null) document.querySelector('#nav-drawer-note').remove();
    } else {
        // the drawer should be closed
        document.querySelector('.carousel').classList.remove('carousel--open');
        document.querySelector('#hamburger').classList.remove('carousel__button--open');
        document.querySelector('body').classList.remove('noscroll');
    }
}

// #########################################
// ######### DOMCONTENT LOADED #############
// #########################################


window.addEventListener('DOMContentLoaded', function(e){
    console.log('DOMContent is loaded')
    const   windowHeight = window.innerHeight,
            doAnimations = doesUserWantAnimations();

    // Remove the nav drawer note if clicked.
    document.querySelector('#nav-drawer-note').addEventListener('click', function(e){ this.remove(); });

    // This powers the header 
    const   body = document.querySelector('body'),
            headerPanels = [].slice.call(document.querySelectorAll('.header__panel-text'));

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

    if(doesUserWantAnimations()){
        // If user wants animations, then register the observers on the breakers
        const breakers = [].slice.call(document.querySelectorAll('.breaker'));

        const breakerWatchers = breakers.map(b => {

            const watcher = scrollMonitor.create(b, {
                bottom: windowHeight * 0.15
            });

            watcher.enterViewport(function(){
                b.classList.add('breaker--animated');
                watcher.destroy();
            });

            return watcher;
        });

    }


    // First, let's init the non-lazy graphics
    const graphics = document.querySelectorAll(".chart:not(.chart--lazy) .graphic-embed");
    
    for (var graphicCounter = 0; graphicCounter < graphics.length; graphicCounter++){
        loadElement(graphics[graphicCounter]);
    }

    // Also, let's lazyload the images and charts
    const lazyItems = [].slice.call(document.querySelectorAll('.image--lazy, .chart--lazy'));
    const lazyWatchers = lazyItems.map(el => {

        const lazyWatcher = scrollMonitor.create(el, {
            top: 500,
            bottom: 500
        });

        const throttledLazyLoad = throttle(function(){ loadElement(el) }, 100);

        lazyWatcher.enterViewport(function(){
            // First bring on the lazy content, but only once every 1/10 second
            throttledLazyLoad();

            // Now that the image is loaded, we can kill the watcher.
            lazyWatcher.destroy();
        });
        return lazyWatcher;
    });

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

    const sidebarLinkButtons = [].slice.call(document.querySelectorAll('.refer--case-study .refer__button, .carousel__stories .story__link, .sidebar-link, .traveler__link[data-sidebar-target] a, .keep-scrolling'));
    for (let sidebarLinkButtonsCounter = 0; sidebarLinkButtonsCounter < sidebarLinkButtons.length; sidebarLinkButtonsCounter++){
        const b = sidebarLinkButtons[sidebarLinkButtonsCounter];
        b.addEventListener('click', function(e){
            e.preventDefault();
            scrollMonitor.recalculateLocations();
            const   targetSidebar = this.getAttribute('href'),
                    targetSidebarTop = document.querySelector(targetSidebar).getBoundingClientRect().y,
                    loc = window.location.href.split("#")[0],
                    newLoc = `${loc}${targetSidebar}`;
            
            window.scrollBy({
                top: targetSidebarTop - 70,
                behavior: doesUserWantAnimations() ? 'smooth' : 'instant'
            })

            // This will change the url without causing the page to reload;
            // history.pushState({}, targetSidebar, newLoc);

            clickTrack(`CPS abuse - internal nav clicked - ${targetSidebar}`, false, false);
        });
    }
    
    // Open the sidebars
    [].slice.call(document.querySelectorAll('.read-more')).forEach(button => {
        button.addEventListener('click', function(e){
            
            // Which sidebar do we want to open?
            const sidebar = this.dataset.target;

            // Add the open class to that sidebar, found by ID.
            document.querySelector(`#${sidebar}`).classList.add('sidebar--open');

            // Remove the button
            this.remove();
            scrollMonitor.recalculateLocations();
            clickTrack(`CPS abuse - sidebar ${sidebar} opened`, true, false);
        })
    });
});

// #########################################
// ########### DOCUMENT LOADED #############
// #########################################


window.addEventListener('load', function() {  

    console.log('main window is onloaded');

    const   windowHeight = window.innerHeight,
            body = document.querySelector('body');
    
    // Now that the css is parsed and rendered, let's recalc all our waypoints
    scrollMonitor.recalculateLocations();


    // POWER THE SIDEBAR TRAVELER
    const sidebars = [].slice.call(document.querySelectorAll('.sidebar'));

    window.sidebarWatchers = sidebars.map(el => {

        const   sidebarWatcherTop = windowHeight * -0.6,
                sidebarWatcherBottom = windowHeight * -0.4;

        const sidebarWatcher = scrollMonitor.create(el, {
            top: sidebarWatcherTop,
            bottom: sidebarWatcherBottom
        });

        sidebarWatcher.enterViewport(function(){

            const   target = el.id,
                    loc = window.location.href.split("#")[0],
                    newLoc = `${loc}#${target}`;

            history.pushState({}, target, newLoc);

            // Mute the active link in the traveler
            const activeLink = document.querySelector(`.traveler__link--active`)
            if (activeLink != null) activeLink.classList.remove('traveler__link--active');
            
            // Add the highlight class to the new traveler link
            document.querySelector(`.traveler [data-sidebar-target="${target}"]`).classList.add('traveler__link--active');
        });
        return sidebarWatcher;
    });

});