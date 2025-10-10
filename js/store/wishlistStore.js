import { getProductById, loadAllProducts } from '../store/productStore.js';

const KEY = 'neoshop:wishlist';

function readIds(){
  try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch{ return []; }
}

function writeIds(ids){
  localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
  try{ window.dispatchEvent(new Event('wishlist:changed')); }catch{}
}

export function addToWishlist(productId){
  const ids = readIds();
  if(!ids.includes(productId)){
    ids.push(productId);
    writeIds(ids);
  }
}

export function removeFromWishlist(productId){
  const ids = readIds().filter(id => id !== productId);
  writeIds(ids);
}

export function getWishlist(){
  return readIds();
}

export function clearWishlist(){
  writeIds([]);
}

export function getWishlistProducts(){
  const ids = readIds();
  const products = [];
  ids.forEach(id => {
    const p = getProductById(id);
    if(p) products.push(p);
  });
  return products;
}


