const 	inView = require('in-view'),
		pym = require('pym.js');



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
});



window.addEventListener('load', function() {  

    // First, let's load the not lazy graphics
    let pymParents = {};

    const graphics = document.querySelectorAll(".chart:not(.chart--lazy) .graphic-embed");
    
    for (var graphicCounter = 0; graphicCounter < graphics.length; graphicCounter++){
        const   graphic = graphics[graphicCounter],
                pymId = graphic.id,
                pymUrl = graphic.dataset.iframeUrl;
        
            pymParents[pymId] = new pym.Parent(pymId, pymUrl, {});
    }
    
    // Let's set our lazyload offset to 500px. The iframe should be loaded once it's 500px frmo being seen.
    inView.offset(-500);
    
    // Let's lazyload the pym
    inView('.chart--lazy')
        .on('enter', el => {
            const   chartContainer = el.querySelector('.graphic-embed'),
                    pymId = chartContainer.id,
                    pymUrl = chartContainer.dataset.iframeUrl;
            if (!pymParents[pymId]){
                pymParents[pymId] = new pym.Parent(pymId, pymUrl, {});
            }
        });

    // Also, let's lazyload the images
    inView('.image--lazy img')
        .on('enter', el => {
            let src = isMobile ? el.dataset.fullResSrc.replace('/1200', "/850") : el.dataset.fullResSrc ;
            console.log('adding', src);
            el.setAttribute('src', src);
        });
});