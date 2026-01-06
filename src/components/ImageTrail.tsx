"use client";

import { useEffect, useRef } from "react";

interface ImageTrailProps {
  images?: string[];
  containerSelector?: string;
}

const ImageTrail = ({
  images: customImages,
  containerSelector = ".hero",
}: ImageTrailProps) => {
  const trailRef = useRef<
    { element: HTMLImageElement; rotation: number; removeTime: number }[]
  >([]);
  const animationRef = useRef<number | null>(null);

  // Mouse position refs
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const prevMouseXRef = useRef(0);
  const prevMouseYRef = useRef(0);

  // Lerped (lagged) position refs
  const lerpedXRef = useRef(0);
  const lerpedYRef = useRef(0);

  // Velocity tracking
  const lastTimeRef = useRef(performance.now());
  const velocityRef = useRef(0);

  // Spawn control
  const lastSpawnTimeRef = useRef(0);
  const isCursorInContainerRef = useRef(false);

  const containerRef = useRef<HTMLElement | null>(null);
  const trailContainerRef = useRef<HTMLDivElement | null>(null);

  // Config
  const config = {
    imageLifespan: 750,
    removalDelay: 50,
    velocityThreshold: 0.08,
    spawnInterval: 60,
    lerpFactor: 0.15,
    inDuration: 400,
    outDuration: 600,
    inEasing: "cubic-bezier(.07,.5,.5,1)",
    outEasing: "cubic-bezier(.87, 0, .13, 1)",
    initialScale: 0.85,
    exitScale: 0.7,
  };

  useEffect(() => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) {
      console.error(`Container with selector '${containerSelector}' not found`);
      return;
    }

    containerRef.current = container;

    // Create trail images container if not exists
    let trailContainer = container.querySelector(
      ".image-trail-container"
    ) as HTMLDivElement;
    if (!trailContainer) {
      trailContainer = document.createElement("div");
      trailContainer.className = "image-trail-container";
      container.appendChild(trailContainer);
    }
    trailContainerRef.current = trailContainer;

    const images =
      customImages ||
      Array.from({ length: 35 }, (_, i) => `/assets/img${i + 1}.jpeg`);

    const isInContainer = (x: number, y: number) => {
      if (!containerRef.current) return false;
      const rect = containerRef.current.getBoundingClientRect();
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    };

    const createImage = () => {
      if (
        !containerRef.current ||
        !trailContainerRef.current ||
        !isCursorInContainerRef.current
      )
        return;

      const img = document.createElement("img");
      img.classList.add("trail-img");

      const randomIndex = Math.floor(Math.random() * images.length);
      const rotation = (Math.random() - 0.5) * 50;
      img.src = images[randomIndex];

      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = lerpedXRef.current - rect.left;
      const relativeY = lerpedYRef.current - rect.top;

      // Initial state: slightly smaller and transparent
      img.style.left = `${relativeX}px`;
      img.style.top = `${relativeY}px`;
      img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${config.initialScale})`;
      img.style.opacity = "0";
      img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}, opacity ${config.inDuration}ms ${config.inEasing}`;

      trailContainerRef.current.appendChild(img);

      // Animate in: scale to 1 and fade in
      requestAnimationFrame(() => {
        img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
        img.style.opacity = "1";
      });

      trailRef.current.push({
        element: img,
        rotation: rotation,
        removeTime: Date.now() + config.imageLifespan,
      });
    };

    const removeOldImages = () => {
      const now = Date.now();

      while (trailRef.current.length > 0) {
        const oldestImage = trailRef.current[0];
        if (now >= oldestImage.removeTime) {
          const imgToRemove = trailRef.current.shift();

          if (imgToRemove) {
            // Animate out: scale down and fade out
            imgToRemove.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}, opacity ${config.outDuration}ms ${config.outEasing}`;
            imgToRemove.element.style.transform = `translate(-50%, -50%) rotate(${imgToRemove.rotation}deg) scale(${config.exitScale})`;
            imgToRemove.element.style.opacity = "0";

            setTimeout(() => {
              if (imgToRemove.element.parentNode) {
                imgToRemove.element.parentNode.removeChild(imgToRemove.element);
              }
            }, config.outDuration);
          }
        } else {
          break;
        }
      }
    };

    const animate = () => {
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Lerp the trail position toward the actual cursor
      lerpedXRef.current +=
        (mouseXRef.current - lerpedXRef.current) * config.lerpFactor;
      lerpedYRef.current +=
        (mouseYRef.current - lerpedYRef.current) * config.lerpFactor;

      // Calculate velocity based on mouse delta
      const dx = mouseXRef.current - prevMouseXRef.current;
      const dy = mouseYRef.current - prevMouseYRef.current;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Velocity = distance per millisecond, normalized
      velocityRef.current = deltaTime > 0 ? distance / deltaTime : 0;

      // Update previous mouse position
      prevMouseXRef.current = mouseXRef.current;
      prevMouseYRef.current = mouseYRef.current;

      // Spawn images only when velocity exceeds threshold
      const currentTime = Date.now();
      if (
        velocityRef.current > config.velocityThreshold &&
        isCursorInContainerRef.current &&
        currentTime - lastSpawnTimeRef.current > config.spawnInterval
      ) {
        createImage();
        lastSpawnTimeRef.current = currentTime;
      }

      // Remove old images
      removeOldImages();

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;
      isCursorInContainerRef.current = isInContainer(e.clientX, e.clientY);
    };

    // Initialize lerped position on first mouse move
    const setInitialMousePos = (event: MouseEvent) => {
      mouseXRef.current = event.clientX;
      mouseYRef.current = event.clientY;
      prevMouseXRef.current = event.clientX;
      prevMouseYRef.current = event.clientY;
      lerpedXRef.current = event.clientX;
      lerpedYRef.current = event.clientY;
      isCursorInContainerRef.current = isInContainer(
        event.clientX,
        event.clientY
      );
      document.removeEventListener("mousemove", setInitialMousePos);
    };

    document.addEventListener("mousemove", setInitialMousePos, { once: true });
    document.addEventListener("mousemove", handleMouseMove);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      trailRef.current.forEach((item) => {
        if (item.element && item.element.parentNode) {
          item.element.parentNode.removeChild(item.element);
        }
      });
      trailRef.current = [];
    };
  }, [containerSelector, customImages]);

  return null;
};

export default ImageTrail;
