/*
 * Instrumentação de campanhas — sem PII.
 * IDs de fornecedores ficam vazios até serem configurados em index.html.
 */
(() => {
  'use strict';

  const config = window.GELO_TRACKING_CONFIG || {};
  const storageKey = 'gelo-consent-v1';
  const attributionKey = 'gelo-attribution-v1';
  const allowedConsent = new Set(['necessary', 'analytics', 'marketing']);
  let consent = 'necessary';
  let reservationStarted = false;
  let ga4Configured = false;
  let adsConfigured = false;
  let metaInitialized = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  const getCampaignContext = () => {
    try { return JSON.parse(sessionStorage.getItem(attributionKey) || '{}'); } catch { return {}; }
  };

  const captureAttribution = () => {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
    const context = keys.reduce((result, key) => {
      const value = params.get(key);
      if (value) result[key] = value.slice(0, 180);
      return result;
    }, {});
    if (Object.keys(context).length) {
      try { sessionStorage.setItem(attributionKey, JSON.stringify(context)); } catch { /* Storage can be unavailable. */ }
    }
  };

  const cleanProperties = (properties = {}) => Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== ''));

  const track = (event, properties = {}) => {
    const payload = cleanProperties({
      event,
      language: document.documentElement.lang || 'pt-PT',
      page_path: window.location.pathname,
      ...getCampaignContext(),
      ...properties
    });
    window.dataLayer.push(payload);

    if (consent !== 'necessary' && typeof window.gtag === 'function' && hasValid(config.ga4MeasurementId, /^G-[A-Z0-9]+$/i)) {
      window.gtag('event', event, cleanProperties({
        language: document.documentElement.lang || 'pt-PT',
        page_path: window.location.pathname,
        ...properties
      }));
    }
  };

  const loadScript = (id, src) => {
    if (document.getElementById(id)) return;
    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.append(script);
  };

  const hasValid = (value, pattern) => typeof value === 'string' && pattern.test(value.trim());

  const enableMarketingTags = () => {
    const ga4Id = config.ga4MeasurementId?.trim();
    const adsId = config.googleAdsId?.trim();
    const pixelId = config.metaPixelId?.trim();

    const analyticsAllowed = consent === 'analytics' || consent === 'marketing';
    const marketingAllowed = consent === 'marketing';
    const canLoadGoogle = (analyticsAllowed && hasValid(ga4Id, /^G-[A-Z0-9]+$/i)) || (marketingAllowed && hasValid(adsId, /^AW-\d+$/i));

    if (canLoadGoogle) {
      loadScript('google-tag', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id || adsId)}`);
      if (analyticsAllowed && hasValid(ga4Id, /^G-[A-Z0-9]+$/i) && !ga4Configured) {
        window.gtag('config', ga4Id, { send_page_view: true });
        ga4Configured = true;
      }
      if (marketingAllowed && hasValid(adsId, /^AW-\d+$/i) && !adsConfigured) {
        window.gtag('config', adsId);
        adsConfigured = true;
      }
    }

    if (marketingAllowed && hasValid(pixelId, /^\d+$/) && !metaInitialized) {
      window.fbq = window.fbq || function fbq() { (window.fbq.q = window.fbq.q || []).push(arguments); };
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      loadScript('meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js');
      metaInitialized = true;
    }
  };

  const updateConsent = (nextConsent) => {
    consent = allowedConsent.has(nextConsent) ? nextConsent : 'necessary';
    const analyticsGranted = consent === 'analytics' || consent === 'marketing' ? 'granted' : 'denied';
    const marketingGranted = consent === 'marketing' ? 'granted' : 'denied';
    window.gtag('consent', 'update', {
      ad_storage: marketingGranted,
      ad_user_data: marketingGranted,
      ad_personalization: marketingGranted,
      analytics_storage: analyticsGranted
    });
    try { localStorage.setItem(storageKey, consent); } catch { /* Storage can be unavailable. */ }
    // Analytics consent também deve carregar o GA4; campanhas apenas acrescentam
    // Google Ads/Meta quando o utilizador autoriza marketing.
    if (consent === 'analytics' || consent === 'marketing') enableMarketingTags();
    track('consent_updated', { consent_level: consent });
  };

  const sendLeadConversion = () => {
    const adsId = config.googleAdsId?.trim();
    const label = config.googleAdsConversionLabel?.trim();
    if (consent !== 'necessary' && typeof window.gtag === 'function' && hasValid(config.ga4MeasurementId, /^G-[A-Z0-9]+$/i)) {
      window.gtag('event', 'generate_lead', {
        lead_type: 'whatsapp_reservation',
        currency: 'EUR'
      });
    }
    if (consent === 'marketing' && hasValid(adsId, /^AW-\d+$/i) && label) {
      window.gtag('event', 'conversion', { send_to: `${adsId}/${label}` });
    }
    if (consent === 'marketing' && typeof window.fbq === 'function' && hasValid(config.metaPixelId, /^\d+$/)) {
      window.fbq('track', 'Lead');
    }
  };

  window.GeloTracking = { track, sendLeadConversion, getConsent: () => consent };

  const copy = {
    'pt-PT': { title: 'A sua privacidade', text: 'Usamos apenas cookies essenciais por padrão. Pode aceitar análises para melhorar o site ou permitir também medição de campanhas.', analytics: 'Aceitar análises', marketing: 'Aceitar campanhas', decline: 'Apenas essenciais', settings: 'Privacidade' },
    en: { title: 'Your privacy', text: 'We use essential cookies by default. You may accept analytics to improve the site or also allow campaign measurement.', analytics: 'Accept analytics', marketing: 'Accept campaigns', decline: 'Essential only', settings: 'Privacy' },
    es: { title: 'Su privacidad', text: 'Usamos cookies esenciales por defecto. Puede aceptar analítica para mejorar el sitio o también permitir la medición de campañas.', analytics: 'Aceptar analítica', marketing: 'Aceptar campañas', decline: 'Solo esenciales', settings: 'Privacidad' }
  };

  const getCopy = () => copy[document.documentElement.lang] || copy['pt-PT'];
  const renderConsentCopy = () => {
    const values = getCopy();
    document.querySelector('[data-consent-title]')?.replaceChildren(values.title);
    document.querySelector('[data-consent-text]')?.replaceChildren(values.text);
    document.querySelector('[data-consent-analytics]')?.replaceChildren(values.analytics);
    document.querySelector('[data-consent-marketing]')?.replaceChildren(values.marketing);
    document.querySelector('[data-consent-decline]')?.replaceChildren(values.decline);
    document.querySelector('[data-consent-settings]')?.replaceChildren(values.settings);
  };

  const showConsent = () => document.querySelector('.consent-banner')?.classList.add('is-visible');
  const hideConsent = () => document.querySelector('.consent-banner')?.classList.remove('is-visible');

  const createConsentUi = () => {
    const banner = document.createElement('aside');
    banner.className = 'consent-banner';
    banner.setAttribute('aria-label', 'Preferências de privacidade');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = '<div><strong data-consent-title></strong><p data-consent-text></p></div><div class="consent-actions"><button class="consent-essential" type="button" data-consent-decline></button><button class="consent-analytics" type="button" data-consent-analytics></button><button class="consent-accept" type="button" data-consent-marketing></button></div>';
    document.body.append(banner);
    banner.querySelector('[data-consent-marketing]').addEventListener('click', () => { updateConsent('marketing'); hideConsent(); });
    banner.querySelector('[data-consent-analytics]').addEventListener('click', () => { updateConsent('analytics'); hideConsent(); });
    banner.querySelector('[data-consent-decline]').addEventListener('click', () => { updateConsent('necessary'); hideConsent(); });

    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'consent-settings';
    settings.setAttribute('data-consent-settings', '');
    settings.addEventListener('click', showConsent);
    document.body.append(settings);
    renderConsentCopy();
  };

  const describeClick = (link) => {
    const href = link.getAttribute('href') || '';
    const section = link.closest('section, header, footer')?.id || link.closest('section')?.className?.split(' ')[0] || 'site';
    if (href.startsWith('tel:')) return ['phone_click', { cta_location: section }];
    if (href === '#reserva') return ['cta_click', { cta_name: 'reservation', cta_location: section }];
    if (/google\.com\/maps|share\.google/.test(href)) return [link.closest('#avaliacoes') ? 'google_business_review_click' : 'directions_click', { cta_location: section }];
    if (/instagram\.com/.test(href)) return ['social_click', { network: 'instagram', cta_location: section }];
    if (/\/menu/.test(href)) return ['menu_view_click', { cta_location: section }];
    return null;
  };

  const observeReservation = () => {
    const section = document.querySelector('#reserva');
    if (!section || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { track('view_reservation'); observer.disconnect(); }
    }, { threshold: 0.35 });
    observer.observe(section);
  };

  document.addEventListener('DOMContentLoaded', () => {
    captureAttribution();
    createConsentUi();
    try { consent = localStorage.getItem(storageKey) || 'necessary'; } catch { consent = 'necessary'; }
    if (consent === 'marketing') updateConsent('marketing'); else showConsent();

    document.addEventListener('site:language', () => track('language_selected', { selected_language: document.documentElement.lang }));
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      const result = describeClick(link);
      if (result) track(result[0], result[1]);
    });

    const form = document.querySelector('#form-reserva');
    form?.addEventListener('focusin', () => {
      if (!reservationStarted) { reservationStarted = true; track('reservation_form_started'); }
    }, { once: true });
    observeReservation();
  });
})();
