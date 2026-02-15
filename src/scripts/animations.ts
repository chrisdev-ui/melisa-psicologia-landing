import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  const run = () => {
    try {
      const hasAnimationTargets = Boolean(
        document.querySelector('[data-animate], [data-animate-group], [data-parallax], [data-bounce]')
      );
      if (!hasAnimationTargets) return;

      gsap.registerPlugin(ScrollTrigger);

      const hero = document.querySelector('#hero');
      if (hero) {
        const heroItems = hero.querySelectorAll('[data-animate-child], [data-animate]');
        if (heroItems.length) {
          gsap.set(heroItems, { opacity: 0, y: 12 });
          gsap.to(heroItems, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power2.out',
          });
        }

        const heroImage = hero.querySelector('[data-hero-image]');
        if (heroImage) {
          gsap.fromTo(
            heroImage,
            { opacity: 0, scale: 0.98 },
            {
              opacity: 1,
              scale: 1,
              duration: 1.2,
              ease: 'power2.out',
              delay: 0.1,
            }
          );
        }

        const heroGlows = hero.querySelectorAll('[data-hero-glow]');
        heroGlows.forEach((glow, index) => {
          gsap.fromTo(
            glow,
            { opacity: 0.3, scale: 0.98 },
            {
              opacity: 0.6,
              scale: 1.03,
              duration: 8 + index * 2,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
            }
          );
        });

        const parallaxItems = hero.querySelectorAll('[data-parallax]');
        parallaxItems.forEach((item) => {
          const speed = Number(item.getAttribute('data-parallax-speed') ?? '20');
          gsap.to(item, {
            y: -speed,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          });
        });

        const bounceItems = hero.querySelectorAll('[data-bounce]');
        bounceItems.forEach((rawItem, index) => {
          if (!(rawItem instanceof HTMLElement)) return;

          const baseDistance = Number(rawItem.dataset.bounceDistance ?? '5');
          const distance = baseDistance + 4;
          const baseDuration = Number(rawItem.dataset.bounceDuration ?? '7');
          const duration = Math.max(4.5, baseDuration * 0.85);
          const direction = index % 2 === 0 ? 1 : -1;
          const drift = Math.max(2, distance * 0.35) * direction;
          const rotation = Math.max(0.6, distance * 0.1) * direction;

          gsap.set(rawItem, { y: 0, x: 0, rotation: 0, transformOrigin: 'center' });
          gsap.to(rawItem, {
            y: distance,
            x: drift,
            rotation,
            duration,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            overwrite: 'auto',
            delay: 0.45 + index * 0.1,
          });
        });
      }

      const singleItems = Array.from(document.querySelectorAll<HTMLElement>('[data-animate]'));
      singleItems.forEach((el) => {
        if (el.closest('#hero')) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });

      const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-animate-group]'));
      groups.forEach((group) => {
        if (group.closest('#hero')) return;
        const children = group.querySelectorAll('[data-animate-child]');
        if (!children.length) return;

        gsap.fromTo(
          children,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: group,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });
    } catch (error) {
      console.error('Error al inicializar animaciones', error);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
