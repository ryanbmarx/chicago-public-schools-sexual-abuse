import {doesUserWantAnimations} from './does-user-want-animation.js';
import smoothscroll from 'smoothscroll-polyfill';
const scrollMonitor = require('scrollmonitor');
import {openSidebar_func} from './open-sidebar.js';

smoothscroll.polyfill(); // kick off the polyfill!


export function scrollToSidebar(targetSidebar, useSmoothScroll=true, openSidebar=false){
    // Takes an anchor ID and sets scroll position to that id. Optionally (and by default) 
    // uses smoothScroll, but will defer to overall preferences on animation

    const targetSidebarTop = document.querySelector(`#${targetSidebar}`).getBoundingClientRect().y;

    if (openSidebar) {
        // Open the sidebar by simulating a click
        // document.querySelectorAll(`.read-more[data-target=${targetSidebar}]`).click();
        openSidebar_func(targetSidebar);
    }
            
    window.scrollBy({
        top: targetSidebarTop - 70,
        behavior: doesUserWantAnimations() && useSmoothScroll ? 'smooth' : 'instant'
    })
}