// 1. Initialize Lenis Smooth Scrolling (Crucial for Parallax)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smooth: true,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// 2. Initial Load Fade-Up Animations
const fadeElements = document.querySelectorAll('.fade-up');
fadeElements.forEach((el) => {
    gsap.set(el, { y: 50, opacity: 0 });
    ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        onEnter: () => {
            gsap.to(el, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.2 });
        },
        once: true
    });
});

gsap.to('.hero .fade-up', {
    y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.15, delay: 0.2
});

// 3. Hero Parallax Effect (Moves text down and fades out as you scroll)
gsap.to('.hero-content', {
    yPercent: 40,
    opacity: 0,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// 4. Horizontal Scroll Effect for Projects
const horizontalSection = document.querySelector('.horizontal-scroll-wrapper');
const container = document.querySelector('.horizontal-scroll-container');
const cards = gsap.utils.toArray('.project-card');

function getScrollAmount() {
    let scrollWidth = horizontalSection.scrollWidth;
    return -(scrollWidth - window.innerWidth + (window.innerWidth * 0.1)); 
}

const tween = gsap.to(horizontalSection, {
    x: getScrollAmount,
    ease: "none"
});

ScrollTrigger.create({
    trigger: container,
    start: "center center", 
    end: () => `+=${getScrollAmount() * -1}`, 
    pin: true,
    animation: tween,
    scrub: 1,
    invalidateOnRefresh: true
});

// 5. Footer Reveal Parallax Effect
// The footer stays in place while the content wrapper scrolls up over it
gsap.fromTo('.footer-content', 
    { yPercent: -50 }, 
    {
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
            trigger: '.contact',
            start: "top bottom",
            end: "bottom bottom",
            scrub: true
        }
    }
);
