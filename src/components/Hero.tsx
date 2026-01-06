"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/all";
import SplitType from "split-type";
import ImageTrail from "./ImageTrail";

gsap.registerPlugin(Flip);

const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const imageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentImageIndexRef = useRef(0);
  const animationCompleteRef = useRef(false);

  // Image cycling effect - starts after intro animation
  useEffect(() => {
    return () => {
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current);
      }
    };
  }, []);

  // Round text spinning animation and arrow bounce
  useEffect(() => {
    const roundTextP = document.querySelector(".roundText p");
    if (roundTextP && roundTextP instanceof HTMLElement) {
      const text = roundTextP.innerText;
      const chars = text.split("");
      roundTextP.innerHTML = chars
        .map(
          (char, i) =>
            `<span style="transform:rotate(${i * 8}deg)">${char}</span>`
        )
        .join("");
    }

    const arrowTl = gsap.timeline({
      yoyo: true,
      repeat: -1,
    });

    arrowTl.fromTo(
      ".arrowDown",
      { y: -10 },
      { y: 10, duration: 1, ease: "power1.inOut" }
    );

    return () => {
      arrowTl.kill();
    };
  }, []);

  const startImageCycling = () => {
    const container = containerRef.current;
    if (!container) return;

    const imageElements = container.querySelectorAll(
      ".img"
    ) as NodeListOf<HTMLElement>;
    const totalImages = imageElements.length;

    if (totalImages === 0) return;

    // Small delay to let FLIP animation settle
    setTimeout(() => {
      // Initially show only the first image, hide others
      imageElements.forEach((img, index) => {
        gsap.set(img, {
          opacity: index === 0 ? 1 : 0,
          scale: 1,
          zIndex: index === 0 ? 10 : 1,
        });
      });

      imageIntervalRef.current = setInterval(() => {
        const prevIndex = currentImageIndexRef.current;
        const nextIndex = (prevIndex + 1) % totalImages;

        // Set z-index so next image is on top
        gsap.set(imageElements[nextIndex], { zIndex: 10 });
        gsap.set(imageElements[prevIndex], { zIndex: 1 });

        // Fade out current image
        gsap.to(imageElements[prevIndex], {
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          ease: "power2.inOut",
        });

        // Fade in next image
        gsap.to(imageElements[nextIndex], {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.inOut",
        });

        currentImageIndexRef.current = nextIndex;
      }, 2000);
    }, 500);
  };

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      // 1. Setup Text Splitting
      // Use scoped selector manually or via context
      const textElements = container.querySelectorAll(
        "h1, h2, p, a"
      ) as NodeListOf<HTMLElement>;

      const splits: SplitType[] = [];

      textElements.forEach((element) => {
        const split = new SplitType(element, {
          types: "lines",
          lineClass: "line",
        });

        // Wrap line content in spans for reveal animation
        if (split.lines) {
          split.lines.forEach((line) => {
            const wrapper = document.createElement("span");
            wrapper.textContent = line.textContent;
            line.innerHTML = "";
            line.appendChild(wrapper);
          });
        }

        splits.push(split);
        gsap.set(element, { autoAlpha: 1 });
      });

      // 2. Animate Counters
      const animateCounter = (
        counterSelector: string,
        duration: number,
        delay: number = 0
      ) => {
        const counter = container.querySelector(counterSelector);
        if (!counter) return;
        const numElement = counter.querySelector(".num");
        if (!numElement) return;

        const numHeight = numElement.clientHeight;
        const totalNumbers = counter.querySelectorAll(".num").length;

        if (totalNumbers > 1 && numHeight > 0) {
          const totalDistance = (totalNumbers - 1) * numHeight;
          gsap.to(counter, {
            y: -totalDistance,
            duration: duration,
            delay: delay,
            ease: "power2.inOut",
          });
        }
      };

      animateCounter(".counter-3", 2.5);
      animateCounter(".counter-2", 3);
      animateCounter(".counter-1", 2, 1.5);

      // 3. Main Timeline
      const tl = gsap.timeline();
      gsap.set(".img", { scale: 0 });

      tl.to(".hero-bg", {
        scaleY: "100%",
        duration: 3,
        ease: "power2.inOut",
        delay: 0.25,
      });

      tl.to(
        ".img",
        {
          scale: 1,
          duration: 1,
          stagger: 0.125,
          ease: "power3.out",
        },
        "<"
      );

      // Animate Images Function (FLIP)
      const animateImages = () => {
        const images = container.querySelectorAll(".img");

        images.forEach((img) => img.classList.remove("animate-out"));

        const state = Flip.getState(images);

        images.forEach((img) => img.classList.add("animate-out"));

        const mainTimeline = gsap.timeline();

        mainTimeline.add(
          Flip.from(state, {
            duration: 1,
            stagger: 0.1,
            ease: "power3.inOut",
          })
        );

        images.forEach((img, index) => {
          const scaleTimeline = gsap.timeline();
          scaleTimeline
            .to(
              img,
              {
                scale: 2.5,
                duration: 0.45,
                ease: "power3.in",
              },
              0.025
            )
            .to(
              img,
              {
                scale: 1,
                duration: 0.45,
                ease: "power3.out",
              },
              0.5
            );

          mainTimeline.add(scaleTimeline, index * 0.1);
        });

        return mainTimeline;
      };

      tl.to(".counter", {
        opacity: 0,
        duration: 0.3,
        ease: "power3.out",
        delay: 0.3,
        onStart: () => {
          animateImages();
        },
      });

      tl.to(".sidebar .divider", {
        scaleY: "100%",
        duration: 1,
        ease: "power3.inOut",
        delay: 1.25,
      });

      tl.to(
        ["nav .divider", ".site-info .divider"],
        {
          scaleX: "100%",
          duration: 1,
          stagger: 0.5,
          ease: "power3.inOut",
        },
        "<"
      );

      tl.to(
        ".logo",
        {
          scale: 1,
          duration: 1,
          ease: "power4.inOut",
        },
        "<"
      );

      tl.to(
        [".logo-name a span", ".links a span", ".links p span", ".cta a span"],
        {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          delay: 0.5,
        },
        "<"
      );

      tl.to(
        [".header span", ".site-info span"],
        {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
        },
        "<"
      );

      // Animate scroller in
      tl.to(
        ".scroller",
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power4.out",
        },
        "<0.5"
      );

      // Start image cycling after all animations complete
      tl.call(() => {
        startImageCycling();
      });

      return () => {
        splits.forEach((split) => split.revert());
        if (imageIntervalRef.current) {
          clearInterval(imageIntervalRef.current);
        }
      };
    },
    { scope: containerRef }
  );

  const counter2 = Array.from({ length: 11 }, (_, i) => i);
  const counter3 = Array.from({ length: 30 }, (_, i) => i % 10);
  const images = [
    "/images/Lightship.png",
    "/images/Moqo.png",
    "/images/Obys.png",
    // "/images/Raft.png",
    "/images/magma.png",
    "/images/tala.png",
    "/images/translatorChat.png",
    "/images/hunchoApes.png",
    "/images/linear.png",
  ];

  return (
    <section className="hero" ref={containerRef}>
      <div className="hero-bg"></div>
      <ImageTrail images={images} containerSelector=".hero" />

      <div className="counter">
        <div className="counter-1 digit">
          <div className="num">0</div>
          <div className="num num1offset1">1</div>
        </div>
        <div className="counter-2 digit">
          {counter2.map((num, i) => (
            <div key={i} className={`num ${num === 1 ? "num1offset2" : ""}`}>
              {num === 10 ? "0" : num}
            </div>
          ))}
        </div>
        <div className="counter-3 digit">
          {counter3.map((num, i) => (
            <div key={i} className="num">
              {num}
            </div>
          ))}
          <div className="num">0</div>
        </div>
      </div>

      <div className="images-container">
        {images.map((src, i) => (
          <div key={i} className="img">
            <img src={src} alt="" />
          </div>
        ))}
      </div>

      <nav>
        <div className="logo-name">
          <a href="#" style={{ opacity: 0 }}>
            ODUNAYOMIDE
          </a>
        </div>

        <div className="nav-items">
          <div className="links"></div>
        </div>

        <div className="divider"></div>
      </nav>

      <div className="sidebar">
        <div className="logo">
          <img src="/logo.jpg" alt="logo" />
        </div>

        <div className="divider"></div>
      </div>

      <div className="header">
        <h1 style={{ opacity: 0 }}>FRONT-END DEVELOPER</h1>
      </div>

      <div className="site-info">
        <h2 style={{ opacity: 0 }}>
          Crafting immersive web experiences with pixel perfect precision
        </h2>

        <div className="divider"></div>

        <div className="site-info-copy">
          <p style={{ opacity: 0 }}>Animations • Interactions • Performance</p>
          <p style={{ opacity: 0 }}>
            Turning designs into living, breathing code
          </p>
        </div>
      </div>

      <div className="scroller">
        <div className="bg">
          <div className="circle">
            <img
              alt="arrow down"
              className="arrowDown"
              src="/icons/arrowDown.svg"
              style={{ width: "auto" }}
            />
            <div className="roundText" id="text">
              <p>SCROLL DOWN FOR MORE . SCROLL DOWN FOR MORE .</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
