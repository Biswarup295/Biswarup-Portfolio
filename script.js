// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// 1. Initial Load Fade-Up Animations
const fadeElements = document.querySelectorAll('.fade-up');

fadeElements.forEach((el) => {
    // Set initial state
    gsap.set(el, { y: 50, opacity: 0 });

    // Animate to visible state on scroll (or instantly if in hero section)
    ScrollTrigger.create({
        trigger: el,
        start: "top 90%", // Triggers when the top of the element hits 90% of the viewport height
        onEnter: () => {
            gsap.to(el, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                stagger: 0.2
            });
        },
        once: true // Only animate once
    });
});

// Trigger Hero section immediately on load
gsap.to('.hero .fade-up', {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power3.out",
    stagger: 0.15,
    delay: 0.2
});

// 2. Horizontal Scroll Effect for Projects
const horizontalSection = document.querySelector('.horizontal-scroll-wrapper');
const container = document.querySelector('.horizontal-scroll-container');

// Calculate how far to move horizontally based on the width of the content
function getScrollAmount() {
    let scrollWidth = horizontalSection.scrollWidth;
    return -(scrollWidth - window.innerWidth + (window.innerWidth * 0.1)); // Gives a little padding at the end
}

// Create the pinning and horizontal movement
const tween = gsap.to(horizontalSection, {
    x: getScrollAmount,
    ease: "none"
});

ScrollTrigger.create({
    trigger: container,
    start: "center center", 
    end: () => `+=${getScrollAmount() * -1}`, // The distance to scroll down equals the distance to move right
    pin: true,
    animation: tween,
    scrub: 1, // Smooth scrubbing, takes 1 second to "catch up" to the scrollbar
    invalidateOnRefresh: true // Recalculates if window is resized
});