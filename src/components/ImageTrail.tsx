"use client";

import { useEffect, useRef } from "react";

interface ImageTrailProps {
  images?: string[];
  containerSelector?: string;
  cellSize?: number;
}

const ImageTrail = ({
  images: customImages,
  containerSelector = ".hero",
  cellSize = 90,
}: ImageTrailProps) => {
  const trailRef = useRef<{ element: HTMLImageElement; removeTime: number }[]>(
    []
  );
  const animationRef = useRef<number | null>(null);

  const currentColRef = useRef(-1);
  const currentRowRef = useRef(-1);

  const lastMouseXRef = useRef(0);
  const lastMouseYRef = useRef(0);

  const lastStepTimeRef = useRef(0);
  const STEP_COOLDOWN = 60;

  const moveThreshold = 20;

  const isCursorInContainerRef = useRef(false);
  const isInitializedRef = useRef(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const trailContainerRef = useRef<HTMLDivElement | null>(null);

  const gridColumnsRef = useRef(1);
  const gridRowsRef = useRef(1);

  const config = {
    imageLifespan: 750,
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

    const updateGridDimensions = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      gridColumnsRef.current = Math.max(1, Math.floor(rect.width / cellSize));
      gridRowsRef.current = Math.max(1, Math.floor(rect.height / cellSize));
    };

    updateGridDimensions();
    window.addEventListener("resize", updateGridDimensions);

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

    const getInitialCell = (clientX: number, clientY: number) => {
      if (!containerRef.current) return { col: 0, row: 0 };

      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;

      const col = Math.floor(relativeX / cellSize);
      const row = Math.floor(relativeY / cellSize);

      return {
        col: Math.max(0, Math.min(col, gridColumnsRef.current - 1)),
        row: Math.max(0, Math.min(row, gridRowsRef.current - 1)),
      };
    };

    const getCellCenter = (col: number, row: number) => {
      return {
        x: (col + 0.5) * cellSize,
        y: (row + 0.5) * cellSize,
      };
    };

    const createImage = (col: number, row: number) => {
      if (
        !containerRef.current ||
        !trailContainerRef.current ||
        !isCursorInContainerRef.current
      )
        return;

      const img = document.createElement("img");
      img.classList.add("trail-img");

      const randomIndex = Math.floor(Math.random() * images.length);
      img.src = images[randomIndex];

      const { x, y } = getCellCenter(col, row);

      img.style.left = `${x}px`;
      img.style.top = `${y}px`;
      img.style.transform = `translate(-50%, -50%) scale(${config.initialScale})`;
      img.style.opacity = "0";
      img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}, opacity ${config.inDuration}ms ${config.inEasing}`;

      trailContainerRef.current.appendChild(img);

      requestAnimationFrame(() => {
        img.style.transform = `translate(-50%, -50%) scale(1)`;
        img.style.opacity = "1";
      });

      trailRef.current.push({
        element: img,
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
            imgToRemove.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}, opacity ${config.outDuration}ms ${config.outEasing}`;
            imgToRemove.element.style.transform = `translate(-50%, -50%) scale(${config.exitScale})`;
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
      removeOldImages();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const inContainer = isInContainer(e.clientX, e.clientY);
      isCursorInContainerRef.current = inContainer;

      if (!inContainer) {
        isInitializedRef.current = false;
        currentColRef.current = -1;
        currentRowRef.current = -1;
        return;
      }

      if (!isInitializedRef.current) {
        const { col, row } = getInitialCell(e.clientX, e.clientY);
        currentColRef.current = col;
        currentRowRef.current = row;
        lastMouseXRef.current = e.clientX;
        lastMouseYRef.current = e.clientY;
        isInitializedRef.current = true;
        createImage(col, row);
        return;
      }

      const now = performance.now();
      if (now - lastStepTimeRef.current < STEP_COOLDOWN) return;

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      const targetCol = Math.floor(relativeX / cellSize);
      const targetRow = Math.floor(relativeY / cellSize);

      const clampedTargetCol = Math.max(
        0,
        Math.min(targetCol, gridColumnsRef.current - 1)
      );
      const clampedTargetRow = Math.max(
        0,
        Math.min(targetRow, gridRowsRef.current - 1)
      );

      if (
        clampedTargetCol === currentColRef.current &&
        clampedTargetRow === currentRowRef.current
      )
        return;

      currentColRef.current = clampedTargetCol;
      currentRowRef.current = clampedTargetRow;
      lastStepTimeRef.current = now;
      createImage(clampedTargetCol, clampedTargetRow);
    };

    document.addEventListener("mousemove", handleMouseMove);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", updateGridDimensions);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      trailRef.current.forEach((item) => {
        if (item.element && item.element.parentNode) {
          item.element.parentNode.removeChild(item.element);
        }
      });
      trailRef.current = [];
    };
  }, [containerSelector, customImages, cellSize]);

  return null;
};

export default ImageTrail;
