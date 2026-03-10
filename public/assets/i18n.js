(function () {
  if (!window.i18next || !window.i18nextHttpBackend || !window.i18nextBrowserLanguageDetector) return;

  var SUPPORTED_LANGS = ['en', 'de', 'es', 'pt', 'fr', 'zh'];
  var NICHE_TAB_ICONS = ['bitcoin', 'trophy', 'landmark', 'clapperboard', 'users', 'flame'];
  var NICHE_STATIC = [
    {
      accent: '#f7931a',
      accentRgb: '247,147,26',
      cards: [
        { type: 'single', img: './assets/images/bitcoin-150k.png', pct: 61, volValue: '$42k' },
        { type: 'single', img: './assets/images/ethereum-flippening.png', pct: 18, volValue: '$29k' },
        { type: 'multi', img: './assets/images/fed-rate-move.png', rowPcts: [42, 51, 7], volValue: '$31k' }
      ]
    },
    {
      accent: '#34d07f',
      accentRgb: '52,208,127',
      cards: [
        { type: 'multi', img: './assets/images/champions-league-top-scorer.png', rowPcts: [34, 28, 19], volValue: '$18k' },
        { type: 'single', img: './assets/images/warriors-playoffs.png', pct: 55, volValue: '$11k' },
        { type: 'single', img: './assets/images/daniel-negranu-wsop.png', pct: 38, volValue: '$8k' }
      ]
    },
    {
      accent: '#8b5cf6',
      accentRgb: '139,92,246',
      cards: [
        { type: 'single', img: './assets/images/elon-usa-election.png', pct: 42, volValue: '$331k' },
        { type: 'single', img: './assets/images/russia-x-ukraine.png', pct: 34, volValue: '$22k' },
        { type: 'multi', img: './assets/images/uk-general-election.png', rowPcts: [58, 28, 14], volValue: '$19k' }
      ]
    },
    {
      accent: '#f43f5e',
      accentRgb: '244,63,94',
      cards: [
        { type: 'single', img: './assets/images/marvel-opening-weekend.png', pct: 70, volValue: '$9k' },
        { type: 'multi', img: './assets/images/big-brother-brasil.png', rowPcts: [41, 33, 26], volValue: '$14k' },
        { type: 'single', img: './assets/images/taylor-swift-album.png', pct: 55, volValue: '$6k' }
      ]
    },
    {
      accent: '#4f8ef7',
      accentRgb: '79,142,247',
      cards: [
        { type: 'single', img: './assets/images/uniswap-v4-mainnet.png', pct: 73, volValue: '$7k' },
        { type: 'multi', img: './assets/images/governance-vote-chain.png', rowPcts: [55, 30, 15], volValue: '$5k' },
        { type: 'single', img: './assets/images/discord-50k-members.png', pct: 44, volValue: '$3k' }
      ]
    },
    {
      accent: '#f5c842',
      accentRgb: '245,200,66',
      cards: [
        { type: 'single', img: './assets/images/mrbeast-vs-tseries.png', pct: 67, volValue: '$21k' },
        { type: 'single', img: './assets/images/elon-500b-net-worth.png', pct: 38, volValue: '$15k' },
        { type: 'single', img: './assets/images/pop-star-arrest.png', pct: 12, volValue: '$9k' }
      ]
    }
  ];

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setText(target, value) {
    var el = typeof target === 'string' ? q(target) : target;
    if (el && typeof value === 'string') el.textContent = value;
  }

  function setHTML(target, value) {
    var el = typeof target === 'string' ? q(target) : target;
    if (el && typeof value === 'string') el.innerHTML = value;
  }

  function setAttr(target, attr, value) {
    var el = typeof target === 'string' ? q(target) : target;
    if (el && value != null) el.setAttribute(attr, value);
  }

  function t(key, options) {
    return window.i18next.t(key, options);
  }

  function toHtmlText(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function applyMeta(bundle) {
    document.documentElement.lang = window.i18next.resolvedLanguage || window.i18next.language || 'en';
    document.title = bundle.meta.title;
    setAttr('meta[name="description"]', 'content', bundle.meta.description);
    setAttr('meta[property="og:title"]', 'content', bundle.meta.ogTitle);
    setAttr('meta[property="og:description"]', 'content', bundle.meta.ogDescription);
    setAttr('meta[name="twitter:title"]', 'content', bundle.meta.twitterTitle);
    setAttr('meta[name="twitter:description"]', 'content', bundle.meta.twitterDescription);
  }

  function applyNav(bundle) {
    setText('nav .nb-solid', bundle.nav.cta);
    setAttr('#siteLanguageSelect', 'aria-label', bundle.languageSelector.ariaLabel);
  }

  function applyHero(bundle) {
    var heroLines = qa('.hero-title-line');
    setText('.hero-kicker', bundle.hero.kicker);
    setText(heroLines[0], bundle.hero.titleLine1);
    setText(heroLines[1], bundle.hero.titleLine2);
    setText('.hero-copy-sub', bundle.hero.subtitle);
    setText('.hero-copy-actions .btn-cta', bundle.hero.cta);
    setText('.hero-copy-proof', bundle.hero.proof);
    setText('.site-preview-url', bundle.hero.previewUrl);
  }

  function applyMarketProof(bundle) {
    var cards = qa('#p2 .mn');
    setText('#p2 .slbl', bundle.social.eyebrow);
    setText('#p2 .sh', bundle.social.title);
    setText('#p2 .bt', bundle.social.subtitle);
    setHTML('#p2 .live-badge', '<div class="live-dot"></div>' + toHtmlText(bundle.social.badge));
    cards.forEach(function (card, index) {
      var data = bundle.social.cards[index];
      if (!data) return;
      setText(q('.mn-label', card), data.label);
      setHTML(q('.mn-sub', card), data.subHtml);
    });
  }

  function applyProblems(bundle) {
    var cards = qa('#p1 .mini-card');
    setText('#p1 .slbl', bundle.problems.eyebrow);
    setText('#p1 .sh', bundle.problems.title);
    setText('#p1 .bt', bundle.problems.subtitle);
    cards.forEach(function (card, index) {
      var data = bundle.problems.cards[index];
      if (!data) return;
      setText(q('.mini-card-title', card), data.title);
      setText(q('.mini-card-copy', card), data.copy);
    });
  }

  function applySolution(bundle) {
    var points = qa('#p3 .solution-point');
    setText('#p3 .slbl', bundle.solution.eyebrow);
    setText('#p3 .sh', bundle.solution.title);
    setText('#p3 .bt', bundle.solution.subtitle);
    setText('#solutionCtaBtn', bundle.hero.cta);
    setText('#solutionCtaNote', bundle.hero.proof);
    points.forEach(function (point, index) {
      var data = bundle.solution.points[index];
      if (!data) return;
      setText(q('h3', point), data.title);
      setText(q('p', point), data.copy);
    });

    setText('#marketMockTitle', bundle.solution.mock.title);
    setText('#marketMockChanceSuffix', bundle.solution.mock.chanceSuffix);
    setText('#marketMockLogoLabel', bundle.solution.mock.logoLabel);
    setHTML('#marketMockMeta', bundle.solution.mock.metaHtml);
    setText('#marketMockYesBtn', bundle.solution.mock.yesButton);
    setText('#marketMockNoBtn', bundle.solution.mock.noButton);
  }

  function renderFeatureTradeFeed(data) {
    var track = q('.mini-trade-track');
    if (!track || !data || !data.length) return;
    var html = data.concat(data.slice(0, 2)).map(function (item) {
      return '<div class="mini-trade-row">'
        + '<span class="mini-trade-avatar">' + toHtmlText(item.avatar) + '</span>'
        + '<span class="mini-trade-text"><span class="mini-trade-name">' + toHtmlText(item.name) + '</span> '
        + '<span class="mini-trade-verb">' + toHtmlText(item.action) + '</span> '
        + '<strong class="mini-trade-outcome is-' + toHtmlText(item.sideClass) + '">' + toHtmlText(item.side) + '</strong> '
        + '<span class="mini-trade-entry-price">' + toHtmlText(item.entry) + '</span></span>'
        + '</div>';
    }).join('');
    track.innerHTML = html;
  }

  function applyFeatures(bundle) {
    var cards = qa('#p4 .mini-card');
    setText('#p4 .slbl', bundle.features.eyebrow);
    setText('#p4 .sh', bundle.features.title);
    setText('#p4 .bt', bundle.features.subtitle);

    if (cards[0]) {
      setText(q('.mini-card-title', cards[0]), bundle.features.cards[0].title);
      setText(q('.mini-card-copy', cards[0]), bundle.features.cards[0].copy);
    }
    if (cards[1]) {
      setText(q('.mini-card-title', cards[1]), bundle.features.cards[1].title);
      setText(q('.mini-card-copy', cards[1]), bundle.features.cards[1].copy);
      setText(q('.mini-vote-question', cards[1]), bundle.features.cards[1].question);
      var voteButtons = qa('.mini-vote-btn', cards[1]);
      setText(voteButtons[0], bundle.common.yes);
      setText(voteButtons[1], bundle.common.no);
    }
    if (cards[2]) {
      setText(q('.mini-card-title', cards[2]), bundle.features.cards[2].title);
      setText(q('.mini-card-copy', cards[2]), bundle.features.cards[2].copy);
      setText(q('.mini-trade-head > span:first-child', cards[2]), bundle.features.cards[2].feedStatus);
      setText(q('.mini-trade-status', cards[2]), bundle.features.cards[2].feedLabel);
      var dot = document.createElement('span');
      dot.className = 'mini-trade-status-dot';
      var status = q('.mini-trade-status', cards[2]);
      if (status) {
        status.innerHTML = '';
        status.appendChild(dot);
        status.appendChild(document.createTextNode(bundle.features.cards[2].feedLabel));
      }
      renderFeatureTradeFeed(bundle.features.cards[2].trades);
    }
  }

  function applyCalculator(bundle) {
    var calcLabels = qa('#p5 .calc-label');
    setText('#p5 .slbl', bundle.calculator.eyebrow);
    setText('#p5 .sh', bundle.calculator.title);
    setText(calcLabels[0], bundle.calculator.dailyVolumeLabel);
    setText(calcLabels[1], bundle.calculator.feeLabel);
    setAttr('#feeSlider', 'aria-label', bundle.calculator.dailyVolumeAriaLabel);
    setAttr('#feeRateDown', 'aria-label', bundle.calculator.decreaseFeeAriaLabel);
    setAttr('#feeRateUp', 'aria-label', bundle.calculator.increaseFeeAriaLabel);
    setText('#p5 .calc-result-label', bundle.calculator.resultLabel);
    setText('#p5 .calc-note', bundle.calculator.note);
    setText('#calculatorCtaPrompt', bundle.calculator.ctaPrompt);
    setText('#calculatorCtaBtn', bundle.hero.cta);
    setText('#calculatorCtaNote', bundle.hero.proof);
  }

  function applyWhyNow(bundle) {
    var cards = qa('#p6 .mn');
    setText('#p6 .slbl', bundle.whyNow.eyebrow);
    setText('#p6 .sh', bundle.whyNow.title);
    setText('#p6 .bt', bundle.whyNow.subtitle);
    cards.forEach(function (card, index) {
      var data = bundle.whyNow.cards[index];
      if (!data) return;
      setText(q('.mn-label', card), data.label);
      setText(q('.mn-sub', card), data.sub);
    });
  }

  function buildNicheData(bundle) {
    return NICHE_STATIC.map(function (staticNiche, nicheIndex) {
      var translated = bundle.niches.data[nicheIndex];
      return {
        tag: translated.tag,
        accent: staticNiche.accent,
        accentRgb: staticNiche.accentRgb,
        tagline: translated.tagline,
        cards: staticNiche.cards.map(function (staticCard, cardIndex) {
          var translatedCard = translated.cards[cardIndex];
          var merged = {
            type: staticCard.type,
            img: staticCard.img,
            title: translatedCard.title,
            vol: staticCard.volValue + ' ' + bundle.niches.volumeSuffix,
            cat: translatedCard.cat
          };
          if (staticCard.type === 'single') {
            merged.pct = staticCard.pct;
          } else {
            merged.rows = staticCard.rowPcts.map(function (pct, rowIndex) {
              return {
                label: translatedCard.rows[rowIndex],
                pct: pct
              };
            });
          }
          return merged;
        })
      };
    });
  }

  function applyNiches(bundle) {
    var tabs = qa('#nicheTabs .niche-tab');
    setText('#p7 .slbl', bundle.niches.eyebrow);
    setText('#p7 .sh', bundle.niches.title);
    setText('#nichesCtaPrompt', bundle.niches.ctaPrompt);
    setText('#nichesCtaBtn', bundle.hero.cta);
    setText('#nichesCtaNote', bundle.hero.proof);
    window.KUEST_I18N_UI = {
      yes: bundle.common.yes,
      no: bundle.common.no,
      chance: bundle.common.chance
    };
    tabs.forEach(function (tab, index) {
      if (!bundle.niches.tabs[index]) return;
      tab.innerHTML = '<i data-lucide="' + NICHE_TAB_ICONS[index] + '"></i> ' + toHtmlText(bundle.niches.tabs[index]);
    });
    window.NICHE_DATA = buildNicheData(bundle);
    if (typeof window.showNiche === 'function') {
      window.showNiche(typeof window.currentNiche === 'number' ? window.currentNiche : 0);
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function applyFaq(bundle) {
    var html = bundle.faq.items.map(function (item) {
      return '<details class="faq-item">'
        + '<summary class="faq-q">' + toHtmlText(item.q) + '</summary>'
        + '<div class="faq-a">' + item.aHtml + '</div>'
        + '</details>';
    }).join('');
    setText('#p8 .slbl', bundle.faq.eyebrow);
    setHTML('#p8 .sh', bundle.faq.titleHtml);
    setHTML('#p8 .faq-list', html);
  }

  function applyFinalCta(bundle) {
    setText('#p9 .slbl', bundle.finalCta.eyebrow);
    setText('#p9 .cta-h', bundle.finalCta.title);
    setText('#p9 .cta-sub', bundle.finalCta.subtitle);
    setText('#p9 .btn-cta', bundle.finalCta.cta);
    setText('#p9 .cta-note', bundle.finalCta.note);
  }

  function applyFooter(bundle) {
    var links = qa('.foot-links a');
    if (links[0]) links[0].textContent = bundle.footer.launch;
    if (links[1]) links[1].textContent = bundle.footer.demo;
    if (links[2]) links[2].textContent = bundle.footer.docs;
    if (links[5]) links[5].textContent = bundle.footer.contact;
    setText('#footerLiveText', bundle.footer.live);
  }

  function applySourceModal(bundle) {
    setText('#sourceModalOutlet', bundle.sourceModal.outlet);
    setText('#sourceModalTitle', bundle.sourceModal.title);
    setText('#sourceModalLoading', bundle.sourceModal.loading);
    setText('#sourceModalNote', bundle.sourceModal.note);
    setText('#sourceModalExternal', bundle.sourceModal.external);
    setText('.source-modal-actions button[data-source-close]', bundle.sourceModal.back);
    window.KUEST_I18N = {
      t: function (key, options) {
        return window.i18next.t(key, options);
      }
    };
  }

  function syncSelectors(lng) {
    var topSelect = q('#siteLanguageSelect');
    var demoSelect = q('#languageDemoSelect');
    if (topSelect && topSelect.value !== lng) topSelect.value = lng;
    if (demoSelect && demoSelect.querySelector('option[value="' + lng + '"]')) {
      demoSelect.value = lng;
      demoSelect.dispatchEvent(new Event('change'));
    }
  }

  function applyAll() {
    var lng = window.i18next.resolvedLanguage || window.i18next.language || 'en';
    var bundle = window.i18next.getResourceBundle(lng, 'translation');
    if (!bundle) return;

    applyMeta(bundle);
    applyNav(bundle);
    applyHero(bundle);
    applyMarketProof(bundle);
    applyProblems(bundle);
    applySolution(bundle);
    applyFeatures(bundle);
    applyCalculator(bundle);
    applyWhyNow(bundle);
    applyNiches(bundle);
    applyFaq(bundle);
    applyFinalCta(bundle);
    applyFooter(bundle);
    applySourceModal(bundle);
    syncSelectors(lng);
  }

  function initLanguageSelector() {
    var select = q('#siteLanguageSelect');
    if (!select) return;
    select.addEventListener('change', function () {
      window.i18next.changeLanguage(select.value);
    });
  }

  window.i18next
    .use(window.i18nextHttpBackend)
    .use(window.i18nextBrowserLanguageDetector)
    .init({
      fallbackLng: 'en',
      supportedLngs: SUPPORTED_LANGS,
      nonExplicitSupportedLngs: true,
      load: 'languageOnly',
      debug: false,
      ns: ['translation'],
      defaultNS: 'translation',
      returnNull: false,
      backend: {
        loadPath: './assets/locales/{{lng}}.json'
      },
      detection: {
        order: ['querystring', 'localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupQuerystring: 'lang'
      }
    })
    .then(function () {
      initLanguageSelector();
      applyAll();
      window.i18next.on('languageChanged', applyAll);
    });
})();
