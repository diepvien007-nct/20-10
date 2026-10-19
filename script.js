/**
 * ============================================================================
 * CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10 - SCRIPT CHÍNH
 * ============================================================================
 * Các phần bạn có thể dễ dàng chỉnh sửa:
 * 1. Lời chúc trong thư: Sửa trực tiếp thuộc tính `data-template="..."` trong
 *    file `index.html` (chỗ `<div class="letter-body" id="letterBodyContent">`).
 *    Từ khóa `{name}` sẽ tự động thay bằng tên người nhận được tô nổi bật!
 * 2. Nhạc nền: Đã cấu hình sẵn `assets/20_10.mp3`.
 * 3. Lời khen dễ thương khi chạm vào bong bóng điều ước: Sửa ở `CONFIG.wishCompliments`.
 */

const CONFIG = {
  // Đường dẫn file nhạc nền
  musicUrl: 'assets/20_10.mp3',
  musicVolume: 0.65,

  // 2 dòng chữ phát sáng trên bầu trời đêm
  skyLine1: '20/10 dịu dàng',
  skyLine2: 'rạng rỡ như hoa nhé',
  skyTypingSpeedMs: 75,

  // Tốc độ gõ chữ trong bức thư (ms mỗi ký tự)
  letterTypingSpeedMs: 24,

  // Danh sách lời khen dễ thương khi chạm vào bong bóng điều ước quanh bó hoa
  wishCompliments: [
    '🌸 Chúc {name} xinh đẹp 100 điểm!',
    '✨ Luôn rạng rỡ và tươi cười nhé!',
    '💖 Hôm nay {name} là nữ hoàng!',
    '🌷 Mãi dịu dàng và hạnh phúc nhé!',
    '💐 Triệu bông hoa đẹp không bằng nụ cười của {name}!',
    '🎀 Chúc {name} luôn gặp điều may mắn!',
    '💌 Yêu thương trọn vẹn mỗi ngày nhé!',
    '🌟 Tỏa sáng rực rỡ theo cách của riêng {name}!',
  ],
};

// Hàm toàn cục để kích hoạt pháo hoa trái tim trên Canvas bầu trời đêm
let triggerHeartFireworksOnSky = null;

document.addEventListener('DOMContentLoaded', () => {
  // Các phần tử DOM
  const welcomeModal = document.getElementById('welcomeModal');
  const nameForm = document.getElementById('nameForm');
  const userNameInput = document.getElementById('userNameInput');
  const inputError = document.getElementById('inputError');

  const mainStage = document.getElementById('mainStage');
  const skyTypedLine1 = document.getElementById('skyTypedLine1');
  const skyTypedLine2 = document.getElementById('skyTypedLine2');
  const skyCursor = document.getElementById('skyCursor');
  const skySubGreeting = document.getElementById('skySubGreeting');
  const skyUserName = document.getElementById('skyUserName');
  const bouquetTrigger = document.getElementById('bouquetTrigger');
  const wishBubblesContainer = document.getElementById('wishBubblesContainer');

  const letterOverlay = document.getElementById('letterOverlay');
  const letterBackdrop = document.getElementById('letterBackdrop');
  const envelopeStage = document.getElementById('envelopeStage');
  const envelope3D = document.getElementById('envelope3D');
  const envPreviewName = document.getElementById('envPreviewName');
  const letterCardContainer = document.getElementById('letterCardContainer');
  const letterFooter = document.getElementById('letterFooter');

  const closeLetterBtn = document.getElementById('closeLetterBtn');

  const letterRecipientName = document.getElementById('letterRecipientName');
  const typewriterParagraphs = document.querySelectorAll('.typewriter-p');

  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const floatingHeartsContainer = document.getElementById('floatingHeartsContainer');

  let currentUserName = 'Bạn';
  let isMusicPlaying = false;
  let synthFallbackInterval = null;
  let audioCtx = null;
  let complimentIndex = 0;

  let envelopeTimers = [];
  let activeTypingSession = 0;

  // Nếu trên URL có sẵn ?name=... thì điền sẵn cho tiện
  const urlParams = new URLSearchParams(window.location.search);
  const presetName = urlParams.get('name') || urlParams.get('ten');
  if (presetName && presetName.trim().length > 0) {
    userNameInput.value = presetName.trim();
  }

  // ==================== 1. XỬ LÝ NHẠC NỀN ====================
  function startBackgroundMusic() {
    musicToggle.classList.remove('hidden');
    if (bgMusic && CONFIG.musicUrl) {
      bgMusic.volume = CONFIG.musicVolume;
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isMusicPlaying = true;
            musicToggle.classList.remove('muted');
          })
          .catch(() => {
            startGentleMusicBoxFallback();
          });
      }
    } else {
      startGentleMusicBoxFallback();
    }
  }

  function startGentleMusicBoxFallback() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtx) audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 587.33, 698.46, 880.0, 698.46];
      let idx = 0;
      isMusicPlaying = true;
      musicToggle.classList.remove('muted');

      if (synthFallbackInterval) clearInterval(synthFallbackInterval);
      synthFallbackInterval = setInterval(() => {
        if (!isMusicPlaying) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[idx % notes.length], audioCtx.currentTime);
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.45);
        idx++;
      }, 650);
    } catch (e) {
      console.warn('Audio fallback skipped:', e);
    }
  }

  musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
      isMusicPlaying = false;
      bgMusic.pause();
      musicToggle.classList.add('muted');
    } else {
      isMusicPlaying = true;
      musicToggle.classList.remove('muted');
      bgMusic.play().catch(() => {
        if (!synthFallbackInterval) startGentleMusicBoxFallback();
      });
    }
  });

  let musicTriggeredOnce = false;
  function triggerMusicOnFirstInteraction() {
    if (!musicTriggeredOnce) {
      musicTriggeredOnce = true;
      startBackgroundMusic();
    }
  }

  welcomeModal.addEventListener('pointerdown', triggerMusicOnFirstInteraction, { once: true });

  // ==================== 2. HIỆU ỨNG GÕ CHỮ TRÊN BẦU TRỜI ĐÊM ====================
  function runSkyHeadlineTypewriter() {
    skyTypedLine1.textContent = '';
    skyTypedLine2.textContent = '';
    skyCursor.classList.remove('done');
    skySubGreeting.classList.remove('show');

    const line1 = CONFIG.skyLine1;
    const line2 = CONFIG.skyLine2;
    let i = 0;
    let j = 0;

    function typeLine1() {
      if (i < line1.length) {
        skyTypedLine1.textContent += line1.charAt(i);
        i++;
        setTimeout(typeLine1, CONFIG.skyTypingSpeedMs);
      } else {
        setTimeout(typeLine2, 260);
      }
    }

    function typeLine2() {
      if (j < line2.length) {
        skyTypedLine2.textContent += line2.charAt(j);
        j++;
        setTimeout(typeLine2, CONFIG.skyTypingSpeedMs + 10);
      } else {
        setTimeout(() => {
          skyCursor.classList.add('done');
          skySubGreeting.classList.add('show');
        }, 450);
      }
    }

    typeLine1();
  }

  // ==================== 3. BONG BÓNG / ĐÈN LỒNG ĐIỀU ƯỚC QUANH BÓ HOA ====================
  const BUBBLE_ICONS = ['🏮', '🫧', '💖', '🌸', '✨', '🌷'];

  function initWishBubbles() {
    if (!wishBubblesContainer) return;
    wishBubblesContainer.innerHTML = '';

    const positions = [
      { left: '14%', top: '26%', delay: '0s', icon: '🏮' },
      { left: '25%', top: '46%', delay: '0.8s', icon: '💖' },
      { left: '18%', top: '64%', delay: '1.5s', icon: '🌸' },
      { left: '76%', top: '24%', delay: '0.4s', icon: '✨' },
      { left: '70%', top: '44%', delay: '1.2s', icon: '🌷' },
    ];

    positions.forEach((pos, idx) => {
      createSingleWishBubble(pos, idx);
    });
  }

  function createSingleWishBubble(pos, idx) {
    const bubble = document.createElement('button');
    bubble.type = 'button';
    bubble.className = 'wish-bubble';
    bubble.style.left = pos.left;
    bubble.style.top = pos.top;
    bubble.style.animationDelay = pos.delay;
    bubble.textContent = pos.icon || BUBBLE_ICONS[idx % BUBBLE_ICONS.length];
    bubble.setAttribute('aria-label', 'Chạm để mở điều ước nhỏ');

    bubble.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = bubble.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      bubble.classList.add('popped');
      showComplimentPopTag(centerX, centerY);

      if (typeof triggerHeartFireworksOnSky === 'function') {
        triggerHeartFireworksOnSky(1, centerX, centerY);
      }

      setTimeout(() => {
        bubble.remove();
        const nextIcon = BUBBLE_ICONS[Math.floor(Math.random() * BUBBLE_ICONS.length)];
        createSingleWishBubble({ ...pos, icon: nextIcon }, idx);
      }, 4500);
    });

    wishBubblesContainer.appendChild(bubble);
  }

  function showComplimentPopTag(x, y) {
    const rawMsg = CONFIG.wishCompliments[complimentIndex % CONFIG.wishCompliments.length];
    complimentIndex++;
    const msg = rawMsg.replace(/\{name\}/g, currentUserName);

    const tag = document.createElement('div');
    tag.className = 'compliment-pop-tag';
    tag.textContent = msg;

    const safeX = Math.max(130, Math.min(window.innerWidth - 130, x));
    const safeY = Math.max(80, y);

    tag.style.left = `${safeX}px`;
    tag.style.top = `${safeY}px`;
    document.body.appendChild(tag);

    setTimeout(() => {
      tag.remove();
    }, 2650);
  }

  // ==================== 4. XỬ LÝ NHẬP TÊN & CHUYỂN MÀN HÌNH ====================
  function formatDisplayName(rawName) {
    return rawName.trim().replace(/\s+/g, ' ');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    triggerMusicOnFirstInteraction();

    const entered = formatDisplayName(userNameInput.value);
    if (!entered) {
      inputError.classList.add('show');
      userNameInput.focus();
      return;
    }

    inputError.classList.remove('show');
    currentUserName = entered;

    const sigRecipientName = document.getElementById('sigRecipientName');
    skyUserName.textContent = currentUserName;
    envPreviewName.textContent = currentUserName;
    letterRecipientName.textContent = currentUserName;
    if (sigRecipientName) sigRecipientName.textContent = currentUserName;

    welcomeModal.classList.remove('active');
    setTimeout(() => {
      mainStage.classList.add('visible');
      runSkyHeadlineTypewriter();
      spawnFloatingParticles(12);
    }, 300);
  });

  userNameInput.addEventListener('input', () => {
    if (userNameInput.value.trim().length > 0) {
      inputError.classList.remove('show');
    }
  });

  // ==================== 5. CHẠM VÀO BÓ HOA -> PHÁO HOA TRÁI TIM -> MỞ PHONG BÌ 3D -> GÕ CHỮ BỨC THƯ ====================
  function clearEnvelopeTimers() {
    envelopeTimers.forEach((t) => clearTimeout(t));
    envelopeTimers = [];
    activeTypingSession++;
  }

  function typeHtmlParagraph(element, htmlString, speedMs, sessionId) {
    return new Promise((resolve) => {
      element.innerHTML = '';
      element.classList.add('active-typing');
      if (element.classList.contains('letter-wish-quote')) {
        element.classList.add('typing-started');
      }

      const tokens = [];
      let inTag = false;
      let currentTag = '';

      for (let i = 0; i < htmlString.length; i++) {
        const ch = htmlString[i];
        if (ch === '<') {
          inTag = true;
          currentTag = '<';
        } else if (ch === '>' && inTag) {
          inTag = false;
          currentTag += '>';
          tokens.push({ isTag: true, val: currentTag });
          currentTag = '';
        } else if (inTag) {
          currentTag += ch;
        } else {
          tokens.push({ isTag: false, val: ch });
        }
      }

      let rendered = '';
      let idx = 0;

      function step() {
        if (sessionId !== activeTypingSession) {
          element.classList.remove('active-typing');
          resolve(false);
          return;
        }

        while (idx < tokens.length && tokens[idx].isTag) {
          rendered += tokens[idx].val;
          idx++;
        }

        if (idx < tokens.length) {
          rendered += tokens[idx].val;
          idx++;
          element.innerHTML = rendered;
          setTimeout(step, speedMs);
        } else {
          element.innerHTML = rendered;
          element.classList.remove('active-typing');
          resolve(true);
        }
      }

      step();
    });
  }

  async function runLetterTypewriterSequence(sessionId) {
    const safeName = escapeHtml(currentUserName);

    typewriterParagraphs.forEach((p) => {
      p.innerHTML = '';
      p.classList.remove('active-typing', 'typing-started');
    });
    letterFooter.classList.remove('visible');

    for (const p of typewriterParagraphs) {
      if (sessionId !== activeTypingSession) return;
      const rawTemplate = p.getAttribute('data-template') || '';
      const filledHtml = rawTemplate.replace(/\{name\}/g, safeName);
      await typeHtmlParagraph(p, filledHtml, CONFIG.letterTypingSpeedMs, sessionId);
      await new Promise((r) => setTimeout(r, 220));
    }

    if (sessionId === activeTypingSession) {
      letterFooter.classList.add('visible');
      spawnFloatingParticles(18);
      if (typeof triggerHeartFireworksOnSky === 'function') {
        triggerHeartFireworksOnSky(3);
      }
    }
  }

  function openLetterModal() {
    clearEnvelopeTimers();
    const currentSession = activeTypingSession;

    if (typeof triggerHeartFireworksOnSky === 'function') {
      triggerHeartFireworksOnSky(4);
    }

    envelope3D.classList.remove('flap-open');
    envelopeStage.classList.remove('fade-out');
    envelopeStage.classList.add('active');
    letterCardContainer.classList.remove('show-card');

    typewriterParagraphs.forEach((p) => {
      p.innerHTML = '';
      p.classList.remove('active-typing', 'typing-started');
    });
    letterFooter.classList.remove('visible');

    letterOverlay.classList.add('open');
    letterOverlay.setAttribute('aria-hidden', 'false');
    spawnFloatingParticles(14);

    envelopeTimers.push(
      setTimeout(() => {
        envelope3D.classList.add('flap-open');
        spawnFloatingParticles(12);
      }, 450)
    );

    envelopeTimers.push(
      setTimeout(() => {
        envelopeStage.classList.add('fade-out');
        letterCardContainer.classList.add('show-card');
        if (typeof triggerHeartFireworksOnSky === 'function') {
          triggerHeartFireworksOnSky(2);
        }
      }, 1450)
    );

    envelopeTimers.push(
      setTimeout(() => {
        envelopeStage.classList.remove('active');
        runLetterTypewriterSequence(currentSession);
      }, 1850)
    );
  }

  function closeLetterModal() {
    clearEnvelopeTimers();
    letterOverlay.classList.remove('open');
    letterOverlay.setAttribute('aria-hidden', 'true');
    letterCardContainer.classList.remove('show-card');
    envelopeStage.classList.remove('active', 'fade-out');
    envelope3D.classList.remove('flap-open');
  }

  bouquetTrigger.addEventListener('click', openLetterModal);
  bouquetTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLetterModal();
    }
  });

  closeLetterBtn.addEventListener('click', closeLetterModal);
  letterBackdrop.addEventListener('click', closeLetterModal);

  // ==================== 6. HIỆU ỨNG TRÁI TIM & HOA BAY ====================
  const PARTICLE_ICONS = ['💖', '🌸', '🌷', '✨', '💗', '🎀', '💐'];

  function spawnFloatingParticles(count = 18) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const item = document.createElement('div');
        item.className = 'floating-particle';
        item.textContent = PARTICLE_ICONS[Math.floor(Math.random() * PARTICLE_ICONS.length)];

        const leftPos = Math.random() * 94 + 3;
        const duration = 3.2 + Math.random() * 2.8;
        const driftX = (Math.random() - 0.5) * 140;
        const rotDeg = (Math.random() - 0.5) * 360;
        const sizeRem = 1.1 + Math.random() * 0.9;

        item.style.left = `${leftPos}vw`;
        item.style.fontSize = `${sizeRem}rem`;
        item.style.animationDuration = `${duration}s`;
        item.style.setProperty('--drift-x', `${driftX}px`);
        item.style.setProperty('--rot-deg', `${rotDeg}deg`);

        floatingHeartsContainer.appendChild(item);

        setTimeout(() => {
          item.remove();
        }, duration * 1000 + 100);
      }, i * 70);
    }
  }

  // ==================== 7. CANVAS NỀN: BẦU TRỜI SAO, KHÓM HOA VƯƠN CAO BÊN TRÁI & ĐỒNG CỎ ====================
  initNightSkyAndMeadowCanvas();
});

function initNightSkyAndMeadowCanvas() {
  const canvas = document.getElementById('sceneCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  let stars = [];
  let grassBlades = [];
  let glowingFlowers = [];
  let leftTallFloralCluster = [];
  let glowingButterflies = [];
  let fallingLeaves = [];
  let shootingStars = [];
  let heartFireworks = [];

  function resizeScene() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildSceneObjects();
  }

  function spawnHeartFireworkBurst(customX, customY) {
    const cx = customX !== undefined ? customX : width * (0.18 + Math.random() * 0.64);
    const cy = customY !== undefined ? customY : height * (0.16 + Math.random() * 0.36);
    const palettes = [
      ['#ff80ab', '#ff4081', '#fce4ec'],
      ['#ffd54f', '#ff80ab', '#fff9c4'],
      ['#ea80fc', '#ff80ab', '#ffffff'],
      ['#ff5252', '#ff80ab', '#ffe082'],
    ];
    const colors = palettes[Math.floor(Math.random() * palettes.length)];
    const particleCount = 42;
    const scale = (width < 640 ? 2.4 : 3.4) * (0.85 + Math.random() * 0.35);

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      heartFireworks.push({
        x: cx,
        y: cy,
        vx: (hx * scale) / 14 + (Math.random() - 0.5) * 0.35,
        vy: (hy * scale) / 14 + (Math.random() - 0.5) * 0.35,
        color: colors[i % colors.length],
        alpha: 1,
        decay: 0.011 + Math.random() * 0.007,
        radius: 1.8 + Math.random() * 1.4,
      });
    }
  }

  triggerHeartFireworksOnSky = function (burstCount = 3, customX, customY) {
    for (let b = 0; b < burstCount; b++) {
      setTimeout(() => {
        spawnHeartFireworkBurst(
          b === 0 ? customX : undefined,
          b === 0 ? customY : undefined
        );
      }, b * 320);
    }
  };

  function buildSceneObjects() {
    const isMobile = width < 640;

    // 1. Ngôi sao lấp lánh trên bầu trời đêm
    const starCount = isMobile ? 65 : 120;
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.78),
      radius: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.025 + 0.008,
      phase: Math.random() * Math.PI * 2,
    }));

    // 2. Thảm cỏ xanh lục & xanh lam phát sáng ở dưới chân màn hình (giống hệt ảnh 1)
    const bladeCount = isMobile ? Math.floor(width / 2.2) : Math.floor(width / 1.8);
    const grassColors = [
      '#69f0ae',
      '#00e676',
      '#40c4ff',
      '#aeea00',
      '#18ffff',
      '#76ff03',
    ];

    grassBlades = Array.from({ length: bladeCount }, (_, idx) => {
      const x = (idx / bladeCount) * width + (Math.random() - 0.5) * 8;
      const maxGrassH = isMobile ? height * 0.17 : height * 0.21;
      const h = maxGrassH * (0.42 + Math.random() * 0.65);
      return {
        x,
        h,
        lean: (Math.random() - 0.5) * 22,
        swayAmp: 4 + Math.random() * 7,
        swaySpeed: 0.0012 + Math.random() * 0.0012,
        phase: Math.random() * Math.PI * 2,
        color: grassColors[Math.floor(Math.random() * grassColors.length)],
        lineWidth: 1.1 + Math.random() * 1.1,
      };
    });

    // 3. Khóm Hoa Sen & Hoa Thu lớn vươn cao (đặt ở khoảng giữa bên trái, trên mobile vươn cao lên phía trên xe đạp)
    leftTallFloralCluster = [
      {
        baseX: width * (isMobile ? 0.14 : 0.22),
        stemH: height * (isMobile ? 0.44 : 0.52),
        curveX: width * (isMobile ? 0.08 : 0.11),
        size: isMobile ? 14 : 22,
        palette: { petals: '#ff80ab', inner: '#fff59d', type: 'layeredLotus' },
        swaySpeed: 0.0011,
        phase: 0.2,
        sideBuds: [
          { t: 0.55, offset: -14, size: 8, color: '#ffab40' },
          { t: 0.78, offset: 12, size: 10, color: '#ff80ab' },
        ],
      },
      {
        baseX: width * (isMobile ? 0.24 : 0.255),
        stemH: height * (isMobile ? 0.37 : 0.43),
        curveX: width * (isMobile ? 0.08 : 0.085),
        size: isMobile ? 13 : 18,
        palette: { petals: '#ffd54f', inner: '#ffffff', type: 'layeredLotus' },
        swaySpeed: 0.0014,
        phase: 1.4,
        sideBuds: [
          { t: 0.65, offset: 12, size: 8, color: '#f48fb1' },
        ],
      },
      {
        baseX: width * (isMobile ? 0.33 : 0.295),
        stemH: height * (isMobile ? 0.30 : 0.36),
        curveX: width * (isMobile ? 0.06 : 0.065),
        size: isMobile ? 12 : 16,
        palette: { petals: '#82b1ff', inner: '#fff59d', type: 'daisy' },
        swaySpeed: 0.0013,
        phase: 2.5,
        sideBuds: [
          { t: 0.68, offset: -11, size: 7, color: '#ff80ab' },
        ],
      },
    ];

    // 4. Đàn bướm phát sáng vỗ cánh bay lượn ở khoảng không phía trên khóm hoa sen và xe đạp
    const butterflyCount = isMobile ? 3 : 5;
    const butterflyColors = ['#ffd54f', '#ff80ab', '#82b1ff', '#b9f6ca', '#ea80fc'];
    glowingButterflies = Array.from({ length: butterflyCount }, (_, i) => ({
      baseX: width * (0.14 + i * 0.055),
      baseY: height * (0.22 + (i % 3) * 0.13),
      orbitRx: 18 + Math.random() * 24,
      orbitRy: 12 + Math.random() * 18,
      speed: 0.0009 + Math.random() * 0.0006,
      flapSpeed: 0.012 + Math.random() * 0.006,
      phase: Math.random() * Math.PI * 2,
      size: (isMobile ? 8 : 11) + Math.random() * 3,
      color: butterflyColors[i % butterflyColors.length],
    }));

    // 5. Những cành hoa neon nhiều màu vươn lên dọc khắp thảm cỏ
    const flowerCount = isMobile ? 10 : 16;
    const flowerPalettes = [
      { petals: '#ff80ab', center: '#fff59d', type: 'lotus' },
      { petals: '#82b1ff', center: '#fff9c4', type: 'five' },
      { petals: '#ffffff', center: '#ffd54f', type: 'daisy' },
      { petals: '#ffab40', center: '#fff59d', type: 'daisy' },
      { petals: '#f48fb1', center: '#ffffff', type: 'five' },
      { petals: '#b388ff', center: '#fff9c4', type: 'lotus' },
    ];

    glowingFlowers = Array.from({ length: flowerCount }, (_, i) => {
      const segWidth = (width * 0.88) / flowerCount;
      const baseX = width * 0.05 + i * segWidth + (Math.random() - 0.5) * segWidth * 0.55;
      const stemH = (isMobile ? height * 0.21 : height * 0.27) * (0.62 + Math.random() * 0.52);
      const palette = flowerPalettes[i % flowerPalettes.length];
      return {
        baseX,
        stemH,
        curve: (Math.random() - 0.5) * 38,
        size: (isMobile ? 9 : 12) + Math.random() * 6,
        palette,
        swaySpeed: 0.0014 + Math.random() * 0.001,
        phase: Math.random() * Math.PI * 2,
      };
    });

    // 6. Những chiếc lá vàng mùa thu rơi nhẹ nhàng (giống ảnh 1)
    const leafCount = isMobile ? 12 : 20;
    fallingLeaves = Array.from({ length: leafCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 6,
      speedY: 0.35 + Math.random() * 0.55,
      speedX: -0.25 + Math.random() * 0.5,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      alpha: 0.45 + Math.random() * 0.45,
    }));
  }

  function maybeSpawnShootingStar() {
    if (shootingStars.length < 2 && Math.random() < 0.012) {
      shootingStars.push({
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * height * 0.35,
        len: 65 + Math.random() * 55,
        speed: 6 + Math.random() * 5,
        angle: Math.PI * 0.78,
        alpha: 1,
      });
    }
  }

  function drawFlowerHead(x, y, radius, palette) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = palette.petals;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = palette.petals;
    ctx.shadowBlur = 9;

    if (palette.type === 'layeredLotus') {
      // Hoa sen nhiều lớp cánh phát sáng giống hệt bông sen hồng góc trái ảnh 1
      for (let i = -3; i <= 3; i++) {
        ctx.save();
        ctx.rotate(i * 0.32);
        ctx.beginPath();
        ctx.ellipse(0, -radius * 0.65, radius * 0.28, radius * 0.75, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = palette.inner || '#fff9c4';
      for (let i = -2; i <= 2; i++) {
        ctx.save();
        ctx.rotate(i * 0.26);
        ctx.beginPath();
        ctx.ellipse(0, -radius * 0.45, radius * 0.18, radius * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      const petalCount = palette.type === 'daisy' ? 10 : palette.type === 'lotus' ? 7 : 5;
      for (let p = 0; p < petalCount; p++) {
        const angle = (p * Math.PI * 2) / petalCount;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        if (palette.type === 'five') {
          ctx.arc(0, -radius * 0.65, radius * 0.48, 0, Math.PI * 2);
        } else {
          ctx.ellipse(0, -radius * 0.7, radius * 0.28, radius * 0.68, 0, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.beginPath();
    ctx.fillStyle = palette.center || palette.inner || '#fff9c4';
    ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Vẽ bướm neon phát sáng vỗ cánh mềm mại
  function drawGlowingButterfly(x, y, size, flapAngle, tiltAngle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tiltAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    const wingScale = 0.35 + 0.65 * Math.abs(Math.sin(flapAngle));

    // Cánh trên trái & phải
    for (const dir of [-1, 1]) {
      ctx.save();
      ctx.scale(dir * wingScale, 1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(size * 0.9, -size * 1.1, size * 1.4, -size * 0.2, 0, size * 0.2);
      ctx.stroke();

      // Cánh dưới
      ctx.beginPath();
      ctx.moveTo(0, size * 0.15);
      ctx.bezierCurveTo(size * 1.0, size * 0.3, size * 0.8, size * 1.05, 0, size * 0.65);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // Tính tọa độ điểm trên đường cong bậc 2 (Quadratic Bezier)
  function getQuadPoint(t, x0, y0, cx, cy, x1, y1) {
    const inv = 1 - t;
    return {
      x: inv * inv * x0 + 2 * inv * t * cx + t * t * x1,
      y: inv * inv * y0 + 2 * inv * t * cy + t * t * y1,
    };
  }

  function render(time) {
    ctx.clearRect(0, 0, width, height);

    // 1. Vẽ các ngôi sao lấp lánh
    for (const s of stars) {
      const twinkle = 0.35 + 0.65 * Math.sin(time * s.speed + s.phase);
      ctx.fillStyle = `rgba(255, 245, 250, ${s.alpha * twinkle})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Vẽ sao băng
    maybeSpawnShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const st = shootingStars[i];
      const tailX = st.x - Math.cos(st.angle) * st.len;
      const tailY = st.y - Math.sin(st.angle) * st.len;

      const grad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${st.alpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      st.x += Math.cos(st.angle) * st.speed;
      st.y += Math.sin(st.angle) * st.speed;
      st.alpha -= 0.016;
      if (st.alpha <= 0) shootingStars.splice(i, 1);
    }

    // 2B. Vẽ pháo hoa trái tim trên bầu trời đêm
    for (let i = heartFireworks.length - 1; i >= 0; i--) {
      const p = heartFireworks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.965;
      p.vy = p.vy * 0.965 + 0.025;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        heartFireworks.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Vẽ lá vàng mùa thu bay nhẹ
    for (const leaf of fallingLeaves) {
      leaf.y += leaf.speedY;
      leaf.x += leaf.speedX + Math.sin(time * 0.0015 + leaf.rot) * 0.3;
      leaf.rot += leaf.rotSpeed;

      if (leaf.y > height + 20) {
        leaf.y = -15;
        leaf.x = Math.random() * width;
      }

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rot);
      ctx.fillStyle = `rgba(238, 188, 65, ${leaf.alpha})`;
      ctx.strokeStyle = `rgba(255, 224, 130, ${leaf.alpha})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 4. Vẽ Khóm Hoa Sen & Hoa Thu vươn cao bên trái (giống hệt góc trái của ảnh 1!)
    for (const tall of leftTallFloralCluster) {
      const sway = Math.sin(time * tall.swaySpeed + tall.phase) * 14;
      const x0 = tall.baseX;
      const y0 = height;
      const x1 = tall.baseX + tall.curveX + sway;
      const y1 = height - tall.stemH;
      const cx = tall.baseX + tall.curveX * 0.48 + sway * 0.5;
      const cy = height - tall.stemH * 0.62;

      ctx.save();
      ctx.strokeStyle = '#ffab40';
      ctx.shadowColor = '#ffab40';
      ctx.shadowBlur = 6;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(cx, cy, x1, y1);
      ctx.stroke();

      // Vẽ các lá gân neon và nụ hoa phụ mọc dọc theo cành vươn cao (giống ảnh 1)
      for (const bud of tall.sideBuds) {
        const pt = getQuadPoint(bud.t, x0, y0, cx, cy, x1, y1);
        ctx.strokeStyle = '#40c4ff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(pt.x + (bud.offset > 0 ? 8 : -8), pt.y + 6, 9, 4, bud.offset > 0 ? 0.45 : -0.45, 0, Math.PI * 2);
        ctx.stroke();

        drawFlowerHead(pt.x + bud.offset, pt.y - 6, bud.size, {
          petals: bud.color,
          center: '#fff9c4',
          type: 'daisy',
        });
      }
      ctx.restore();

      // Bông hoa sen lớn ở đỉnh cành
      drawFlowerHead(x1, y1, tall.size, tall.palette);
    }

    // 4B. Vẽ đàn bướm phát sáng vỗ cánh bay lượn bên trái
    for (const bf of glowingButterflies) {
      const bx = bf.baseX + Math.cos(time * bf.speed + bf.phase) * bf.orbitRx;
      const by = bf.baseY + Math.sin(time * bf.speed * 1.3 + bf.phase) * bf.orbitRy;
      const tilt = Math.sin(time * bf.speed + bf.phase) * 0.35 - 0.25;
      drawGlowingButterfly(bx, by, bf.size, time * bf.flapSpeed + bf.phase, tilt, bf.color);
    }

    // 5. Vẽ các cành hoa phát sáng đung đưa dọc đồng cỏ
    for (const fl of glowingFlowers) {
      const sway = Math.sin(time * fl.swaySpeed + fl.phase) * 10;
      const topX = fl.baseX + fl.curve + sway;
      const topY = height - fl.stemH;
      const ctrlX = fl.baseX + fl.curve * 0.4 + sway * 0.5;
      const ctrlY = height - fl.stemH * 0.55;

      ctx.save();
      ctx.strokeStyle = '#69f0ae';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(fl.baseX, height);
      ctx.quadraticCurveTo(ctrlX, ctrlY, topX, topY);
      ctx.stroke();

      const leafY = height - fl.stemH * 0.48;
      const leafX = (fl.baseX + topX) * 0.5;
      ctx.strokeStyle = '#b9f6ca';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(leafX - 7, leafY, 7, 3.2, -0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(leafX + 7, leafY - 12, 7, 3.2, 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      drawFlowerHead(topX, topY, fl.size, fl.palette);
    }

    // 6. Vẽ thảm cỏ phát sáng dưới cùng
    for (const b of grassBlades) {
      const sway = Math.sin(time * b.swaySpeed + b.phase) * b.swayAmp;
      const tipX = b.x + b.lean + sway;
      const tipY = height - b.h;
      const midX = b.x + (b.lean + sway) * 0.45;
      const midY = height - b.h * 0.52;

      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.lineWidth;
      ctx.beginPath();
      ctx.moveTo(b.x, height);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();
    }

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', resizeScene);
  resizeScene();
  requestAnimationFrame(render);
}
