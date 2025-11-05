

// Toggle Slide In Nav
function toggleNav(){
    let nav = document.querySelector(".navPlaceholder");
    nav.classList.toggle('active');
    let menuIcon = document.querySelector(".menuContainer");
    menuIcon.classList.toggle('active');
    let helpButton = document.querySelector('.helpButton')
    if (helpButton != undefined){
        helpButton.classList.toggle('level');
    }
}

// Menu Item Hover Effect
menu = document.querySelector('.menu')
Array.from(document.getElementsByClassName('menu-item')).forEach((item,index) => {
    item.onmouseover = () => {
        console.log('here');
        menu.dataset.activeIndex = index;
        menu.classList.add("index" + index)
        console.log(menu.dataset.activeIndex);
    }
})

// Hamburger Click Animation
let navIcon = document.querySelector('#nav-icon3');

navIcon.addEventListener("click",() => {
    navIcon.classList.toggle('open');
})

// Fix To VH issues 
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});
