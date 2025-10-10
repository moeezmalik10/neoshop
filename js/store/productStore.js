// Lazy-loaded products from data/products.json

import { API_BASE } from '../config.js';

let cache = null;

export async function loadAllProducts(){
  if(cache) return cache;
  try{
    if(API_BASE){
      const resApi = await fetch(`${API_BASE}/api/products`, { credentials:'include', cache:'no-store' });
      if(resApi.ok){ cache = await resApi.json(); return cache.map(p => ({
        id: String(p.id), title: p.name, price: Number(p.price), description: p.description || '', image: p.image || '', category: 'General'
      })); }
    }
    const res = await fetch('./data/products.json', { cache:'no-store' });
    cache = await res.json();
    return cache;
  }catch{
    // Fallback: inlined minimal set (handles file:// or blocked fetch)
    cache = [
      { id:'p-f1', title:'Fallback Headphones', price:99, category:'Audio', image:'https://images.unsplash.com/photo-1518447654495-6a1b6e155b43?q=80&w=1200&auto=format&fit=crop', description:'Fallback item when data fetch is unavailable.' },
      { id:'p-f2', title:'Fallback Keyboard', price:79, category:'Peripherals', image:'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop', description:'Another fallback item.' }
    ];
    return cache;
  }
}

export function getProductById(id){
  if(!cache) return null;
  return cache.find(p => p.id === id) || null;
}


