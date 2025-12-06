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
                        setTimeout(() => initProfileCardAnimation(), 100);
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
            }, 50);
        }
    }
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

    let raf = null;
    const state = { rx: 0, ry: 0, tx: 0, ty: 0 };

    function apply() {
        card.style.transform = `rotateX(${state.rx}deg) rotateY(${state.ry}deg)`;
        if (photo) photo.style.transform = `translateZ(36px) translateX(${state.tx * 0.6}px) translateY(${state.ty * 0.4}px)`;
        if (name) name.style.transform = `translateZ(20px) translateY(${state.ty * 0.18}px)`;
        if (actions) actions.style.transform = `translateZ(12px)`;
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
    }

    card.addEventListener('pointermove', (e) => {
        handlePointer(e.clientX, e.clientY);
    }, { passive: true });

    card.addEventListener('pointerleave', resetState);

    card.addEventListener('focusin', () => { 
        card.classList.add('keyboard-focus'); 
    });

    card.addEventListener('focusout', () => { 
        card.classList.remove('keyboard-focus');
        resetState();
    });
}