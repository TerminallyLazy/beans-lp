import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { FilmCompositor, type FilmSource } from './film-compositor';
import type { CachedFilm } from './cached-film';
import type { PhoneRear } from './phone-rear';
import { createNativeScreenArt, PETS } from './native-screen-art';
import { createStoryClock, storyFrame, type AppScreen, type Pet } from './story-clock';
import { inverseProjection, projectPoint, screenProjection, type ScreenQuad } from './screen-projection';
import { mobileFraming } from './mobile-framing';
import { decodedPresentation, phoneFace } from './frame-presentation';
import ProductOverview from './ProductOverview';
import { filmViewport } from './film-viewport';
import './encounter-landing.css';

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText);
const BETA = 'https://testflight.apple.com/join/7WSeN4VB';
type Track = { width: number; height: number; fps: number; frame_count: number; frames: (ScreenQuad | null)[]; faces: ('app' | 'case')[]; scenes: { id: string; start_frame: number; frames: number }[] };
type Loaded = { compositor: FilmCompositor; screens: Record<AppScreen, HTMLImageElement>; track: Track; ending: HTMLImageElement; cache?: CachedFilm };
type Delights = ReturnType<typeof import('./story-delights').createStoryDelights>;
const image = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const target = new Image(); target.onload = () => resolve(target); target.onerror = reject; target.src = src;
});
const fitFilmSurface = (surface: HTMLCanvasElement) => {
  const rect = surface.getBoundingClientRect();
  const ratio = Math.min(devicePixelRatio, 2, Math.sqrt(4_194_304 / Math.max(1, rect.width * rect.height)));
  const width = Math.max(1, Math.round(rect.width * ratio)), height = Math.max(1, Math.round(rect.height * ratio));
  if (surface.width !== width) surface.width = width;
  if (surface.height !== height) surface.height = height;
};

export default function EncounterLanding({ stillFrame = false }: { stillFrame?: boolean }) {
  const root = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null), film = useRef<HTMLVideoElement>(null);
  const scrollWrapper = useRef<HTMLDivElement>(null), scrollContent = useRef<HTMLDivElement>(null);
  const smoother = useRef<ScrollSmoother | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null), wildlife = useRef<HTMLCanvasElement>(null), heading = useRef<HTMLHeadingElement>(null);
  const delights = useRef<Delights | null>(null), updateArt = useRef<(() => void) | null>(null);
  const selected = useRef<Pet | null>(null), state = useRef(storyFrame(0));
  const audio = useRef<AudioContext | null>(null), sound = useRef(false), taps = useRef(0);
  const ambientPaused = useRef(false), sectionActive = useRef(true);
  const [loaded, setLoaded] = useState<Loaded>(), [unavailable, setUnavailable] = useState(false);
  const [atEnd, setAtEnd] = useState(false), [soundOn, setSoundOn] = useState(false), [activePet, setActivePet] = useState<Pet | null>(null);
  const [effectsPaused, setEffectsPaused] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    const video = film.current!, surface = canvas.current!, controller = new AbortController();
    const staticView = stillFrame || matchMedia('(prefers-reduced-motion:reduce)').matches;
    let cancelled = false, compositor: FilmCompositor | undefined, cache: CachedFilm | undefined, rear: PhoneRear | undefined;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const displayedFilmWidth = Math.max(innerWidth, innerHeight * 960 / 544) * Math.min(devicePixelRatio, 2);
    let hd = !staticView && displayedFilmWidth > 960 && !connection?.saveData && !['slow-2g','2g','3g'].includes(connection?.effectiveType || '');
    let rejectMedia: (error: Error) => void = () => {};
    const loadVideo = () => new Promise<void>((resolve, reject) => {
      rejectMedia = reject;
      video.addEventListener('loadeddata', () => resolve(), { once: true, signal: controller.signal });
      video.src = `/assets/story/${hd ? 'journey-hd' : 'journey'}.mp4`;
      video.preload = 'auto';
      video.load();
    });
    const mediaReady = staticView ? Promise.resolve() : import('./cached-film').then(async ({ CachedFilm }) => {
      cache = await CachedFilm.open(hd ? 'journey-hd' : 'journey', controller.signal);
    }).catch(() => { if (!cancelled) return loadVideo(); });
    Promise.all([
      fetch('/assets/story/journey-track.json', { signal: controller.signal }).then(r => { if (!r.ok) throw new Error('Story tracking unavailable'); return r.json() as Promise<Track>; }),
      createNativeScreenArt(), image('/assets/story/journey-end.webp'),
      import('./phone-rear').then(({ PhoneRear }) => {
        const model = new PhoneRear();
        if (cancelled) { model.dispose(); return undefined; }
        rear = model; return model;
      }).catch(() => undefined), mediaReady, document.fonts.ready,
    ]).then(([track, screens, ending, rear]) => {
      if (cancelled) return;
      if (track.frames.length !== track.frame_count || track.faces.length !== track.frame_count || track.fps <= 0) throw new Error('Incomplete story tracking');
      createStoryClock(track);
      fitFilmSurface(surface);
      compositor = new FilmCompositor(surface, screens.welcome, rear);
      root.current!.dataset.phoneRender = rear ? 'geometry' : 'source';
      const rect = surface.getBoundingClientRect();
      compositor.setViewport(filmViewport(rect.width, rect.height, track.width, track.height));
      compositor.draw(staticView ? ending : cache?.get(0) || video, staticView ? track.frames.at(-1) || null : track.frames[0]); setLoaded({ track, screens, compositor, ending, cache });
    }).catch(() => { if (!cancelled) setUnavailable(true); });
    const lost = () => setUnavailable(true);
    const mediaError = () => {
      if (hd) { hd = false; video.src = '/assets/story/journey.mp4'; video.load(); return; }
      rejectMedia(new Error('Story video unavailable.')); lost();
    };
    surface.addEventListener('webglcontextlost', lost);
    video.addEventListener('error', mediaError, { signal: controller.signal });
    return () => { cancelled = true; controller.abort(); cache?.dispose(); if (compositor) compositor.dispose(); else rear?.dispose(); video.pause(); surface.removeEventListener('webglcontextlost', lost); audio.current?.close(); };
  }, [stillFrame]);

  useGSAP(() => {
    if (!loaded || unavailable || skipped) return;
    const { compositor, screens, track, ending } = loaded, video = film.current!, surface = canvas.current!, element = root.current!, story = createStoryClock(track);
    const firstPhoneTime = track.frames.findIndex(Boolean) / track.fps;
    // A late media load must not pull someone back into the story after they
    // have already scrolled to the beta section.
    if (scrollY >= element.offsetTop + stage.current!.offsetHeight) { setSkipped(true); return; }
    const familyStart = track.scenes[4].start_frame;
    let still = false, requested = 0, lastArt = '', disposed = false, active = true;
    let cached = Boolean(loaded.cache);
    element.dataset.decoder = cached ? 'frame-cache' : 'video-seek';
    let decoding = state.current, presented = state.current, presentedFrame = 0;
    const draw = (source?: FilmSource, decodedFrame?: number) => {
      if (document.hidden || disposed) return;
      const began = performance.now();
      if (still) { presented = state.current; presentedFrame = track.frame_count - 1; }
      else if (source) presentedFrame = decodedFrame ?? Math.min(track.frame_count - 1, Math.max(0, Math.round(video.currentTime * track.fps)));
      const frame = presentedFrame;
      const key: AppScreen = selected.current && presented.index === 4 ? `${selected.current}-activity` : presented.screen;
      if (key !== lastArt) { compositor.setScreen(screens[key]); lastArt = key; }
      const face = phoneFace(frame, track.fps, familyStart, track.frames[frame], track.faces);
      let screenOpacity = 1;
      if (!still) for (let prior = 1; prior <= 3; prior++) {
        if (!track.frames[frame - prior]) screenOpacity = Math.min(screenOpacity, prior / 4);
        if (frame + prior < track.frame_count && !track.frames[frame + prior]) screenOpacity = Math.min(screenOpacity, prior / 4);
      }
      const rect = surface.getBoundingClientRect();
      let position = .5;
      if (matchMedia('(max-width:700px)').matches) {
        const visibleWidth = Math.min(1, rect.width / Math.max(rect.width, rect.height * track.width / track.height));
        const quad = track.frames[frame];
        const phoneX = quad ? quad.reduce((sum, point) => sum + point[0], 0) / 4 : .55;
        const focus = mobileFraming(presented, phoneX, firstPhoneTime);
        position = Math.max(0, Math.min(1, (focus - visibleWidth / 2) / Math.max(.001, 1 - visibleWidth)));
      }
      compositor.setViewport(filmViewport(rect.width, rect.height, track.width, track.height, position));
      if (still) compositor.draw(ending, track.frames.at(-1) || null);
      else if (source) compositor.draw(source, track.frames[frame], screenOpacity, face);
      else compositor.redraw(track.frames[frame], screenOpacity, face);
      element.dataset.frame = String(frame); element.dataset.screen = key;
      element.dataset.renderMs = (performance.now()-began).toFixed(1);
      element.dataset.screenTracked = track.frames[frame] ? 'true' : 'false';
      element.dataset.phoneFace = face; element.dataset.chapter = presented.shot;
      const end = presented.time >= story.duration - 5;
      setAtEnd(previous => previous === end ? previous : end);
    };
    const seek = () => {
      if (still || disposed) return;
      if (cached && loaded.cache) {
        const frame = Math.max(0, Math.min(track.frame_count - 1, Math.round(requested * track.fps)));
        const picture = loaded.cache.nearest(frame);
        element.dataset.cachedFrames = String(loaded.cache.size);
        element.dataset.decodeMs = loaded.cache.decodeMs.toFixed(1);
        if (picture) {
          presented = story.forFilmFrame(picture.frame, state.current);
          draw(picture.image, picture.frame);
        }
        return;
      }
      if (video.seeking || video.readyState < 2) return;
      if (Math.abs(video.currentTime - requested) > .49 / track.fps) { decoding = state.current; video.currentTime = requested; }
      else { presented = state.current; draw(video); }
    };
    if (loaded.cache) {
      loaded.cache.onFrames = seek;
      loaded.cache.onUnavailable = () => {
        if (disposed) return;
        cached = false; element.dataset.decoder = 'video-seek'; loaded.cache?.dispose();
        video.src = loaded.cache!.index.media; video.preload = 'auto'; video.load();
      };
    }
    const seeked = () => {
      if (disposed || video.seeking || video.readyState < 2) return;
      const completed = decodedPresentation(state.current, decoding, video.currentTime, track.fps);
      // Present each completed decode immediately with its own UI and framing.
      // Chasing only the newest target starves rendering during continuous scroll.
      if (completed) { presented = completed; draw(video); }
      seek();
    };
    const resize = new ResizeObserver(() => { fitFilmSurface(surface); draw(); });
    resize.observe(surface);
    const visibility = () => { if (!document.hidden) { draw(); seek(); } else audio.current?.suspend(); };
    const update = (time: number) => {
      state.current = story.frame(time);
      // Seek to presentation timestamps so the decoded picture and its measured
      // phone plane always use the same frame, even during a fast reverse scroll.
      requested = Math.round(state.current.filmTime * track.fps) / track.fps;
      element.dataset.targetFrame = String(Math.round(requested * track.fps));
      if (state.current.index !== 4 && selected.current) { selected.current = null; setActivePet(null); }
      element.style.setProperty('--story-progress', String(state.current.progress));
      element.dataset.targetChapter = state.current.shot; delights.current?.setProgress(state.current.progress);
      seek();
    };
    updateArt.current = () => draw(); video.addEventListener('seeked', seeked); video.addEventListener('loadeddata', seeked); document.addEventListener('visibilitychange', visibility);
    const mm = gsap.matchMedia();
    mm.add({ reduced: '(prefers-reduced-motion: reduce)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
      still = stillFrame || Boolean(context.conditions?.reduced); element.dataset.motion = still ? 'reduced' : 'scroll';
      if (still) {
        update(story.duration); delights.current?.setEnabled(false); draw(); return;
      }
      if (!cached && video.readyState < 2) { video.preload = 'auto'; video.load(); }
      // Filter the page and its story together. A second numeric film scrub
      // would leave the picture catching up after the pinned stage has moved.
      const smooth = ScrollSmoother.create({ wrapper: scrollWrapper.current!, content: scrollContent.current!,
        smooth: 1.1, ease: 'sine.out', smoothTouch: .12, effects: false });
      smoother.current = smooth;
      element.dataset.scrollSystem = 'gsap-smoother';
      let cancelled = false;
      import('./story-delights').then(({ createStoryDelights }) => {
        if (!cancelled) { try { delights.current = createStoryDelights(wildlife.current!); delights.current.setEnabled(active && !ambientPaused.current); } catch { /* Film and native app stay available without foreground WebGL. */ } }
      });
      const clock = { time: 0 };
      const timeline = gsap.timeline({ scrollTrigger: {
        id: 'beans-encounter-story', trigger: element, pin: stage.current, start: 'top top',
        end: () => `+=${Math.max(8000, innerHeight * 12)}`, scrub: true, invalidateOnRefresh: true,
        onToggle: self => { active = self.isActive; sectionActive.current = active; delights.current?.setEnabled(active && !ambientPaused.current); },
      }});
      timeline.addLabel('a-little-closer', 0).to(clock, { time: story.duration, duration: story.duration, ease: 'none', onUpdate: () => update(clock.time) }, 0);
      timeline.addLabel('meet-cleo', story.labels.kitten).addLabel('meet-willow', story.labels.puppy).addLabel('meet-bert', story.labels.pony).addLabel('together', story.labels.family);
      const split = SplitText.create(heading.current!, { type: 'words', aria: 'auto' });
      timeline.to(split.words, { opacity: 0, yPercent: -30, stagger: .1, duration: 1.8, ease: 'sine.in' }, .5);
      timeline.to(stage.current, { '--opening-shade': 0, duration: 1.8 }, .5);
      timeline.to('.story-scroll-cue', { autoAlpha: 0, duration: .6 }, .3);
      update(0);
      return () => { cancelled = true; split.revert(); delights.current?.dispose(); delights.current = null; smooth.kill(); smoother.current = null; };
    });
    ScrollTrigger.refresh();
    return () => { disposed = true; if (loaded.cache) { loaded.cache.onFrames = undefined; loaded.cache.onUnavailable = undefined; } resize.disconnect(); mm.revert(); element.style.removeProperty('--story-progress'); updateArt.current = null; video.removeEventListener('seeked', seeked); video.removeEventListener('loadeddata', seeked); document.removeEventListener('visibilitychange', visibility); video.pause(); };
  }, { scope: root, dependencies: [loaded, unavailable, stillFrame, skipped], revertOnUpdate: true });

  const chime = () => {
    if (!sound.current) return;
    const context = audio.current || new AudioContext(); audio.current = context; void context.resume();
    [659.25, 783.99, 987.77].forEach((hz, i) => {
      const oscillator = context.createOscillator(), gain = context.createGain(), now = context.currentTime + i * .09;
      oscillator.type = 'sine'; oscillator.frequency.value = hz; gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(.035, now + .03); gain.gain.exponentialRampToValueAtTime(.001, now + .7);
      oscillator.connect(gain).connect(context.destination); oscillator.start(now); oscillator.stop(now + .75);
    });
  };
  const flourish = () => { delights.current?.flourish(); chime(); };
  const toggleEffects = () => {
    ambientPaused.current = !ambientPaused.current; setEffectsPaused(ambientPaused.current);
    delights.current?.setEnabled(sectionActive.current && !ambientPaused.current);
  };
  const choose = (pet: Pet) => { selected.current = pet; setActivePet(pet); updateArt.current?.(); flourish(); };
  const phoneTap = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!loaded || state.current.index !== 4 || root.current?.dataset.phoneFace === 'case') return;
    const frame = root.current?.dataset.motion === 'reduced' ? loaded.track.frame_count - 1 : Number(root.current?.dataset.frame || 0);
    const quad = loaded.track.frames[frame], plane = quad && screenProjection(quad), inverse = plane && inverseProjection(plane);
    if (!inverse) return;
    const rect = event.currentTarget.getBoundingClientRect(), crop = loaded.compositor.getViewport();
    const x = crop[0] + (event.clientX - rect.left) / rect.width * crop[2];
    const y = crop[1] + (event.clientY - rect.top) / rect.height * crop[3];
    const point = projectPoint(inverse, [x, y]);
    if (point[0] < 0 || point[0] > 1 || point[1] < 0 || point[1] > 1) return;
    const current = selected.current || state.current.screen;
    choose(PETS[(PETS.findIndex(p => current.startsWith(p.id)) + 1) % PETS.length].id);
  };
  const goHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (smoother.current) smoother.current.scrollTo(0, false);
    else scrollTo(0, 0);
    setSkipped(false);
  };

  return <>
    <a className="skip-link" href="#join" onClick={() => { ScrollTrigger.getById('beans-encounter-story')?.kill(true); smoother.current?.kill(); setSkipped(true); }}>Skip the story</a>
    <div className="encounter-scroll-wrapper" ref={scrollWrapper}><div ref={scrollContent}>
    <main className="encounter-story" id="hero" data-ready={Boolean(loaded && !unavailable && !skipped) || undefined} data-snapshot={stillFrame || undefined} data-fallback={unavailable || undefined} ref={root}>
      <div className="encounter-stage" ref={stage}>
        <header className="encounter-header">
          <a href="#hero" className="encounter-brand" aria-label="Beans home" onClick={event => { goHome(event); if (++taps.current % 3 === 0) flourish(); }}><img src="/assets/beans-logo-light.webp" alt="Beans" width="142" height="38" /></a>
          <a className="quiet-beta" href={BETA}>Join the beta <span aria-hidden="true">↗</span></a>
        </header>
        <div className="encounter-picture">
          <video className="story-video-source" ref={film} preload="none" muted playsInline aria-hidden="true" />
          <canvas ref={canvas} onPointerDown={phoneTap} className="story-film" role="img" aria-hidden={!loaded || unavailable || skipped} aria-label="The Beans Human meets a playful kitten, a puppy with a ball, and a pony. They join his family in the Beans app and walk together." />
          {(!loaded || unavailable || skipped) && <picture><source media="(prefers-reduced-motion:reduce)" srcSet="/assets/story/journey-poster.webp" /><img className="story-poster" src="/assets/story/journey-start.webp" alt="Beans characters on a sunlit meadow path." /></picture>}
        </div>
        <canvas className="story-wildlife" ref={wildlife} aria-hidden="true" />
        <h1 className="story-opening" ref={heading}>A little closer.<br />Better cared for.</h1>
        <div className="story-scroll-cue" aria-hidden="true"><span />Scroll to wander</div>
        {atEnd && <div className="story-pet-choices" role="group" aria-label="Explore each pet in the Beans app">
          {PETS.map(pet => <button key={pet.id} onClick={() => choose(pet.id)} aria-pressed={activePet === pet.id}><img src={pet.image} alt="" />{pet.name}</button>)}
        </div>}
        <div className="story-play-controls">
          <button className="butterfly-invitation" aria-label="Invite the butterflies" onClick={flourish}><svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 17C5-3 0 9 6 17c-7 8 7 15 12 3C23 32 37 25 30 17c6-8 1-20-12 0Z" fill="currentColor" /><path d="M18 12v13" stroke="#805b43" strokeWidth="2" /></svg></button>
          <button aria-label={effectsPaused ? 'Resume butterflies' : 'Pause butterflies'} aria-pressed={effectsPaused} onClick={toggleEffects}><svg viewBox="0 0 24 24" aria-hidden="true">{effectsPaused ? <path d="m8 5 11 7-11 7Z" fill="currentColor" /> : <path d="M8 5v14m8-14v14" fill="none" stroke="currentColor" strokeWidth="2" />}</svg></button>
          <button aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'} aria-pressed={soundOn} onClick={() => { sound.current = !sound.current; setSoundOn(sound.current); if (sound.current) chime(); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5 5 9H2v6h3l5 4V5Zm4 3c3 2 3 6 0 8m3-11c5 4 5 10 0 14" fill="none" stroke="currentColor" strokeWidth="1.5" />{!soundOn && <path d="m3 3 18 18" stroke="currentColor" strokeWidth="1.5" />}</svg></button>
        </div>
        <div className="story-progress" aria-hidden="true" />
      </div>
    </main>
    <ProductOverview />
    <div className="beans-finish">
    <section className="join-beans" id="join" aria-labelledby="join-heading" tabIndex={-1}>
      <div className="join-copy"><h2 id="join-heading">Life’s better<br />with Beans.</h2>
        <a className="beta-link" href={BETA}>Join the iPhone beta <span aria-hidden="true">↗</span></a>
        <a className="testflight-help" href="https://testflight.apple.com/"><img src="/assets/story/apple-testflight.png" width="24" height="24" alt="" />Available through Apple TestFlight</a>
      </div>
      <a className="beta-qr" href={BETA} aria-label="Open the Beans public beta"><img src="/assets/story/beans-public-beta-qr.svg" alt="QR code for the Beans public beta" width="132" height="132" /></a>
    </section>
    <footer className="beans-footer"><a href="#hero" aria-label="Beans home" onClick={goHome}><img src="/assets/beans-logo-light.webp" alt="Beans" width="111" height="30" /></a>
      <nav aria-label="Footer"><a href="mailto:contact@petswithbeans.com">Contact</a><a href="https://beans-api-omega.vercel.app/support">Support</a><a href="https://beans-api-omega.vercel.app/privacy">Privacy</a></nav>
      <small>© {new Date().getFullYear()} Beans</small>
    </footer>
    </div>
    </div></div>
  </>;
}
