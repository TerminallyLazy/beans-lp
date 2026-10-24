import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { PETS } from './native-screen-art';

export default function ProductOverview() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion:no-preference)', () => {
      gsap.from('.overview-reveal', {
        y: 22, autoAlpha: 0, duration: .65, stagger: .08, ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 82%', toggleActions: 'play none none reverse' },
      });
    });
    return () => media.revert();
  }, { scope: root });

  return <section className="beans-overview" ref={root} aria-labelledby="overview-heading">
    <div className="overview-intro overview-reveal">
      <h2 id="overview-heading">Their everyday.<br />All together.</h2>
      <div className="overview-family" aria-hidden="true">
        {PETS.map(pet => <img key={pet.id} src={pet.image} width="150" height="150" alt="" loading="lazy" />)}
      </div>
    </div>
    <div className="overview-features">
      <article className="overview-reveal">
        <h3>One home for every animal.</h3>
        <p>Dogs, cats and horses, each with their own profile. Switch between them in My Pets to see daily logs, care progress and recent records.</p>
      </article>
      <article className="overview-reveal">
        <h3>A little help finding the words.</h3>
        <p>Talk or type with the Beans AI companion, with your selected animal as context. Review a conversation note before choosing to save it.</p>
      </article>
      <article className="overview-reveal">
        <h3>Small moments. A clearer picture.</h3>
        <p>Bring daily logs, your own goals, charts and reviewed care notes together in Organizer. Search past records when you need the details.</p>
      </article>
    </div>
  </section>;
}
