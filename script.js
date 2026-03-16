$(function () {

  // ── Password & Letter ──
  const PASSWORD = '021009';

const MESSAGE =
  'selamattt ulang tahunn sayangkuu cintaakuu\n\n' +
  'maaf ya kado yang ini terlambat, aku bikinnya susah banget loo (meskipun di bantu gpt sih hehe) hampir dua mingguan ak bikinnyah, soalnyaa  jadwal ak padet gegara lomba jagoss. kemarin aku ngerasa ada yang kurang aja si  pas ngasih kado kamu, terus aku kepikiran deh buat kaya gini biar kesimpenn terus selamanyaaa, fyi ini ak bikinnyah pakai pc sama laptop sekolah hehe soalnya laptop ak kentank, hehe semoga kamu sukakk yaa! sekali lagi selamat ulang tahun mylovvvvv';
  '- qaesyaar\n' +
  '16/10/25';

  // Typewriter effect
  function typewriter(el, text, speed, cb) {
    let i = 0;
    el.textContent = '';
    const lines = text.split('\n');
    let flat = '';
    lines.forEach((l, idx) => { flat += l + (idx < lines.length - 1 ? '\n' : ''); });
    const chars = flat.split('');
    function next() {
      if (i >= chars.length) { if (cb) cb(); return; }
      const ch = chars[i++];
      if (ch === '\n') {
        el.appendChild(document.createElement('br'));
      } else {
        el.appendChild(document.createTextNode(ch));
      }
      setTimeout(next, speed);
    }
    next();
  }

  function showLetter() {
    const gate   = document.getElementById('gate');
    const letter = document.getElementById('letter');

    gate.classList.add('fade-out');
    setTimeout(() => {
      gate.style.display = 'none';
      letter.style.opacity = '1';
      letter.style.pointerEvents = 'auto';
      typewriter(document.getElementById('letterBody'), MESSAGE, 28);
    }, 600);
  }

  function openFlipbook() {
    const letter = document.getElementById('letter');
    letter.classList.add('fade-out');
    setTimeout(() => {
      letter.style.display = 'none';
      $('#loading').addClass('hidden');
      document.querySelector('.scene').style.visibility = 'visible';
    }, 600);
  }

  // Cek password
  function checkPassword() {
    const boxes = document.querySelectorAll('.gate-box');
    const val   = Array.from(boxes).map(b => b.value).join('');
    const err   = document.getElementById('gateError');
    if (val === PASSWORD) {
      err.classList.remove('show');
      showLetter();
    } else {
      err.classList.add('show');
      boxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });
      boxes[0].focus();
    }
  }

  // 6 kotak: auto focus next, backspace, auto submit
  const boxes = document.querySelectorAll('.gate-box');
  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/[^0-9]/g, '').slice(-1);
      if (box.value) {
        box.classList.add('filled');
        if (i < boxes.length - 1) boxes[i + 1].focus();
        else checkPassword();
      } else {
        box.classList.remove('filled');
      }
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && i > 0) {
        boxes[i - 1].value = '';
        boxes[i - 1].classList.remove('filled');
        boxes[i - 1].focus();
      }
    });
    box.addEventListener('paste', e => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
      boxes.forEach((b, j) => {
        b.value = text[j] || '';
        b.classList.toggle('filled', !!b.value);
      });
      if (text.length >= 6) checkPassword();
      else boxes[Math.min(text.length, 5)].focus();
    });
  });
  boxes[0].focus();

  document.getElementById('gateBtn').addEventListener('click', checkPassword);
  document.getElementById('letterBtn').addEventListener('click', openFlipbook);

  // ── Flipbook ──
  // Total halaman: 1 dummy + 12 spread × 2 = 25
  // Spread konten: hal 2-23, spread looping: hal 24-25
  const FIRST  = 2;   // halaman pertama konten (kiri=11Blk, kanan=1Dpn)
  const LAST   = 24;  // halaman pertama spread looping terakhir

  function bookSize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Selalu double: lebar = 2 halaman, tinggi = rasio A5
    const maxW = Math.round(vw * 0.96);
    const maxH = Math.round(vh * 0.88);
    const byH  = Math.round(maxH / 1.414) * 2;
    const w    = Math.min(maxW, byH);
    const even = w % 2 === 0 ? w : w - 1;
    return { w: even, h: Math.round((even / 2) * 1.414) };
  }

  let initialized = false;
  const preload   = new Image();
  preload.onload  = preload.onerror = init;
  preload.src     = 'page/11 Belakang.png';
  setTimeout(init, 5000);

  function init() {
    if (initialized) return;
    initialized = true;

    const sz = bookSize();

    book.turn({
      width:        sz.w,
      height:       sz.h,
      autoCenter:   true,
      duration:     900,
      gradients:    true,
      elevation:    60,
      acceleration: true,
      display:      'double',
      page:         FIRST,
    });

    $('#loading').addClass('hidden');

    // Update tombol prev/next berdasarkan halaman aktif
    function updateButtons(page) {
      $('#btnPrev').toggleClass('hidden', page <= FIRST);
      $('#btnNext').toggleClass('hidden', page >= LAST);
    }
    updateButtons(FIRST); // state awal

    // Looping: lompat instan tanpa animasi
    let isLooping = false;
    book.bind('turned', function (e, page) {
      updateButtons(page);
      if (isLooping) { isLooping = false; return; }

      // Sampai spread looping terakhir → lompat ke spread pertama
      if (page >= LAST) {
        isLooping = true;
        book.turn('animationDuration', 0);
        book.turn('page', FIRST);
        setTimeout(() => book.turn('animationDuration', 900), 50);
      }
      // Mundur melewati spread pertama → lompat ke spread looping terakhir
      else if (page < FIRST) {
        isLooping = true;
        book.turn('animationDuration', 0);
        book.turn('page', LAST);
        setTimeout(() => book.turn('animationDuration', 900), 50);
      }
    });
  }

  // ── Tombol navigasi (desktop) ──
  $('#btnPrev').on('click', () => book.turn('previous'));
  $('#btnNext').on('click', () => book.turn('next'));

  // ── Swipe (mobile) ──
  let tx = 0, ty = 0;
  document.addEventListener('touchstart', e => {
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    dx > 0 ? book.turn('previous') : book.turn('next');
  }, { passive: true });

  // ── Keyboard ──
  $(document).on('keydown', e => {
    if (e.key === 'ArrowRight') book.turn('next');
    if (e.key === 'ArrowLeft')  book.turn('previous');
  });

  // ── Resize ──
  let resizeTimer;
  $(window).on('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const s = bookSize();
      book.turn('size', s.w, s.h);
      book.turn('display', 'double');
    }, 200);
  });

});
