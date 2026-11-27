(() => {
  'use strict';

  const DEFAULT_REPO = {
    owner: 'SanjayR857',
    repo: 'All-in-One-Notes',
    branch: 'main',
    path: ''
  };

  const TREE_CACHE_TTL_MS = 30 * 60 * 1000;
  const THEMES = ['light', 'dark', 'sepia'];

  const state = {
    owner: DEFAULT_REPO.owner,
    repo: DEFAULT_REPO.repo,
    branch: DEFAULT_REPO.branch,
    path: DEFAULT_REPO.path,
    files: [],          // Flat ordered list of .md paths
    treeRoot: null,     // Nested folder/file structure
    rawMarkdown: '',
    theme: localStorage.getItem('mdviewer_theme') || 'light',
    width: localStorage.getItem('mdviewer_width') || 'readable',
    pat: localStorage.getItem('mdviewer_pat') || '',
    tocObserver: null,
    searchSelectedIdx: 0,
    zoomScale: 1
  };

  // DOM References
  const el = {
    urlForm: document.getElementById('url-form'),
    urlInput: document.getElementById('github-url-input'),
    repoBadge: document.getElementById('repo-badge'),
    brandHome: document.getElementById('brand-home'),
    openGithubLink: document.getElementById('open-github-link'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    treeFilter: document.getElementById('tree-filter'),
    refreshTreeBtn: document.getElementById('refresh-tree-btn'),
    treeStatus: document.getElementById('tree-status'),
    fileTree: document.getElementById('file-tree'),
    readerPane: document.getElementById('reader-pane'),
    breadcrumbs: document.getElementById('breadcrumbs'),
    copyRawBtn: document.getElementById('copy-raw-btn'),
    frontmatterCard: document.getElementById('frontmatter-card'),
    statusBanner: document.getElementById('status-banner'),
    markdownBody: document.getElementById('markdown-body'),
    docPager: document.getElementById('doc-pager'),
    tocList: document.getElementById('toc-list'),
    themeToggle: document.getElementById('theme-toggle'),
    widthToggle: document.getElementById('width-toggle'),
    hljsTheme: document.getElementById('hljs-theme'),
    quickSearchBtn: document.getElementById('quick-search-btn'),
    searchModal: document.getElementById('search-modal'),
    quickSearchInput: document.getElementById('quick-search-input'),
    quickSearchResults: document.getElementById('quick-search-results'),
    mermaidModal: document.getElementById('mermaid-modal'),
    mermaidStage: document.getElementById('mermaid-modal-stage'),
    zoomLevel: document.getElementById('zoom-level'),
    zoomInBtn: document.getElementById('zoom-in-btn'),
    zoomOutBtn: document.getElementById('zoom-out-btn'),
    zoomResetBtn: document.getElementById('zoom-reset-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    patInput: document.getElementById('pat-input'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    clearCacheBtn: document.getElementById('clear-cache-btn')
  };

  /* =========================================================
     Initialization
     ========================================================= */
  function init() {
    applyTheme(state.theme, false);
    applyWidth(state.width);
    configureMarked();
    bindEvents();
    loadFromLocation();
  }

  function configureMarked() {
    if (window.marked) {
      window.marked.setOptions({
        gfm: true,
        breaks: false
      });
    }
  }

  /* =========================================================
     GitHub URL Parsing & Building
     ========================================================= */
  function parseGitHubUrl(input) {
    const trimmed = (input || '').trim();
    if (!trimmed) return { ...DEFAULT_REPO };

    // Handle owner/repo shorthand
    if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(trimmed)) {
      const [owner, repo] = trimmed.split('/');
      return { owner, repo, branch: null, path: '' };
    }

    let url;
    try {
      url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    } catch {
      return null;
    }

    const host = url.hostname.toLowerCase();
    const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

    if (host === 'raw.githubusercontent.com') {
      if (parts.length < 4) return null;
      const [owner, repo, branch, ...rest] = parts;
      return {
        owner,
        repo,
        branch: decodeURIComponent(branch),
        path: decodeURIComponent(rest.join('/'))
      };
    }

    if (host === 'github.com' || host === 'www.github.com') {
      if (parts.length < 2) return null;
      const owner = parts[0];
      const repo = parts[1].replace(/\.git$/, '');

      if (parts.length === 2) {
        return { owner, repo, branch: null, path: '' };
      }

      const mode = parts[2];
      if ((mode === 'blob' || mode === 'tree') && parts.length >= 4) {
        const branch = decodeURIComponent(parts[3]);
        const path = decodeURIComponent(parts.slice(4).join('/'));
        return { owner, repo, branch, path };
      }

      return { owner, repo, branch: null, path: '' };
    }

    return null;
  }

  function buildGitHubWebUrl(owner, repo, branch, path) {
    const base = `https://github.com/${owner}/${repo}`;
    if (!path) return base;
    const isFile = /\.md$/i.test(path);
    const kind = isFile ? 'blob' : 'tree';
    return `${base}/${kind}/${encodeURIComponent(branch)}/${path}`;
  }

  function buildRawUrl(owner, repo, branch, path) {
    return `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${path}`;
  }

  /* =========================================================
     GitHub API Helpers
     ========================================================= */
  function githubHeaders() {
    const headers = { Accept: 'application/vnd.github+json' };
    if (state.pat) {
      headers.Authorization = `Bearer ${state.pat}`;
    }
    return headers;
  }

  async function resolveDefaultBranch(owner, repo) {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: githubHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        return data.default_branch || 'main';
      }
    } catch {
      // Fallback below
    }
    return 'main';
  }

  async function fetchRepoTree(owner, repo, branch, forceRefresh = false) {
    const cacheKey = `mdviewer_tree:${owner}/${repo}@${branch}`;
    if (!forceRefresh) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (cached && Date.now() - cached.savedAt < TREE_CACHE_TTL_MS) {
          return cached.files;
        }
      } catch {
        // Ignore corrupt cache
      }
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
    const res = await fetch(apiUrl, { headers: githubHeaders() });

    if (!res.ok) {
      const remaining = res.headers.get('X-RateLimit-Remaining');
      if (res.status === 403 && remaining === '0') {
        throw new Error('GitHub API rate limit reached (60/hr). Add an optional token in Settings or paste a direct .md file URL.');
      }
      throw new Error(`Could not load repository tree (${res.status} ${res.statusText}).`);
    }

    const data = await res.json();
    const mdFiles = (data.tree || [])
      .filter((item) => item.type === 'blob' && /\.md$/i.test(item.path))
      .map((item) => item.path);

    try {
      localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), files: mdFiles }));
    } catch {
      // Ignore storage quota errors
    }

    return mdFiles;
  }

  /* =========================================================
     Tree Structure & Sidebar Rendering
     ========================================================= */
  function buildNestedTree(paths) {
    const root = { name: '', path: '', folders: new Map(), files: [] };

    for (const fullPath of paths) {
      const parts = fullPath.split('/');
      let node = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const seg = parts[i];
        const folderPath = parts.slice(0, i + 1).join('/');
        if (!node.folders.has(seg)) {
          node.folders.set(seg, { name: seg, path: folderPath, folders: new Map(), files: [] });
        }
        node = node.folders.get(seg);
      }
      node.files.push({ name: parts[parts.length - 1], path: fullPath });
    }

    // Sort recursively: index.md / README.md first, then folders, then files
    const sortNode = (node) => {
      node.files.sort((a, b) => {
        const rank = (f) => (/^readme\.md$/i.test(f.name) ? 0 : /^index\.md$/i.test(f.name) ? 1 : 2);
        const r = rank(a) - rank(b);
        return r !== 0 ? r : a.name.localeCompare(b.name, undefined, { numeric: true });
      });
      const sortedFolders = [...node.folders.entries()].sort((a, b) =>
        a[0].localeCompare(b[0], undefined, { numeric: true })
      );
      node.folders = new Map(sortedFolders);
      for (const child of node.folders.values()) {
        sortNode(child);
      }
    };

    sortNode(root);
    return root;
  }

  function flattenOrderedFiles(node, out = []) {
    for (const file of node.files) out.push(file.path);
    for (const folder of node.folders.values()) flattenOrderedFiles(folder, out);
    return out;
  }

  function countFiles(node) {
    let total = node.files.length;
    for (const child of node.folders.values()) total += countFiles(child);
    return total;
  }

  function formatLabel(rawName) {
    const clean = rawName.replace(/\.md$/i, '');
    if (/^index$/i.test(clean)) return 'Overview (index)';
    if (/^readme$/i.test(clean)) return 'README';
    return clean
      .split('-')
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ');
  }

  function renderFileTree(filterText = '') {
    el.fileTree.innerHTML = '';
    if (!state.treeRoot) return;

    const query = filterText.trim().toLowerCase();
    const frag = document.createDocumentFragment();

    const renderNode = (node, container) => {
      let hasVisibleChild = false;

      for (const folder of node.folders.values()) {
        const group = document.createElement('div');
        group.className = 'tree-group';

        const isActiveAncestor = state.path && state.path.startsWith(folder.path + '/');
        if (isActiveAncestor || query) {
          group.classList.add('open');
        }

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tree-folder-btn';
        btn.title = folder.path;
        btn.innerHTML = `
          <svg class="tree-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          <span class="tree-label">${escapeHtml(formatLabel(folder.name))}</span>
          <span class="tree-count">${countFiles(folder)}</span>
        `;
        btn.addEventListener('click', () => {
          group.classList.toggle('open');
        });

        const childrenWrap = document.createElement('div');
        childrenWrap.className = 'tree-children';

        const childVisible = renderNode(folder, childrenWrap);
        if (childVisible) {
          group.appendChild(btn);
          group.appendChild(childrenWrap);
          container.appendChild(group);
          hasVisibleChild = true;
        }
      }

      for (const file of node.files) {
        if (query && !file.path.toLowerCase().includes(query) && !formatLabel(file.name).toLowerCase().includes(query)) {
          continue;
        }

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tree-file-btn';
        if (file.path === state.path) {
          btn.classList.add('active');
        }
        btn.title = file.path;
        btn.innerHTML = `<span class="tree-label">${escapeHtml(formatLabel(file.name))}</span>`;
        btn.addEventListener('click', () => {
          navigateToPath(file.path);
          closeMobileSidebar();
        });
        container.appendChild(btn);
        hasVisibleChild = true;
      }

      return hasVisibleChild;
    };

    const any = renderNode(state.treeRoot, frag);
    if (!any) {
      el.fileTree.innerHTML = '<div class="tree-status">No matching notes found.</div>';
    } else {
      el.fileTree.appendChild(frag);
    }
  }

  /* =========================================================
     Navigation & Document Loading
     ========================================================= */
  async function loadTarget(target, { pushHistory = true, forceTreeRefresh = false, fragment = '' } = {}) {
    const owner = target.owner || DEFAULT_REPO.owner;
    const repo = target.repo || DEFAULT_REPO.repo;
    const repoChanged = owner !== state.owner || repo !== state.repo || !state.treeRoot;

    state.owner = owner;
    state.repo = repo;
    state.branch = target.branch || (repoChanged ? await resolveDefaultBranch(owner, repo) : state.branch);
    state.path = target.path || '';

    const webUrl = buildGitHubWebUrl(state.owner, state.repo, state.branch, state.path);
    el.urlInput.value = webUrl;
    el.repoBadge.textContent = state.repo;
    el.openGithubLink.href = webUrl;

    if (pushHistory) {
      syncBrowserHistory(fragment);
    }

    // Start loading raw file right away if path looks like a .md file
    const directFilePromise = /\.md$/i.test(state.path)
      ? loadMarkdownDocument(state.path, fragment)
      : null;

    // Load repository tree (cached)
    if (repoChanged || forceTreeRefresh) {
      el.treeStatus.textContent = `Loading ${state.owner}/${state.repo}...`;
      try {
        const rawFiles = await fetchRepoTree(state.owner, state.repo, state.branch, forceTreeRefresh);
        state.treeRoot = buildNestedTree(rawFiles);
        state.files = flattenOrderedFiles(state.treeRoot);
        el.treeStatus.textContent = `${state.files.length} Markdown notes · ${state.branch}`;
      } catch (err) {
        state.treeRoot = null;
        state.files = [];
        el.treeStatus.textContent = err.message;
      }
    }

    renderFileTree(el.treeFilter.value);

    if (directFilePromise) {
      await directFilePromise;
    } else {
      await resolveAndRenderNonFilePath(state.path, fragment);
    }

    renderBreadcrumbs();
    renderPager();
  }

  async function navigateToPath(newPath, fragment = '', pushHistory = true) {
    const cleanPath = newPath.replace(/^\/+/, '');
    state.path = cleanPath;

    const webUrl = buildGitHubWebUrl(state.owner, state.repo, state.branch, state.path);
    el.urlInput.value = webUrl;
    el.openGithubLink.href = webUrl;

    if (pushHistory) {
      syncBrowserHistory(fragment);
    }

    renderFileTree(el.treeFilter.value);
    await resolveAndRenderNonFilePath(state.path, fragment);
    renderBreadcrumbs();
    renderPager();
  }

  async function resolveAndRenderNonFilePath(targetPath, fragment = '') {
    // 1. Direct .md file
    if (/\.md$/i.test(targetPath)) {
      await loadMarkdownDocument(targetPath, fragment);
      return;
    }

    // 2. Root path: prefer README.md or index.md if present, else Home Dashboard
    const normalizedFolder = targetPath.replace(/\/+$/, '');
    if (!normalizedFolder) {
      const rootReadme = state.files.find((f) => /^readme\.md$/i.test(f));
      const rootIndex = state.files.find((f) => /^index\.md$/i.test(f));
      const rootDoc = rootIndex || rootReadme;
      if (rootDoc) {
        state.path = rootDoc;
        renderFileTree(el.treeFilter.value);
        await loadMarkdownDocument(rootDoc, fragment);
      } else {
        renderHomeDashboard();
      }
      return;
    }

    // 3. Folder path: check for <folder>/index.md or <folder>/README.md
    const candidateIndex = `${normalizedFolder}/index.md`;
    const candidateReadme = `${normalizedFolder}/README.md`;
    const match = state.files.find(
      (f) => f.toLowerCase() === candidateIndex.toLowerCase() || f.toLowerCase() === candidateReadme.toLowerCase()
    );

    if (match) {
      state.path = match;
      renderFileTree(el.treeFilter.value);
      await loadMarkdownDocument(match, fragment);
      return;
    }

    // 4. Fallback: probe raw index.md directly in case tree failed, otherwise folder listing
    const rawTry = await tryFetchRaw(candidateIndex);
    if (rawTry !== null) {
      state.path = candidateIndex;
      await renderMarkdownContent(rawTry, fragment);
    } else {
      renderFolderListing(normalizedFolder);
    }
  }

  async function tryFetchRaw(path) {
    try {
      const res = await fetch(buildRawUrl(state.owner, state.repo, state.branch, path));
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  }

  async function loadMarkdownDocument(path, fragment = '') {
    showStatus('Loading document...');
    el.frontmatterCard.classList.add('hidden');
    el.copyRawBtn.classList.add('hidden');

    try {
      const rawUrl = buildRawUrl(state.owner, state.repo, state.branch, path);
      const res = await fetch(rawUrl);
      if (!res.ok) {
        throw new Error(`Unable to fetch ${path} (HTTP ${res.status}).`);
      }
      const text = await res.text();
      hideStatus();
      await renderMarkdownContent(text, fragment);
    } catch (err) {
      el.markdownBody.innerHTML = '';
      el.tocList.innerHTML = '';
      showStatus(err.message, true);
    }
  }

  /* =========================================================
     Markdown, Frontmatter, Mermaid & Link Rewriting
     ========================================================= */
  function extractFrontmatter(raw) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!match) {
      return { meta: null, body: raw };
    }
    let meta = null;
    try {
      if (window.jsyaml) {
        meta = window.jsyaml.load(match[1]);
      }
    } catch {
      meta = null;
    }
    return {
      meta: meta && typeof meta === 'object' ? meta : null,
      body: raw.slice(match[0].length)
    };
  }

  function renderFrontmatterCard(meta) {
    if (!meta) {
      el.frontmatterCard.classList.add('hidden');
      el.frontmatterCard.innerHTML = '';
      return;
    }

    const badges = [];
    if (meta.category) badges.push(`<span class="fm-badge">${escapeHtml(String(meta.category))}</span>`);
    if (meta.type) badges.push(`<span class="fm-badge secondary">${escapeHtml(String(meta.type))}</span>`);

    const summary = meta.summary ? `<p class="fm-summary">${escapeHtml(String(meta.summary))}</p>` : '';

    const tags = Array.isArray(meta.tags) && meta.tags.length
      ? `<div class="fm-tags">${meta.tags.map((t) => `<span class="fm-tag">#${escapeHtml(String(t))}</span>`).join('')}</div>`
      : '';

    if (!badges.length && !summary && !tags) {
      el.frontmatterCard.classList.add('hidden');
      return;
    }

    el.frontmatterCard.innerHTML = `
      ${badges.length ? `<div class="fm-badges">${badges.join('')}</div>` : ''}
      ${summary}
      ${tags}
    `;
    el.frontmatterCard.classList.remove('hidden');
  }

  async function renderMarkdownContent(raw, fragment = '') {
    state.rawMarkdown = raw;
    el.copyRawBtn.classList.remove('hidden');

    const { meta, body } = extractFrontmatter(raw);
    renderFrontmatterCard(meta);

    const parsedHtml = window.marked.parse(body);
    const cleanHtml = window.DOMPurify.sanitize(parsedHtml, {
      ADD_ATTR: ['target', 'rel']
    });

    el.markdownBody.innerHTML = cleanHtml;
    document.title = `${meta?.title || formatLabel(state.path.split('/').pop() || state.repo)} — ${state.repo}`;

    rewriteLinksAndImages();
    enhanceCodeBlocks();
    await renderMermaidDiagrams();
    buildTableOfContents();

    if (fragment) {
      scrollToFragment(fragment);
    } else {
      el.readerPane.scrollTop = 0;
    }
  }

  function resolveRelativePath(baseFilePath, relPath) {
    const baseDir = baseFilePath.includes('/')
      ? baseFilePath.slice(0, baseFilePath.lastIndexOf('/') + 1)
      : '';
    const stack = baseDir.split('/').filter(Boolean);
    const segments = relPath.split('/');

    for (const seg of segments) {
      if (!seg || seg === '.') continue;
      if (seg === '..') {
        stack.pop();
      } else {
        stack.push(seg);
      }
    }
    return stack.join('/') + (relPath.endsWith('/') ? '/' : '');
  }

  function rewriteLinksAndImages() {
    const currentDirPath = state.path || '';

    // Images
    el.markdownBody.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src');
      if (!src || /^(https?:|data:|blob:)/i.test(src)) return;
      const resolved = resolveRelativePath(currentDirPath, src).replace(/\/$/, '');
      img.src = buildRawUrl(state.owner, state.repo, state.branch, resolved);
    });

    // Links
    el.markdownBody.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Same-page anchor
      if (href.startsWith('#')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          scrollToFragment(href.slice(1));
        });
        return;
      }

      // External URL: check if it's a GitHub link we can open inline
      if (/^https?:\/\//i.test(href)) {
        const ghTarget = parseGitHubUrl(href);
        if (ghTarget && (/\.md$/i.test(ghTarget.path) || ghTarget.owner === state.owner && ghTarget.repo === state.repo)) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const frag = href.includes('#') ? href.split('#')[1] : '';
            loadTarget(ghTarget, { fragment: frag });
          });
        } else {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
        return;
      }

      // Relative repository link
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        const [pathPart, frag = ''] = href.split('#');
        const cleanRel = decodeURIComponent(pathPart);
        const resolved = resolveRelativePath(currentDirPath, cleanRel);
        navigateToPath(resolved, frag);
      });
    });
  }

  function enhanceCodeBlocks() {
    el.markdownBody.querySelectorAll('pre').forEach((pre) => {
      const code = pre.querySelector('code');
      if (!code || code.classList.contains('language-mermaid')) return;

      if (window.hljs) {
        window.hljs.highlightElement(code);
      }

      const wrap = document.createElement('div');
      wrap.className = 'code-block-wrap';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'copy-code-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.textContent || '');
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
        } catch {
          copyBtn.textContent = 'Failed';
        }
      });
      wrap.appendChild(copyBtn);
    });
  }

  async function renderMermaidDiagrams() {
    if (!window.mermaid) return;

    const blocks = [...el.markdownBody.querySelectorAll('pre > code.language-mermaid')];
    if (!blocks.length) return;

    window.mermaid.initialize({
      startOnLoad: false,
      theme: state.theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose'
    });

    for (let i = 0; i < blocks.length; i++) {
      const codeEl = blocks[i];
      const pre = codeEl.parentElement;
      const source = codeEl.textContent || '';
      const id = `mermaid-svg-${Date.now()}-${i}`;

      try {
        const { svg } = await window.mermaid.render(id, source);
        const card = document.createElement('div');
        card.className = 'mermaid-card';
        card.dataset.mermaidSource = source;
        card.innerHTML = `<span class="mermaid-zoom-hint">Click to zoom</span>${svg}`;
        card.addEventListener('click', () => openMermaidModal(card.innerHTML));
        pre.replaceWith(card);
      } catch {
        // Leave fallback code block if diagram syntax fails
      }
    }
  }

  /* =========================================================
     Table of Contents & Scroll Spy
     ========================================================= */
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  function buildTableOfContents() {
    if (state.tocObserver) {
      state.tocObserver.disconnect();
      state.tocObserver = null;
    }

    el.tocList.innerHTML = '';
    const headings = [...el.markdownBody.querySelectorAll('h2, h3')];

    if (!headings.length) {
      el.tocList.innerHTML = '<div style="font-size:12px;color:var(--text-faint)">No subheadings</div>';
      return;
    }

    const usedIds = new Set();
    const linkMap = new Map();

    headings.forEach((h) => {
      let id = h.id || slugify(h.textContent || 'section');
      let suffix = 1;
      const baseId = id;
      while (usedIds.has(id)) {
        id = `${baseId}-${suffix++}`;
      }
      usedIds.add(id);
      h.id = id;

      const a = document.createElement('a');
      a.href = `#${id}`;
      a.className = `toc-link level-${h.tagName === 'H3' ? '3' : '2'}`;
      a.textContent = h.textContent || '';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToFragment(id);
      });
      el.tocList.appendChild(a);
      linkMap.set(id, a);
    });

    state.tocObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            linkMap.forEach((link) => link.classList.remove('active'));
            const active = linkMap.get(entry.target.id);
            if (active) active.classList.add('active');
            break;
          }
        }
      },
      { root: el.readerPane, rootMargin: '0px 0px -75% 0px', threshold: 0.1 }
    );

    headings.forEach((h) => state.tocObserver.observe(h));
  }

  function scrollToFragment(fragment) {
    if (!fragment) return;
    const target = document.getElementById(fragment) || document.getElementById(slugify(fragment));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* =========================================================
     Home Dashboard, Folder View, Breadcrumbs & Pager
     ========================================================= */
  function renderHomeDashboard() {
    hideStatus();
    el.frontmatterCard.classList.add('hidden');
    el.copyRawBtn.classList.add('hidden');
    el.tocList.innerHTML = '';
    document.title = `${state.repo} — Knowledge Base`;

    if (!state.treeRoot) {
      el.markdownBody.innerHTML = `
        <div class="home-hero">
          <h1>${escapeHtml(state.repo)}</h1>
          <p>Paste any GitHub repository or <code>.md</code> file URL above to start reading.</p>
        </div>
      `;
      return;
    }

    const cards = [...state.treeRoot.folders.values()]
      .map((folder) => {
        const count = countFiles(folder);
        const entryIndex = state.files.find(
          (f) =>
            f.toLowerCase() === `${folder.path}/index.md`.toLowerCase() ||
            f.toLowerCase() === `${folder.path}/readme.md`.toLowerCase()
        ) || state.files.find((f) => f.startsWith(folder.path + '/'));

        return `
          <button class="track-card" data-open-path="${escapeHtml(entryIndex || folder.path)}">
            <div class="track-card-title">${escapeHtml(formatLabel(folder.name))}</div>
            <div class="track-card-meta">${count} markdown notes · ${folder.folders.size} modules</div>
            <div class="track-card-cta">Open guide →</div>
          </button>
        `;
      })
      .join('');

    el.markdownBody.innerHTML = `
      <div class="home-hero">
        <h1>${escapeHtml(state.owner)} / ${escapeHtml(state.repo)}</h1>
        <p>${state.files.length} Markdown notes indexed on branch <code>${escapeHtml(state.branch)}</code>. Choose a track below or press <kbd>Ctrl</kbd>+<kbd>K</kbd> to jump anywhere.</p>
      </div>
      <div class="track-grid">${cards}</div>
    `;

    el.markdownBody.querySelectorAll('[data-open-path]').forEach((btn) => {
      btn.addEventListener('click', () => navigateToPath(btn.dataset.openPath));
    });
  }

  function renderFolderListing(folderPath) {
    hideStatus();
    el.frontmatterCard.classList.add('hidden');
    el.copyRawBtn.classList.add('hidden');
    el.tocList.innerHTML = '';

    const prefix = `${folderPath}/`;
    const childFiles = state.files.filter((f) => f.startsWith(prefix));

    const items = childFiles
      .map((f) => `<li><a href="#" data-file-path="${escapeHtml(f)}">${escapeHtml(f.slice(prefix.length))}</a></li>`)
      .join('');

    el.markdownBody.innerHTML = `
      <h1>${escapeHtml(formatLabel(folderPath.split('/').pop() || folderPath))}</h1>
      <p>Files inside <code>${escapeHtml(folderPath)}</code>:</p>
      <ul>${items || '<li>No markdown files found in this folder.</li>'}</ul>
    `;

    el.markdownBody.querySelectorAll('[data-file-path]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPath(a.dataset.filePath);
      });
    });
  }

  function renderBreadcrumbs() {
    const parts = state.path ? state.path.split('/').filter(Boolean) : [];
    const items = [`<button type="button" data-crumb="">${escapeHtml(state.repo)}</button>`];

    parts.forEach((seg, idx) => {
      items.push('<span>/</span>');
      if (idx === parts.length - 1) {
        items.push(`<span class="crumb-current">${escapeHtml(seg)}</span>`);
      } else {
        const subPath = parts.slice(0, idx + 1).join('/') + '/';
        items.push(`<button type="button" data-crumb="${escapeHtml(subPath)}">${escapeHtml(seg)}</button>`);
      }
    });

    el.breadcrumbs.innerHTML = items.join('');
    el.breadcrumbs.querySelectorAll('button[data-crumb]').forEach((btn) => {
      btn.addEventListener('click', () => navigateToPath(btn.dataset.crumb));
    });
  }

  function renderPager() {
    const idx = state.files.indexOf(state.path);
    if (idx === -1 || state.files.length < 2) {
      el.docPager.classList.add('hidden');
      el.docPager.innerHTML = '';
      return;
    }

    const prev = idx > 0 ? state.files[idx - 1] : null;
    const next = idx < state.files.length - 1 ? state.files[idx + 1] : null;

    let html = '';
    if (prev) {
      html += `
        <button type="button" class="pager-btn prev" data-pager-path="${escapeHtml(prev)}">
          <span class="pager-dir">← Previous</span>
          <span class="pager-title">${escapeHtml(formatLabel(prev.split('/').pop()))}</span>
        </button>
      `;
    }
    if (next) {
      html += `
        <button type="button" class="pager-btn next" data-pager-path="${escapeHtml(next)}">
          <span class="pager-dir">Next →</span>
          <span class="pager-title">${escapeHtml(formatLabel(next.split('/').pop()))}</span>
        </button>
      `;
    }

    el.docPager.innerHTML = html;
    el.docPager.classList.remove('hidden');
    el.docPager.querySelectorAll('[data-pager-path]').forEach((btn) => {
      btn.addEventListener('click', () => navigateToPath(btn.dataset.pagerPath));
    });
  }

  /* =========================================================
     URL & Browser History Sync (file:// safe)
     ========================================================= */
  function syncBrowserHistory(fragment = '') {
    const params = new URLSearchParams();
    params.set('repo', `${state.owner}/${state.repo}`);
    if (state.branch !== 'main') params.set('branch', state.branch);
    if (state.path) params.set('path', state.path);
    if (fragment) params.set('section', fragment);

    if (window.location.protocol === 'file:') {
      window.location.hash = params.toString();
      return;
    }

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ ...state }, '', nextUrl);
  }

  function loadFromLocation() {
    const rawSearch = window.location.protocol === 'file:'
      ? window.location.hash.replace(/^#/, '')
      : window.location.search.replace(/^\?/, '');

    const params = new URLSearchParams(rawSearch);
    const directUrl = params.get('url');

    if (directUrl) {
      const parsed = parseGitHubUrl(directUrl);
      if (parsed) {
        loadTarget(parsed, { pushHistory: false, fragment: params.get('section') || '' });
        return;
      }
    }

    const repoParam = params.get('repo');
    if (repoParam && repoParam.includes('/')) {
      const [owner, repo] = repoParam.split('/');
      loadTarget(
        {
          owner,
          repo,
          branch: params.get('branch') || null,
          path: params.get('path') || ''
        },
        { pushHistory: false, fragment: params.get('section') || '' }
      );
      return;
    }

    loadTarget(DEFAULT_REPO, { pushHistory: false });
  }

  /* =========================================================
     Modals, Theme, Events
     ========================================================= */
  function applyTheme(theme, rerenderDiagrams = true) {
    state.theme = THEMES.includes(theme) ? theme : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('mdviewer_theme', state.theme);

    el.hljsTheme.href = state.theme === 'dark'
      ? 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.10.0/build/styles/github-dark.min.css'
      : 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.10.0/build/styles/github.min.css';

    if (rerenderDiagrams && state.rawMarkdown && /\.md$/i.test(state.path)) {
      renderMarkdownContent(state.rawMarkdown);
    }
  }

  function applyWidth(width) {
    state.width = width === 'wide' ? 'wide' : 'readable';
    document.documentElement.setAttribute('data-width', state.width);
    localStorage.setItem('mdviewer_width', state.width);
  }

  function openSearchModal() {
    el.searchModal.classList.remove('hidden');
    el.quickSearchInput.value = '';
    renderSearchResults('');
    setTimeout(() => el.quickSearchInput.focus(), 10);
  }

  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    const matches = state.files
      .filter((p) => !q || p.toLowerCase().includes(q))
      .slice(0, 30);

    state.searchSelectedIdx = 0;
    el.quickSearchResults.innerHTML = matches.length
      ? matches
          .map(
            (p, idx) => `
          <li class="search-result-item ${idx === 0 ? 'selected' : ''}" data-search-path="${escapeHtml(p)}">
            <span class="search-result-name">${escapeHtml(formatLabel(p.split('/').pop()))}</span>
            <span class="search-result-path">${escapeHtml(p)}</span>
          </li>
        `
          )
          .join('')
      : '<li class="search-result-item"><span class="search-result-path">No matching files</span></li>';

    el.quickSearchResults.querySelectorAll('[data-search-path]').forEach((li) => {
      li.addEventListener('click', () => {
        closeModal('search-modal');
        navigateToPath(li.dataset.searchPath);
      });
    });
  }

  function openMermaidModal(cardHtml) {
    state.zoomScale = 1;
    el.mermaidStage.innerHTML = cardHtml;
    const hint = el.mermaidStage.querySelector('.mermaid-zoom-hint');
    if (hint) hint.remove();
    updateMermaidZoom();
    el.mermaidModal.classList.remove('hidden');
  }

  function updateMermaidZoom() {
    el.zoomLevel.textContent = `${Math.round(state.zoomScale * 100)}%`;
    const svg = el.mermaidStage.querySelector('svg');
    if (svg) {
      svg.style.transform = `scale(${state.zoomScale})`;
    }
  }

  function closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
  }

  function closeMobileSidebar() {
    document.body.classList.remove('mobile-sidebar-open');
    el.sidebarBackdrop.classList.add('hidden');
  }

  function showStatus(msg, isError = false) {
    el.statusBanner.textContent = msg;
    el.statusBanner.classList.toggle('error', isError);
    el.statusBanner.classList.remove('hidden');
  }

  function hideStatus() {
    el.statusBanner.classList.add('hidden');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function bindEvents() {
    el.urlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const parsed = parseGitHubUrl(el.urlInput.value);
      if (!parsed) {
        showStatus('Please enter a valid GitHub repository, folder, or .md file URL.', true);
        return;
      }
      loadTarget(parsed);
    });

    el.brandHome.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPath('');
    });

    el.treeFilter.addEventListener('input', () => renderFileTree(el.treeFilter.value));

    el.refreshTreeBtn.addEventListener('click', () => {
      loadTarget(
        { owner: state.owner, repo: state.repo, branch: state.branch, path: state.path },
        { pushHistory: false, forceTreeRefresh: true }
      );
    });

    el.sidebarToggle.addEventListener('click', () => {
      if (window.innerWidth <= 820) {
        const opening = !document.body.classList.contains('mobile-sidebar-open');
        document.body.classList.toggle('mobile-sidebar-open', opening);
        el.sidebarBackdrop.classList.toggle('hidden', !opening);
      } else {
        document.body.classList.toggle('sidebar-collapsed');
      }
    });

    el.sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    el.themeToggle.addEventListener('click', () => {
      const next = THEMES[(THEMES.indexOf(state.theme) + 1) % THEMES.length];
      applyTheme(next, true);
    });

    el.widthToggle.addEventListener('click', () => {
      applyWidth(state.width === 'readable' ? 'wide' : 'readable');
    });

    el.copyRawBtn.addEventListener('click', async () => {
      if (!state.rawMarkdown) return;
      await navigator.clipboard.writeText(state.rawMarkdown);
      const span = el.copyRawBtn.querySelector('span');
      if (span) {
        span.textContent = 'Copied!';
        setTimeout(() => { span.textContent = 'Copy MD'; }, 1500);
      }
    });

    el.quickSearchBtn.addEventListener('click', openSearchModal);

    el.quickSearchInput.addEventListener('input', () => {
      renderSearchResults(el.quickSearchInput.value);
    });

    el.quickSearchInput.addEventListener('keydown', (e) => {
      const items = [...el.quickSearchResults.querySelectorAll('[data-search-path]')];
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.searchSelectedIdx = (state.searchSelectedIdx + 1) % items.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.searchSelectedIdx = (state.searchSelectedIdx - 1 + items.length) % items.length;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = items[state.searchSelectedIdx];
        if (selected) {
          closeModal('search-modal');
          navigateToPath(selected.dataset.searchPath);
        }
        return;
      } else {
        return;
      }

      items.forEach((item, idx) => item.classList.toggle('selected', idx === state.searchSelectedIdx));
      items[state.searchSelectedIdx]?.scrollIntoView({ block: 'nearest' });
    });

    el.zoomInBtn.addEventListener('click', () => {
      state.zoomScale = Math.min(3, +(state.zoomScale + 0.25).toFixed(2));
      updateMermaidZoom();
    });
    el.zoomOutBtn.addEventListener('click', () => {
      state.zoomScale = Math.max(0.5, +(state.zoomScale - 0.25).toFixed(2));
      updateMermaidZoom();
    });
    el.zoomResetBtn.addEventListener('click', () => {
      state.zoomScale = 1;
      updateMermaidZoom();
    });

    el.settingsBtn.addEventListener('click', () => {
      el.patInput.value = state.pat;
      el.settingsModal.classList.remove('hidden');
    });

    el.saveSettingsBtn.addEventListener('click', () => {
      state.pat = el.patInput.value.trim();
      if (state.pat) {
        localStorage.setItem('mdviewer_pat', state.pat);
      } else {
        localStorage.removeItem('mdviewer_pat');
      }
      closeModal('settings-modal');
    });

    el.clearCacheBtn.addEventListener('click', () => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('mdviewer_tree:'))
        .forEach((k) => localStorage.removeItem(k));
      closeModal('settings-modal');
      loadTarget(
        { owner: state.owner, repo: state.repo, branch: state.branch, path: state.path },
        { pushHistory: false, forceTreeRefresh: true }
      );
    });

    document.querySelectorAll('[data-close]').forEach((node) => {
      node.addEventListener('click', () => closeModal(node.dataset.close));
    });

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchModal();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        el.sidebarToggle.click();
      } else if (e.key === 'Escape') {
        closeModal('search-modal');
        closeModal('mermaid-modal');
        closeModal('settings-modal');
      }
    });

    window.addEventListener('popstate', () => loadFromLocation());
  }

  init();
})();
