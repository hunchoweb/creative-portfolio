"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "./About.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Particle class for explosion effect
class Particle {
  element: HTMLImageElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  config: {
    gravity: number;
    friction: number;
    horizontalForce: number;
    verticalForce: number;
    rotationSpeed: number;
  };

  constructor(
    element: HTMLImageElement,
    config: {
      gravity: number;
      friction: number;
      horizontalForce: number;
      verticalForce: number;
      rotationSpeed: number;
    }
  ) {
    this.element = element;
    this.config = config;
    this.x = 0;
    this.y = 0;
    this.vx = (Math.random() - 0.5) * config.horizontalForce;
    this.vy = -config.verticalForce - Math.random() * 10;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * config.rotationSpeed;
  }

  update() {
    this.vy += this.config.gravity;
    this.vx *= this.config.friction;
    this.vy *= this.config.friction;
    this.rotationSpeed *= this.config.friction;

    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    if (this.element) {
      this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
    }
  }
}

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const copyContainerRef = useRef<HTMLDivElement>(null);
  const explosionContainerRef = useRef<HTMLDivElement>(null);
  const splitRefs = useRef<{ wordSplit: SplitText; charSplit: SplitText }[]>(
    []
  );
  const lastScrollProgress = useRef(0);
  const colorTransitionTimers = useRef<
    Map<number, ReturnType<typeof setTimeout>>
  >(new Map());
  const completedChars = useRef<Set<number>>(new Set());
  const particlesRef = useRef<Particle[]>([]);
  const [explosionTriggered, setExplosionTriggered] = useState(false);

  // Same images as Hero section
  const images = [
    "/images/Lightship.png",
    "/images/Moqo.png",
    "/images/Obys.png",
    "/images/Raft.png",
    "/images/magma.png",
    "/images/tala.png",
    "/images/translatorChat.png",
    "/images/hunchoApes.png",
    "/images/linear.png",
  ];

  // Explosion config
  const explosionConfig = {
    gravity: 0.25,
    friction: 0.99,
    imageSize: 120,
    horizontalForce: 25,
    verticalForce: 18,
    rotationSpeed: 12,
    resetDelay: 500,
  };

  // Color scheme for the terminal text reveal
  const colorInitial = "#4a4a4a";
  const colorAccent = "#ff3333";
  const colorFinal = "#f5f5f0";

  const createParticles = () => {
    if (!explosionContainerRef.current) return;

    explosionContainerRef.current.innerHTML = "";
    particlesRef.current = [];

    images.forEach((path) => {
      const particle = document.createElement("img");
      particle.src = path;
      particle.classList.add("explosion-particle-img");
      particle.style.width = `${explosionConfig.imageSize}px`;
      explosionContainerRef.current?.appendChild(particle);
    });

    const particleElements = explosionContainerRef.current.querySelectorAll(
      ".explosion-particle-img"
    );
    particlesRef.current = Array.from(particleElements).map(
      (element) => new Particle(element as HTMLImageElement, explosionConfig)
    );
  };

  const explode = () => {
    if (explosionTriggered) return;
    setExplosionTriggered(true);

    createParticles();

    let animationId: number;
    let finished = false;

    const animate = () => {
      if (finished) return;

      particlesRef.current.forEach((particle) => particle.update());

      if (
        explosionContainerRef.current &&
        particlesRef.current.every(
          (particle) =>
            particle.y > explosionContainerRef.current!.offsetHeight / 2
        )
      ) {
        cancelAnimationFrame(animationId);
        finished = true;
        setTimeout(() => {
          setExplosionTriggered(false);
        }, explosionConfig.resetDelay);
        return;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
  };

  // Explosion trigger on scroll
  useEffect(() => {
    // Preload images
    images.forEach((path) => {
      const img = new Image();
      img.src = path;
    });

    createParticles();

    let checkTimeout: ReturnType<typeof setTimeout>;

    const checkSectionPosition = () => {
      if (!sectionRef.current) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Trigger explosion when about section is mostly in view
      if (
        !explosionTriggered &&
        sectionRect.top <= viewportHeight * 0.3 &&
        sectionRect.bottom >= viewportHeight * 0.5
      ) {
        explode();
      }
    };

    const handleScroll = () => {
      clearTimeout(checkTimeout);
      checkTimeout = setTimeout(checkSectionPosition, 10);
    };

    window.addEventListener("scroll", handleScroll);
    setTimeout(checkSectionPosition, 500);

    const handleResize = () => {
      setExplosionTriggered(false);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(checkTimeout);
    };
  }, [explosionTriggered]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const copyContainer = copyContainerRef.current;
      if (!section || !copyContainer) return;

      // Reset refs
      splitRefs.current = [];
      lastScrollProgress.current = 0;
      colorTransitionTimers.current.clear();
      completedChars.current.clear();

      // Animate heading with chars
      if (headingRef.current) {
        const headingSplit = SplitText.create(headingRef.current, {
          type: "chars",
          charsClass: "char",
        });

        gsap.set(headingRef.current, { autoAlpha: 1 });

        gsap.from(headingSplit.chars, {
          y: 100,
          opacity: 0,
          rotateX: -90,
          stagger: 0.02,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "top 20%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Terminal text reveal for paragraphs
      const paragraphs = copyContainer.querySelectorAll(".about-paragraph");

      paragraphs.forEach((element) => {
        const wordSplit = SplitText.create(element, {
          type: "words",
          wordsClass: "word",
        });

        const charSplit = SplitText.create(wordSplit.words, {
          type: "chars",
          charsClass: "char",
        });

        splitRefs.current.push({ wordSplit, charSplit });
      });

      const allChars = splitRefs.current.flatMap(
        ({ charSplit }) => charSplit.chars
      );

      gsap.set(allChars, { color: colorInitial });
      gsap.set(paragraphs, { autoAlpha: 1 });

      const scheduleFinalTransition = (char: Element, index: number) => {
        if (colorTransitionTimers.current.has(index)) {
          clearTimeout(colorTransitionTimers.current.get(index));
        }

        const timer = setTimeout(() => {
          if (!completedChars.current.has(index)) {
            gsap.to(char, {
              duration: 0.1,
              ease: "none",
              color: colorFinal,
              onComplete: () => {
                completedChars.current.add(index);
              },
            });
          }
          colorTransitionTimers.current.delete(index);
        }, 100);

        colorTransitionTimers.current.set(index, timer);
      };

      ScrollTrigger.create({
        trigger: copyContainer,
        start: "top 80%",
        end: "bottom 30%",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalChars = allChars.length;
          const isScrollingDown = progress >= lastScrollProgress.current;
          const currentCharIndex = Math.floor(progress * totalChars);

          allChars.forEach((char, index) => {
            if (!isScrollingDown && index >= currentCharIndex) {
              if (colorTransitionTimers.current.has(index)) {
                clearTimeout(colorTransitionTimers.current.get(index));
                colorTransitionTimers.current.delete(index);
              }
              completedChars.current.delete(index);
              gsap.set(char, { color: colorInitial });
              return;
            }

            if (completedChars.current.has(index)) {
              return;
            }

            if (index <= currentCharIndex) {
              gsap.set(char, { color: colorAccent });
              if (!colorTransitionTimers.current.has(index)) {
                scheduleFinalTransition(char, index);
              }
            } else {
              gsap.set(char, { color: colorInitial });
            }
          });

          lastScrollProgress.current = progress;
        },
      });

      // Animate the image
      const imageContainer = section.querySelector(".about-image-container");
      if (imageContainer) {
        gsap.from(imageContainer, {
          y: 100,
          opacity: 0,
          scale: 0.9,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: imageContainer,
            start: "top 95%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        });

        // Add subtle parallax to image
        gsap.to(imageContainer.querySelector(".about-image"), {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: imageContainer,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      return () => {
        colorTransitionTimers.current.forEach((timer) => clearTimeout(timer));
        colorTransitionTimers.current.clear();
        completedChars.current.clear();

        splitRefs.current.forEach(({ wordSplit, charSplit }) => {
          if (charSplit) charSplit.revert();
          if (wordSplit) wordSplit.revert();
        });
      };
    },
    { scope: sectionRef }
  );

  return (
    <section className="about" ref={sectionRef}>
      <div className="about-grain"></div>

      {/* Explosion container */}
      <div ref={explosionContainerRef} className="explosion-container"></div>

      <div className="about-content">
        <h2 className="about-heading" ref={headingRef}>
          THE ORIGIN
        </h2>

        <div className="about-text" ref={copyContainerRef}>
          <p className="about-paragraph">
            Building for the web has never felt like just a job to me. It's
            where creativity meets problem solving, where pixels become
            experiences, and where ideas actually come to life. I obsess over
            the details that most people never notice: the smoothness of a
            scroll, the timing of an animation, the way a button feels when you
            click it. Every project I touch gets that same energy because I
            genuinely believe the web deserves to feel alive.
          </p>

          <p className="about-paragraph">
            What drives me is the challenge of making something complex feel
            effortless. I love taking a wild design and figuring out how to
            build it without compromise. Performance, accessibility, and user
            experience are never afterthoughts. They're baked into everything
            from the start. I work best when I'm pushing boundaries,
            experimenting with new techniques, and finding that sweet spot where
            art meets engineering.
          </p>

          <p className="about-paragraph">
            Beyond the code, I'm someone who genuinely cares about the craft. I
            stay curious, keep learning, and never settle for "good enough."
            Whether it's a subtle micro-interaction or a full-blown immersive
            experience, I bring the same level of intention and care. If you're
            looking for someone who treats every pixel like it matters, you're
            in the right place.
          </p>
        </div>

        <div className="about-image-container">
          <div className="about-image-wrapper">
            <img
              className="about-image"
              src="/images/about-image.jpg"
              alt="Creative portrait"
            />
            <div className="about-image-overlay"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
