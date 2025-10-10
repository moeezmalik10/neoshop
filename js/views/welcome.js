export function renderWelcomeView(root){
  root.innerHTML = `
    <section class="welcome">
      <div class="container welcome-hero">
        <div class="welcome-copy">
          <div class="eyebrow">Welcome to</div>
          <h1>NeoShop</h1>
          <p>Experience a modern, front-end only eCommerce demo with immersive 3D, smooth animations, and a delightful UI. No sign-in required.</p>
          <div class="hero-cta">
            <a class="btn primary" href="#/home">Enter</a>
            <a class="btn" href="#/products">Shop now</a>
          </div>
        </div>
        <div class="welcome-art">
          <div class="glossy-cube" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  `;
}


