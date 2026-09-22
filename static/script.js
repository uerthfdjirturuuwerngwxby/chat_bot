// Tab navigation
const summarizerTab = document.getElementById('summarizer-tab');
const chatbotTab = document.getElementById('chatbot-tab');
const summarizerSection = document.getElementById('summarizer-section');
const chatbotSection = document.getElementById('chatbot-section');
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

function buildPageSkeleton() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.className = 'fixed inset-0 z-50 overflow-hidden bg-[#f5f9ff] transition-opacity duration-500';
  loader.innerHTML = `
    <div class="mx-auto w-[min(1180px,calc(100%-2rem))] pt-5">
      <div class="h-16 animate-pulse rounded-3xl border border-slate-100 bg-white shadow-sm"></div>
      <div class="mt-7 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <div class="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div class="h-4 w-28 animate-pulse rounded bg-slate-200"></div>
          <div class="mt-5 h-10 w-4/5 animate-pulse rounded bg-slate-200"></div>
          <div class="mt-3 h-4 w-3/5 animate-pulse rounded bg-slate-100"></div>
          <div class="mt-8 flex gap-3"><div class="h-11 w-32 animate-pulse rounded-xl bg-blue-100"></div><div class="h-11 w-28 animate-pulse rounded-xl bg-slate-100"></div></div>
        </div>
        <div class="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm"><div class="h-5 w-32 animate-pulse rounded bg-slate-200"></div><div class="mt-5 h-3 w-full animate-pulse rounded bg-slate-100"></div><div class="mt-3 h-3 w-4/5 animate-pulse rounded bg-slate-100"></div><div class="mt-7 h-20 animate-pulse rounded-2xl bg-blue-50"></div></div>
      </div>
      <div class="mt-7 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm"><div class="flex items-center gap-4"><div class="h-11 w-11 animate-pulse rounded-full bg-slate-200"></div><div class="flex-1"><div class="h-4 w-40 animate-pulse rounded bg-slate-200"></div><div class="mt-3 h-3 w-2/3 animate-pulse rounded bg-slate-100"></div></div></div><div class="mt-6 h-3 w-full animate-pulse rounded bg-slate-100"></div><div class="mt-3 h-3 w-11/12 animate-pulse rounded bg-slate-100"></div></div>
      <div class="mt-5 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm"><div class="flex items-center gap-4"><div class="h-11 w-11 animate-pulse rounded-full bg-slate-200"></div><div class="flex-1"><div class="h-4 w-32 animate-pulse rounded bg-slate-200"></div><div class="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-100"></div></div></div><div class="mt-6 h-3 w-full animate-pulse rounded bg-slate-100"></div></div>
    </div>`;
}

buildPageSkeleton();

function createAmbientBackground() {
  if (!window.THREE || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('ambient-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 7;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const group = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(0.12, 1);
  const colors = [0x60a5fa, 0x818cf8, 0x38bdf8];
  for (let i = 0; i < 22; i += 1) {
    const material = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.3 });
    const icon = new THREE.Mesh(geometry, material);
    icon.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 3);
    icon.userData = { speed: 0.001 + Math.random() * 0.002, offset: Math.random() * Math.PI * 2 };
    group.add(icon);
  }
  scene.add(group);

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  function animate(time) {
    group.children.forEach((icon) => {
      icon.rotation.x += icon.userData.speed;
      icon.rotation.y += icon.userData.speed * 1.5;
      icon.position.y += Math.sin(time * 0.001 + icon.userData.offset) * 0.0009;
    });
    group.rotation.y = time * 0.000025;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(animate);
}

window.addEventListener('load', createAmbientBackground);

function startInterfaceAnimations() {
  if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.site-header', { y: -18, duration: 0.45 })
      .from('.hero-panel > :not(.hero-orbit)', { y: 16, duration: 0.45, stagger: 0.1 }, '-=0.15')
      .from('.tabs', { y: 12, duration: 0.35 }, '-=0.18');

    gsap.to('.hero-orbit', { rotation: 360, duration: 26, repeat: -1, ease: 'none' });

    const revealPanel = (panel) => {
      if (panel.dataset.revealed || panel.classList.contains('hidden')) return;
      panel.dataset.revealed = 'true';
      gsap.from(panel, { y: 22, duration: 0.55, ease: 'power3.out' });
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) revealPanel(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.page-panel').forEach((panel) => observer.observe(panel));
  }

  if (window.anime && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    anime({
      targets: '.hero-orbit span',
      translateY: [-7, 7],
      rotate: [-5, 5],
      delay: anime.stagger(180),
      direction: 'alternate',
      easing: 'easeInOutSine',
      duration: 1500,
      loop: true,
    });

    document.querySelectorAll('.button, .tab, .hero-feature').forEach((element) => {
      element.addEventListener('mouseenter', () => anime({ targets: element, scale: 1.025, duration: 180, easing: 'easeOutQuad' }));
      element.addEventListener('mouseleave', () => anime({ targets: element, scale: 1, duration: 220, easing: 'easeOutQuad' }));
    });
  }
}

let summaryLottie;
function initialiseLottieLoader() {
  if (!window.lottie) return;
  summaryLottie = lottie.loadAnimation({
    container: document.getElementById('summary-loader'),
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: 'https://assets2.lottiefiles.com/packages/lf20_usmfx6bp.json',
  });
}

window.addEventListener('load', () => {
  startInterfaceAnimations();
  initialiseLottieLoader();
  window.lucide?.createIcons();


  const loader = document.getElementById('page-loader');
  setTimeout(() => { loader.classList.add('opacity-0', 'pointer-events-none'); }, 550);
  setTimeout(() => loader.remove(), 1100);
  const heading = document.getElementById('summary-heading');
  if (heading && window.RoughNotation) RoughNotation.annotate(heading, { type: 'underline', color: '#67e8f9', strokeWidth: 2, padding: 4, animate: true, animationDuration: 700 }).show();
  // Do not hide core workspace panels during animations.
  document.querySelectorAll('.page-panel').forEach((panel) => {
    panel.style.opacity = '1';
    panel.style.visibility = 'visible';
    panel.style.transform = 'none';
  });
});

window.addEventListener('scroll', () => {
  document.querySelector('.site-header').classList.toggle('scrolled', window.scrollY > 12);
}, { passive: true });

function updatePageMode(page) {
  const isChat = page === 'chat';
  summarizerTab.classList.toggle('tab-active', !isChat);
  chatbotTab.classList.toggle('tab-active', isChat);
  summarizerSection.classList.toggle('hidden', isChat);
  chatbotSection.classList.toggle('hidden', !isChat);
  summarizerSection.classList.toggle('active', !isChat);
  chatbotSection.classList.toggle('active', isChat);

  [summarizerSection, chatbotSection].forEach((section) => {
    section.style.opacity = '1';
    section.style.visibility = 'visible';
    section.style.transform = 'none';
  });

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', linkPage === page);
  });

  document.title = `InsightFlow | ${isChat ? 'Chat' : 'Summary'}`;
  siteNav.classList.add('hidden');
}

function navigateTo(page) {
  const targetHash = `#${page}`;
  if (window.location.hash !== targetHash) {
    window.location.hash = page;
  } else {
    updatePageMode(page);
  }
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  updatePageMode(hash === 'chat' ? 'chat' : 'summary');
}

navToggle.addEventListener('click', () => {
  siteNav.classList.toggle('hidden');
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const page = link.getAttribute('href').replace('#', '');
    navigateTo(page);
  });
});

summarizerTab.addEventListener('click', () => navigateTo('summary'));
chatbotTab.addEventListener('click', () => navigateTo('chat'));
window.addEventListener('hashchange', handleRoute);
handleRoute();

// PDF summarizer upload UI
const pdfDropzone = document.getElementById('pdf-dropzone');
const pdfUpload = document.getElementById('pdf-upload');
const supportedExtensions = ['pdf', 'docx', 'txt'];
function isSupportedDocument(file) {
  return file && supportedExtensions.includes(file.name.split('.').pop().toLowerCase());
}

pdfDropzone.addEventListener('click', () => pdfUpload.click());
pdfUpload.addEventListener('change', handlePdfSelect);
pdfDropzone.addEventListener('drop', handlePdfDrop);
pdfDropzone.addEventListener('dragover', preventDefaults);
pdfDropzone.addEventListener('dragleave', preventDefaults);

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handlePdfSelect(e) {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    if (isSupportedDocument(file)) {
      updateDropzone(file);
    } else {
      alert('Please upload a PDF, DOCX, or TXT file');
      pdfUpload.value = '';
      resetDropzone();
    }
  }
}

function handlePdfDrop(e) {
  preventDefaults(e);
  const file = e.dataTransfer.files[0];
  if (isSupportedDocument(file)) {
    updateDropzone(file);
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    pdfUpload.files = dataTransfer.files;
  } else {
    alert('Upload a PDF, DOCX, or TXT file.');
    resetDropzone();
  }
}

function updateDropzone(file) {
  pdfDropzone.innerHTML = `
    <div class="text-center">
      <p class="text-lg font-bold !text-slate-900">${escapeHTML(file.name)}</p>
      <p class="mt-1 !text-slate-600">${(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to summarize</p>
    </div>`;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatAssistantOutput(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  const formatted = [];
  let listType = null;
  let hasTitle = false;
  let sectionIndex = 0;

  function sectionHeading(title) {
    const lowerTitle = title.replace(/<[^>]*>/g, '').toLowerCase();
    const matchingTheme = [
      { words: ['project', 'experience', 'work'], theme: 'violet', icon: 'fa-code' },
      { words: ['skill', 'technology', 'technical', 'tool'], theme: 'cyan', icon: 'fa-screwdriver-wrench' },
      { words: ['education', 'academic', 'course'], theme: 'amber', icon: 'fa-graduation-cap' },
      { words: ['achievement', 'award', 'certification'], theme: 'rose', icon: 'fa-trophy' },
      { words: ['profile', 'about', 'overview'], theme: 'emerald', icon: 'fa-user-astronaut' },
    ].find(({ words }) => words.some((word) => lowerTitle.includes(word)));
    const themes = ['violet', 'cyan', 'amber', 'rose', 'emerald'];
    const theme = matchingTheme?.theme || themes[sectionIndex % themes.length];
    const icon = matchingTheme?.icon || 'fa-layer-group';
    sectionIndex += 1;
    const palette = { violet: 'border-violet-300 bg-violet-100 text-violet-800', cyan: 'border-cyan-300 bg-cyan-100 text-cyan-800', amber: 'border-amber-300 bg-amber-100 text-amber-800', rose: 'border-rose-300 bg-rose-100 text-rose-800', emerald: 'border-emerald-300 bg-emerald-100 text-emerald-800' };
    return `<h3 class="mt-7 flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-base font-bold ${palette[theme]}"><span class="text-sm">✦</span>${title}</h3>`;
  }

  function closeList() {
    if (listType) {
      formatted.push(`</${listType}>`);
      listType = null;
    }
  }

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      const heading = inlineMarkdown(headingMatch[2]);
      if (level === 1 || level === 2) {
        formatted.push(`<div class="mb-5 flex items-center gap-3 border-b border-blue-200 pb-4"><span class="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30"><i data-lucide="file-text" class="h-4 w-4"></i></span><h2 class="text-2xl font-bold text-slate-900">${heading}</h2></div>`);
        hasTitle = true;
      } else {
        formatted.push(sectionHeading(heading));
      }
      return;
    }

    // Some model responses use bold text as a section heading instead of ###.
    const boldHeadingMatch = trimmedLine.match(/^(?:\d+\.\s*)?\*{2,3}(.+?)\*{2,3}\s*[–—:-]?$/);
    if (boldHeadingMatch) {
      closeList();
      const heading = escapeHTML(boldHeadingMatch[1].trim());
      formatted.push(hasTitle
        ? sectionHeading(heading)
        : `<div class="mb-5 flex items-center gap-3 border-b border-blue-200 pb-4"><span class="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30"><i data-lucide="file-text" class="h-4 w-4"></i></span><h2 class="text-2xl font-bold text-slate-900">${heading}</h2></div>`);
      hasTitle = true;
      return;
    }

    // Tolerate responses such as "**Profile** – details" (and stray bullets).
    const inlineSectionMatch = trimmedLine.match(/^[.\s*-]*\*{2,3}(.+?)\*{2,3}\s*\*?\s*[–—:-]\s*(.+)$/);
    if (inlineSectionMatch) {
      closeList();
      const heading = escapeHTML(inlineSectionMatch[1].trim());
      formatted.push(hasTitle
        ? sectionHeading(heading)
        : `<div class="mb-5 flex items-center gap-3 border-b border-blue-200 pb-4"><span class="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30"><i data-lucide="file-text" class="h-4 w-4"></i></span><h2 class="text-2xl font-bold text-slate-900">${heading}</h2></div>`);
      formatted.push(`<p>${inlineMarkdown(inlineSectionMatch[2].trim())}</p>`);
      hasTitle = true;
      return;
    }

    const listMatch = trimmedLine.match(/^[-*•]\s+(.+)$/);
    if (listMatch) {
      if (listType !== 'ul') {
        closeList();
        formatted.push('<ul>');
        listType = 'ul';
      }
      formatted.push(`<li>${inlineMarkdown(listMatch[1])}</li>`);
      return;
    }

    const numberedMatch = trimmedLine.match(/^\d+[.)]\s+(.+)$/);
    if (numberedMatch) {
      if (listType !== 'ol') {
        closeList();
        formatted.push('<ol>');
        listType = 'ol';
      }
      formatted.push(`<li>${inlineMarkdown(numberedMatch[1])}</li>`);
      return;
    }

    closeList();
    if (!trimmedLine) {
      return;
    }

    formatted.push(`<p>${inlineMarkdown(trimmedLine)}</p>`);
  });

  closeList();
  return formatted.join('');
}

function inlineMarkdown(value) {
  return escapeHTML(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function resetDropzone() {
  pdfDropzone.innerHTML = `
    <i class="fas fa-cloud-upload-alt upload-icon"></i>
    <p class="upload-title">Drag & drop your PDF here</p>
    <p class="upload-subtitle">or browse files to upload</p>
    <label for="pdf-upload" class="upload-button">Browse files</label>`;
}

// Generate summary
const generateButton = document.getElementById('generate-summary');
const summaryResults = document.getElementById('summary-results');

function showSummarySkeleton() {
  document.getElementById('summary-loader').classList.remove('hidden');
  summaryLottie?.play();
  summaryResults.innerHTML = `
    <div class="grid min-h-44 content-center gap-4" aria-label="Generating summary" role="status">
      <div class="flex items-center gap-3 text-slate-800"><span class="inline-flex h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></span><span class="font-semibold">Creating your summary</span></div>
      <div class="h-5 w-2/5 animate-pulse rounded bg-slate-500/45"></div>
      <div class="h-3 w-full animate-pulse rounded bg-slate-500/40"></div>
      <div class="h-3 w-4/5 animate-pulse rounded bg-slate-500/40"></div>
      <div class="h-12 w-full animate-pulse rounded-xl bg-slate-500/35"></div>
      <p class="text-sm text-slate-600">Reading your document and organizing the important details...</p>
    </div>`;
}

generateButton.addEventListener('click', async () => {
  if (!pdfUpload.files.length) {
    alert('Please upload a PDF file first');
    return;
  }

  generateButton.disabled = true;
  generateButton.innerHTML = '<i class="fas fa-spinner fa-spin button-icon"></i> Processing...';
  showSummarySkeleton();

  const formData = new FormData();
  formData.append('pdf', pdfUpload.files[0]);
  formData.append('summary_length', document.getElementById('summary-length').value);
  formData.append('summary_style', document.getElementById('summary-style').value);

  try {
    const response = await fetch('/result', { method: 'POST', body: formData });
    const data = await response.json();

    if (data.summary) {
      summaryResults.innerHTML = formatAssistantOutput(data.summary);
      const summaryTitleIcon = summaryResults.querySelector('div > span');
      if (summaryTitleIcon) {
        summaryTitleIcon.className = 'grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30';
        summaryTitleIcon.innerHTML = '<i data-lucide="file-text" class="h-4 w-4"></i>';
        window.lucide?.createIcons();
      }
      if (window.mojs && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new mojs.Burst({
          parent: document.getElementById('generate-burst'),
          radius: { 0: 55 },
          count: 9,
          children: { shape: 'circle', radius: { 4: 0 }, fill: ['#60a5fa', '#818cf8', '#38bdf8'], duration: 650 },
        }).play();
      }
    } else {
      throw new Error(data.error || 'No summary returned.');
    }
  } catch (error) {
    console.error(error);
    summaryResults.innerHTML = `<p class="error-text">${error.message || 'Unable to generate summary.'}</p>`;
  } finally {
    document.getElementById('summary-loader').classList.add('hidden');
    summaryLottie?.stop();
    generateButton.disabled = false;
    generateButton.innerHTML = '<i class="fa-solid fa-magic button-icon"></i> Generate Summary';
  }
});

// Chat upload + messages
const chatPdfUpload = document.getElementById('chat-pdf-upload');
chatPdfUpload.accept = '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';
const chatbotFileName = document.getElementById('chatbot-file-name');
const contextFileName = document.getElementById('context-file-name');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message');
const voiceInputBtn = document.createElement('button');
voiceInputBtn.id = 'voice-input';
voiceInputBtn.type = 'button';
voiceInputBtn.title = 'Speak your question';
voiceInputBtn.className = 'grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-violet-200 bg-white text-violet-700 transition hover:bg-violet-50';
voiceInputBtn.innerHTML = '<i data-lucide="mic" class="h-5 w-5"></i>';
chatInput.insertAdjacentElement('afterend', voiceInputBtn);
chatInput.parentElement.classList.remove('sm:grid-cols-[1fr_auto]');
chatInput.parentElement.classList.add('sm:grid-cols-[1fr_auto_auto]');
document.documentElement.style.scrollBehavior = 'smooth';
window.lucide?.createIcons();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  voiceInputBtn.addEventListener('click', () => {
    recognition.start();
    voiceInputBtn.classList.add('animate-pulse', 'bg-violet-600', 'text-white');
  });
  recognition.addEventListener('result', (event) => {
    chatInput.value = event.results[0][0].transcript;
    chatInput.focus();
  });
  recognition.addEventListener('end', () => voiceInputBtn.classList.remove('animate-pulse', 'bg-violet-600', 'text-white'));
} else {
  voiceInputBtn.disabled = true;
  voiceInputBtn.title = 'Voice input is not supported by this browser';
  voiceInputBtn.classList.add('cursor-not-allowed', 'opacity-50');
}
const chatSection = document.getElementById('chatbot-section');
const conversationRail = chatSection.querySelector('aside:first-of-type > div');
const contextPanel = chatSection.querySelector('aside:last-of-type .space-y-4');
let conversationEntryCount = 0;
let activeConversationEntry = null;
const conversationRecords = [];

const selectedMessagePanel = document.createElement('div');
selectedMessagePanel.className = 'rounded-2xl border border-blue-100 bg-white p-3';
selectedMessagePanel.innerHTML = '<p class="text-slate-500">Selected message</p><p class="mt-1 text-slate-400">Choose an item from the history rail.</p>';
contextPanel.appendChild(selectedMessagePanel);

const conversationNavigator = document.createElement('div');
conversationNavigator.className = 'flex items-center justify-center gap-2 border-t border-slate-100 bg-white px-4 py-2';
conversationNavigator.innerHTML = '<button id="previous-conversation" class="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-violet-700" type="button" title="Previous conversation"><i data-lucide="chevron-up" class="h-4 w-4"></i></button><span id="conversation-position" class="min-w-12 text-center text-xs font-semibold text-slate-500">0 / 0</span><button id="next-conversation" class="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-violet-700" type="button" title="Next conversation"><i data-lucide="chevron-down" class="h-4 w-4"></i></button>';
chatMessages.insertAdjacentElement('afterend', conversationNavigator);
let selectedConversationIndex = -1;

function selectConversation(index) {
  if (index < 0 || index >= conversationRecords.length) return;
  selectedConversationIndex = index;
  conversationRecords[index].entry.click();
  document.getElementById('conversation-position').textContent = `${index + 1} / ${conversationRecords.length}`;
}

document.getElementById('previous-conversation').addEventListener('click', () => selectConversation(selectedConversationIndex - 1));
document.getElementById('next-conversation').addEventListener('click', () => selectConversation(selectedConversationIndex + 1));
window.lucide?.createIcons();

function addConversationEntry(content, isUser, messageElement) {
  if (!isUser && activeConversationEntry) {
    activeConversationEntry.answer = content;
    activeConversationEntry.messageElement = messageElement;
    return activeConversationEntry;
  }
  conversationEntryCount += 1;
  const entryNumber = conversationEntryCount;
  const entry = document.createElement('button');
  entry.type = 'button';
  entry.className = 'grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 focus:bg-violet-100';
  entry.textContent = entryNumber;
  entry.title = isUser ? `Question ${entryNumber}` : `Answer ${entryNumber}`;
  const record = { entry, entryNumber, question: content, answer: '', messageElement };
  activeConversationEntry = record;
  conversationRecords.push(record);
  entry.addEventListener('click', () => {
    conversationRail.querySelectorAll('button').forEach((button) => button.classList.remove('bg-violet-600', 'text-white', 'border-violet-600'));
    entry.classList.add('bg-violet-600', 'text-white', 'border-violet-600');
    const selected = record;
    selectedMessagePanel.innerHTML = `<p class="text-slate-500">Conversation ${entryNumber}</p><p class="mt-2 text-xs font-bold uppercase tracking-wider text-violet-600">Question</p><p class="mt-1 max-h-20 overflow-y-auto font-medium leading-6 text-slate-800">${escapeHTML(selected.question)}</p>${selected.answer ? `<p class="mt-3 text-xs font-bold uppercase tracking-wider text-blue-600">Answer</p><p class="mt-1 max-h-24 overflow-y-auto leading-6 text-slate-700">${inlineMarkdown(selected.answer)}</p>` : ''}`;
    selected.messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  conversationRail.appendChild(entry);
  document.getElementById('conversation-position').textContent = `${conversationRecords.length} / ${conversationRecords.length}`;
  return record;
}

chatPdfUpload.addEventListener('change', async () => {
  const file = chatPdfUpload.files[0];
  if (!file) return;

  if (!isSupportedDocument(file)) {
    alert('Please upload a PDF, DOCX, or TXT file');
    chatbotFileName.textContent = 'No document loaded';
    chatPdfUpload.value = '';
    return;
  }

  chatbotFileName.textContent = file.name;
  contextFileName.textContent = file.name;
  const formData = new FormData();
  formData.append('pdf', file);

  try {
    await fetch('/result', { method: 'POST', body: formData });
    addSystemMessage('Document loaded! Ask anything about it.');
  } catch (error) {
    console.error(error);
    addSystemMessage('Failed to load the document.');
  }
});

sendMessageBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') sendMessage();
});

function addMessage(content, isUser = false, conversationRecord = null) {
  chatMessages.querySelector('.chat-placeholder')?.remove();
  const message = document.createElement('div');
  message.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  const safeContent = isUser ? escapeHTML(content) : formatAssistantOutput(content);
  message.innerHTML = isUser
    ? `<div class="max-w-[78%] rounded-2xl rounded-br-md bg-violet-600 px-4 py-3 text-white shadow-sm"><div class="mb-1 flex items-center justify-between gap-4"><p class="text-[11px] font-bold uppercase tracking-wider text-violet-200">You</p><span class="flex gap-2"><button class="edit-question text-violet-200 transition hover:text-white" type="button" aria-label="Edit question"><i data-lucide="pencil" class="h-3.5 w-3.5"></i></button><button class="delete-message text-violet-200 transition hover:text-white" type="button" aria-label="Delete question"><i data-lucide="trash-2" class="h-3.5 w-3.5"></i></button></span></div><p class="question-content">${safeContent}</p></div>`
    : `<div class="max-w-[88%] rounded-2xl rounded-bl-md border border-blue-100 bg-blue-50 px-5 py-4 text-slate-800 shadow-sm"><div class="mb-3 flex items-center justify-between gap-3 text-sm font-bold text-blue-700"><span class="flex items-center gap-2"><span class="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-white"><i data-lucide="file-text" class="h-4 w-4"></i></span> InsightFlow answer</span><button class="delete-message text-blue-500 transition hover:text-blue-800" type="button" aria-label="Delete answer"><i data-lucide="trash-2" class="h-3.5 w-3.5"></i></button></div><div class="chat-answer leading-7">${safeContent}</div></div>`;
  chatMessages.appendChild(message);
  window.lucide?.createIcons();
  let record = conversationRecord || addConversationEntry(content, isUser, message);
  if (!isUser && conversationRecord) {
    record.answer = content;
    record.messageElement = message;
  }
  if (isUser) {
    message.querySelector('.edit-question').addEventListener('click', () => {
      const updated = window.prompt('Edit your question', content);
      if (updated?.trim()) {
        message.querySelector('.question-content').textContent = updated.trim();
        record.question = updated.trim();
        regenerateAnswer(updated.trim(), record);
      }
    });
  }
  message.querySelector('.delete-message').addEventListener('click', () => message.remove());
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
}

async function regenerateAnswer(question, record) {
  const previousAnswer = record.answer ? record.messageElement : null;
  previousAnswer?.remove();
  record.answer = '';
  const loader = createAnswerSkeleton();
  chatMessages.appendChild(loader);
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
  try {
    const response = await fetch('/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question }) });
    const data = await response.json();
    loader.remove();
    addMessage(data.answer || 'No answer returned.', false, record);
  } catch (error) {
    loader.remove();
    addMessage('Unable to reach the server.', false, record);
  }
}

function createAnswerSkeleton() {
  const loader = document.createElement('div');
  loader.className = 'flex justify-start';
  loader.innerHTML = '<div class="w-[75%] rounded-2xl rounded-bl-md border border-blue-100 bg-blue-50 px-5 py-4"><div class="space-y-3"><div class="h-4 w-2/5 animate-pulse rounded bg-slate-400/45"></div><div class="h-3 w-full animate-pulse rounded bg-slate-400/35"></div><div class="h-3 w-4/5 animate-pulse rounded bg-slate-400/35"></div><div class="h-10 w-full animate-pulse rounded-xl bg-slate-400/25"></div></div></div>';
  return loader;
}

function addSystemMessage(content) {
  const message = document.createElement('div');
  message.className = 'flex justify-center';
  message.innerHTML = `<div class="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">${escapeHTML(content)}</div>`;
  chatMessages.appendChild(message);
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage(text, true);
  chatInput.value = '';

  const typingPlaceholder = document.createElement('div');
  typingPlaceholder.className = 'flex justify-start';
  typingPlaceholder.innerHTML = `
    <div class="w-[75%] rounded-2xl rounded-bl-md border border-blue-100 bg-blue-50 px-5 py-4">
      <div class="space-y-3"><div class="h-4 w-2/5 animate-pulse rounded bg-slate-400/45"></div><div class="h-3 w-full animate-pulse rounded bg-slate-400/35"></div><div class="h-3 w-4/5 animate-pulse rounded bg-slate-400/35"></div><div class="h-10 w-full animate-pulse rounded-xl bg-slate-400/25"></div></div>
    </div>`;
  chatMessages.appendChild(typingPlaceholder);
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await response.json();
    await new Promise((resolve) => setTimeout(resolve, 450));
    chatMessages.removeChild(typingPlaceholder);
    addMessage(data.answer || 'No answer returned.');
  } catch (error) {
    chatMessages.removeChild(typingPlaceholder);
    console.error(error);
    addMessage('Unable to reach the server.');
  }
}
