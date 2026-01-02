"use client";

import React, { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "./Work.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  year: string;
  link?: string;
}

const projects: Project[] = [
  {
    title: "Lightship",
    description:
      "A cutting-edge AR development platform enabling creators to build immersive augmented reality experiences with powerful tools and seamless integration.",
    image: "/images/Lightship.png",
    tags: ["AR/VR", "Platform", "Development"],
    year: "2024",
  },
  {
    title: "Moqo",
    description:
      "Modern mobility-as-a-service platform powering shared mobility solutions with intelligent fleet management and seamless user experiences.",
    image: "/images/Moqo.png",
    tags: ["SaaS", "Mobility", "Platform"],
    year: "2024",
  },
  {
    title: "Obys",
    description:
      "Award-winning digital agency website with experimental interactions, bold typography, and boundary-pushing visual design that sets new standards.",
    image: "/images/Obys.png",
    tags: ["Agency", "Experimental", "Web"],
    year: "2023",
  },
  {
    title: "Raft",
    description:
      "Collaborative design research platform streamlining the entire UX research workflow from planning to insights with intuitive tools.",
    image: "/images/Raft.png",
    tags: ["UX Research", "Collaboration", "Tool"],
    year: "2023",
  },
  {
    title: "Magma",
    description:
      "Next-generation collaborative design tool combining real-time multiplayer editing with powerful creative features for modern design teams.",
    image: "/images/magma.png",
    tags: ["Design Tool", "Collaboration", "Creative"],
    year: "2023",
  },
  {
    title: "Tala",
    description:
      "Financial technology platform democratizing access to credit and financial services with innovative mobile-first solutions.",
    image: "/images/tala.png",
    tags: ["Fintech", "Mobile", "Platform"],
    year: "2022",
  },
  {
    title: "Translator Chat",
    description:
      "AI-powered real-time translation platform breaking language barriers with instant multilingual communication capabilities.",
    image: "/images/translatorChat.png",
    tags: ["AI", "Communication", "Translation"],
    year: "2022",
  },
  {
    title: "Huncho Apes",
    description:
      "Premium NFT collection featuring unique digital art with exclusive community benefits and metaverse integration.",
    image: "/images/hunchoApes.png",
    tags: ["NFT", "Web3", "Digital Art"],
    year: "2022",
  },
  {
    title: "Linear",
    description:
      "Streamlined project management tool built for modern software teams with powerful issue tracking and beautiful interface design.",
    image: "/images/linear.png",
    tags: ["Project Management", "SaaS", "Tool"],
    year: "2021",
  },
];

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const magneticRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // magnetic hover
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!titleRef.current) return;

    const rect = titleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;

    magneticRef.current = { x: deltaX, y: deltaY };

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (titleRef.current) {
          gsap.to(titleRef.current, {
            x: magneticRef.current.x,
            y: magneticRef.current.y,
            duration: 0.4,
            ease: "power2.out",
          });
        }
        rafRef.current = null;
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
      });
    }
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  // scroll animations
  useGSAP(
    () => {
      if (!cardRef.current || !titleRef.current || !descRef.current) return;

      const titleSplit = SplitText.create(titleRef.current, {
        type: "chars",
        charsClass: "title-char",
      });

      const descSplit = SplitText.create(descRef.current, {
        type: "words",
        wordsClass: "desc-word",
      });

      gsap.set(titleSplit.chars, {
        opacity: 0,
        y: 80,
        rotateX: -90,
        transformOrigin: "50% 50% -50px",
      });

      gsap.to(titleSplit.chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: {
          each: 0.03,
          from: "start",
        },
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.set(descSplit.words, {
        opacity: 0,
        y: 20,
        filter: "blur(8px)",
      });

      gsap.to(descSplit.words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: {
          each: 0.02,
          from: "start",
        },
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      // tags
      const tags = cardRef.current.querySelectorAll(".work-card-tag");
      gsap.set(tags, {
        opacity: 0,
        scale: 0.8,
        y: 15,
      });

      gsap.to(tags, {
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      const numberEl = cardRef.current.querySelector(".work-card-number");
      if (numberEl) {
        gsap.from(numberEl, {
          opacity: 0,
          scale: 0.5,
          rotation: -15,
          duration: 0.8,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const yearEl = cardRef.current.querySelector(".work-card-year");
      if (yearEl) {
        gsap.from(yearEl, {
          opacity: 0,
          x: 30,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const cta = cardRef.current.querySelector(".work-card-cta");
      if (cta) {
        gsap.from(cta, {
          opacity: 0,
          x: -20,
          duration: 0.6,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        });
      }

      return () => {
        titleSplit.revert();
        descSplit.revert();
      };
    },
    { scope: cardRef }
  );

  return (
    <div className="work-card" id={`work-card-${index + 1}`} ref={cardRef}>
      <div className="work-card-inner">
        <div className="work-card-content">
          <div className="work-card-header">
            <span className="work-card-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="work-card-year">{project.year}</span>
          </div>
          <h3 className="work-card-title" ref={titleRef}>
            {project.title}
          </h3>
          <p className="work-card-description" ref={descRef}>
            {project.description}
          </p>
          <div className="work-card-tags">
            {project.tags.map((tag, i) => (
              <span key={i} className="work-card-tag">
                {tag}
              </span>
            ))}
          </div>
          <div className="work-card-cta">
            <span className="work-card-link">View Project</span>
            <svg
              className="work-card-arrow"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="work-card-img">
          <img src={project.image} alt={project.title} />
          <div className="work-card-img-overlay"></div>
        </div>
      </div>
    </div>
  );
};

const Work: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const introHeadingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".work-card");

      ScrollTrigger.create({
        trigger: cards[0],
        start: "top 15%",
        endTrigger: cards[cards.length - 1],
        end: "top 10%",
        pin: ".work-intro",
        pinSpacing: false,
      });

      // sticky cards
      cards.forEach((card, index) => {
        const isLastCard = index === cards.length - 1;
        const cardInner = card.querySelector(".work-card-inner");

        if (!isLastCard && cardInner) {
          ScrollTrigger.create({
            trigger: card,
            start: "top 15%",
            endTrigger: cards[cards.length - 1],
            end: "top 15%",
            pin: true,
            pinSpacing: false,
          });

          gsap.to(cardInner, {
            y: `-${(cards.length - index) * 10}vh`,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 15%",
              endTrigger: cards[cards.length - 1],
              end: "top 15%",
              scrub: true,
            },
          });
        }
      });

      // intro
      if (introHeadingRef.current) {
        gsap.from(introHeadingRef.current, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: introHeadingRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const introLabel = sectionRef.current?.querySelector(".work-intro-label");
      if (introLabel) {
        gsap.from(introLabel, {
          opacity: 0,
          x: -30,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: introLabel,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const introDesc = sectionRef.current?.querySelector(
        ".work-intro-description"
      ) as HTMLElement;
      if (introDesc) {
        const descSplit = SplitText.create(introDesc, {
          type: "words",
          wordsClass: "intro-desc-word",
        });

        gsap.set(descSplit.words, {
          opacity: 0,
          y: 30,
          filter: "blur(4px)",
        });

        gsap.to(descSplit.words, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          stagger: 0.03,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: introDesc,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }

      cards.forEach((card) => {
        gsap.from(card, {
          y: 100,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      });

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: containerRef }
  );

  return (
    <section className="work" ref={sectionRef}>
      <div className="work-grain"></div>
      <div className="work-container" ref={containerRef}>
        <div className="work-intro">
          <div className="work-intro-label">
            <span className="work-intro-dot"></span>
            <span>Selected Work</span>
          </div>
          <h2 ref={introHeadingRef}>
            Projects that push boundaries
            <br />
            <span className="work-intro-accent">and define experiences</span>
          </h2>
          <p className="work-intro-description">
            A curated collection of work spanning web development, design
            systems, and creative technology. Each project represents a unique
            challenge solved with precision and creativity.
          </p>
        </div>

        <div className="work-cards">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
