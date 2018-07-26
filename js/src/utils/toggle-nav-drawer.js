import clickTrack from "../click-track.js";

export function toggleDrawer(drawerShouldOpen=false){
    if (drawerShouldOpen){
        // The drawer should be opened
        document.querySelector('.carousel').classList.add('carousel--open');
        document.querySelector('#hamburger').classList.add('carousel__button--open');
        document.querySelector('body').classList.add('noscroll');
        clickTrack("CPS abuse - nav drawer is opened", true, false);
        if (document.querySelector('#nav-drawer-note') !== null) {
            const note = document.querySelector('#nav-drawer-note');
            note.parentNode.removeChild(note);
        }
    } else {
        // the drawer should be closed
        document.querySelector('.carousel').classList.remove('carousel--open');
        document.querySelector('#hamburger').classList.remove('carousel__button--open');
        document.querySelector('body').classList.remove('noscroll');
    }
}