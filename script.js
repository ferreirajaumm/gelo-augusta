const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');

if (header && navToggle && nav) {
  const setNavState = (open) => {
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  navToggle.addEventListener('click', () => setNavState(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setNavState(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setNavState(false);
      navToggle.focus();
    }
  });

  const sentinel = document.createElement('div');
  sentinel.className = 'header-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  header.after(sentinel);
  new IntersectionObserver(([entry]) => {
    header.classList.toggle('is-sticky', !entry.isIntersecting);
  }, { threshold: 0 }).observe(sentinel);
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealTargets.forEach((element) => observer.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add('visible'));
}

/* Motion-style scroll choreography: transform and opacity only, with a full reduced-motion fallback. */
if (!reducedMotion) {
  const hero = document.querySelector('.hero');
  const motionImages = [...document.querySelectorAll('.editorial-grid img, .menu-photo, .signature-grid > img, .gallery-grid img, .contact-visual img')];
  motionImages.forEach((image) => image.classList.add('motion-image'));
  let ticking = false;
  const updateMotion = () => {
    const viewportHeight = window.innerHeight || 1;
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
      hero.style.setProperty('--hero-shift', `${Math.round(progress * 28)}px`);
      hero.style.setProperty('--hero-zoom', `${1 + (progress * 0.025)}`);
    }
    motionImages.forEach((image, index) => {
      const rect = image.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportHeight) return;
      const centerOffset = (rect.top + (rect.height / 2) - (viewportHeight / 2)) / viewportHeight;
      const amount = 13 + ((index % 3) * 4);
      image.style.setProperty('--motion-shift', `${Math.round(centerOffset * amount)}px`);
    });
    ticking = false;
  };
  const requestMotionUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateMotion);
    }
  };
  window.addEventListener('scroll', requestMotionUpdate, { passive: true });
  window.addEventListener('resize', requestMotionUpdate, { passive: true });
  requestMotionUpdate();
}

/* Galeria de vídeos: apenas o vídeo mais visível é carregado e reproduzido. */
const videoExperience = document.querySelector('.video-experience');
const experienceVideos = [...document.querySelectorAll('.experience-video')];
const ensureVideoSource = (video) => {
  const source = video.querySelector('source[data-src]');
  if (!source || source.src) return;
  source.src = source.dataset.src;
  video.load();
};
const setExperiencePlayback = (video, shouldPlay) => {
  const card = video.closest('[data-video-card]');
  const button = card?.querySelector('.video-control');
  const label = button?.querySelector('.video-control-text');
  if (!card || !button || !label) return;
  // O autoplay respeita reduced-motion porque o observer não é iniciado nesse
  // modo, mas a reprodução manual continua disponível e acessível.
  if (shouldPlay) {
    ensureVideoSource(video);
    if (!video.paused) {
      card.classList.add('is-playing');
      button.setAttribute('aria-pressed', 'true');
      return;
    }
    video.play().then(() => {
      card.classList.add('is-playing');
      button.setAttribute('aria-pressed', 'true');
      button.setAttribute('aria-label', `${languageData[activeLanguage].videoPause} vídeo ${experienceVideos.indexOf(video) + 1}`);
      label.textContent = languageData[activeLanguage].videoPause;
    }).catch(() => { /* O botão continua disponível caso o autoplay seja bloqueado. */ });
  } else {
    if (!video.paused) video.pause();
    card.classList.remove('is-playing');
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `${languageData[activeLanguage].videoPlay} vídeo ${experienceVideos.indexOf(video) + 1}`);
    label.textContent = languageData[activeLanguage].videoPlay;
  }
};

if (videoExperience && experienceVideos.length) {
  const touchLayout = matchMedia('(hover: none) and (pointer: coarse)').matches;
  experienceVideos.forEach((video) => {
    const button = video.closest('[data-video-card]')?.querySelector('.video-control');
    button?.addEventListener('click', () => {
      const willPlay = video.paused;
      experienceVideos.forEach((item) => { if (item !== video) setExperiencePlayback(item, false); });
      setExperiencePlayback(video, willPlay);
    });
  });
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const visibility = new Map(experienceVideos.map((video) => [video, 0]));
    let playbackTimer;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target, entry.intersectionRatio));
      const active = [...visibility.entries()].sort((a, b) => b[1] - a[1])[0];
      const applyPlayback = () => {
        experienceVideos.forEach((video) => setExperiencePlayback(video, active?.[0] === video && active[1] >= .48));
      };
      if (touchLayout) {
        // Durante o gesto horizontal, o IntersectionObserver pode alternar
        // rapidamente entre cartões e provocar play/load repetidos no iOS.
        // Aguarda o scroll assentar antes de trocar o vídeo activo.
        window.clearTimeout(playbackTimer);
        playbackTimer = window.setTimeout(applyPlayback, 180);
      } else {
        applyPlayback();
      }
    }, { threshold: [0, .48, .7], rootMargin: '0px 0px -8% 0px' });
    experienceVideos.forEach((video) => observer.observe(video));
  }
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const reservationForm = document.querySelector('#form-reserva');
const reservationDate = document.querySelector('#data');
const reservationStatus = document.querySelector('#status-reserva');
let activeLanguage = 'pt';

if (reservationDate) {
  const today = new Date();
  const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60_000)).toISOString().slice(0, 10);
  reservationDate.min = localToday;
}

const languageData = {
  pt: {
    htmlLang: 'pt-PT', locale: 'pt-PT', short: 'PT', title: 'Gelo Augusta - Marisco e cozinha portuguesa em Lisboa',
    description: 'Gelo Augusta, marisqueira e restaurante português na Rua Augusta, em Lisboa.',
    nav: ['A casa', 'Especialidades', 'Reservas', 'Contacto'],
    heroLocation: 'Rua Augusta, 182 · Baixa de Lisboa', heroTitle: 'Marisco e sabor<br>português no<br>coração de Lisboa.', heroCta: 'Reserve a sua mesa',
    storyTitle: 'Marisco, cozinha portuguesa e Lisboa à mesa.', storyText: 'O Gelo Augusta é uma marisqueira e restaurante português na Rua Augusta, na Baixa de Lisboa. Num espaço moderno de dois pisos e quatro frentes de loja, a casa reúne marisco, peixe fresco e cozinha portuguesa.', storyCta: 'Visite o Gelo Augusta',
    experienceTitle: 'O mar encontra a energia da Baixa.', experienceText: 'Entre a elegância da Rua Augusta e o sabor do Atlântico, o Gelo Augusta convida a descobrir uma mesa dedicada ao peixe fresco, ao marisco e aos clássicos da cozinha portuguesa.', videoTitle: 'A energia da Rua Augusta, à sua mesa.', videoText: 'Do primeiro brinde ao último detalhe: conheça um pouco da atmosfera do Gelo Augusta antes de chegar.', videoCaptions: [['Rua Augusta', 'À porta de Lisboa'], ['À mesa', 'Sabor em cada detalhe'], ['O momento', 'Uma casa com ritmo próprio']], videoCta: 'Reserve a sua mesa', videoPlay: 'Reproduzir', videoPause: 'Pausar', stats: ['Pisos', 'Um espaço contemporâneo para almoços, jantares e encontros no centro histórico de Lisboa.', 'Frentes de loja', 'Na Rua Augusta, uma das vias mais emblemáticas da Baixa lisboeta.'],
    reservationTitle: 'Reserve a sua mesa ou um evento especial.', reservationText: 'Escolha a data, a hora e o número de pessoas. Ao confirmar, o seu pedido é preparado para envio direto pelo WhatsApp.', reservationNote: 'Para grupos, comemorações e eventos, conte-nos os detalhes na mensagem.', phone: 'Prefere telefonar? +351 967 573 815', formTitle: 'Vamos organizar a sua visita.', labels: ['Nome completo', 'Telefone / WhatsApp', 'Data', 'Hora', 'Pessoas'], peoplePlaceholder: 'Selecione o número de pessoas', people: ['2 pessoas', '3 pessoas', '4 pessoas', '5+ pessoas'], confirm: 'Confirmar reserva',
    menuTitle: 'Sabores do mar e da cozinha portuguesa', dishes: [['Marisco', 'Seleção de marisco para partilhar e apreciar à mesa.'], ['Peixe fresco', 'Preparações que valorizam o produto e os sabores do Atlântico.'], ['Cozinha portuguesa', 'Receitas e referências da gastronomia portuguesa em plena Baixa.']], menuLink: 'Ver ementa',
    reviewsTitle: 'O que os clientes dizem.', reviewsSummary: 'Avaliações publicadas no Google Maps', reviews: ['“O serviço foi muito agradável e atencioso. Fui bem recebida...”', '“Excelente restaurante, comida espetacular, bebida gelada. Todos os atendentes super educados, em especial o brasileiro Paulo que nos atendeu e nos fez sentir em casa!”', '“A experiência na Cervejaria e Marisqueira Gelo Augusta foi simplesmente fantástica. Ambiente animado, música ao vivo, energia boa...”'], reviewSource: ['trecho de crítica no Google Maps', 'crítica no Google Maps', 'trecho de crítica no Google Maps'], reviewLink: 'Ler as avaliações no Google Maps', galleryTitle: 'Da vitrine à mesa.',
    locationTitle: 'Gelo Augusta, na Baixa de Lisboa.', locationText: 'Rua Augusta 182, 1100-051 Lisboa, Portugal. Depois de reservar, use o mapa apenas para traçar a sua rota.', contactCta: 'Fazer reserva', route: 'Ver rota no mapa', footerTitles: ['Informações', 'Localização'], footerInfo: 'Gelo Augusta<br>Rua Augusta 182<br>1100-051 Lisboa, Portugal', footerTagline: 'Marisqueira e cozinha portuguesa na Rua Augusta, em Lisboa.', footerLocation: 'Baixa de Lisboa<br>Rua Augusta, 182', footerLinks: ['Abrir localização', 'Avaliações públicas', 'Como chegar'],
    validation: 'Preencha todos os campos para confirmar a sua reserva.', opening: 'A abrir o WhatsApp para confirmar o seu pedido.', popupBlocked: 'Não foi possível abrir o WhatsApp. Permita pop-ups e tente novamente.', reservationMessage: 'Olá! Gostaria de pedir uma reserva no Gelo Augusta.', navLabel: 'Menu principal', languageLabel: 'Selecionar idioma', menuOpen: 'Abrir menu', menuClose: 'Fechar menu'
  },
  en: {
    htmlLang: 'en', locale: 'en-GB', short: 'EN', title: 'Gelo Augusta - Seafood and Portuguese cuisine in Lisbon',
    description: 'Gelo Augusta, a seafood restaurant and Portuguese dining destination on Rua Augusta, Lisbon.',
    nav: ['Our restaurant', 'Specialities', 'Bookings', 'Contact'],
    heroLocation: 'Rua Augusta, 182 · Downtown Lisbon', heroTitle: 'Seafood and<br>Portuguese flavour<br>in the heart of Lisbon.', heroCta: 'Book your table',
    storyTitle: 'Seafood, Portuguese cuisine and Lisbon at the table.', storyText: 'Gelo Augusta is a seafood restaurant and Portuguese dining destination on Rua Augusta, in downtown Lisbon. In a contemporary two-floor space with four shopfronts, the house brings together seafood, fresh fish and Portuguese cuisine.', storyCta: 'Visit Gelo Augusta',
    experienceTitle: 'The sea meets the energy of downtown.', experienceText: 'Between the elegance of Rua Augusta and the taste of the Atlantic, Gelo Augusta invites you to discover a table devoted to fresh fish, seafood and Portuguese classics.', videoTitle: 'The energy of Rua Augusta, at your table.', videoText: 'From the first toast to the final detail: get a glimpse of the Gelo Augusta atmosphere before you arrive.', videoCaptions: [['Rua Augusta', 'At Lisbon’s door'], ['At the table', 'Flavour in every detail'], ['The moment', 'A house with its own rhythm']], videoCta: 'Book your table', videoPlay: 'Play', videoPause: 'Pause', stats: ['Floors', 'A contemporary space for lunches, dinners and gatherings in Lisbon’s historic centre.', 'Shopfronts', 'On Rua Augusta, one of downtown Lisbon’s most iconic streets.'],
    reservationTitle: 'Book your table or a special event.', reservationText: 'Choose the date, time and number of guests. When you confirm, your request is prepared to send directly through WhatsApp.', reservationNote: 'For groups, celebrations and events, tell us the details in your message.', phone: 'Prefer to call? +351 967 573 815', formTitle: 'Let’s plan your visit.', labels: ['Full name', 'Phone / WhatsApp', 'Date', 'Time', 'Guests'], peoplePlaceholder: 'Select the number of guests', people: ['2 guests', '3 guests', '4 guests', '5+ guests'], confirm: 'Confirm booking',
    menuTitle: 'Flavours of the sea and Portuguese cuisine', dishes: [['Seafood', 'A selection of seafood to share and enjoy at the table.'], ['Fresh fish', 'Preparations that honour the product and the flavours of the Atlantic.'], ['Portuguese cuisine', 'Recipes and references from Portuguese gastronomy in the heart of downtown.']], menuLink: 'View menu',
    reviewsTitle: 'What guests are saying.', reviewsSummary: 'Reviews published on Google Maps', reviews: ['“The service was very pleasant and attentive. I was warmly welcomed...”', '“Excellent restaurant, spectacular food, ice-cold drinks. The whole team was very polite, especially Paulo, who made us feel at home!”', '“The experience at Gelo Augusta was simply fantastic. Lively atmosphere, live music, great energy...”'], reviewSource: ['excerpt from a Google Maps review', 'Google Maps review', 'excerpt from a Google Maps review'], reviewLink: 'Read reviews on Google Maps', galleryTitle: 'From display to table.',
    locationTitle: 'Gelo Augusta, in downtown Lisbon.', locationText: 'Rua Augusta 182, 1100-051 Lisbon, Portugal. Once you have booked, use the map only to plan your route.', contactCta: 'Make a booking', route: 'Get directions', footerTitles: ['Information', 'Location'], footerInfo: 'Gelo Augusta<br>Rua Augusta 182<br>1100-051 Lisbon, Portugal', footerTagline: 'Seafood and Portuguese cuisine on Rua Augusta, Lisbon.', footerLocation: 'Downtown Lisbon<br>Rua Augusta, 182', footerLinks: ['Open location', 'Public reviews', 'How to get here'],
    validation: 'Please complete all fields to confirm your booking.', opening: 'Opening WhatsApp so you can confirm your request.', popupBlocked: 'WhatsApp could not be opened. Allow pop-ups and try again.', reservationMessage: 'Hello! I would like to request a booking at Gelo Augusta.', navLabel: 'Main menu', languageLabel: 'Select language', menuOpen: 'Open menu', menuClose: 'Close menu'
  },
  es: {
    htmlLang: 'es', locale: 'es-ES', short: 'ES', title: 'Gelo Augusta - Marisco y cocina portuguesa en Lisboa',
    description: 'Gelo Augusta, marisquería y restaurante portugués en Rua Augusta, Lisboa.',
    nav: ['El restaurante', 'Especialidades', 'Reservas', 'Contacto'],
    heroLocation: 'Rua Augusta, 182 · Centro de Lisboa', heroTitle: 'Marisco y sabor<br>portugués en el<br>corazón de Lisboa.', heroCta: 'Reserve su mesa',
    storyTitle: 'Marisco, cocina portuguesa y Lisboa en la mesa.', storyText: 'Gelo Augusta es una marisquería y restaurante portugués en Rua Augusta, en el centro de Lisboa. En un espacio contemporáneo de dos plantas y cuatro escaparates, la casa reúne marisco, pescado fresco y cocina portuguesa.', storyCta: 'Visite Gelo Augusta',
    experienceTitle: 'El mar se encuentra con la energía del centro.', experienceText: 'Entre la elegancia de Rua Augusta y el sabor del Atlántico, Gelo Augusta le invita a descubrir una mesa dedicada al pescado fresco, al marisco y a los clásicos de la cocina portuguesa.', videoTitle: 'La energía de Rua Augusta, en su mesa.', videoText: 'Del primer brindis al último detalle: descubra un poco de la atmósfera de Gelo Augusta antes de llegar.', videoCaptions: [['Rua Augusta', 'A las puertas de Lisboa'], ['En la mesa', 'Sabor en cada detalle'], ['El momento', 'Una casa con ritmo propio']], videoCta: 'Reserve su mesa', videoPlay: 'Reproducir', videoPause: 'Pausar', stats: ['Plantas', 'Un espacio contemporáneo para almuerzos, cenas y encuentros en el centro histórico de Lisboa.', 'Escaparates', 'En Rua Augusta, una de las calles más emblemáticas del centro de Lisboa.'],
    reservationTitle: 'Reserve su mesa o un evento especial.', reservationText: 'Elija la fecha, la hora y el número de comensales. Al confirmar, su solicitud queda preparada para enviarse directamente por WhatsApp.', reservationNote: 'Para grupos, celebraciones y eventos, cuéntenos los detalles en su mensaje.', phone: '¿Prefiere llamar? +351 967 573 815', formTitle: 'Organicemos su visita.', labels: ['Nombre completo', 'Teléfono / WhatsApp', 'Fecha', 'Hora', 'Comensales'], peoplePlaceholder: 'Seleccione el número de comensales', people: ['2 personas', '3 personas', '4 personas', '5+ personas'], confirm: 'Confirmar reserva',
    menuTitle: 'Sabores del mar y de la cocina portuguesa', dishes: [['Marisco', 'Una selección de marisco para compartir y disfrutar en la mesa.'], ['Pescado fresco', 'Preparaciones que valorizan el producto y los sabores del Atlántico.'], ['Cocina portuguesa', 'Recetas y referencias de la gastronomía portuguesa en pleno centro.']], menuLink: 'Ver carta',
    reviewsTitle: 'Lo que dicen los clientes.', reviewsSummary: 'Reseñas publicadas en Google Maps', reviews: ['“El servicio fue muy agradable y atento. Me recibieron muy bien...”', '“Excelente restaurante, comida espectacular y bebidas frías. Todo el personal fue muy educado, especialmente Paulo, que nos hizo sentir como en casa.”', '“La experiencia en Gelo Augusta fue simplemente fantástica. Ambiente animado, música en directo y muy buena energía...”'], reviewSource: ['extracto de una reseña de Google Maps', 'reseña de Google Maps', 'extracto de una reseña de Google Maps'], reviewLink: 'Leer las reseñas en Google Maps', galleryTitle: 'Del expositor a la mesa.',
    locationTitle: 'Gelo Augusta, en el centro de Lisboa.', locationText: 'Rua Augusta 182, 1100-051 Lisboa, Portugal. Después de reservar, use el mapa solo para planificar su ruta.', contactCta: 'Hacer una reserva', route: 'Ver ruta en el mapa', footerTitles: ['Información', 'Ubicación'], footerInfo: 'Gelo Augusta<br>Rua Augusta 182<br>1100-051 Lisboa, Portugal', footerTagline: 'Marisquería y cocina portuguesa en Rua Augusta, Lisboa.', footerLocation: 'Centro de Lisboa<br>Rua Augusta, 182', footerLinks: ['Abrir ubicación', 'Reseñas públicas', 'Cómo llegar'],
    validation: 'Complete todos los campos para confirmar su reserva.', opening: 'Abriendo WhatsApp para que confirme su solicitud.', popupBlocked: 'No se pudo abrir WhatsApp. Permita las ventanas emergentes e inténtelo de nuevo.', reservationMessage: '¡Hola! Me gustaría solicitar una reserva en Gelo Augusta.', navLabel: 'Menú principal', languageLabel: 'Seleccionar idioma', menuOpen: 'Abrir menú', menuClose: 'Cerrar menú'
  }
};

const setText = (selector, value, root = document) => {
  const element = root.querySelector(selector);
  if (element && value !== undefined) element.textContent = value;
};
const setHtml = (selector, value, root = document) => {
  const element = root.querySelector(selector);
  if (element && value !== undefined) element.innerHTML = value;
};
const setLabel = (id, value) => {
  const label = document.querySelector(`label[for="${id}"]`);
  if (label?.firstChild) label.firstChild.nodeValue = value;
};

function applyLanguage(lang) {
  const copy = languageData[lang] || languageData.pt;
  activeLanguage = lang in languageData ? lang : 'pt';
  document.documentElement.lang = copy.htmlLang;
  document.title = copy.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', copy.description);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', copy.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', copy.title);
  document.querySelectorAll('.main-nav a').forEach((link, index) => { link.textContent = copy.nav[index]; });
  document.querySelector('.main-nav')?.setAttribute('aria-label', copy.navLabel);
  setText('.hero-location', copy.heroLocation); setHtml('#titulo-principal', copy.heroTitle); setText('.hero .button', copy.heroCta);
  setText('#titulo-sobre', copy.storyTitle); setText('.paper p:not(.eyebrow)', copy.storyText); setText('.paper .button', copy.storyCta);
  setText('#titulo-experiencia', copy.experienceTitle); setText('.editorial-right .lead', copy.experienceText);
  setText('#titulo-videos', copy.videoTitle); setText('#texto-videos', copy.videoText); setText('.video-experience-action .button', copy.videoCta);
  document.querySelectorAll('[data-video-card]').forEach((card, index) => {
    const caption = copy.videoCaptions?.[index];
    if (caption) { setText('.video-caption p', caption[0], card); setText('.video-caption span', caption[1], card); }
    const control = card.querySelector('.video-control');
    const controlText = card.querySelector('.video-control-text');
    const playing = card.classList.contains('is-playing');
    if (control) control.setAttribute('aria-label', `${playing ? copy.videoPause : copy.videoPlay} vídeo ${index + 1}`);
    if (controlText) controlText.textContent = playing ? copy.videoPause : copy.videoPlay;
  });
  const stats = document.querySelectorAll('.stats span, .stats p');
  [copy.stats[0], copy.stats[1], copy.stats[2], copy.stats[3]].forEach((value, index) => { if (stats[index]) stats[index].textContent = value; });
  setText('#titulo-reserva', copy.reservationTitle);
  const reservationParagraphs = document.querySelectorAll('.reservation-intro > p:not(.eyebrow)');
  if (reservationParagraphs[0]) reservationParagraphs[0].textContent = copy.reservationText;
  if (reservationParagraphs[1]) reservationParagraphs[1].textContent = copy.reservationNote;
  setText('.reservation-phone', copy.phone); setText('.reservation-form h3', copy.formTitle);
  ['nome', 'telefone', 'data', 'hora', 'pessoas'].forEach((id, index) => setLabel(id, copy.labels[index]));
  const guestOptions = document.querySelectorAll('#pessoas option');
  if (guestOptions[0]) guestOptions[0].textContent = copy.peoplePlaceholder;
  copy.people.forEach((value, index) => { if (guestOptions[index + 1]) guestOptions[index + 1].textContent = value; });
  setText('.reservation-submit', copy.confirm);
  setText('#titulo-menu', copy.menuTitle);
  document.querySelectorAll('.dish').forEach((dish, index) => { setText('h3', copy.dishes[index][0], dish); setText('p', copy.dishes[index][1], dish); });
  setText('.menu-section .text-link', copy.menuLink);
  setText('#titulo-avaliacoes', copy.reviewsTitle); setText('.review-summary', copy.reviewsSummary);
  document.querySelectorAll('.signature-stats blockquote').forEach((review, index) => { setText('p', copy.reviews[index], review); const source = review.querySelector('footer span'); if (source) source.textContent = copy.reviewSource[index]; });
  setText('.review-link', copy.reviewLink); setText('#titulo-galeria', copy.galleryTitle);
  setText('#titulo-contato', copy.locationTitle); setText('.contact article > p:not(.eyebrow)', copy.locationText); setText('.contact-actions .button', copy.contactCta); setText('.inline-contact', copy.route);
  const footerTitles = document.querySelectorAll('.footer-grid > div > h3');
  footerTitles.forEach((title, index) => { if (copy.footerTitles[index]) title.textContent = copy.footerTitles[index]; });
  setHtml('.footer-grid > div:first-child p', copy.footerInfo); setText('.footer-brand p', copy.footerTagline); setHtml('.footer-grid > div:last-child p', copy.footerLocation);
  const footerLinks = document.querySelectorAll('.footer-grid > div:first-child a:last-child, .footer-grid > div:last-child a');
  footerLinks.forEach((link, index) => { if (copy.footerLinks[index]) link.textContent = copy.footerLinks[index]; });
  const languageToggle = document.querySelector('.language-toggle');
  languageToggle?.setAttribute('aria-label', copy.languageLabel);
  document.querySelector('.language-current').textContent = copy.short;
  document.querySelectorAll('[data-lang]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.lang === activeLanguage)));
  navToggle?.setAttribute('aria-label', nav?.classList.contains('open') ? copy.menuClose : copy.menuOpen);
  try { localStorage.setItem('gelo-language', activeLanguage); } catch { /* Storage can be unavailable in private contexts. */ }
  document.dispatchEvent(new CustomEvent('site:language'));
}

const languageSwitcher = document.querySelector('.language-switcher');
const languageToggle = document.querySelector('.language-toggle');
if (languageSwitcher && languageToggle) {
  const setLanguageMenu = (open) => {
    languageSwitcher.classList.toggle('open', open);
    languageToggle.setAttribute('aria-expanded', String(open));
  };
  languageToggle.addEventListener('click', () => setLanguageMenu(!languageSwitcher.classList.contains('open')));
  document.querySelectorAll('[data-lang]').forEach((button) => button.addEventListener('click', () => {
    applyLanguage(button.dataset.lang);
    setLanguageMenu(false);
    languageToggle.focus();
  }));
  document.addEventListener('click', (event) => { if (!languageSwitcher.contains(event.target)) setLanguageMenu(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && languageSwitcher.classList.contains('open')) { setLanguageMenu(false); languageToggle.focus(); } });
}

try { applyLanguage(localStorage.getItem('gelo-language') || 'pt'); } catch { applyLanguage('pt'); }

if (reservationForm && reservationStatus) {
  reservationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const copy = languageData[activeLanguage];
    if (!reservationForm.checkValidity()) {
      reservationStatus.textContent = copy.validation;
      reservationForm.reportValidity();
      return;
    }
    const data = new FormData(reservationForm);
    const date = new Date(`${data.get('data')}T12:00:00`).toLocaleDateString(copy.locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    const message = [copy.reservationMessage, '', `${copy.labels[0]}: ${data.get('nome')}`, `${copy.labels[1]}: ${data.get('telefone')}`, `${copy.labels[2]}: ${date}`, `${copy.labels[3]}: ${data.get('hora')}`, `${copy.labels[4]}: ${data.get('pessoas')}`].join('\n');
    const whatsAppWindow = window.open(`https://wa.me/351967573815?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    if (!whatsAppWindow) {
      reservationStatus.textContent = copy.popupBlocked;
      return;
    }
    reservationStatus.textContent = copy.opening;
    const guestCount = String(data.get('pessoas') || '').replace(/[^0-9+]/g, '');
    window.GeloTracking?.track('reservation_submit_valid', { guest_count: guestCount });
    window.GeloTracking?.track('whatsapp_reservation_opened', { guest_count: guestCount });
    window.GeloTracking?.sendLeadConversion();
  });
}
