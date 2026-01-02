"use client";

import React, { useRef, useEffect, useState } from "react";
import Matter from "matter-js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./Skills.css";

gsap.registerPlugin(ScrollTrigger);

interface Skill {
  name: string;
  category:
    | "language"
    | "framework"
    | "animation"
    | "web3"
    | "tool"
    | "backend";
}

const skills: Skill[] = [
  // Core Languages
  { name: "JavaScript", category: "language" },
  { name: "TypeScript", category: "language" },
  { name: "HTML", category: "language" },
  { name: "CSS", category: "language" },
  { name: "SCSS", category: "language" },

  // Frameworks & Libraries
  { name: "React", category: "framework" },
  { name: "Next.js", category: "framework" },
  { name: "Vue.js", category: "framework" },
  { name: "Nuxt.js", category: "framework" },

  // Animation & Creative
  { name: "GSAP", category: "animation" },
  { name: "Three.js", category: "animation" },
  { name: "WebGL", category: "animation" },
  { name: "Framer Motion", category: "animation" },
  { name: "Lenis", category: "animation" },

  // UI & Styling
  { name: "TailwindCSS", category: "framework" },
  { name: "Bootstrap", category: "framework" },
  { name: "Material UI", category: "framework" },
  { name: "Chakra UI", category: "framework" },

  // Backend & Tools
  { name: "Node.js", category: "backend" },
  { name: "Firebase", category: "backend" },
  { name: "Sanity", category: "backend" },
  { name: "Supabase", category: "backend" },
  { name: "GraphQL", category: "backend" },

  // Web3
  { name: "Solidity", category: "web3" },
  { name: "Thirdweb", category: "web3" },
  { name: "Ethers.js", category: "web3" },
  { name: "Wagmi", category: "web3" },

  // Tools
  { name: "Git", category: "tool" },
  { name: "Figma", category: "tool" },
  { name: "Vercel", category: "tool" },
  { name: "Docker", category: "tool" },
];

interface BodyData {
  body: Matter.Body;
  element: HTMLDivElement;
  width: number;
  height: number;
}

const Skills: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const skillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const bodiesRef = useRef<BodyData[]>([]);
  const [isPhysicsActive, setIsPhysicsActive] = useState(false);
  const hasInitialized = useRef(false);

  const config = {
    gravity: { x: 0, y: 1 },
    restitution: 0.4,
    friction: 0.1,
    frictionAir: 0.015,
    density: 0.001,
    wallThickness: 200,
    mouseStiffness: 0.6,
  };

  const clamp = (val: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, val));
  };

  const initPhysics = () => {
    if (!containerRef.current || hasInitialized.current) return;
    hasInitialized.current = true;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Ensure container has valid dimensions
    if (containerRect.width === 0 || containerRect.height === 0) {
      hasInitialized.current = false;
      return;
    }

    engineRef.current = Matter.Engine.create();
    engineRef.current.gravity.x = config.gravity.x;
    engineRef.current.gravity.y = config.gravity.y;
    engineRef.current.gravity.scale = 0.001;
    engineRef.current.constraintIterations = 10;
    engineRef.current.positionIterations = 20;
    engineRef.current.velocityIterations = 16;

    const wallThickness = config.wallThickness;

    // Create walls (bottom, left, right)
    const walls = [
      Matter.Bodies.rectangle(
        containerRect.width / 2,
        containerRect.height + wallThickness / 2,
        containerRect.width + wallThickness * 2,
        wallThickness,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        -wallThickness / 2,
        containerRect.height / 2,
        wallThickness,
        containerRect.height + wallThickness * 2,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        containerRect.width + wallThickness / 2,
        containerRect.height / 2,
        wallThickness,
        containerRect.height + wallThickness * 2,
        { isStatic: true }
      ),
    ];

    Matter.World.add(engineRef.current.world, walls);

    // Create physics bodies for each skill with staggered drops
    const validSkills = skillRefs.current.filter((el) => el !== null);

    validSkills.forEach((skillEl, index) => {
      if (!skillEl) return;

      const skillRect = skillEl.getBoundingClientRect();

      // Skip if element has no dimensions yet
      if (skillRect.width === 0 || skillRect.height === 0) return;

      // Spread skills across the width and stagger vertically
      const columns = 6;
      const column = index % columns;
      const row = Math.floor(index / columns);

      const columnWidth = containerRect.width / columns;
      const startX = columnWidth * column + columnWidth / 2;
      const startY = -200 - row * 150 - Math.random() * 100;
      const startRotation = (Math.random() - 0.5) * Math.PI * 0.3;

      const body = Matter.Bodies.rectangle(
        startX,
        startY,
        skillRect.width,
        skillRect.height,
        {
          restitution: config.restitution,
          friction: config.friction,
          frictionAir: config.frictionAir,
          density: config.density,
          chamfer: { radius: 25 },
        }
      );

      Matter.Body.setAngle(body, startRotation);

      bodiesRef.current.push({
        body,
        element: skillEl,
        width: skillRect.width,
        height: skillRect.height,
      });

      Matter.World.add(engineRef.current!.world, body);
    });

    // Add top wall after delay
    setTimeout(() => {
      if (!engineRef.current) return;
      const topWall = Matter.Bodies.rectangle(
        containerRect.width / 2,
        -config.wallThickness / 2,
        containerRect.width + config.wallThickness * 2,
        config.wallThickness,
        { isStatic: true }
      );
      Matter.World.add(engineRef.current.world, topWall);
    }, 3500);

    // Mouse interaction
    const mouse = Matter.Mouse.create(container);
    // Prevent scroll hijacking
    const mouseEl = mouse.element as HTMLElement;
    mouseEl.removeEventListener(
      "wheel",
      (mouse as unknown as { mousewheel: EventListener }).mousewheel
    );

    const mouseConstraint = Matter.MouseConstraint.create(engineRef.current, {
      mouse,
      constraint: {
        stiffness: config.mouseStiffness,
        render: { visible: false },
      },
    });

    mouseConstraint.mouse.element.oncontextmenu = () => false;

    let dragging: Matter.Body | null = null;
    let originalInertia: number | null = null;

    Matter.Events.on(mouseConstraint, "startdrag", (event) => {
      const e = event as unknown as { body: Matter.Body };
      dragging = e.body;
      if (dragging) {
        originalInertia = dragging.inertia;
        Matter.Body.setInertia(dragging, Infinity);
        Matter.Body.setVelocity(dragging, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(dragging, 0);
      }
    });

    Matter.Events.on(mouseConstraint, "enddrag", () => {
      if (dragging) {
        Matter.Body.setInertia(dragging, originalInertia || 1);
        dragging = null;
        originalInertia = null;
      }
    });

    Matter.Events.on(engineRef.current, "beforeUpdate", () => {
      if (dragging) {
        const found = bodiesRef.current.find((b) => b.body === dragging);
        if (found) {
          const minX = found.width / 2;
          const maxX = containerRect.width - found.width / 2;
          const minY = found.height / 2;
          const maxY = containerRect.height - found.height / 2;

          Matter.Body.setPosition(dragging, {
            x: clamp(dragging.position.x, minX, maxX),
            y: clamp(dragging.position.y, minY, maxY),
          });

          Matter.Body.setVelocity(dragging, {
            x: clamp(dragging.velocity.x, -20, 20),
            y: clamp(dragging.velocity.y, -20, 20),
          });
        }
      }
    });

    container.addEventListener("mouseleave", () => {
      (mouseConstraint.constraint as { bodyB: Matter.Body | null }).bodyB =
        null;
      (mouseConstraint.constraint as { pointB: Matter.Vector | null }).pointB =
        null;
    });

    document.addEventListener("mouseup", () => {
      (mouseConstraint.constraint as { bodyB: Matter.Body | null }).bodyB =
        null;
      (mouseConstraint.constraint as { pointB: Matter.Vector | null }).pointB =
        null;
    });

    Matter.World.add(engineRef.current.world, mouseConstraint);

    runnerRef.current = Matter.Runner.create();
    Matter.Runner.run(runnerRef.current, engineRef.current);

    // Update DOM positions
    const updatePositions = () => {
      bodiesRef.current.forEach(({ body, element, width, height }) => {
        const x = clamp(
          body.position.x - width / 2,
          0,
          containerRect.width - width
        );
        const y = clamp(
          body.position.y - height / 2,
          -height * 3,
          containerRect.height - height
        );

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.transform = `rotate(${body.angle}rad)`;
      });

      requestAnimationFrame(updatePositions);
    };
    updatePositions();

    setIsPhysicsActive(true);
  };

  useGSAP(
    () => {
      if (!sectionRef.current || !containerRef.current) return;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          // Small delay to ensure DOM elements are fully rendered
          setTimeout(() => {
            initPhysics();
          }, 100);
        },
      });

      // Animate header
      const heading = sectionRef.current.querySelector(".skills-heading");
      if (heading) {
        gsap.from(heading, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const label = sectionRef.current.querySelector(".skills-label");
      if (label) {
        gsap.from(label, {
          opacity: 0,
          x: -30,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: label,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const subtext = sectionRef.current.querySelector(".skills-subtext");
      if (subtext) {
        gsap.from(subtext, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: subtext,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      }

      return () => {
        if (runnerRef.current) {
          Matter.Runner.stop(runnerRef.current);
        }
        if (engineRef.current) {
          Matter.Engine.clear(engineRef.current);
        }
      };
    },
    { scope: sectionRef }
  );

  return (
    <section className="skills" ref={sectionRef}>
      <div className="skills-grain"></div>

      <div className="skills-header">
        <div className="skills-label">
          <span className="skills-dot"></span>
          <span>Tech Stack</span>
        </div>
        <h2 className="skills-heading">
          Tools of the trade
          <br />
          <span className="skills-accent">crafted into play</span>
        </h2>
        <p className="skills-subtext">
          Drag, toss, and stack the skills. Because why list when you can play?
        </p>
      </div>

      <div className="skills-playground" ref={containerRef}>
        {skills.map((skill, index) => (
          <div
            key={skill.name}
            ref={(el) => {
              skillRefs.current[index] = el;
            }}
            className={`skill-pill skill-${skill.category}`}
            data-category={skill.category}
          >
            <span>{skill.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
