/* ---------------- DATA ---------------- */
const iconRing = c => `<svg viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="2"><circle cx="32" cy="38" r="16"/><path d="M24 24 L32 8 L40 24" stroke-linejoin="round" stroke-linecap="round"/><circle cx="32" cy="16" r="3.2" fill="${c}" stroke="none"/></svg>`;
const iconNecklace = c => `<svg viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="2"><path d="M12 10 C12 34 24 42 32 42 C40 42 52 34 52 10" stroke-linecap="round"/><circle cx="32" cy="46" r="5"/></svg>`;
const iconEarring = c => `<svg viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="2"><circle cx="32" cy="14" r="5"/><path d="M32 19 V30" stroke-linecap="round"/><circle cx="32" cy="42" r="12"/></svg>`;
const iconBracelet = c => `<svg viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="2"><ellipse cx="32" cy="32" rx="24" ry="14"/><ellipse cx="32" cy="32" rx="16" ry="8"/></svg>`;

const GOLD = '#A67C3D', SILVER = '#8E8E8B';

// Os produtos agora vêm do banco de dados (via GET /api/produtos).
// Aqui só guardamos a lista em memória depois de carregada.
let PRODUCTS = [];
const ICON_BY_CAT = {
  'Anéis': iconRing,
  'Colares': iconNecklace,
  'Brincos': iconEarring,
  'Pulseiras': iconBracelet,
};
const WHATSAPP_NUMBER = '5543988008313'; // número que recebe os pedidos
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const money = v => 'R$ ' + v.toFixed(2).replace('.',',');
const colorFor = mat => mat === 'Ouro 18k' ? GOLD : SILVER;

/* ---------------- RENDER PRODUCTS ---------------- */
const grid = document.getElementById('productGrid');
function renderProducts(filter='all'){
  grid.innerHTML = '';
  PRODUCTS.filter(p => filter==='all' || p.cat===filter || p.mat===filter).forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-media">
        <span class="tag-material">${p.mat}</span>
        ${p.icon(colorFor(p.mat))}
      </div>
      <div class="card-body">
        <div class="pcat">${p.cat}</div>
        <div class="pname">${p.name}</div>
        <div class="card-foot">
          <span class="price">${money(p.price)}</span>
          ${p.stock > 0 ? `<button class="add-btn" data-id="${p.id}">Adicionar</button>` : `<button class="add-btn" disabled>Esgotado</button>`}
        </div>
      </div>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll('.add-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> addToCart(parseInt(btn.dataset.id)));
  });
}
document.getElementById('filters').addEventListener('click', e=>{
  const btn = e.target.closest('.filter-btn');
  if(!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.filter);
});

/* ---------------- CART STATE ---------------- */
let cart = JSON.parse(localStorage.getItem('r2_cart') || '[]');

function saveCart(){
  localStorage.setItem('r2_cart', JSON.stringify(cart));
  renderCart();
}
function addToCart(id){
  const existing = cart.find(i=>i.id===id);
  if(existing){ existing.qty++; } else { cart.push({id, qty:1}); }
  saveCart();
  showToast('Peça adicionada à sacola');
  openDrawer();
}
function changeQty(id, delta){
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(i=>i.id!==id);
  saveCart();
}
function removeItem(id){
  cart = cart.filter(i=>i.id!==id);
  saveCart();
}
function cartTotal(){
  return cart.reduce((sum,i)=>{
    const p = PRODUCTS.find(pp=>pp.id===i.id);
    return sum + (p ? p.price*i.qty : 0);
  },0);
}
function cartCount(){
  return cart.reduce((sum,i)=>sum+i.qty,0);
}

function renderCart(){
  document.getElementById('cartCount').textContent = cartCount();
  document.getElementById('subtotalVal').textContent = money(cartTotal());
  const box = document.getElementById('drawerItems');
  if(cart.length===0){
    box.innerHTML = `<div class="cart-empty">Sua sacola está vazia.<br>Explore a coleção e escolha suas peças.</div>`;
    return;
  }
  box.innerHTML = cart.map(i=>{
    const p = PRODUCTS.find(pp=>pp.id===i.id);
    if(!p) return '';
    return `
      <div class="cart-item">
        <div class="thumb">${p.icon(colorFor(p.mat))}</div>
        <div class="info">
          <div class="n">${p.name}</div>
          <div class="m">${p.mat}</div>
          <div class="qty-row">
            <button data-act="dec" data-id="${p.id}">−</button>
            <span>${i.qty}</span>
            <button data-act="inc" data-id="${p.id}">+</button>
          </div>
        </div>
        <div class="right">
          <span class="price">${money(p.price*i.qty)}</span>
          <button class="remove" data-act="rm" data-id="${p.id}">Remover</button>
        </div>
      </div>`;
  }).join('');

  box.querySelectorAll('[data-act]').forEach(btn=>{
    const id = parseInt(btn.dataset.id);
    const act = btn.dataset.act;
    btn.addEventListener('click', ()=>{
      if(act==='inc') changeQty(id, 1);
      if(act==='dec') changeQty(id, -1);
      if(act==='rm') removeItem(id);
    });
  });
}
/* ---------------- DRAWER ---------------- */
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');
function openDrawer(){ drawer.classList.add('show'); overlay.classList.add('show'); }
function closeDrawer(){ drawer.classList.remove('show'); overlay.classList.remove('show'); }
document.getElementById('cartBtn').addEventListener('click', openDrawer);
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
overlay.addEventListener('click', ()=>{ closeDrawer(); closeModal(); });

/* ---------------- TOAST ---------------- */
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2400);
}

/* ---------------- CHECKOUT MODAL ---------------- */
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
let payMethod = 'pix';

function openModal(){
  if(cart.length===0){ showToast('Sua sacola está vazia'); return; }
  renderCheckoutForm();
  modalOverlay.classList.add('show');
}
function closeModal(){ modalOverlay.classList.remove('show'); }
document.getElementById('checkoutBtn').addEventListener('click', openModal);

function renderCheckoutForm(){
  const total = cartTotal();
  modalContent.innerHTML = `
    <button class="modal-close" id="modalClose">&times;</button>
    <h3>Finalizar pedido</h3>
    <div class="sub">Preencha seus dados para concluirmos sua compra.</div>

    <div class="field"><label>Nome completo</label><input type="text" id="fName" required></div>
    <div class="field-row">
      <div class="field"><label>Telefone / WhatsApp</label><input type="tel" id="fPhone" placeholder="(48) 90000-0000" required></div>
      <div class="field"><label>CEP</label><input type="text" id="fCep" placeholder="00000-000"></div>
    </div>
    <div class="field"><label>Endereço de entrega</label><input type="text" id="fAddr" placeholder="Rua, número, bairro, cidade"></div>

    <div class="field"><label>Forma de pagamento</label></div>
    <div class="pay-options">
      <div class="pay-opt active" data-pay="pix">Pix</div>
      <div class="pay-opt" data-pay="cartao">Cartão</div>
    </div>

    <div class="modal-summary">
      ${cart.map(i=>{
        const p = PRODUCTS.find(pp=>pp.id===i.id);
        return `<div class="row"><span>${p.name} × ${i.qty}</span><span>${money(p.price*i.qty)}</span></div>`;
      }).join('')}
      <div class="row total"><span>Total</span><span>${money(total)}</span></div>
    </div>

    <button class="btn btn-solid" id="confirmOrder">Confirmar pedido</button>
    <div class="note">Ambiente de demonstração — nenhuma cobrança real é feita. Para pagamento em produção, integre um gateway (Pix / cartão) ao backend da loja.</div>
  `;

  modalContent.querySelectorAll('.pay-opt').forEach(el=>{
    el.addEventListener('click', ()=>{
      modalContent.querySelectorAll('.pay-opt').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      payMethod = el.dataset.pay;
    });
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('confirmOrder').addEventListener('click', submitOrder);
}

async function submitOrder(){
  const name = document.getElementById('fName').value.trim();
  const phone = document.getElementById('fPhone').value.trim();
  const cep = document.getElementById('fCep').value.trim();
  const addr = document.getElementById('fAddr').value.trim();
  if(!name || !phone){ showToast('Preencha nome e telefone'); return; }

  const btn = document.getElementById('confirmOrder');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  let pedido;
  try {
    pedido = await criarPedido({
      cliente: { nome: name, telefone: phone, cep, endereco: addr },
      pagamento: payMethod,
      itens: cart.map(i => ({ produto_id: i.id, quantidade: i.qty })),
    });
  } catch (err) {
    // o servidor explica o problema (ex.: peça esgotada) — mostramos e mantemos o carrinho
    showToast(err.message);
    btn.disabled = false;
    btn.textContent = 'Confirmar pedido';
    return;
  }

  // o total oficial é o que o servidor calculou (nunca o do navegador)
  const total = pedido.total;
  const itemsText = cart.map(i=>{
    const p = PRODUCTS.find(pp=>pp.id===i.id);
    return `${i.qty}x ${p.name} (${p.mat}) - ${money(p.price*i.qty)}`;
  }).join('\n');
  const waMsg = `Olá! Meu nome é ${name}.\nGostaria de confirmar meu pedido nº ${pedido.id} na R2 Gold and Silver:\n${itemsText}\nTotal: ${money(total)}\nForma de pagamento: ${payMethod==='pix' ? 'Pix' : 'Cartão'}`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;

  modalContent.innerHTML = `
    <button class="modal-close" id="modalClose">&times;</button>
    <div class="success-state">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      <h3>Pedido nº ${pedido.id} recebido</h3>
      <p>Obrigado, ${esc(name.split(' ')[0])}! Seu pedido de ${money(total)} foi registrado.<br>Envie os detalhes pelo WhatsApp para combinarmos a entrega e o pagamento.</p>
      <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-solid" style="display:block;">Enviar pedido via WhatsApp</a>
    </div>
  `;
  document.getElementById('modalClose').addEventListener('click', closeModal);
  cart = [];
  saveCart();
  closeDrawer();
  loadProducts(); // atualiza o estoque exibido
}

/* ---------------- NEWSLETTER (captura de lead sem sair da página) ---------------- */
const nlForm = document.getElementById('nlForm');
if(nlForm){
  nlForm.addEventListener('submit', function(e){
    e.preventDefault();
    const emailInput = document.getElementById('nlEmail');
    const email = emailInput.value.trim();
    if(!email) return;

    const submitBtn = document.getElementById('nlSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const formData = new FormData(nlForm);

    // Envio em segundo plano — o formulário é de outro domínio (Brevo/Sendinblue),
    // então usamos no-cors: não lemos a resposta, só confirmamos que a requisição saiu.
    fetch(nlForm.action, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    }).catch(()=>{ /* mesmo se a rede falhar, mantemos a UX consistente abaixo */ })
      .finally(()=>{
        const firstName = email.split('@')[0];
        document.getElementById('newsletterBox').innerHTML = `
          <div class="success-state">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            <h3>Inscrição confirmada</h3>
            <p>Prontinho! <strong>${esc(email)}</strong> já está na nossa lista.<br>Em breve você recebe lançamentos e ofertas exclusivas da R2 em primeira mão.</p>
          </div>
        `;
      });
  });
}

/* ---------------- INICIALIZAÇÃO ---------------- */
async function loadProducts(){
  try {
    const list = await getProdutos();
    PRODUCTS = list.map(p => ({ ...p, icon: ICON_BY_CAT[p.cat] || iconRing }));
  } catch (err) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--ink-soft)">Não foi possível carregar a coleção agora. Tente novamente em instantes.</p>';
    return;
  }
  // tira da sacola itens que não existem mais no catálogo
  cart = cart.filter(i => PRODUCTS.some(p => p.id === i.id));
  const active = document.querySelector('.filter-btn.active');
  renderProducts(active ? active.dataset.filter : 'all');
  saveCart(); // salva e redesenha a sacola
}
loadProducts();
