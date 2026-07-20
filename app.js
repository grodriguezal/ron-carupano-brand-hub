const state = { products: [], filter: 'all' };

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
    $('#product-grid').innerHTML = '<p class="load-error">No se pudo cargar el contenido. Abre el proyecto desde un servidor local o GitHub Pages.</p>';
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
    button.addEventListener('click', () => openProduct(button.dataset.product));
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
}

function setupFilters() {
  $$('.filter').forEach(button => {
    button.addEventListener('click', () => {
      $$('.filter').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      state.filter = button.dataset.filter;
      renderProducts();
    });
  });
}

function setupToggles() {
  $$('[data-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.toggle);
      const opening = target.hidden;
      target.hidden = !opening;
      button.firstChild.textContent = opening ? 'Ocultar ' : button.dataset.toggle === 'ritual' ? 'Ver pasos ' : 'Ver checklist ';
      button.setAttribute('aria-expanded', String(opening));
    });
  });
}

function setupMenu() {
  const button = $('.menu-button');
  button.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    button.setAttribute('aria-expanded', String(open));
  });
  $$('.side-nav a').forEach(link => link.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    button.setAttribute('aria-expanded', 'false');
  }));
}

function setupNavigationObserver() {
  const links = $$('.side-nav a');
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
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
setupToggles();
setupMenu();
setupNavigationObserver();
setupSearch();
