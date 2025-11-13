import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const AnimatedText = ({ text, className = '', delay = 0.05 }) => {
  const textRef = useRef(null);

  useEffect(() => {
    if (!textRef.current) return;

    const chars = textRef.current.querySelectorAll('.char');
    
    gsap.fromTo(
      chars,
      {
        opacity: 0,
        y: 60,
        rotationX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: delay,
        delay: 0.2,
      }
    );
  }, [delay]);

  return (
    <h1 ref={textRef} className={className} style={{ perspective: '1000px' }}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="char inline-block"
          style={{ 
            display: 'inline-block',
            transformOrigin: '50% 100%',
            transformStyle: 'preserve-3d'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
};

export default AnimatedText;
