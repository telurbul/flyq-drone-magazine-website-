'use strict';

/* =========================================================================
   Product page — gallery
   Two views per drone: the reference photo and an abstract "radar" view,
   plus a third "more" state showing "додаткові фото скоро з'являться".
   Depends on PRODUCTS from script.js — load that file first.
   ========================================================================= */
function galleryVariantsFor(product) {
  // All products get photo+radar variants, plus a final "more" state
  return ['photo', 'radar', 'more'];
}

function initGallery(product) {
  const frame = document.getElementById('galleryFrame');
  const photoEl = document.getElementById('galleryPhoto');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const dotsEl = document.getElementById('galleryDots');
  if (!frame || !photoEl || !prevBtn || !nextBtn || !dotsEl) return;

  const variants = galleryVariantsFor(product);
  if (product && product.image) photoEl.style.backgroundImage = `url(${product.image})`;

  // The last variant is the "more" message — it gets no dot.
  // Only real variants (all except the last one) get dots.
  const realCount = variants.length - 1; // exclude 'more'
  let index = 0;

  dotsEl.innerHTML = variants
    .slice(0, realCount)
    .map((_, i) => `<button type="button" aria-label="${tr('galleryViewLabel')} ${i + 1}" aria-selected="${i === 0}"></button>`)
    .join('');
  const dots = Array.from(dotsEl.children);

  function paint() {
    // Remove all variant classes, then add the current one
    variants.forEach((v) => frame.classList.remove(`gallery__frame--${v}`));
    frame.classList.add(`gallery__frame--${variants[index]}`);
    // Update dot selected state (dots only cover real variants)
    dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === index)));
    // Disable / enable arrows
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === variants.length - 1; // disabled only on 'more'
  }

  function go(delta) {
    const next = index + delta;
    if (next < 0 || next >= variants.length) return; // clamp, don't wrap
    index = next;
    paint();
  }

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  dots.forEach((d, i) => d.addEventListener('click', () => { index = i; paint(); }));

  paint();
}

/* =========================================================================
   Product page — price + quantity + order button
   ========================================================================= */
function initBuyBox(product) {
  const qtyValueEl = document.getElementById('qtyValue');
  const minusBtn = document.getElementById('qtyMinus');
  const plusBtn = document.getElementById('qtyPlus');
  const priceEl = document.getElementById('productPrice');
  const orderBtn = document.getElementById('orderBtn');
  if (!qtyValueEl || !minusBtn || !plusBtn || !priceEl || !orderBtn || !product) return;

  const MAX_QTY = 20;
  let qty = 1;
  const unitPrice = typeof product.price === 'number' && !Number.isNaN(product.price) ? product.price : 0;

  const formatPrice = (v) => `${v.toLocaleString('uk-UA')} \u20B4`;

  function paint() {
    qtyValueEl.textContent = String(qty);
    priceEl.textContent = formatPrice(unitPrice * qty);
    minusBtn.disabled = qty <= 1;
    plusBtn.disabled = qty >= MAX_QTY;
  }

  minusBtn.addEventListener('click', () => { qty = Math.max(1, qty - 1); paint(); });
  plusBtn.addEventListener('click', () => { qty = Math.min(MAX_QTY, qty + 1); paint(); });

  // Save to cart in localStorage and redirect to cart page
  let redirectTimer = null;
  orderBtn.addEventListener('click', () => {
    clearTimeout(redirectTimer);
    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if this product is already in cart — if so, increase quantity
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex !== -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: unitPrice,
        quantity: qty
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Show confirmation then redirect to cart
    orderBtn.classList.add('is-confirmed');
    orderBtn.textContent = `${tr('orderAdded')} \u00D7 ${qty}`;

    redirectTimer = setTimeout(() => {
      window.location.href = 'cart.html';
    }, 800);
  });

  paint();
}

/* =========================================================================
   Product page — video player shell (custom play button + progress bar).
   No footage exists for any VCD model yet — real, on-topic footage of a
   fictional drone can't be sourced honestly, so `videoSrc` stays unset and
   the player degrades to a poster + "coming soon" notice instead of a
   broken <video> or someone else's unrelated clip. Point
   PRODUCTS[i].videoSrc at a real .mp4 (e.g. your own test-flight footage)
   to activate it — everything else already works with it.
   ========================================================================= */
function initProductVideo(product) {
  const wrap = document.getElementById('videoPlayer');
  const video = document.getElementById('productVideo');
  const playBtn = document.getElementById('videoPlayBtn');
  const track = document.getElementById('videoTrack');
  const progress = document.getElementById('videoProgress');
  const handle = document.getElementById('videoHandle');
  if (!wrap || !video || !playBtn || !track || !progress || !handle) return;

  const hasSource = Boolean(product && product.videoSrc);
  wrap.classList.toggle('is-empty', !hasSource);
  if (hasSource) {
    video.src = product.videoSrc;
    if (product.image) video.poster = product.image;
  }

  function setProgress(ratio) {
    const pct = `${Math.min(1, Math.max(0, ratio)) * 100}%`;
    progress.style.width = pct;
    handle.style.left = pct;
  }

  playBtn.addEventListener('click', () => {
    if (!hasSource) return; // graceful no-op instead of a broken-media error
    video.paused ? video.play() : video.pause();
  });
  video.addEventListener('play',  () => { wrap.classList.add('is-playing'); playBtn.setAttribute('aria-label', tr('videoPause')); });
  video.addEventListener('pause', () => { wrap.classList.remove('is-playing'); playBtn.setAttribute('aria-label', tr('videoPlay')); });
  video.addEventListener('timeupdate', () => {
    if (video.duration) setProgress(video.currentTime / video.duration);
  });

  function seekFromEvent(e) {
    if (!hasSource || !video.duration) return;
    const rect = track.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    video.currentTime = Math.min(1, Math.max(0, x / rect.width)) * video.duration;
  }
  track.addEventListener('click', seekFromEvent);
}

/* =========================================================================
   Decorative drone background — scroll parallax (drifts opposite to scroll)
   Copied from script.js so product.html works independently.
   ========================================================================= */
function initDroneParallax() {
  const bg = document.querySelector('.drone-bg');
  const items = document.querySelectorAll('.drone-bg__item');
  if (!bg || !items.length) return;

  function sizeDroneBg() {
    bg.style.height = document.documentElement.scrollHeight + 'px';
  }
  sizeDroneBg();
  window.addEventListener('load', sizeDroneBg);
  // Simple debounce fallback (since script.js's debounce may not be loaded yet)
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeDroneBg, 200);
  });

  // Check for reduced motion (inline to avoid dependency on script.js helpers)
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) return;

  let ticking = false;
  function update() {
    const y = window.scrollY;
    items.forEach((el) => {
      const depth = parseFloat(el.dataset.depth) || 0.1;
      const flip = el.dataset.flip === '1' ? ' scaleX(-1)' : '';
      el.style.transform = `translateY(${(-y * depth).toFixed(1)}px)${flip}`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

/* =========================================================================
   Product page — boot: read ?id= from the URL and paint everything above.
   Requires PRODUCTS from script.js to already be loaded on the page.
   ========================================================================= */
function initProductPage() {
  const nameEl = document.getElementById('productNameText');
  if (!nameEl) return; // not on product.html

  // Also init the drone parallax background
  initDroneParallax();

  const id = new URLSearchParams(window.location.search).get('id');
  const rawProduct = (PRODUCTS || []).find((p) => p.id === id) || (PRODUCTS || [])[0];
  if (!rawProduct) return; // PRODUCTS missing/empty — nothing to render
  const product = localizedProduct(rawProduct);

  const description = Array.isArray(product.description) ? product.description : [];
  const extra = product.extra || {};

  const missingFields = [];
  if (!description.length) missingFields.push('description');
  if (!extra.heading && !extra.text) missingFields.push('extra');
  if (typeof product.price !== 'number') missingFields.push('price');
  if (missingFields.length) {
    console.warn(
      `[VCD] product "${product.id}" is missing ${missingFields.join(', ')} in PRODUCTS ` +
      '(script.js). If the other products are fine, the script.js actually being served here ' +
      'is probably an older copy — check the Network tab / cache, not this file.'
    );
  }

  document.title = `${product.name || 'VCD'} \u2014 VCD`;
  nameEl.textContent = product.name || '\u2014';
  document.getElementById('productTag').textContent = product.tag || '';
  document.getElementById('productDescP1').textContent = description[0] || '';
  document.getElementById('productDescP2').textContent = description[1] || '';
  document.getElementById('extraHeading').textContent = extra.heading || '';
  document.getElementById('extraText').textContent = extra.text || '';

  initGallery(product);
  initBuyBox(product);
  initProductVideo(product);
}

document.addEventListener('DOMContentLoaded', initProductPage);
