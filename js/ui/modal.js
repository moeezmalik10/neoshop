export function openModal(html){
  const modal = document.getElementById('product-modal');
  const content = document.getElementById('modal-content');
  if(!modal || !content) return;
  content.innerHTML = html;
  modal.setAttribute('aria-hidden', 'false');
  
  // Add event listeners to add buttons in the modal
  const addButtons = content.querySelectorAll('[data-add]');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-add');
      if(id) {
        window.dispatchEvent(new CustomEvent('cart:add', { detail: { id } }));
      }
    });
  });

  // Add event listeners for tab switching
  const tabButtons = content.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const tabName = btn.getAttribute('data-tab');
      
      // Remove active class from all tab buttons and panels
      content.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      content.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked button and corresponding panel
      btn.classList.add('active');
      const panel = content.querySelector(`[data-tab="${tabName}"]`);
      if(panel) panel.classList.add('active');
    });
  });
}

export function closeModal(){
  const modal = document.getElementById('product-modal');
  const content = document.getElementById('modal-content');
  if(!modal || !content) return;
  content.innerHTML = '';
  modal.setAttribute('aria-hidden', 'true');
}

export function initModal(){
  const modal = document.getElementById('product-modal');
  if(!modal) return;
  
  modal.addEventListener('click', (e) => {
    const target = e.target;
    if(!(target instanceof HTMLElement)) return;
    if(target.hasAttribute('data-close-modal') || target.classList.contains('modal-close')){
      closeModal();
    }
  });
  
  window.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeModal();
  });
}


