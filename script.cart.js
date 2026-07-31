'use strict';

/* =========================================================================
   Cart page — logic
   ========================================================================= */

// Отримуємо кошик з localStorage
const cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCart() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p>Ваш кошик порожній</p>';
    return;
  }

  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <span class="cart-name">${item.name}</span>
      <span class="cart-price">${item.price} ₴</span>
      <button class="remove-btn" onclick="removeItem(${index})">-</button>
    `;
    container.appendChild(div);
  });
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function checkout() {
  document.getElementById('banner').style.display = 'block';
}

function closeBanner() {
  document.getElementById('banner').style.display = 'none';
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', renderCart);
