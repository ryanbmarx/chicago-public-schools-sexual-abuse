document.querySelector('#hamburger').addEventListener('click', function(e){
	this.classList.toggle('carousel__button--open');
	const carousel = document.querySelector('.carousel');
	if (carousel.classList.contains('carousel--open')){
		carousel.classList.remove('carousel--open');
	} else {
		carousel.classList.add('carousel--open');
	}
});