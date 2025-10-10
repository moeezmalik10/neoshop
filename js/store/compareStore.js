import { getProductById } from '../store/productStore.js';

const KEY = 'neoshop:compare';

function readIds(){
  try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch{ return []; }
}

function writeIds(ids){
  localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
}

export function addToCompare(productId){
  const ids = readIds();
  if(!ids.includes(productId)){
    ids.push(productId);
    writeIds(ids);
  }
}

export function removeFromCompare(productId){
  const ids = readIds().filter(id => id !== productId);
  writeIds(ids);
}

export function clearCompare(){
  writeIds([]);
}

export function getCompare(){
  return readIds();
}

export function getCompareProducts(){
  const ids = readIds();
  const products = [];
  ids.forEach(id => {
    const p = getProductById(id);
    if(p) products.push(p);
  });
  return products;
}


