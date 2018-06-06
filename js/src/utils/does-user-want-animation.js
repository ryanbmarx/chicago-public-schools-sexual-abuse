export function doesUserWantAnimations(){
    // returns true if user wants animations
    return document.querySelector(`[data-animate="true"]`) == null ? false : true;
}
