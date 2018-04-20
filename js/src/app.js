
[].slice.call(document.querySelectorAll('.carousel__opener')).forEach(opener => {
	opener.addEventListener('click', function(e){
		if (document.querySelector('#hamburger').classList.contains('carousel__button--open')){
			document.querySelector('.carousel').classList.remove('carousel--open');
			document.querySelector('#hamburger').classList.remove('carousel__button--open');
		} else {
			document.querySelector('.carousel').classList.add('carousel--open');
			document.querySelector('#hamburger').classList.add('carousel__button--open');
		}
	});
});