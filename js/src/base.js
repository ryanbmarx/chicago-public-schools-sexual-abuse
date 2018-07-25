// import 'intersection-observer'; // A polyfill that comes highly recommended
import clickTrack from "./click-track.js";
// import smoothscroll from 'smoothscroll-polyfill';
import {openSidebar_func} from './utils/open-sidebar.js';
import {toggleDrawer} from './utils/toggle-nav-drawer.js';
import {scrollToSidebar} from './utils/scroll-to-sidebar.js';
import {doesUserWantAnimations} from './utils/does-user-want-animation.js';
import {loadElement} from './utils/load-element.js';

const   scrollMonitor = require('scrollmonitor'),
        pym = require('pym.js'),
        throttle = require('lodash.throttle');

function isMobile(){
    // returns true if I think we're on mobile.
    return window.innerWidth < 850 ? true : false;
}

// #########################################
// ######### DOMCONTENT LOADED #############
// #########################################


window.addEventListener('DOMContentLoaded', function(e){
    // console.log('DOMContent is loaded')
    const   windowHeight = window.innerHeight,
            doAnimations = doesUserWantAnimations();

    // First things first, let's check for a scroll-to point

    const pageUrl = window.location.href.split(/[?&]/);
    if (pageUrl.length > 1){
        for (let i=1; i< pageUrl.length; i++){
            if (pageUrl[i].indexOf('story') > -1){
                const targetSidebar = pageUrl[i].split('=')[1];
                scrollToSidebar(targetSidebar, false, true);
            }
        }
    }

    // Remove the nav drawer note if clicked.
    document.querySelector('#nav-drawer-note').addEventListener('click', function(e){ this.remove(); });

    // This powers the header 
    const   body = document.querySelector('body'),
            headerPanels = [].slice.call(document.querySelectorAll('.header__panel-text'));

    const watchers = headerPanels.map(panel => {

        const watcher = scrollMonitor.create(panel, {
            top: window.innerHeight * -0.5
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

    // First, let's init the non-lazy graphics
    const graphics = document.querySelectorAll(".chart:not(.chart--lazy) .graphic-embed");
    
    for (var graphicCounter = 0; graphicCounter < graphics.length; graphicCounter++){
        loadElement(graphics[graphicCounter]);
    }

    // Also, let's lazyload the images and charts
    const lazyItems = [].slice.call(document.querySelectorAll('.image--lazy, .chart--lazy, .audio--lazy'));
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

            // All our navigation and such around sidebars requires 
            // the hash to be stripped. It works with slugs, not anchors
            const targetSidebar = this.getAttribute('href').replace(/#/g, "");

            scrollToSidebar(targetSidebar, true);

            clickTrack(`CPS abuse - internal nav clicked - ${targetSidebar}`, false, false);
        });
    }
    
    // Open the sidebars
    [].slice.call(document.querySelectorAll('.read-more')).forEach(button => {
        button.addEventListener('click', function(e){
            openSidebar_func(this.dataset.target);            
        })
    });
});

// #########################################
// ########### DOCUMENT LOADED #############
// #########################################


window.addEventListener('load', function() {  

    // console.log('main window is onloaded');

    const   windowHeight = window.innerHeight,
            body = document.querySelector('body');
    
    // Now that the css is parsed and rendered, let's recalc all our waypoints
    scrollMonitor.recalculateLocations();

    if (document.querySelector('.traveler') !== null){
        // POWER THE SIDEBAR TRAVELER, IF THERE IS ONE.
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
                        loc = window.ROOT_URL,
                        newLoc = `${loc}/${target}`;
                history.replaceState({}, target, newLoc);
    
                // Mute the active link in the traveler
                const activeLink = document.querySelector(`.traveler__link--active`)
                if (activeLink != null) activeLink.classList.remove('traveler__link--active');
                
                // Add the highlight class to the new traveler link
                document.querySelector(`.traveler [data-sidebar-target="${target}"]`).classList.add('traveler__link--active');
            });
            return sidebarWatcher;
        });
    }
});