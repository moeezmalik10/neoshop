// Footer functionality and interactions
import { getProductById } from '../store/productStore.js';
import { getWishlistProducts } from '../store/wishlistStore.js';
export function initFooter() {
  console.log('initFooter called!');
  
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM loaded, initializing footer...');
      initializeFooterFunctions();
    });
  } else {
    console.log('DOM already loaded, initializing footer...');
    initializeFooterFunctions();
  }
}

function initializeFooterFunctions() {
  // Newsletter subscription
  initNewsletter();
  
  // Footer link handlers
  initFooterLinks();
  
  // Social media links
  initSocialLinks();
  
  // Legal links
  initLegalLinks();
}

function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const messageEl = document.getElementById('newsletter-message');
  
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('newsletter-email').value;
    const submitBtn = form.querySelector('.newsletter-btn');
    
    // Validate email
    if (!isValidEmail(email)) {
      showNewsletterMessage('Please enter a valid email address.', 'error');
      return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';
    
    // Simulate API call
    setTimeout(() => {
      // Store subscription in localStorage
      const subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions') || '[]');
      if (!subscriptions.includes(email)) {
        subscriptions.push(email);
        localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
      }
      
      showNewsletterMessage('Thank you for subscribing! You\'ll receive updates soon.', 'success');
      form.reset();
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Subscribe';
    }, 1500);
  });
}

function showNewsletterMessage(message, type) {
  const messageEl = document.getElementById('newsletter-message');
  if (!messageEl) return;
  
  messageEl.textContent = message;
  messageEl.className = `newsletter-message ${type}`;
  
  // Clear message after 5 seconds
  setTimeout(() => {
    messageEl.textContent = '';
    messageEl.className = 'newsletter-message';
  }, 5000);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function initFooterLinks() {
  console.log('Initializing footer links...');
  
  // Contact Us
  const contactBtn = document.getElementById('contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showContactModal();
    });
  }
  
  // Help Center removed
  
  // Returns & Exchanges
  const returnsBtn = document.getElementById('returns-btn');
  if (returnsBtn) {
    returnsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showReturnsModal();
    });
  }
  
  // FAQ
  const faqBtn = document.getElementById('faq-btn');
  if (faqBtn) {
    faqBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showFAQModal();
    });
  }

  // Safety: delegated click handler (in case direct listeners didn't bind)
  document.addEventListener('click', (e) => {
    const t = e.target;
    if(!(t instanceof HTMLElement)) return;
    if (t.id === 'contact-btn') { e.preventDefault(); showContactModal(); }
    if (t.id === 'returns-btn') { e.preventDefault(); showReturnsModal(); }
    if (t.id === 'faq-btn') { e.preventDefault(); showFAQModal(); }
  }, { once: true });
  
  // Track Order
  document.getElementById('track-order-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showModal('Track Order', `
      <div class="track-order-form">
        <p>Enter your order number to track your package:</p>
        <div class="form-group">
          <input type="text" id="order-number" placeholder="Order # (e.g., NS-2024-001)" />
        </div>
        <button class="btn primary" onclick="trackOrder()">Track Order</button>
      </div>
    `);
  });
  
  // About Us
  document.getElementById('about-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showModal('About NeoShop', `
      <div class="about-content">
        <h4>Our Story</h4>
        <p>NeoShop was founded with a simple mission: to provide an exceptional shopping experience through innovative technology and outstanding customer service.</p>
        <button class="btn primary" onclick="closeModal()">Got it!</button>
      </div>
    `);
  });

  // Blog
  document.getElementById('blog-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showBlogModal();
  });

  // Sustainability
  document.getElementById('sustainability-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSustainabilityModal();
  });

  // Wishlist quick link
  document.getElementById('wishlist-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const items = getWishlistProducts();
    const body = items.length ? items.map(p => `
      <div class="wish-item" style="display:flex; gap:12px; align-items:center; padding:8px 0;">
        <img src="${p.image}" alt="${p.title}" style="width:48px; height:48px; object-fit:cover; border-radius:8px;" />
        <div style="flex:1;">
          <div style="font-weight:600;">${p.title}</div>
          <div class="muted">${p.category}</div>
        </div>
        <button class="btn" data-remove-wish="${p.id}">Remove</button>
      </div>
    `).join('') : '<p class="muted">Your wishlist is empty.</p>';
    showModal('Your Wishlist', `<div>${body}</div>`);

    // Attach remove handlers after render
    setTimeout(() => {
      document.querySelectorAll('[data-remove-wish]')?.forEach(btn => {
        btn.addEventListener('click', (ev) => {
          ev.preventDefault();
          const id = btn.getAttribute('data-remove-wish');
          try{ window.dispatchEvent(new CustomEvent('wishlist:remove', { detail:{ id } })); }catch{}
        });
      });
    }, 50);
  });

  // Compare removed
}

function initSocialLinks() {
  const socialLinks = document.querySelectorAll('.social-link');
  
  socialLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const platform = link.getAttribute('aria-label');
      showModal(`${platform}`, `
        <div class="social-content">
          <h4>Follow us on ${platform}</h4>
          <p>Connect with us on ${platform} for the latest updates and exclusive offers!</p>
          <button class="btn primary" onclick="closeModal()">Got it!</button>
        </div>
      `);
    });
  });
}

function initLegalLinks() {
  // Privacy Policy
  document.getElementById('privacy-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showPrivacyModal();
  });

  // Terms and Conditions
  document.getElementById('terms-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showTermsModal();
  });

  // Cookie Policy
  document.getElementById('cookies-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showCookiesModal();
  });
}

// Customer Service Modal Functions
function showContactModal() {
  const modal = document.getElementById('product-modal');
  const content = document.getElementById('modal-content');
  
  if (modal && content) {
    content.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2 style="color: #7aa2ff; margin-bottom: 20px;">Contact Us</h2>
        <div style="background: #131927; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #7aa2ff; margin-bottom: 15px;">Business Hours</h3>
          <p style="color: #e8eefc; font-size: 18px; font-weight: bold;">Mon-Sat 9AM-6PM PST</p>
        </div>
        <div style="background: #131927; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #7aa2ff; margin-bottom: 15px;">Email</h3>
          <p style="color: #e8eefc;"><a href="mailto:malikmoeez152@gmail.com" style="color: #7aa2ff; text-decoration: none;">malikmoeez152@gmail.com</a></p>
        </div>
        <div style="background: #131927; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #7aa2ff; margin-bottom: 15px;">Response Time</h3>
          <p style="color: #e8eefc;">We typically respond within 24 hours during business days.</p>
        </div>
        <button onclick="closeModal()" style="background: linear-gradient(135deg, #7aa2ff, #b388ff); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 20px;">Got it!</button>
      </div>
    `;
    modal.setAttribute('aria-hidden', 'false');
  }
}

// Help Center removed

function showReturnsModal() {
  const modal = document.getElementById('product-modal');
  const content = document.getElementById('modal-content');
  
  if (modal && content) {
    content.innerHTML = `
      <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7aa2ff; margin-bottom: 20px; text-align: center;">Returns & Exchanges Policy</h2>
        
        <div style="background: #131927; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="color: #e8eefc; line-height: 1.6; margin-bottom: 15px;">We have designed a flexible return policy for our clients so, that people don't need to stress out if they won't get the right product after placing the order. We never see our clients suffering if it is not their mistake.</p>
          
          <p style="color: #e8eefc; line-height: 1.6; margin-bottom: 20px;">Following are our return policies. You can return or exchange your parcel by reading these policies.</p>
          
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="background: #0f1522; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7aa2ff; color: #e8eefc; position: relative;">
              <span style="position: absolute; left: -2px; top: 15px; color: #7aa2ff; font-weight: bold;">✓</span>
              We will happily accept undamaged and unused products within 5 working days after delivery. After 5 days, it will not refundable or exchangeable.
            </li>
            <li style="background: #0f1522; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7aa2ff; color: #e8eefc; position: relative;">
              <span style="position: absolute; left: -2px; top: 15px; color: #7aa2ff; font-weight: bold;">✓</span>
              We will facilitate by picking the parcel from your house if it is not right from our end.
            </li>
            <li style="background: #0f1522; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7aa2ff; color: #e8eefc; position: relative;">
              <span style="position: absolute; left: -2px; top: 15px; color: #7aa2ff; font-weight: bold;">✓</span>
              When you have made your mind to return the products, kindly mention the reason. We only accept genuine reasons while you want to return anything.
            </li>
            <li style="background: #0f1522; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7aa2ff; color: #e8eefc; position: relative;">
              <span style="position: absolute; left: -2px; top: 15px; color: #7aa2ff; font-weight: bold;">✓</span>
              Make sure that the copy of the invoice is attached with the parcel on time of return.
            </li>
            <li style="background: #0f1522; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7aa2ff; color: #e8eefc; position: relative;">
              <span style="position: absolute; left: -2px; top: 15px; color: #7aa2ff; font-weight: bold;">✓</span>
              Customers must have to return the product by registered or traceable delivery companies at their expense.
            </li>
            <li style="background: #0f1522; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7aa2ff; color: #e8eefc; position: relative;">
              <span style="position: absolute; left: -2px; top: 15px; color: #7aa2ff; font-weight: bold;">✓</span>
              Delivery charges are not refundable. Only the product price will refund.
            </li>
            <li style="background: #0f1522; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7aa2ff; color: #e8eefc; position: relative;">
              <span style="position: absolute; left: -2px; top: 15px; color: #7aa2ff; font-weight: bold;">✓</span>
              The refunding charges will send to you in 7 working days.
            </li>
            <li style="background: #0f1522; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7aa2ff; color: #e8eefc; position: relative;">
              <span style="position: absolute; left: -2px; top: 15px; color: #7aa2ff; font-weight: bold;">✓</span>
              To return the product, the customer must have to repack the product and send it to the right address. Also, fill the return or exchange form so, we can facilitate you easily.
            </li>
          </ul>
        </div>
        
        <button onclick="closeModal()" style="background: linear-gradient(135deg, #7aa2ff, #b388ff); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: block; margin: 20px auto;">Got it!</button>
      </div>
    `;
    modal.setAttribute('aria-hidden', 'false');
  }
}

function showFAQModal() {
  const modal = document.getElementById('product-modal');
  const content = document.getElementById('modal-content');
  
  if (modal && content) {
    content.innerHTML = `
      <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7aa2ff; margin-bottom: 20px; text-align: center;">Frequently Asked Questions</h2>
        
        <div style="background: #131927; padding: 20px; border-radius: 10px; margin: 15px 0;">
          <h3 style="color: #7aa2ff; margin-bottom: 10px;">1. What products does NeoShop offer?</h3>
          <p style="color: #e8eefc; line-height: 1.6;">NeoShop specializes in electronics, mobile phones, accessories, headphones, chargers, smart devices, and related gadgets.</p>
        </div>
        
        <div style="background: #131927; padding: 20px; border-radius: 10px; margin: 15px 0;">
          <h3 style="color: #7aa2ff; margin-bottom: 10px;">2. How long does delivery take?</h3>
          <p style="color: #e8eefc; line-height: 1.6;">Orders are usually delivered within 3–5 business days. Delivery times may vary depending on your location and product availability.</p>
        </div>
        
        <div style="background: #131927; padding: 20px; border-radius: 10px; margin: 15px 0;">
          <h3 style="color: #7aa2ff; margin-bottom: 10px;">3. What payment methods are accepted?</h3>
          <p style="color: #e8eefc; line-height: 1.6;">We accept credit and debit cards, digital wallets, and cash on delivery in select regions.</p>
        </div>
        
        <div style="background: #131927; padding: 20px; border-radius: 10px; margin: 15px 0;">
          <h3 style="color: #7aa2ff; margin-bottom: 10px;">4. Can I return or exchange a product?</h3>
          <p style="color: #e8eefc; line-height: 1.6;">Yes. Products can be returned or exchanged within 7 days of delivery, provided they are unused and in original packaging.</p>
        </div>
        
        <div style="background: #131927; padding: 20px; border-radius: 10px; margin: 15px 0;">
          <h3 style="color: #7aa2ff; margin-bottom: 10px;">5. Does NeoShop provide a warranty?</h3>
          <p style="color: #e8eefc; line-height: 1.6;">Yes. Most electronics and accessories come with a manufacturer's warranty. Warranty details are mentioned on each product page.</p>
        </div>
        
        <button onclick="closeModal()" style="background: linear-gradient(135deg, #7aa2ff, #b388ff); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: block; margin: 20px auto;">Got it!</button>
      </div>
    `;
  modal.setAttribute('aria-hidden', 'false');
  }
}

function showBlogModal(){
  const content = `
    <div style="padding: 12px; line-height:1.6;">
      <h2 style="margin:0 0 12px; color:#7aa2ff;">5 Practical Tips to Grow Your Online Store</h2>
      <p>The e-commerce market is expanding quickly. Global retail e-commerce sales are projected to reach over 7 trillion USD by 2025. Competition is increasing, but small improvements can give your store a clear edge. Here are five areas to focus on.</p>

      <h3 style="margin:16px 0 8px;">1. Optimize product pages</h3>
      <p>Your product page is the decision point. If it fails to convince, visitors leave.</p>
      <ul>
        <li>Write clear product titles with keywords that match how people search.</li>
        <li>Keep descriptions short but benefit-driven.</li>
        <li>Use at least 3 to 5 high-quality photos; include lifestyle shots.</li>
        <li>Add product videos when possible.</li>
      </ul>

      <h3 style="margin:16px 0 8px;">2. Simplify checkout</h3>
      <p>Cart abandonment averages ~70%. Reduce steps, offer guest checkout, multiple payments, and show total costs early.</p>

      <h3 style="margin:16px 0 8px;">3. Leverage email marketing</h3>
      <p>Email has high ROI. Use welcome series, abandoned cart reminders, segmentation, and exclusive offers.</p>

      <h3 style="margin:16px 0 8px;">4. Use social proof</h3>
      <p>Display verified reviews, highlight bestsellers, and share real customer photos/videos.</p>

      <h3 style="margin:16px 0 8px;">5. Track and analyze data</h3>
      <p>Use analytics, conversion tracking, and A/B tests. Iterate based on data.</p>

      <h4 style="margin:16px 0 0;">Final thoughts</h4>
      <p>Growth comes from consistent improvements—product pages, checkout, email, social proof, and analytics.</p>
        </div>
  `;
  showModal('Blog', content);
}

function showSustainabilityModal(){
  const content = `
    <div style="padding:12px; line-height:1.6;">
      <h2 style="margin:0 0 12px; color:#7aa2ff;">NeoShop Sustainability Commitment</h2>
      <p>At NeoShop, we believe growth and responsibility go together. Every purchase shapes the future, so we are building practices that reduce impact on the planet and support responsible consumption.</p>
      <h3 style="margin:16px 0 8px;">Our Focus Areas</h3>
      <h4>Sustainable sourcing</h4>
      <ul>
        <li>We work with suppliers who use eco-friendly and responsibly sourced materials.</li>
        <li>We prioritize products with certifications such as Fair Trade, FSC, and organic.</li>
      </ul>
      <h4>Eco-friendly packaging</h4>
      <ul>
        <li>We use recyclable and compostable materials with minimal packaging.</li>
        <li>Customers can select “minimal packaging” at checkout.</li>
      </ul>
      <h4>Responsible logistics</h4>
      <ul>
        <li>We collaborate with partners who offer carbon offset programs.</li>
        <li>We encourage bulk orders to lower emissions.</li>
      </ul>
      <h4>Low-impact digital operations</h4>
      <ul>
        <li>Our website runs on servers powered by renewable energy.</li>
        <li>We optimize performance to reduce data transfer.</li>
      </ul>
      <h4>Transparency and measurable goals</h4>
      <ul>
        <li>We share progress, such as reducing packaging waste by 30% next year.</li>
        <li>We highlight eco-friendly products in a dedicated collection.</li>
      </ul>
      <h4>Customer involvement</h4>
      <ul>
        <li>Rewards for returning packaging for reuse.</li>
        <li>Digital receipts by default to save paper.</li>
        <li>Resources to help customers make sustainable choices.</li>
      </ul>
      <p><strong>Our Promise</strong><br/>Sustainability is a long-term commitment. We will continue to improve, measure, and keep our community informed.</p>
      </div>
    `;
  showModal('Sustainability', content);
}

function showTermsModal(){
  const content = `
    <div style="padding: 12px; line-height:1.6;">
      <h1>Terms and Conditions</h1>
      <p>Last updated: September 08, 2025</p>
      <p>Please read these terms and conditions carefully before using Our Service.</p>
      <h2>Interpretation and Definitions</h2>
      <h3>Interpretation</h3>
      <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
      <h3>Definitions</h3>
      <p>For the purposes of these Terms and Conditions:</p>
      <ul>
        <li>
          <p><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>
        </li>
        <li>
          <p><strong>Country</strong> refers to:  Pakistan</p>
        </li>
        <li>
          <p><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to NeoShop.</p>
        </li>
        <li>
          <p><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</p>
        </li>
        <li>
          <p><strong>Service</strong> refers to the Website.</p>
        </li>
        <li>
          <p><strong>Terms and Conditions</strong> (also referred as &quot;Terms&quot;) mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service. This Terms and Conditions agreement has been created with the help of the <a href="https://www.termsfeed.com/terms-conditions-generator/" target="_blank">Terms and Conditions Generator</a>.</p>
        </li>
        <li>
          <p><strong>Third-party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.</p>
        </li>
        <li>
          <p><strong>Website</strong> refers to NeoShop, accessible from <a href="http://neoshop.com" rel="external nofollow noopener" target="_blank">http://neoshop.com</a></p>
        </li>
        <li>
          <p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>
        </li>
      </ul>
      <h2>Acknowledgment</h2>
      <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
      <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
      <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
      <p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>
      <p>Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.</p>
      <h2>Links to Other Websites</h2>
      <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.</p>
      <p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>
      <p>We strongly advise You to read the terms and conditions and privacy policies of any third-party web sites or services that You visit.</p>
      <h2>Termination</h2>
      <p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>
      <p>Upon termination, Your right to use the Service will cease immediately.</p>
      <h2>Limitation of Liability</h2>
      <p>Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of this Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.</p>
      <p>To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of this Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.</p>
      <p>Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party's liability will be limited to the greatest extent permitted by law.</p>
      <h2>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot; Disclaimer</h2>
      <p>The Service is provided to You &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.</p>
      <p>Without limiting the foregoing, neither the Company nor any of the company's provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.</p>
      <p>Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.</p>
      <h2>Governing Law</h2>
      <p>The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
      <h2>Disputes Resolution</h2>
      <p>If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.</p>
      <h2>For European Union (EU) Users</h2>
      <p>If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.</p>
      <h2>United States Legal Compliance</h2>
      <p>You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a &quot;terrorist supporting&quot; country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.</p>
      <h2>Severability and Waiver</h2>
      <h3>Severability</h3>
      <p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>
      <h3>Waiver</h3>
      <p>Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not affect a party's ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.</p>
      <h2>Translation Interpretation</h2>
      <p>These Terms and Conditions may have been translated if We have made them available to You on our Service.
      You agree that the original English text shall prevail in the case of a dispute.</p>
      <h2>Changes to These Terms and Conditions</h2>
      <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
      <p>By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the website and the Service.</p>
      <h2>Contact Us</h2>
      <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
      <ul>
        <li>
          <p>By email: malikmoeez152@gmail.com</p>
        </li>
        <li>
          <p>By visiting this page on our website: <a href="http://neoshop.com" rel="external nofollow noopener" target="_blank">http://neoshop.com</a></p>
        </li>
        <li>
          <p>By mail: 565 A Model Town Gujranwala</p>
        </li>
      </ul>
    </div>
  `;
  showModal('Terms and Conditions', content);
}

function showCookiesModal(){
  const content = `
    <div class="legal-content" style="text-align:left; line-height:1.6;">
      <h1>Cookies Policy</h1>
      <p>Last updated: September 08, 2025</p>
      <p>This Cookies Policy explains what Cookies are and how We use them. You should read this policy so You can understand what type of cookies We use, or the information We collect using Cookies and how that information is used. This Cookies Policy has been created with the help of the <a href="https://www.freeprivacypolicy.com/free-cookies-policy-generator/" target="_blank">Free Cookies Policy Generator</a>.</p>
      <p>Cookies do not typically contain any information that personally identifies a user, but personal information that we store about You may be linked to the information stored in and obtained from Cookies. For further information on how We use, store and keep your personal data secure, see our Privacy Policy.</p>
      <p>We do not store sensitive personal information, such as mailing addresses, account passwords, etc. in the Cookies We use.</p>
      <h2>Interpretation and Definitions</h2>
      <h4>Interpretation</h4>
      <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
      <h4>Definitions</h4>
      <p>For the purposes of this Cookies Policy:</p>
      <ul>
        <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Cookies Policy) refers to NeoShop.</li>
        <li><strong>Cookies</strong> means small files that are placed on Your computer, mobile device or any other device by a website, containing details of your browsing history on that website among its many uses.</li>
        <li><strong>Website</strong> refers to NeoShop, accessible from <a href="http://www.neoshop.com" rel="external nofollow noopener" target="_blank">http://www.neoshop.com</a></li>
        <li><strong>You</strong> means the individual accessing or using the Website, or a company, or any legal entity on behalf of which such individual is accessing or using the Website, as applicable.</li>
      </ul>
      <h2>The use of the Cookies</h2>
      <h4>Type of Cookies We Use</h4>
      <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close your web browser.</p>
      <p>We use both session and persistent Cookies for the purposes set out below:</p>
      <ul>
        <li>
          <p><strong>Necessary / Essential Cookies</strong></p>
          <p>Type: Session Cookies</p>
          <p>Administered by: Us</p>
          <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>
        </li>
        <li>
          <p><strong>Functionality Cookies</strong></p>
          <p>Type: Persistent Cookies</p>
          <p>Administered by: Us</p>
          <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.</p>
        </li>
      </ul>
      <h4>Your Choices Regarding Cookies</h4>
      <p>If You prefer to avoid the use of Cookies on the Website, first You must disable the use of Cookies in your browser and then delete the Cookies saved in your browser associated with this website. You may use this option for preventing the use of Cookies at any time.</p>
      <p>If You do not accept Our Cookies, You may experience some inconvenience in your use of the Website and some features may not function properly.</p>
      <p>If You'd like to delete Cookies or instruct your web browser to delete or refuse Cookies, please visit the help pages of your web browser.</p>
      <ul>
        <li><p>For the Chrome web browser, please visit this page from Google: <a href="https://support.google.com/accounts/answer/32050" rel="external nofollow noopener" target="_blank">https://support.google.com/accounts/answer/32050</a></p></li>
        <li><p>For the Internet Explorer web browser, please visit this page from Microsoft: <a href="http://support.microsoft.com/kb/278835" rel="external nofollow noopener" target="_blank">http://support.microsoft.com/kb/278835</a></p></li>
        <li><p>For the Firefox web browser, please visit this page from Mozilla: <a href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored" rel="external nofollow noopener" target="_blank">https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored</a></p></li>
        <li><p>For the Safari web browser, please visit this page from Apple: <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" rel="external nofollow noopener" target="_blank">https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac</a></p></li>
      </ul>
      <p>For any other web browser, please visit your web browser's official web pages.</p>
      <h4>More Information about Cookies</h4>
      <p>You can learn more about cookies: <a href="https://www.freeprivacypolicy.com/blog/cookies/" target="_blank">Cookies: What Do They Do?</a>.</p>
      <h4>Contact Us</h4>
      <p>If you have any questions about this Cookies Policy, You can contact us:</p>
      <ul>
        <li><p>By email: malikmoeez152@gmail.com</p></li>
        <li><p>By visiting this page on our website: <a href="http://www.neoshop.com" rel="external nofollow noopener" target="_blank">http://www.neoshop.com</a></p></li>
        <li><p>By mail: 565 A Model Town Gujranwala</p></li>
      </ul>
    </div>
  `;
  showModal('Cookie Policy', content);
}

function showPrivacyModal(){
  const content = `
    <div class="legal-content" style="text-align:left; line-height:1.6;">
      <h1>Privacy Policy</h1>
      <p>Last updated: September 08, 2025</p>
      <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
      <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy has been created with the help of the <a href="https://www.freeprivacypolicy.com/free-privacy-policy-generator/" target="_blank">Free Privacy Policy Generator</a>.</p>
      <h2>Interpretation and Definitions</h2>
      <h3>Interpretation</h3>
      <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
      <h3>Definitions</h3>
      <p>For the purposes of this Privacy Policy:</p>
      <ul>
        <li><p><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</p></li>
        <li><p><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p></li>
        <li><p><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to NeoShop.</p></li>
        <li><p><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</p></li>
        <li><p><strong>Country</strong> refers to:  Pakistan</p></li>
        <li><p><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</p></li>
        <li><p><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</p></li>
        <li><p><strong>Service</strong> refers to the Website.</p></li>
        <li><p><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</p></li>
        <li><p><strong>Third-party Social Media Service</strong> refers to any website or any social network website through which a User can log in or create an account to use the Service.</p></li>
        <li><p><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p></li>
        <li><p><strong>Website</strong> refers to NeoShop, accessible from <a href="http://www.neoshop.com" rel="external nofollow noopener" target="_blank">http://www.neoshop.com</a></p></li>
        <li><p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p></li>
      </ul>
      <h2>Collecting and Using Your Personal Data</h2>
      <h3>Types of Data Collected</h3>
      <h4>Personal Data</h4>
      <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
      <ul>
        <li><p>Email address</p></li>
        <li><p>First name and last name</p></li>
        <li><p>Phone number</p></li>
        <li><p>Address, State, Province, ZIP/Postal code, City</p></li>
        <li><p>Usage Data</p></li>
      </ul>
      <h4>Usage Data</h4>
      <p>Usage Data is collected automatically when using the Service.</p>
      <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
      <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
      <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.</p>
      <h4>Information from Third-Party Social Media Services</h4>
      <p>The Company allows You to create an account and log in to use the Service through the following Third-party Social Media Services:</p>
      <ul>
        <li>Google</li>
        <li>Facebook</li>
        <li>Instagram</li>
        <li>Twitter</li>
        <li>LinkedIn</li>
      </ul>
      <p>If You decide to register through or otherwise grant us access to a Third-Party Social Media Service, We may collect Personal data that is already associated with Your Third-Party Social Media Service's account, such as Your name, Your email address, Your activities or Your contact list associated with that account.</p>
      <p>You may also have the option of sharing additional information with the Company through Your Third-Party Social Media Service's account. If You choose to provide such information and Personal Data, during registration or otherwise, You are giving the Company permission to use, share, and store it in a manner consistent with this Privacy Policy.</p>
      <h4>Tracking Technologies and Cookies</h4>
      <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:</p>
      <ul>
        <li><strong>Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may use Cookies.</li>
        <li><strong>Web Beacons.</strong> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).</li>
      </ul>
      <p>Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser. Learn more about cookies on the <a href="https://www.freeprivacypolicy.com/blog/sample-privacy-policy-template/#Use_Of_Cookies_And_Tracking" target="_blank">Free Privacy Policy website</a> article.</p>
      <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
      <ul>
        <li>
          <p><strong>Necessary / Essential Cookies</strong></p>
          <p>Type: Session Cookies</p>
          <p>Administered by: Us</p>
          <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>
        </li>
        <li>
          <p><strong>Cookies Policy / Notice Acceptance Cookies</strong></p>
          <p>Type: Persistent Cookies</p>
          <p>Administered by: Us</p>
          <p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p>
        </li>
        <li>
          <p><strong>Functionality Cookies</strong></p>
          <p>Type: Persistent Cookies</p>
          <p>Administered by: Us</p>
          <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.</p>
        </li>
      </ul>
      <p>For more information about the cookies we use and your choices regarding cookies, please visit our Cookies Policy or the Cookies section of our Privacy Policy.</p>
      <h3>Use of Your Personal Data</h3>
      <p>The Company may use Personal Data for the following purposes:</p>
      <ul>
        <li><p><strong>To provide and maintain our Service</strong>, including to monitor the usage of our Service.</p></li>
        <li><p><strong>To manage Your Account:</strong> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</p></li>
        <li><p><strong>For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</p></li>
        <li><p><strong>To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</p></li>
        <li><p><strong>To provide You</strong> with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.</p></li>
        <li><p><strong>To manage Your requests:</strong> To attend and manage Your requests to Us.</p></li>
        <li><p><strong>For business transfers:</strong> We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.</p></li>
        <li><p><strong>For other purposes</strong>: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</p></li>
      </ul>
      <p>We may share Your personal information in the following situations:</p>
      <ul>
        <li><strong>With Service Providers:</strong> We may share Your personal information with Service Providers to monitor and analyze the use of our Service,  to contact You.</li>
        <li><strong>For business transfers:</strong> We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>
        <li><strong>With Affiliates:</strong> We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.</li>
        <li><strong>With business partners:</strong> We may share Your information with Our business partners to offer You certain products, services or promotions.</li>
        <li><strong>With other users:</strong> when You share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside. If You interact with other users or register through a Third-Party Social Media Service, Your contacts on the Third-Party Social Media Service may see Your name, profile, pictures and description of Your activity. Similarly, other users will be able to view descriptions of Your activity, communicate with You and view Your profile.</li>
        <li><strong>With Your consent</strong>: We may disclose Your personal information for any other purpose with Your consent.</li>
      </ul>
      <h3>Retention of Your Personal Data</h3>
      <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
      <p>The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.</p>
      <h3>Transfer of Your Personal Data</h3>
      <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.</p>
      <p>Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
      <p>The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.</p>
      <h3>Delete Your Personal Data</h3>
      <p>You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>
      <p>Our Service may give You the ability to delete certain information about You from within the Service.</p>
      <p>You may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the account settings section that allows you to manage Your personal information. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.</p>
      <p>Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.</p>
      <h3>Disclosure of Your Personal Data</h3>
      <h4>Business Transactions</h4>
      <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
      <h4>Law enforcement</h4>
      <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>
      <h4>Other legal requirements</h4>
      <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
      <ul>
        <li>Comply with a legal obligation</li>
        <li>Protect and defend the rights or property of the Company</li>
        <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
        <li>Protect the personal safety of Users of the Service or the public</li>
        <li>Protect against legal liability</li>
      </ul>
      <h3>Security of Your Personal Data</h3>
      <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
      <h2>Detailed Information on the Processing of Your Personal Data</h2>
      <p>The Service Providers We use may have access to Your Personal Data. These third-party vendors collect, store, use, process and transfer information about Your activity on Our Service in accordance with their Privacy Policies.</p>
      <h3>Usage, Performance and Miscellaneous</h3>
      <p>We may use third-party Service Providers to maintain and improve our Service.</p>
      <ul>
        <li>
          <p><strong>Google Places</strong></p>
          <p>Google Places is a service that returns information about places using HTTP requests. It is operated by Google</p>
          <p>Google Places service may collect information from You and from Your Device for security purposes.</p>
          <p>The information gathered by Google Places is held in accordance with the Privacy Policy of Google: <a href="https://www.google.com/intl/en/policies/privacy/" rel="external nofollow noopener" target="_blank">https://www.google.com/intl/en/policies/privacy/</a></p>
        </li>
      </ul>
      <h2>Children's Privacy</h2>
      <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.</p>
      <p>If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent's consent before We collect and use that information.</p>
      <h2>Links to Other Websites</h2>
      <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
      <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>
      <h2>Changes to this Privacy Policy</h2>
      <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
      <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.</p>
      <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
      <h2>Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, You can contact us:</p>
      <ul>
        <li><p>By email: malikmoeez152@gmail.com</p></li>
        <li><p>By visiting this page on our website: <a href="http://www.neoshop.com" rel="external nofollow noopener" target="_blank">http://www.neoshop.com</a></p></li>
        <li><p>By mail: 565 A Model Town Gujranwala</p></li>
      </ul>
    </div>
  `;
  showModal('Privacy Policy', content);
}

// Expose for inline handlers if present
window.showPrivacyModal = showPrivacyModal;

// Modal functionality
function showModal(title, content) {
  const modal = document.getElementById('product-modal');
  const modalContent = document.getElementById('modal-content');
  
  if (modal && modalContent) {
    modalContent.innerHTML = `
      <h3 class="modal-title" style="color: #7aa2ff; margin-bottom: 20px; text-align: center;">${title}</h3>
      <div class="modal-body">${content}</div>
    `;
  modal.setAttribute('aria-hidden', 'false');
  }
}

function closeModal() {
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
  }
}

// Global functions
window.closeModal = closeModal;

// Help Center removed

// Help Center removed
// Expose customer service handlers for inline usage if needed
window.showContactModal = showContactModal;
window.showReturnsModal = showReturnsModal;
window.showFAQModal = showFAQModal;
// Expose legal handlers used by inline links
window.showTermsModal = showTermsModal;
window.showCookiesModal = showCookiesModal;

window.trackOrder = function() {
  const orderNumber = document.getElementById('order-number').value;
  if (!orderNumber) {
    alert('Please enter an order number.');
    return;
  }
  
  const modalBody = document.querySelector('.modal-body');
  modalBody.innerHTML = `
    <div class="tracking-result">
      <h4>Order: ${orderNumber}</h4>
      <div class="tracking-status">
        <p><strong>Status:</strong> <span class="status-badge confirmed">In Transit</span></p>
        <p><strong>Estimated Delivery:</strong> ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>
      <button class="btn primary" onclick="closeModal()">Got it!</button>
    </div>
  `;
};
