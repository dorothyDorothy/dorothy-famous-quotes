/**
 * Wisdom100 - Vanilla JavaScript Application
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State ---
  const state = {
    currentQuote: null,
    activeCategory: 'all',
    searchQuery: '',
    categories: [],
    quotes: []
  };

  // --- DOM Elements ---
  const heroCard = document.getElementById('heroQuoteCard');
  const heroText = document.getElementById('heroQuoteText');
  const heroAuthor = document.getElementById('heroAuthor');
  const heroYear = document.getElementById('heroYear');
  const heroCategory = document.getElementById('heroCategory');
  const heroIdBadge = document.getElementById('heroIdBadge');

  const newQuoteBtn = document.getElementById('newQuoteBtn');
  const copyQuoteBtn = document.getElementById('copyQuoteBtn');
  const shareQuoteBtn = document.getElementById('shareQuoteBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const resultsCountBadge = document.getElementById('resultsCountBadge');
  const activeFilterNotice = document.getElementById('activeFilterNotice');
  const categoryPillsContainer = document.getElementById('categoryPillsContainer');
  const quotesGrid = document.getElementById('quotesGrid');
  const emptyState = document.getElementById('emptyState');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const toast = document.getElementById('toast');

  let searchDebounceTimeout = null;

  // --- Theme Management ---
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  // --- Toast Feedback ---
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // --- Hero Quote Rendering ---
  function displayHeroQuote(quote) {
    if (!quote) return;
    state.currentQuote = quote;

    // Smooth fade transition
    heroText.classList.add('fade-out');
    setTimeout(() => {
      heroText.textContent = `"${quote.quote}"`;
      heroAuthor.textContent = quote.author;
      heroYear.textContent = quote.year ? `(${quote.year})` : '';
      heroCategory.textContent = quote.category;
      heroIdBadge.textContent = `#${quote.id} of 100`;

      heroText.classList.remove('fade-out');
    }, 150);

    // Update active highlight in grid
    document.querySelectorAll('.quote-item-card').forEach(card => {
      const cardId = parseInt(card.dataset.id, 10);
      if (cardId === quote.id) {
        card.classList.add('is-active-hero');
      } else {
        card.classList.remove('is-active-hero');
      }
    });
  }

  // --- API Calls ---
  async function fetchRandomQuote() {
    try {
      const params = new URLSearchParams();
      if (state.activeCategory && state.activeCategory !== 'all') {
        params.append('category', state.activeCategory);
      }
      if (state.currentQuote) {
        params.append('exclude_id', state.currentQuote.id);
      }

      const res = await fetch(`/api/quote/random?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch random quote');
      const data = await res.json();
      displayHeroQuote(data.quote);
    } catch (err) {
      console.error(err);
      showToast('Could not load random quote.');
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      state.categories = data.categories;
      renderCategoryPills();
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchQuotes() {
    try {
      const params = new URLSearchParams();
      if (state.activeCategory && state.activeCategory !== 'all') {
        params.append('category', state.activeCategory);
      }
      if (state.searchQuery.trim()) {
        params.append('search', state.searchQuery.trim());
      }

      const res = await fetch(`/api/quotes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch quotes');
      const data = await res.json();
      state.quotes = data.quotes;
      renderQuotesGrid();
      updateFilterNotice();
    } catch (err) {
      console.error(err);
    }
  }

  // --- Rendering UI ---
  function renderCategoryPills() {
    categoryPillsContainer.innerHTML = '';
    state.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `pill ${state.activeCategory.toLowerCase() === cat.name.toLowerCase() ? 'active' : ''}`;
      btn.dataset.category = cat.name;
      btn.setAttribute('role', 'tab');
      btn.innerHTML = `${cat.name} <span class="pill-count">${cat.count}</span>`;
      btn.addEventListener('click', () => {
        selectCategory(cat.name);
      });
      categoryPillsContainer.appendChild(btn);
    });
  }

  function selectCategory(category) {
    state.activeCategory = category;

    // Update pill styles
    document.querySelectorAll('.category-pills-scroll .pill').forEach(pill => {
      const pillCat = pill.dataset.category || 'all';
      if (pillCat.toLowerCase() === category.toLowerCase()) {
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-selected', 'false');
      }
    });

    fetchQuotes();
  }

  function renderQuotesGrid() {
    quotesGrid.innerHTML = '';
    const total = state.quotes.length;
    resultsCountBadge.textContent = `${total} quote${total === 1 ? '' : 's'} available`;

    if (total === 0) {
      emptyState.classList.remove('hidden');
      quotesGrid.style.display = 'none';
      return;
    }

    emptyState.classList.add('hidden');
    quotesGrid.style.display = 'grid';

    state.quotes.forEach(quote => {
      const card = document.createElement('article');
      card.className = 'quote-item-card';
      card.dataset.id = quote.id;

      if (state.currentQuote && state.currentQuote.id === quote.id) {
        card.classList.add('is-active-hero');
      }

      card.innerHTML = `
        <div class="card-top">
          <span class="badge">${quote.category}</span>
          <span class="quote-id-badge">#${quote.id}</span>
        </div>
        <p class="card-text">"${escapeHtml(quote.quote)}"</p>
        <div class="card-footer">
          <span class="card-author">${escapeHtml(quote.author)}</span>
          <span class="card-action-hint">&#10022; View</span>
        </div>
      `;

      card.addEventListener('click', () => {
        displayHeroQuote(quote);
        heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      quotesGrid.appendChild(card);
    });
  }

  function updateFilterNotice() {
    const parts = [];
    if (state.activeCategory && state.activeCategory !== 'all') {
      parts.push(`category "${state.activeCategory}"`);
    }
    if (state.searchQuery.trim()) {
      parts.push(`search "${state.searchQuery.trim()}"`);
    }

    if (parts.length > 0) {
      activeFilterNotice.textContent = `Filtered by: ${parts.join(' and ')}`;
      clearSearchBtn.classList.toggle('visible', !!state.searchQuery);
    } else {
      activeFilterNotice.textContent = '';
      clearSearchBtn.classList.remove('visible');
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Copy & Share Actions ---
  async function copyCurrentQuote() {
    if (!state.currentQuote) return;
    const shareText = `"${state.currentQuote.quote}"\n— ${state.currentQuote.author}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        showToast('Quote copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Quote copied to clipboard!');
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      showToast('Failed to copy to clipboard.');
    }
  }

  function shareCurrentQuote() {
    if (!state.currentQuote) return;
    const text = `"${state.currentQuote.quote}" — ${state.currentQuote.author}`;
    if (navigator.share) {
      navigator.share({
        title: 'Quote of the Day',
        text: text,
        url: window.location.href
      }).catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });
    } else {
      // Twitter / X Web Intent
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(tweetUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  }

  function resetAllFilters() {
    state.activeCategory = 'all';
    state.searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');

    // Reset active category pills
    document.querySelectorAll('.category-pills-scroll .pill').forEach(pill => {
      const pillCat = pill.dataset.category || 'all';
      pill.classList.toggle('active', pillCat === 'all');
      pill.setAttribute('aria-selected', pillCat === 'all' ? 'true' : 'false');
    });

    fetchQuotes();
  }

  // --- Event Listeners ---
  newQuoteBtn.addEventListener('click', fetchRandomQuote);
  copyQuoteBtn.addEventListener('click', copyCurrentQuote);
  shareQuoteBtn.addEventListener('click', shareCurrentQuote);
  themeToggleBtn.addEventListener('click', toggleTheme);
  resetFiltersBtn.addEventListener('click', resetAllFilters);

  // 'All' category pill click
  const allCategoryPill = document.querySelector('.pill[data-category="all"]');
  if (allCategoryPill) {
    allCategoryPill.addEventListener('click', () => {
      selectCategory('all');
    });
  }

  // Live Search with Debounce
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimeout);
    const value = e.target.value;
    clearSearchBtn.classList.toggle('visible', !!value);

    searchDebounceTimeout = setTimeout(() => {
      state.searchQuery = value;
      fetchQuotes();
    }, 250);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    clearSearchBtn.classList.remove('visible');
    fetchQuotes();
    searchInput.focus();
  });

  // Keyboard shortcut: Spacebar or 'N' for next random quote (when not typing in an input)
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === ' ' || e.key.toLowerCase() === 'r') {
      e.preventDefault();
      fetchRandomQuote();
    }
  });

  // --- Initialization ---
  initTheme();
  fetchCategories();
  fetchRandomQuote();
  fetchQuotes();
});
