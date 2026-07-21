const state = { products: [], filter: 'all', lastProductTrigger: null };

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

async function loadData() {
  try {
    const response = await fetch('data/brand.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.products = data.products;
    renderProducts();
    renderColors(data.colors);
  } catch (error) {
    console.error('No se pudo cargar brand.json:', error);
    $('#product-grid').innerHTML = '<p class="load-error">No se pudo cargar el contenido. Intenta recargar la página.</p>';
  }
}

function renderProducts() {
  const grid = $('#product-grid');
  const products = state.filter === 'all'
    ? state.products
    : state.products.filter(product => product.category === state.filter);

  grid.innerHTML = products.map(product => `
    <article class="product-card searchable" data-search="${escapeHtml(`${product.name} ${product.category} ${product.age} ${product.tasting}`)}">
      <button type="button" data-product="${product.id}" aria-label="Abrir ficha de ${product.name}">
        <div class="product-image"><img src="${product.image}" alt="Botella de ${product.name}" loading="lazy"></div>
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3>${product.shortName}</h3>
          <p>${product.role}</p>
          <div class="product-meta"><span>${product.age}</span><span>${product.abv}</span></div>
        </div>
      </button>
    </article>
  `).join('');

  $$('[data-product]', grid).forEach(button => {
    button.addEventListener('click', () => {
      state.lastProductTrigger = button;
      openProduct(button.dataset.product);
    });
  });
}

function renderColors(colors) {
  const grid = $('#color-grid');
  grid.innerHTML = colors.map(color => {
    const dark = getLuminance(color.hex) < 0.52;
    return `
      <button class="color-chip ${dark ? 'light-text' : 'dark-text'}" style="background:${color.hex}" data-copy="${color.hex}" type="button" aria-label="Copiar ${color.hex}">
        <span class="copy">Copiar</span>
        <span><strong>${color.name}</strong><small>${color.use}</small></span>
        <code>${color.hex}</code>
      </button>`;
  }).join('');

  $$('[data-copy]', grid).forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        const label = $('.copy', button);
        label.textContent = 'Copiado';
        setTimeout(() => label.textContent = 'Copiar', 1200);
      } catch {
        window.prompt('Copia el valor:', value);
      }
    });
  });
}

function openProduct(id) {
  const product = state.products.find(item => item.id === id);
  if (!product) return;
  const dialog = $('#product-dialog');
  $('.dialog-image img', dialog).src = product.image;
  $('.dialog-image img', dialog).alt = `Botella de ${product.name}`;
  $('.dialog-category', dialog).textContent = product.category;
  $('.dialog-title', dialog).textContent = product.name;
  $('.dialog-age', dialog).textContent = product.age;
  $('.dialog-abv', dialog).textContent = product.abv;
  $('.dialog-description', dialog).textContent = product.description;
  $('.dialog-role', dialog).textContent = product.role;
  $('.dialog-tasting', dialog).textContent = product.tasting;
  $('.dialog-serve', dialog).textContent = product.serve;
  dialog.showModal();
}

function setupDialog() {
  const dialog = $('#product-dialog');
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
  dialog.addEventListener('close', () => {
    state.lastProductTrigger?.focus();
  });
}

function setupFilters() {
  $$('.filter').forEach(button => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      $$('.filter').forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      state.filter = button.dataset.filter;
      renderProducts();
    });
  });
}

function setupLogoThemes() {
  const preview = $('.logo-preview');
  if (!preview) return;
  const logo = $('img', preview);
  $$('[data-logo-theme]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      $$('[data-logo-theme]').forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      preview.dataset.theme = button.dataset.logoTheme;
      logo.src = button.dataset.logoSrc;
    });
  });
}

function setupResourceFilters() {
  const buttons = $$('[data-resource-filter]');
  const resources = $$('[data-resource-category]');
  if (!buttons.length) return;
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.resourceFilter;
      buttons.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      resources.forEach(resource => {
        const visible = category === 'all' || resource.dataset.resourceCategory === category;
        resource.classList.toggle('resource-hidden', !visible);
      });
    });
  });
}

function setupToggles() {
  $$('[data-toggle]').forEach(button => {
    const target = document.getElementById(button.dataset.toggle);
    const label = button.dataset.toggle === 'ritual' ? 'pasos' : 'checklist';
    button.setAttribute('aria-controls', target.id);
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', () => {
      const opening = target.hidden;
      target.hidden = !opening;
      button.innerHTML = `${opening ? 'Ocultar' : 'Ver'} ${label} <span>→</span>`;
      button.setAttribute('aria-expanded', String(opening));
    });
  });
}

function setupPersonality() {
  const tabs = $$('[data-personality]');
  if (!tabs.length) return;
  const traits = {
    segura: ['01', 'Segura', 'Habla desde hechos, experiencia y criterio. No necesita exagerar ni compararse para demostrar su valor.', '“Más de 260 años perfeccionando el tiempo.”', 'Superlativos vacíos, gritos y superioridad.'],
    refinada: ['02', 'Refinada', 'Cuida la forma, el ritmo y el detalle. Convierte la sofisticación en una experiencia clara y accesible.', '“Complejidad, equilibrio y un final que permanece.”', 'Ornamento excesivo, rigidez y lenguaje pretencioso.'],
    sensorial: ['03', 'Sensorial', 'Hace visible lo que se siente: madera, temperatura, textura, aroma, luz y permanencia.', '“Frutos confitados, roble y una entrada sedosa.”', 'Adjetivos genéricos que no permiten imaginar la experiencia.'],
    generosa: ['04', 'Generosa', 'Comparte conocimiento y disfrute. Invita a descubrir sin convertir la experiencia en una prueba de estatus.', '“Una copa para conversar, descubrir y compartir.”', 'Exclusión, condescendencia o códigos sociales cerrados.'],
    contemporanea: ['05', 'Contemporánea', 'Interpreta el legado desde el presente. Innova en ocasiones, formatos y cultura sin perder autenticidad.', '“Una tradición que sigue avanzando.”', 'Nostalgia inmóvil, modas oportunistas y recursos sin propósito.'],
    venezolana: ['06', 'Venezolana', 'Expresa origen con seguridad y precisión: Hacienda Altamira, Caribe, caña, oficio y hospitalidad.', '“Hecho en Macarapana. Reconocido en el mundo.”', 'Folclor superficial, clichés o exageraciones patrióticas.']
  };
  const fields = ['#personality-number', '#personality-title', '#personality-description', '#personality-do', '#personality-dont'];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => item.setAttribute('aria-selected', String(item === tab)));
    traits[tab.dataset.personality].forEach((value, index) => $(fields[index]).textContent = value);
  }));
}

function setupMenu() {
  const button = $('.menu-button');
  button.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('.side-nav a').forEach(link => link.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Abrir menú');
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
      document.body.classList.remove('menu-open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Abrir menú');
      button.focus();
    }
  });
}

function setupNavigationObserver() {
  const links = $$('.side-nav a');
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach(link => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, .15, .4] });
  sections.forEach(section => observer.observe(section));
}

function setupSearch() {
  const input = $('#site-search');
  const empty = $('#search-empty');
  let timer;

  const performSearch = () => {
    const term = normalize(input.value);
    const items = $$('.searchable');
    if (!term) {
      items.forEach(item => item.classList.remove('search-hidden', 'search-highlight'));
      empty.hidden = true;
      return;
    }

    let matches = 0;
    items.forEach(item => {
      const haystack = normalize(`${item.dataset.search || ''} ${item.textContent}`);
      const match = haystack.includes(term);
      item.classList.toggle('search-hidden', !match);
      item.classList.toggle('search-highlight', match && item.matches('article'));
      if (match) matches++;
    });
    empty.hidden = matches > 0;
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(performSearch, 80);
  });

  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      input.focus();
    }
    if (event.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      input.blur();
      performSearch();
    }
  });
}

function normalize(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function getLuminance(hex) {
  const rgb = hex.replace('#','').match(/.{2}/g).map(value => parseInt(value, 16) / 255)
    .map(value => value <= .03928 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4));
  return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
}

loadData();
setupDialog();
setupFilters();
setupLogoThemes();
setupResourceFilters();
setupToggles();
setupPersonality();
setupMenu();
setupNavigationObserver();
setupSearch();
