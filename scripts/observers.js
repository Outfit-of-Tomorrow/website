
// Initiate Intersection Observer

const observer = new IntersectionObserver(entries => {
    entries.forEach((entry) => {
        if(entry.isIntersecting) {
            entry.target.classList.add('show')
        } 
    })
})

// Adds observer to all elements with class 'Fade'

let fadeItems = document.querySelectorAll(".fade").forEach((elm) => observer.observe(elm))