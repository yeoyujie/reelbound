"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type HomeHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  scrollLabel: string;
  videoLabel: string;
  poster: string;
};

export function HomeHero({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  scrollLabel,
  videoLabel,
  poster,
}: HomeHeroProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [motionAllowed, setMotionAllowed] = useState<boolean | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const updateMotionPreference = () => setMotionAllowed(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const video = videoRef.current;
    if (!hero || !video || !motionAllowed) return;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video.play().catch(() => setVideoFailed(true));
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );

    visibilityObserver.observe(hero);
    return () => {
      visibilityObserver.disconnect();
      // Cache Components hides left routes with `display: none`, which does not
      // stop media playback.
      video.pause();
    };
  }, [motionAllowed]);

  return (
    <section className="home-hero" aria-labelledby="home-hero-title" ref={heroRef}>
      <div className="home-hero-media" aria-hidden="true">
        {motionAllowed === false || videoFailed ? (
          <Image
            alt=""
            className="home-hero-poster"
            fill
            priority
            sizes="(max-width: 600px) calc(100vw - 40px), min(100vw - 96px, 1600px)"
            src={poster}
          />
        ) : null}
        {motionAllowed === true && !videoFailed ? (
          <video
            autoPlay
            className="home-hero-video"
            loop
            muted
            playsInline
            preload="metadata"
            ref={videoRef}
            onError={() => setVideoFailed(true)}
            aria-label={videoLabel}
          >
            <source src="/videos/series/bei-cai-diao-de-nv-hai.mp4" type="video/mp4" />
          </video>
        ) : null}
        <span className="home-hero-vignette" />
      </div>

      <div className="home-hero-content">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="home-hero-title">{title}</h1>
        <p className="home-hero-copy">{description}</p>
        <Link className="home-hero-action" href={actionHref}>
          {actionLabel} <span aria-hidden="true">↗</span>
        </Link>
      </div>

      <a className="home-hero-scroll" href="#series">
        <span>{scrollLabel}</span>
        <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
