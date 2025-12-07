// Typing intro + skip/fallback
document.addEventListener('DOMContentLoaded', function () {
    const intro = document.getElementById('intro');
    const typedEl = intro ? intro.querySelector('.typed') : null;
    const fullText = 'Hi, saya Ajie Ahmad Fathi Fauzi';
    let canceled = false;

    function typeText(el, text, delay) {
        return new Promise((resolve) => {
            if (!el) return resolve();
            el.textContent = '';
            let i = 0;
            function step() {
                if (canceled) return resolve();
                if (i < text.length) {
                    el.textContent += text[i++];
                    setTimeout(step, delay);
                } else {
                    resolve();
                }
            }
            step();
        });
    }

    function hideIntro() {
        if (!intro) return;
        intro.classList.add('fade-out');
        setTimeout(() => {
            try { intro.style.display = 'none'; } catch (e) { intro.setAttribute('aria-hidden', 'true'); }
            document.body.classList.remove('intro-open');
        }, 420);
    }

    if (intro && typedEl) {
        intro.addEventListener('click', () => { canceled = true; hideIntro(); });
        const fallback = setTimeout(() => { canceled = true; hideIntro(); }, 7000);
        typeText(typedEl, fullText, 70).then(() => {
            clearTimeout(fallback);
            setTimeout(hideIntro, 900);
        });
    } else {
        document.body.classList.remove('intro-open');
    }

    // Load HTML sections
    loadAllSections();

    // Routing: handle hash changes
    window.addEventListener('hashchange', updateActivePage);
    updateActivePage();
});

// Load all section HTML files
function loadAllSections() {
    const sections = ['home', 'about', 'projects', 'contact'];
    sections.forEach(id => {
        fetch(id + '.html')
            .then(res => res.text())
            .then(html => {
                const section = document.getElementById(id);
                if (section) {
                    section.innerHTML = html;
                    // Jika home, init parallax animation
                    if (id === 'home') {
                        setTimeout(() => {
                            initProfileCardAnimation();
                            initHomeAnimations();
                        }, 120);
                    }

                                    // If about, initialize about animations
                                    if (id === 'about') {
                                        setTimeout(() => {
                                            try { initAboutAnimations(); } catch (e) { /* ignore */ }
                                        }, 120);
                                    }
                                    // If contact, initialize contact animations
                                    if (id === 'contact') {
                                        setTimeout(() => {
                                            try { initContactAnimations(); } catch (e) { /* ignore */ }
                                        }, 120);
                                    }
                }
            })
            .catch(err => {
                const section = document.getElementById(id);
                if (section) section.innerHTML = '<p>Error loading section.</p>';
            });
    });
}

// Update active page based on URL hash
function updateActivePage() {
    const hash = window.location.hash.slice(1) || 'home';
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const activePage = document.getElementById(hash);
    if (activePage) {
        activePage.classList.add('active');
        // Init parallax saat home halaman aktif (delay kecil agar DOM sudah siap)
        if (hash === 'home') {
            setTimeout(() => {
                const card = document.querySelector('.profile-card');
                if (card && card.dataset.parallaxInit !== 'true') {
                    initProfileCardAnimation();
                }
                // Start home-specific animations
                try { initHomeAnimations(); } catch (e) { /* ignore */ }
            }, 50);
        }
        if (hash === 'about') {
            setTimeout(() => {
                try { initAboutAnimations(); } catch (e) { /* ignore */ }
            }, 50);
        }
        if (hash === 'contact') {
            setTimeout(() => {
                try { initContactAnimations(); } catch (e) { /* ignore */ }
            }, 50);
        }
    }
}

// Home-specific animations: rotating typed roles + skill reveal
function initHomeAnimations() {
    const rolesEl = document.querySelector('.typed-roles');
    if (rolesEl && !rolesEl.dataset.inited) {
        rolesEl.dataset.inited = 'true';
        const roles = JSON.parse(rolesEl.getAttribute('data-roles') || '[]');
        let idx = 0;
        function showRole(i) {
            rolesEl.textContent = roles[i] || '';
            rolesEl.style.opacity = '0';
            rolesEl.getBoundingClientRect();
            rolesEl.style.transition = 'opacity 300ms ease';
            rolesEl.style.opacity = '1';
        }
        showRole(0);
        setInterval(() => {
            idx = (idx + 1) % roles.length;
            showRole(idx);
        }, 1800);
    }

    // stagger skill badges
    const skills = document.querySelectorAll('.skill');
    skills.forEach((el, i) => {
        el.classList.remove('pop');
        setTimeout(() => el.classList.add('pop'), 220 * i + 200);
    });
}

// Side nav active state
(function () {
    const links = Array.from(document.querySelectorAll('.side-nav .side-link'));
    if (!links.length) return;

    function updateNavActive() {
        const hash = window.location.hash.slice(1) || 'home';
        links.forEach(link => {
            const href = link.getAttribute('href').slice(1);
            if (href === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = link.getAttribute('href').slice(1);
            window.location.hash = hash;
            updateNavActive();
        });
    });

    window.addEventListener('hashchange', updateNavActive);
    updateNavActive();
})();

// 3D Parallax for profile card
function initProfileCardAnimation() {
    const card = document.querySelector('.profile-card');
    if (!card) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Check if already initialized (avoid duplicate listeners)
    if (card.dataset.parallaxInit === 'true') return;
    card.dataset.parallaxInit = 'true';

    const photo = card.querySelector('.profile-photo');
    const name = card.querySelector('.profile-name');
    const actions = card.querySelector('.profile-actions');
    const holoLetters = Array.from(card.querySelectorAll('.holo-letter'));

    // Randomize base positions, scale and rotation for holo letters once
    function randomizeHoloLetters() {
        if (!holoLetters || !holoLetters.length) return;
        holoLetters.forEach((el, i) => {
            // base offsets chosen to stay roughly inside the card
            const baseX = Math.round((Math.random() * 160) - 80); // -80 .. 80
            const baseY = Math.round((Math.random() * 120) - 60); // -60 .. 60
            const baseScale = +(Math.random() * 0.5 + 0.75).toFixed(2); // 0.75 .. 1.25
            const baseRot = Math.round((Math.random() * 60) - 30); // -30 .. 30deg
            // small opacity variation
            const baseOpacity = +(Math.random() * 0.25 + 0.7).toFixed(2); // 0.7 .. 0.95
            el.dataset.baseX = baseX;
            el.dataset.baseY = baseY;
            el.dataset.baseScale = baseScale;
            el.dataset.baseRot = baseRot;
            el.dataset.baseOpacity = baseOpacity;
            // set initial transform from base values (will be updated every frame)
            el.style.transform = `translate(-50%, -50%) translate3d(${baseX}px, ${baseY}px, 0) rotateZ(${baseRot}deg) scale(${baseScale})`;
            el.style.opacity = baseOpacity;
        });
    }

    // run randomization now
    randomizeHoloLetters();

    let raf = null;
    const state = { rx: 0, ry: 0, tx: 0, ty: 0 };
    let touchActive = false; // enable tracking while pressed on touch

    function apply() {
        card.style.transform = `rotateX(${state.rx}deg) rotateY(${state.ry}deg)`;
        if (photo) photo.style.transform = `translateZ(36px) translateX(${state.tx * 0.6}px) translateY(${state.ty * 0.4}px)`;
        if (name) name.style.transform = `translateZ(20px) translateY(${state.ty * 0.18}px)`;
        if (actions) actions.style.transform = `translateZ(12px)`;
        // update hologram CSS variables for subtle background motion
        try {
            card.style.setProperty('--tx', state.tx + 'px');
            card.style.setProperty('--ty', state.ty + 'px');
            card.style.setProperty('--rx', state.rx + 'deg');
            card.style.setProperty('--ry', state.ry + 'deg');
        } catch (e) { /* ignore if style.setProperty fails */ }
        // update holo letters: translate and slight rotate based on state
        if (holoLetters && holoLetters.length) {
            card.classList.add('holo-active');
                holoLetters.forEach((el, i) => {
                    // read randomized base values
                    const baseX = Number(el.dataset.baseX) || ((i - 2) * 6);
                    const baseY = Number(el.dataset.baseY) || ((i - 3) * 4);
                    const baseScale = Number(el.dataset.baseScale) || 1;
                    const baseRot = Number(el.dataset.baseRot) || 0;
                    const baseOpacity = Number(el.dataset.baseOpacity) || 0.9;

                    // multipliers give varied parallax motion per letter
                    const mulX = 0.5 + (i % 4) * 0.18;
                    const mulY = 0.35 + (i % 3) * 0.12;

                    const offsetX = baseX + state.tx * mulX;
                    const offsetY = baseY + state.ty * mulY;
                    const rot = baseRot + state.ry * (i % 2 === 0 ? 0.6 : -0.6);

                    el.style.transform = `translate(-50%, -50%) translate3d(${offsetX}px, ${offsetY}px, 0) rotateZ(${rot}deg) scale(${baseScale})`;
                    // increase brightness/opacity + CD hologram glow when movement is active
                    const activity = Math.min(1, Math.abs(state.tx) * 0.08 + Math.abs(state.ty) * 0.06);
                    el.style.opacity = Math.max(0.5, Math.min(1, baseOpacity + activity * 0.45));
                    
                    // Dynamic hologram glow: increases with parallax activity, mimics CD shine effect
                    const glowIntensity = activity * 0.8;
                    const shadowColor1 = `rgba(158,232,223,${0.5 + glowIntensity * 0.5})`;
                    const shadowColor2 = `rgba(14,165,164,${0.3 + glowIntensity * 0.4})`;
                    const shadowColor3 = `rgba(255,255,255,${0.2 + glowIntensity * 0.3})`;
                    
                    el.style.filter = `blur(${Math.max(0, 0.8 - activity * 0.4)}px) saturate(${1 + activity * 0.2}) drop-shadow(0 0 ${8 + glowIntensity * 12}px ${shadowColor1}) drop-shadow(0 0 ${12 + glowIntensity * 16}px ${shadowColor2})`;
                    el.style.textShadow = `0 0 ${12 + glowIntensity * 16}px ${shadowColor1}, 0 0 ${24 + glowIntensity * 20}px ${shadowColor2}, 0 0 ${6 + glowIntensity * 10}px ${shadowColor3}, 0 2px 4px rgba(11,23,32,0.2)`;
                });
        }
        raf = null;
    }

    function handlePointer(clientX, clientY) {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const nx = (clientX - cx) / (rect.width / 2);
        const ny = (clientY - cy) / (rect.height / 2);

        state.ry = Math.max(-12, Math.min(12, nx * 10));
        state.rx = Math.max(-8, Math.min(8, -ny * 8));
        state.tx = Math.max(-12, Math.min(12, nx * 12));
        state.ty = Math.max(-10, Math.min(10, ny * 10));

        if (!raf) raf = requestAnimationFrame(apply);
    }

    function resetState() {
        state.rx = 0;
        state.ry = 0;
        state.tx = 0;
        state.ty = 0;
        if (!raf) raf = requestAnimationFrame(apply);
        // hide holo letters when reset
        if (card) {
            card.classList.remove('holo-active');
            if (holoLetters && holoLetters.length) {
                holoLetters.forEach(el => {
                    el.style.opacity = '';
                    el.style.transform = '';
                    el.style.filter = '';
                });
            }
        }
    }

    // Only track pointermove for mouse always, for touch only while pointer is pressed
    card.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch' && !touchActive) return;
        handlePointer(e.clientX, e.clientY);
    }, { passive: true });

    // For touch devices: enable tracking only while pressing/dragging
    card.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') {
            touchActive = true;
            // set pointer capture so we keep receiving pointermove while dragging
            try { (e.target || card).setPointerCapture && (e.target || card).setPointerCapture(e.pointerId); } catch (err) {}
            handlePointer(e.clientX, e.clientY);
            // show holo letters immediately on touchstart
            if (card) card.classList.add('holo-active');
        }
    });

    card.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'touch') {
            touchActive = false;
            try { (e.target || card).releasePointerCapture && (e.target || card).releasePointerCapture(e.pointerId); } catch (err) {}
            resetState();
        }
    });

    card.addEventListener('pointercancel', (e) => {
        if (e.pointerType === 'touch') {
            touchActive = false;
            resetState();
        }
    });

    card.addEventListener('pointerleave', resetState);

    card.addEventListener('focusin', () => { 
        card.classList.add('keyboard-focus'); 
    });

    card.addEventListener('focusout', () => { 
        card.classList.remove('keyboard-focus');
        resetState();
    });
}

// About page animations: reveal lines, show-more toggle, animate skill meters
function initAboutAnimations() {
    const about = document.querySelector('.about-content');
    if (!about) return;
    if (about.dataset.inited === 'true') return;
    about.dataset.inited = 'true';

    // reveal lines with stagger
    const lines = about.querySelectorAll('.about-intro .line');
    lines.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 220);
    });

    // encourage interaction: pulse the show-more button after lines reveal
    const pulseBtn = about.querySelector('.show-more-btn');
    if (pulseBtn) {
        setTimeout(() => pulseBtn.classList.add('pulse'), Math.min(900, (lines.length * 220) + 300));
    }

    // show-more toggle
    const btn = about.querySelector('.show-more-btn');
    const more = about.querySelector('.about-more');
    if (btn && more) {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            if (expanded) {
                more.hidden = true;
            } else {
                more.hidden = false;
                // remove pulse once user interacts
                btn.classList.remove('pulse');
                // animate skill meters when revealed, show percent labels
                const meters = more.querySelectorAll('.skill-meter');
                meters.forEach((m, idx) => {
                    if (m.dataset.animated === 'true') return;
                    const val = Number(m.dataset.value) || 60;
                    const fill = m.querySelector('.skill-fill');
                    const valEl = m.querySelector('.skill-value');
                    setTimeout(() => {
                        if (fill) {
                            fill.style.width = val + '%';
                            // reveal percent text
                            if (valEl) {
                                valEl.textContent = val + '%';
                                fill.classList.add('show-value');
                            }
                        }
                        m.dataset.animated = 'true';
                    }, idx * 140 + 140);
                });
            }
        });
    }

    // If .about-more is visible by default (edge case), animate meters now
    const moreMeters = about.querySelectorAll('.about-more .skill-meter');
    if (more && !more.hidden && moreMeters.length) {
        moreMeters.forEach((m, idx) => {
            if (m.dataset.animated === 'true') return;
            const val = Number(m.dataset.value) || 60;
            const fill = m.querySelector('.skill-fill');
            const valEl = m.querySelector('.skill-value');
            setTimeout(() => {
                if (fill) {
                    fill.style.width = val + '%';
                    if (valEl) { valEl.textContent = val + '%'; fill.classList.add('show-value'); }
                }
                m.dataset.animated = 'true';
            }, idx * 140);
        });
    }
}

// Contact page interactions: set/show instagram handle, copy link, animations
function initContactAnimations() {
    const root = document.querySelector('.contact-content');
    if (!root) return;
    if (root.dataset.inited === 'true') return;
    root.dataset.inited = 'true';

    const input = root.querySelector('.contact-username');
    const showBtn = root.querySelector('.contact-show-btn');
    const copyBtn = root.querySelector('.copy-btn');
    const handleEl = root.querySelector('.insta-handle');
    const card = root.querySelector('.contact-card');

    function sanitize(name) {
        if (!name) return '';
        return name.trim().replace(/^@+/, '').replace(/\s+/g, '');
    }

    function flashCopied(btn) {
        btn.classList.add('copied');
        const prev = btn.textContent;
        btn.textContent = 'Disalin!';
        setTimeout(() => { btn.classList.remove('copied'); btn.textContent = prev; }, 1200);
    }

    if (showBtn && input && handleEl) {
        showBtn.addEventListener('click', () => {
            const raw = sanitize(input.value);
            if (!raw) {
                // invalid -> shake input
                input.classList.remove('shake');
                // reflow to restart
                void input.offsetWidth;
                input.classList.add('shake');
                return;
            }

            const url = 'https://instagram.com/' + raw;
            handleEl.setAttribute('href', url);
            handleEl.textContent = '@' + raw;

            // animate card briefly
            if (card) {
                card.classList.add('reveal');
                setTimeout(() => card.classList.remove('reveal'), 800);
            }
        });
    }

    if (copyBtn && handleEl) {
        copyBtn.addEventListener('click', async () => {
            const url = handleEl.getAttribute('href') || '';
            if (!url) {
                input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
                return;
            }
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(url);
                } else {
                    const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
                }
                flashCopied(copyBtn);
            } catch (e) {
                console.warn('Copy failed', e);
            }
        });
    }

    // Interactive social icons (open in new tab + small click feedback)
    const socialGrid = root.querySelector('.social-grid');
    if (socialGrid) {
        const links = Array.from(socialGrid.querySelectorAll('.social-link'));
        links.forEach(a => {
            a.addEventListener('click', (e) => {
                // visual feedback
                a.classList.add('clicked');
                setTimeout(() => a.classList.remove('clicked'), 420);
                // default behavior opens in new tab due to anchor attributes
            });
            a.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.click(); }
            });
        });
    }

    // If we have the new social cards, add a similar lightweight feedback
    const socialList = root.querySelector('.social-list');
    if (socialList) {
        const cards = Array.from(socialList.querySelectorAll('.social-card'));
        cards.forEach(card => {
            const link = card.querySelector('.card-link');
            if (!link) return;
            link.addEventListener('click', () => {
                card.classList.add('clicked');
                setTimeout(() => card.classList.remove('clicked'), 420);
            });
            link.addEventListener('focus', () => card.classList.add('focused'));
            link.addEventListener('blur', () => card.classList.remove('focused'));
        });
    }
}
