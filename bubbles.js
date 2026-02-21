    (() => {
      const trailer = document.querySelector('[data-intro-trailer]');
      const launchButton = document.querySelector('[data-trailer-launch]');
      const trailerContainer = document.querySelector('[data-trailer-container]');
      if (!trailer || !launchButton || !trailerContainer) return;

      let userActivatedSound = false;

      const playMuted = async () => {
        try {
          if (!userActivatedSound) {
            trailer.muted = true;
          }
          const p = trailer.play();
          if (p && typeof p.catch === 'function') {
            await p;
          }
        } catch (err) {
          // ignore autoplay restrictions
        }
      };

      const playWithSound = async () => {
        try {
          if (trailer.ended) trailer.currentTime = 0;

          userActivatedSound = true;
          trailer.muted = false;
          trailer.volume = 1;

          const p = trailer.play();
          if (p && typeof p.catch === 'function') {
            await p;
          }
        } catch (err) {
          // ignore browser quirks
        }
      };

      launchButton.addEventListener('click', async () => {
        trailerContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

      try {
          trailer.pause();
          trailer.currentTime = 0;     // always restart
          trailer.muted = false;       // user explicitly asked for sound
          trailer.volume = 1;
          userActivatedSound = true;   // keep this if you still use this flag elsewhere
          await trailer.play();
        } catch (err) {}
      });


      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {

            // If user has not manually activated sound, autoplay muted
            if (trailer.paused) {
              playMuted();
            }
             return;
          }
            trailer.pause();
            trailer.muted = true;
            userActivatedSound = false;
          });
        },
        {
          threshold: 0.35,
          rootMargin: '0px 0px 10% 0px',
        }
      );

      observer.observe(trailerContainer);

      // In case page loads already at trailer position, force an initial check
      const tryInitialAutoplay = () => {
        const rect = trailerContainer.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
        const visibleRatio = visibleHeight / Math.max(rect.height, 1);

        if (visibleRatio > 0.35 && trailer.paused) {
          playMuted();
        }
      };

      window.addEventListener('load', tryInitialAutoplay, { once: true });
      requestAnimationFrame(tryInitialAutoplay);
    })();

      (() => {
        const items = Array.from(document.querySelectorAll('.event-meta__item, .reveal-item'));
        if (!items.length) return;

        const revealOrder = new Map(items.map((item, index) => [item, index]));
        const queuedItems = [];
        const queuedSet = new Set();
        const initialRevealDelayMs = 500;
        const mobileRevealGapMs = 250;
        let nextRevealAt = 0;
        let queueActive = false;

        const flushQueue = () => {
          if (queueActive || !queuedItems.length) return;
          queueActive = true;

          const runNext = () => {
            const nextItem = queuedItems.shift();
            if (!nextItem) {
              queueActive = false;
              return;
            }

            queuedSet.delete(nextItem);

            const now = performance.now();
            if (now >= nextRevealAt) {
              nextRevealAt = now + initialRevealDelayMs;
            }

            const delay = Math.max(nextRevealAt - now, 0);
            window.setTimeout(() => {
              nextItem.classList.add('is-visible');
              nextRevealAt += mobileRevealGapMs;
              runNext();
            }, delay);
          };

          runNext();
        };

        const observer = new IntersectionObserver(
          (entries, currentObserver) => {
            const newlyVisible = entries
              .filter((entry) => entry.isIntersecting)
              .map((entry) => entry.target)
              .sort((a, b) => revealOrder.get(a) - revealOrder.get(b));

            const isDesktop = window.matchMedia('(min-width: 761px)').matches;

            if (isDesktop) {
              newlyVisible.forEach((target) => {
                currentObserver.unobserve(target);
              });

              if (newlyVisible.length) {
                window.setTimeout(() => {
                  newlyVisible.forEach((target) => target.classList.add('is-visible'));
                }, initialRevealDelayMs);
              }

              return;
            }

            newlyVisible.forEach((target) => {
              if (queuedSet.has(target)) return;
              queuedSet.add(target);
              queuedItems.push(target);
              currentObserver.unobserve(target);
            });

            flushQueue();
          },
          {
            threshold: 0.15,
            rootMargin: '0px 0px 20% 0px',
          }
        );

        items.forEach((item) => observer.observe(item));
      })();

      (() => {
        const rails = Array.from(document.querySelectorAll('.bubble-rail'));
        if (!rails.length) return;

        const bubbles = [];
        const spawnDelayMs = 950;
        const spawnJitterMs = 420;
        const nextSpawnAt = new Map(rails.map((rail) => [rail, Math.random() * (spawnDelayMs + spawnJitterMs)]));
        const baseRiseSpeed = 102;
        const scrollModeHoldMs = 180;
        const maxBubbles = 72;
        let scrollMode = 'idle';
        let scrollModeUntil = 0;
        let lastTimestamp;
        let lastScrollY = window.scrollY;

        const removeBubble = (bubble) => {
          bubble.el.remove();
          const idx = bubbles.indexOf(bubble);
          if (idx !== -1) bubbles.splice(idx, 1);
        };

        const popBubble = (bubble, duration = 220) => {
          if (!bubble || bubble.popping) return;
          bubble.popping = true;
          bubble.el.classList.add('champagne-bubble--popping');
          const currentTransform = bubble.el.style.transform || `translate3d(${bubble.x}px, ${bubble.y}px, 0)`;
          const animation = bubble.el.animate(
            [
              { transform: currentTransform, opacity: 1 },
              { transform: `${currentTransform} scale(1.5)`, opacity: 0 },
            ],
            { duration, easing: 'ease-out', fill: 'forwards' }
          );
          animation.addEventListener('finish', () => removeBubble(bubble), { once: true });
        };

        const makeBubble = (rail) => {
          if (bubbles.length >= maxBubbles) {
            popBubble(bubbles[0], 140);
            return;
          }

          const size = 2 + Math.random() * 2.5;
          const maxDrift = Math.max((rail.clientWidth - size) / 2 - 1.5, 0);
          const offsetX = (Math.random() * 2 - 1) * maxDrift;
          const bubbleEl = document.createElement('button');
          bubbleEl.type = 'button';
          bubbleEl.className = 'champagne-bubble';
          bubbleEl.setAttribute('aria-label', 'Pop bubble');
          bubbleEl.style.width = `${size}px`;
          bubbleEl.style.height = `${size}px`;

          const bubble = {
            el: bubbleEl,
            rail,
            size,
            x: offsetX,
            y: rail.clientHeight - size,
            popping: false,
          };

          bubbleEl.addEventListener('pointerdown', () => popBubble(bubble));
          bubbleEl.addEventListener('click', () => popBubble(bubble));

          rail.appendChild(bubbleEl);
          bubbles.push(bubble);
        };

        const updateScrollMode = () => {
          const currentY = window.scrollY;
          const delta = currentY - lastScrollY;
          const now = performance.now();

          if (delta > 0) {
            scrollMode = 'down';
            scrollModeUntil = now + scrollModeHoldMs;
          } else if (delta < 0) {
            scrollMode = 'up';
            scrollModeUntil = now + scrollModeHoldMs;
          }

          lastScrollY = currentY;
        };

        window.addEventListener('scroll', updateScrollMode, { passive: true });

        const frame = (timestamp) => {
          if (!lastTimestamp) {
            lastTimestamp = timestamp;
            requestAnimationFrame(frame);
            return;
          }

          const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.04);
          lastTimestamp = timestamp;

          if (scrollModeUntil && timestamp > scrollModeUntil) {
            scrollMode = 'idle';
            scrollModeUntil = 0;
          }

          let riseMultiplier = 1;
          if (scrollMode === 'down') {
            riseMultiplier = 2;
          } else if (scrollMode === 'up') {
            riseMultiplier = 0;
          }

          rails.forEach((rail) => {
            const next = nextSpawnAt.get(rail) - dt * 1000;
            if (next <= 0) {
              makeBubble(rail);
              const randomizedDelay = spawnDelayMs + Math.random() * spawnJitterMs;
              nextSpawnAt.set(rail, randomizedDelay);
            } else {
              nextSpawnAt.set(rail, next);
            }
          });

          for (let i = bubbles.length - 1; i >= 0; i -= 1) {
            const bubble = bubbles[i];
            if (bubble.popping) continue;

            bubble.y -= baseRiseSpeed * riseMultiplier * dt;
            bubble.el.style.transform = `translate3d(${bubble.x}px, ${bubble.y}px, 0)`;

            if (bubble.y + bubble.size <= 2) {
              popBubble(bubble, 180);
            }
          }

          requestAnimationFrame(frame);
        };

        requestAnimationFrame(frame);
      })();

      (() => {
        const mascotCta = document.querySelector('[data-mascot-cta]');
        const mascotImageLink = mascotCta?.querySelector('a[aria-label="Book a ticket"]');
        const headerImage = document.querySelector('.top-header-image');

        if (!mascotCta || !mascotImageLink || !headerImage) {
          return;
        }

        let hasStarted = false;
        let dragState = null;
        let suppressNextClick = false;

        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

        const setDraggedPosition = (clientX, clientY) => {
          const ctaRect = mascotCta.getBoundingClientRect();
          const maxLeft = Math.max(window.innerWidth - ctaRect.width, 0);
          const maxTop = Math.max(window.innerHeight - ctaRect.height, 0);

          const nextLeft = clamp(clientX - dragState.offsetX, 0, maxLeft);
          const nextTop = clamp(clientY - dragState.offsetY, 0, maxTop);

          mascotCta.style.left = `${nextLeft}px`;
          mascotCta.style.top = `${nextTop}px`;
          mascotCta.style.right = 'auto';
          mascotCta.style.bottom = 'auto';
          mascotCta.style.transform = 'none';
        };

        const handlePointerMove = (event) => {
          if (!dragState) return;

          const moveDistance = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);
          if (moveDistance > 4) {
            dragState.moved = true;
          }

          setDraggedPosition(event.clientX, event.clientY);
        };

        const handlePointerUp = () => {
          if (!dragState) return;

          mascotCta.classList.remove('is-dragging');
          if (dragState.pointerId !== null && mascotCta.releasePointerCapture) {
            mascotCta.releasePointerCapture(dragState.pointerId);
          }

          if (dragState.moved) {
            suppressNextClick = true;
          }

          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerUp);
          window.removeEventListener('pointercancel', handlePointerUp);
          dragState = null;
        };

        const startDrag = (event) => {
          if (!mascotCta.classList.contains('mascot-cta--active')) {
            return;
          }

          const isDesktopMouse = window.matchMedia('(min-width: 901px)').matches && event.pointerType === 'mouse';
          if (!isDesktopMouse) {
            return;
          }

          if (event.isPrimary === false || (event.button !== undefined && event.button !== 0)) {
            return;
          }

          event.preventDefault();

          const ctaRect = mascotCta.getBoundingClientRect();
          dragState = {
            pointerId: event.pointerId,
            offsetX: event.clientX - ctaRect.left,
            offsetY: event.clientY - ctaRect.top,
            startX: event.clientX,
            startY: event.clientY,
            moved: false,
          };

          mascotCta.classList.add('is-dragging');
          if (mascotCta.setPointerCapture) {
            mascotCta.setPointerCapture(event.pointerId);
          }

          window.addEventListener('pointermove', handlePointerMove);
          window.addEventListener('pointerup', handlePointerUp);
          window.addEventListener('pointercancel', handlePointerUp);

          setDraggedPosition(event.clientX, event.clientY);
        };

        mascotImageLink.addEventListener('pointerdown', startDrag);
        mascotCta.addEventListener('lostpointercapture', handlePointerUp);
        mascotImageLink.addEventListener('click', (event) => {
          if (!suppressNextClick) {
            return;
          }

          suppressNextClick = false;
          event.preventDefault();
        });

        const activateMascot = () => {
          if (hasStarted) {
            return;
          }

          hasStarted = true;
          mascotCta.classList.add('mascot-cta--entering');

          mascotCta.addEventListener(
            'animationend',
            () => {
              mascotCta.classList.remove('mascot-cta--entering');
              mascotCta.classList.add('mascot-cta--active');
            },
            { once: true }
          );
        };

        const checkScrollPosition = () => {
          const pastHeaderImage = window.scrollY > headerImage.offsetHeight;

          if (pastHeaderImage) {
            activateMascot();
            window.removeEventListener('scroll', checkScrollPosition);
          }
        };

        window.addEventListener('scroll', checkScrollPosition, { passive: true });
        checkScrollPosition();
      })();
