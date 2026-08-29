// 1. Initialize Lenis Smooth Scrolling
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

// 2. Premium Fade-Up Animations (Using Expo.out for a sharper, high-end feel)
const fadeElements = document.querySelectorAll('.fade-up');
fadeElements.forEach((el) => {
    // Add a slight rotation for a more dynamic reveal
    gsap.set(el, { y: 60, opacity: 0, rotation: 2 });
    
    ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        onEnter: () => {
            gsap.to(el, { 
                y: 0, 
                opacity: 1, 
                rotation: 0, 
                duration: 1.4, 
                ease: "expo.out" 
            });
        },
        once: true
    });
});

// Trigger Hero section immediately on load
gsap.to('.hero .fade-up', {
    y: 0, 
    opacity: 1, 
    rotation: 0, 
    duration: 1.4, 
    ease: "expo.out", 
    stagger: 0.15, 
    delay: 0.2
});

// 3. Enhanced Hero Parallax (Adds a subtle scale-down for depth)
gsap.to('.hero-content', {
    yPercent: 50,
    scale: 0.9,
    opacity: 0,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// 4. Horizontal Scroll Effect
const horizontalSection = document.querySelector('.horizontal-scroll-wrapper');
const container = document.querySelector('.horizontal-scroll-container');

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

// 4b. Dynamic Velocity Skew (The "Awwwards" lean effect)
let proxy = { skew: 0 },
    skewSetter = gsap.quickSetter(".project-card", "skewX", "deg"),
    clamp = gsap.utils.clamp(-12, 12); // Limits the lean angle so it doesn't break

ScrollTrigger.create({
  onUpdate: (self) => {
    let skew = clamp(self.getVelocity() / -200);
    // Only animate if scrolling fast enough
    if (Math.abs(skew) > Math.abs(proxy.skew)) {
      proxy.skew = skew;
      gsap.to(proxy, {
        skew: 0, 
        duration: 1, 
        ease: "power3", 
        overwrite: true, 
        onUpdate: () => skewSetter(proxy.skew)
      });
    }
  }
});

// 5. True 3D Footer Parallax Reveal
// Triggers when the bottom of the main content wrapper hits the bottom of the screen
gsap.fromTo('.footer-content', 
    { 
        y: -100, 
        scale: 0.9, 
        opacity: 0 
    }, 
    {
        y: 0,
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
            trigger: '.content-wrapper', // Use the wrapper, not the fixed footer
            start: "bottom bottom", 
            end: "max", // Animates until the absolute bottom of the page
            scrub: true
        }
    }
);

// 6. Deep Background Parallax
// Pushes the background image down slightly as you scroll down the page
gsap.to('.site-background', {
    yPercent: 15, 
    ease: "none",
    scrollTrigger: {
        trigger: ".content-wrapper",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});