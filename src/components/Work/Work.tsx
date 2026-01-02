"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./Work.css";

gsap.registerPlugin(ScrollTrigger);

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
  return (
    <div className="work-card" id={`work-card-${index + 1}`}>
      <div className="work-card-inner">
        <div className="work-card-content">
          <div className="work-card-header">
            <span className="work-card-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="work-card-year">{project.year}</span>
          </div>
          <h3 className="work-card-title">{project.title}</h3>
          <p className="work-card-description">{project.description}</p>
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

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".work-card");

      // Pin the intro section
      ScrollTrigger.create({
        trigger: cards[0],
        start: "top 15%",
        endTrigger: cards[cards.length - 1],
        end: "top 10%",
        pin: ".work-intro",
        pinSpacing: false,
      });

      // Animate each card
      cards.forEach((card, index) => {
        const isLastCard = index === cards.length - 1;
        const cardInner = card.querySelector(".work-card-inner");

        if (!isLastCard && cardInner) {
          // Pin the card
          ScrollTrigger.create({
            trigger: card,
            start: "top 15%",
            endTrigger: ".work-outro",
            end: "top 65%",
            pin: true,
            pinSpacing: false,
          });

          // Move card up as user scrolls
          gsap.to(cardInner, {
            y: `-${(cards.length - index) * 10}vh`,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 15%",
              endTrigger: ".work-outro",
              end: "top 65%",
              scrub: true,
            },
          });
        }
      });

      // Animate intro heading
      const introHeading = sectionRef.current?.querySelector(
        ".work-intro h2"
      ) as HTMLElement;
      if (introHeading) {
        gsap.from(introHeading, {
          y: 80,
          opacity: 0,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: introHeading,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Animate intro description
      const introDesc = sectionRef.current?.querySelector(
        ".work-intro-description"
      ) as HTMLElement;
      if (introDesc) {
        gsap.from(introDesc, {
          y: 60,
          opacity: 0,
          duration: 1,
          delay: 0.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: introDesc,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Cards entrance animation
      cards.forEach((card, index) => {
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
          <h2>
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
