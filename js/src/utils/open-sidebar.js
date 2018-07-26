import clickTrack from "../click-track.js";

export function openSidebar_func(sidebarToOpen){

    // Add the open class to that sidebar, found by ID.
    document.querySelector(`#${sidebarToOpen}`).classList.add('sidebar--open');

    

    // Remove the button, since the sidebar is opened
    const sidebarButton = document.querySelector(`.read-more[data-target=${sidebarToOpen}]`);
    if (sidebarButton !== null){
        sidebarButton.parentNode.removeChild(sidebarButton);
    }

    // We need to do this so the traveler still works
    scrollMonitor.recalculateLocations();

    // Let's track the opening
    clickTrack(`CPS abuse - sidebar ${sidebarToOpen} opened`, true, false);
}