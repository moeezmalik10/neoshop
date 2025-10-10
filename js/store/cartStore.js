import { getProductById } from './productStore.js';
import { useAuthStore } from './authStore.js';

const CART_KEY = 'neoshop.cart.v1';

let cart = {};

export function initCartStore(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    cart = raw ? JSON.parse(raw) : {};
  }catch{
    cart = {};
  }
}

function persist(){
  try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch{}
}

export function canAddToCart(){
  // Allow adding to cart without authentication
  return true;
}

export function canCheckout(){
  // Require authentication for checkout
  const authStore = useAuthStore();
  return authStore.isAuthenticated;
}

export function addToCart(productId){
  if(!productId) return;
  
  cart[productId] = (cart[productId] || 0) + 1;
  persist();
  return true;
}

export function incrementItem(productId){
  if(!productId) return; 
  cart[productId] = (cart[productId] || 0) + 1; 
  persist();
  return true;
}

export function decrementItem(productId){
  if(!productId) return; 
  if(!cart[productId]) return; 
  cart[productId] = Math.max(0, cart[productId]-1); 
  if(cart[productId]===0) delete cart[productId]; 
  persist();
  return true;
}

export function removeItem(productId){
  if(!productId) return; 
  delete cart[productId]; 
  persist();
  return true;
}

export function clearCart(){ 
  cart = {}; 
  persist();
  return true;
}

export function clearCartOnLogout(){
  cart = {};
  persist();
}

export function hasCartItems(){
  return Object.keys(cart).length > 0;
}

export function getCartCount(){
  return Object.values(cart).reduce((a,b)=>a+b,0);
}

export function getCartItems(){
  const items = Object.entries(cart).map(([id, qty]) => ({ product: getProductById(id), quantity: qty }))
    .filter(x => !!x.product);
  return { items };
}

export function getCartTotals(){
  const { items } = getCartItems();
  const subtotal = items.reduce((sum, {product, quantity}) => sum + product.price * quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? 8 : 0;
  const total = subtotal + tax + shipping;
  return { subtotal, tax, shipping, total };
}


