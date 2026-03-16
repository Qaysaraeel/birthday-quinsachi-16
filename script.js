$(function () {

  const book   = $('#book');
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
