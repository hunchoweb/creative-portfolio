"use client";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import Link from "next/link";
import "./Nav.css";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import MenuBtn from "../MenuBtn/MenuBtn";

const Nav = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  useLayoutEffect(() => {
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "hop",
      "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1"
    );
  }, []);

  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const links = menu.querySelectorAll(".nav-link");
      const socialLinks = menu.querySelectorAll(".socials p");

      gsap.set(menu, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      });
      gsap.set(links, { y: 30, opacity: 0 });
      gsap.set(socialLinks, { y: 30, opacity: 0 });
      gsap.set(".menu-header h1 span", {
        y: 500,
        rotateY: 90,
        scale: 0.8,
      });

      isInitializedRef.current = true;
    }

    // Animate the menu button in after hero animation completes
    gsap.to(".menu-toggle", {
      opacity: 1,
      duration: 1,
      delay: 5, // Appears after hero intro animation
      ease: "power4.out",
    });
  }, []);

  const animateMenu = useCallback((open: boolean) => {
    if (!menuRef.current) {
      return;
    }

    const menu = menuRef.current;
    const links = menu.querySelectorAll(".nav-link");
    const socialLinks = menu.querySelectorAll(".socials p");

    setIsAnimating(true);

    if (open) {
      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "hop",
        duration: 1.5,
        onStart: () => {
          menu.style.pointerEvents = "all";
        },
        onComplete: () => {
          setIsAnimating(false);
        },
      });

      gsap.to(links, {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        delay: 0.85,
        duration: 1,
        ease: "power3.out",
      });

      gsap.to(socialLinks, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        delay: 0.85,
        duration: 1,
        ease: "power3.out",
      });

      gsap.to(".nav-video-wrapper", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "hop",
        duration: 1.5,
        delay: 0.5,
      });

      gsap.to(".menu-header h1 span", {
        rotateY: 0,
        stagger: 0.05,
        delay: 0.75,
        duration: 1.5,
        ease: "power4.out",
      });

      gsap.to(".menu-header h1 span", {
        y: 0,
        scale: 1,
        stagger: 0.05,
        delay: 0.5,
        duration: 1.5,
        ease: "power4.out",
      });
    } else {
      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        ease: "hop",
        duration: 1.5,
        onComplete: () => {
          menu.style.pointerEvents = "none";
          gsap.set(menu, {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          });

          gsap.set(links, { y: 30, opacity: 0 });
          gsap.set(socialLinks, { y: 30, opacity: 0 });
          gsap.set(".menu-header h1 span", {
            y: 500,
            rotateY: 90,
            scale: 0.8,
          });

          setIsAnimating(false);
        },
      });
    }
  }, []);

  useEffect(() => {
    if (isInitializedRef.current) {
      animateMenu(isOpen);
    }
  }, [isOpen, animateMenu]);

  const toggleMenu = useCallback(() => {
    if (!isAnimating) {
      setIsOpen((prevIsOpen) => {
        return !prevIsOpen;
      });
    }
  }, [isAnimating]);

  const splitTextIntoSpans = (text: string) => {
    return text
      .split("")
      .map((char, index) =>
        char === " " ? (
          <span key={index}>&nbsp;&nbsp;</span>
        ) : (
          <span key={index}>{char}</span>
        )
      );
  };

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Work", href: "/work" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <MenuBtn isOpen={isOpen} toggleMenu={toggleMenu} />

      <div className="menu" ref={menuRef}>
        <div className="menu-col menu-col-1">
          <div className="menu-logo">
            <Link href="/">Odunayomide</Link>
          </div>
          <div className="nav-links">
            {navLinks.map((link, index) => (
              <div className="nav-link" key={index}>
                <Link href={link.href} onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>
              </div>
            ))}
          </div>
          <div className="nav-video-wrapper">
            <video src={"/video.mp4"} muted autoPlay loop playsInline />
          </div>
        </div>
        <div className="menu-col menu-col-2">
          <div className="socials">
            <div className="sub-col">
              <p>Odunayomide</p>
              <p>Frontend Developer</p>
              <p>Lagos, Nigeria</p>
              <br />
              <p>hello@odunayomide.com</p>
            </div>
            <div className="sub-col">
              <p>
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </p>
              <p>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </p>
              <p>
                <a href="https://twitter.com" target="_blank" rel="noreferrer">
                  Twitter
                </a>
              </p>
              <br />
              <p>
                <a href="/resume.pdf" download>
                  Download Resume
                </a>
              </p>
            </div>
          </div>

          <div className="menu-header">
            <h1>{splitTextIntoSpans("MIDE")}</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default Nav;
