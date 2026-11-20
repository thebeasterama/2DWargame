const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;
const keys = {};
let activeIndex = 0;
let round = 1;
let ended = false;
let target = null;
let particles = [];
let tracers = [];

const allies = [
  { name: 'Viper', role: 'Rifleman', x: 230, y: 265, hp: 100, ammo: 6, color: '#9cab70', angle: 0, cooldown: 0 },
  { name: 'Bulldog', role: 'Heavy', x: 155, y: 390, hp: 100, ammo: 4, color: '#b49a67', angle: 0, cooldown: 0 },
  { name: 'Ghost', role: 'Scout', x: 170, y: 145, hp: 100, ammo: 5, color: '#7e9a82', angle: 0, cooldown: 0 }
];

const enemies = [
  { name: 'Hostile', x: 760, y: 130, hp: 70, ammo: 99, color: '#a65d50', angle: 0, cooldown: 1 },
  { name: 'Hostile', x: 825, y: 250, hp: 70, ammo: 99, color: '#a65d50', angle: 0, cooldown: 2 },
  { name: 'Hostile', x: 735, y: 390, hp: 70, ammo: 99, color: '#a65d50', angle: 0, cooldown: 1.5 },
  { name: 'Hostile', x: 870, y: 460, hp: 70, ammo: 99, color: '#a65d50', angle: 0, cooldown: 3 },
  { name: 'Hostile', x: 590, y: 230, hp: 70, ammo: 99, color: '#a65d50', angle: 0, cooldown: 2.5 }
];

const obstacles = [
  { x: 400, y: 100, w: 95, h: 48 },
  { x: 350, y: 270, w: 130, h: 55 },
  { x: 530, y: 185, w: 55, h: 130 },
  { x: 620, y: 365, w: 110, h: 48 },
  { x: 480, y: 430, w: 85, h: 38 }
];

function buildRoster() {
  const roster = document.getElementById('roster');
  roster.innerHTML = '';
  allies.forEach((unit, i) => {
    const card = document.createElement('div');
    card.className = 'unit-card' + (i === activeIndex ? ' active' : '') + (unit.hp <= 0 ? ' dead' : '');
    card.innerHTML = `<div class="unit-icon">▰</div><div><strong>${unit.name}</strong><small>${unit.role}</small><div class="hp-track"><div class="hp-fill" style="width:${Math.max(0, unit.hp)}%"></div></div></div>`;
    card.onclick = () => selectUnit(i);
    roster.appendChild(card);
  });
}

function selectUnit(index) {
  if (allies[index].hp <= 0 || ended) return;
  activeIndex = index;
  target = null;
  buildRoster();
  updateUI();
}

function updateUI() {
  const unit = allies[activeIndex];
  document.getElementById('activeName').textContent = unit?.name || '—';
  document.getElementById('health').textContent = unit ? `${Math.max(0, unit.hp)}%` : '—';
  document.getElementById('ammo').textContent = unit ? String(unit.ammo).padStart(2, '0') : '—';
  document.getElementById('status').textContent = unit?.hp <= 0 ? 'DOWN' : 'READY';
  document.getElementById('round').textContent = round;
  document.getElementById('allies').textContent = allies.filter(u => u.hp > 0).length;
  document.getElementById('enemies').textContent = enemies.filter(u => u.hp > 0).length;
}

window.addEventListener('keydown', e => {
  keys[e.key.toLowerElementCase()] = true;
  if (e.key === ' ') {
    e.prevent();
    attack();
  }
  if (/^[1-3]$/.test(e.key)) selectUnit(Number(e.key) - 1);
});
window.addEventListener('keyup', e => keys[e.key.toLowerElementCase()] = false);

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingRect();
  const x = (e.clientX - rect.left) * W / rect.width;
  const y = (e.clientY - rect.top) * H / rect.height;
  target = enemies.find(u => u.hp > 0 && Math.hypot(u.x - x, u.y - y) < 24);
});

function toLowerElementCase() { return undefined; }

function collides(x, y, radius = 14) {
  if (x < radius || x > W - radius || y < radius || y > H - radius) return true;
  return obstacles.some(o => x + radius > o.x && x - radius < o.x + o.w && y + radius > o.y && y - radius < o.y + o.h);
}

function moveUnit(unit, dx, dy) {
  if (!collides(unit.x + dx, unit.y)) unit.x += dx;
  if (!collides(unit.x, unit.y + dy)) unit.y += dy;
}

function attack() {
  if (ended) return;
  const unit = allies[activeIndex];
  if (!unit || unit.hp <= 0) return;
  if (unit.ammo <= 0) {
    document.getElementById('phase').textContent = 'AMMO DEPLETED';
    return;
  }
  let victim = target && target.hp > 0 ? target : enemies.find(u => u.hp > 0);
  if (!victim) return;
  unit.ammo--;
  unit.cooldown = 0.45;
  const range = Math.hypot(victim.x - unit.x, victim.y - unit.y);
  unit.angle = Math.atan2(victim.y - unit.y, victim.x - unit.x);
  tracers.push({ x1: unit.x, y1: unit.y, x2: victim.x, y2: victim.y, life: 0.12 });
  if (range < 420 && hasLineOfSight(unit, victim)) {
    victim.hp -= unit.role === 'Heavy' ? 30 : 24;
    burst(victim.x, victim.y, '#e3a85d', 9);
    if (victim.hp <= 0) {
      victim.hp = 0;
      target = null;
      burst(victim.x, victim.y, '#8f4d3e', 14);
    }
  } else {
    burst(victim.x, victim.y, '#d8d0bd', 4);
  }
  round++;
  buildRoster();
  updateUI();
}

function hasLineOfSight(a, b) {
  const steps = 30;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    if (obstacles.some(o => x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.h)) return false;
  }
  return true;
}

function enemyTurn(dt) {
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;
    enemy.cooldown -= dt;
    if (enemy.cooldown > 0) return;
    const living = allies.filter(u => u.hp > 0);
    if (!living.length) return;
    living.sort((a, b) => Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y));
    const victim = living[0];
    const distance = Math.hypot(victim.x - enemy.x, victim.y - enemy.y);
    enemy.angle = Math.atan2(victim.y - enemy.y, victim.x - enemy.x);
    if (distance > 260 && !collides(enemy.x + Math.cos(enemy.angle) * 0.8, enemy.y + Math.sin(enemy.angle) * 0.8, 12)) {
      enemy.x += Math.cos(enemy.angle) * 0.45;
      enemy.y += Math.sin(enemy.angle) * 0.45;
    } else if (hasLineOfSight(enemy, victim)) {
      tracers.push({ x1: enemy.x, y1: enemy.y, x2: victim.x, y2: victim.y, life: 0.12 });
      victim.hp -= 8 + Math.floor(Math.random() * 7);
      burst(victim.x, victim.y, '#cf735d', 5);
      if (victim.hp <= 0) victim.hp = 0;
    }
    enemy.cooldown = 1.2 + Math.random() * 1.8;
  });
  buildRoster();
  updateUI();
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({ x, y, vx: (Math.random() - .5) * 180, vy: (Math.random() - .5) * 180, life: .4 + Math.random() * .5, color });
  }
}

function drawTerrain() {
  ctx.fillStyle = '#777d67';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(36,42,34,.16)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  ctx.fillStyle = 'rgba(85,91,73,.35)';
  ctx.beginPath(); ctx.ellipse(260, 220, 180, 95, -.25, 0, Math.PI * 2); ctx.fill();

  obstacles.forEach(o => {
    ctx.fillStyle = '#45483e';
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeStyle = '#686d5d';
    ctx.strokeRect(o.x + 3, o.y + 3, o.w - 6, o.h - 6);
    ctx.fillStyle = 'rgba(20,22,18,.25)';
    ctx.fillRect(o.x + 8, o.y + o.h - 7, o.w - 16, 3);
  });
}

function drawUnit(unit, enemy = false) {
  if (unit.hp <= 0) {
    ctx.save(); ctx.translate(unit.x, unit.y); ctx.rotate(.7);
    ctx.fillStyle = '#393d35'; ctx.fillRect(-15, -5, 30, 10); ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(unit.x, unit.y);
  ctx.rotate(unit.angle);
  ctx.fillStyle = enemy ? '#7e463f' : unit.color;
  ctx.strokeStyle = '#252820';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = enemy ? '#9f5d50' : '#c4c8a9';
  ctx.fillRect(6, -3, 24, 6);
  ctx.restore();

  ctx.fillStyle = '#d2d0bc';
  ctx.font = 'bold 9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(enemy ? 'ENEMY' : unit.name.toUpperCase(), unit.x, unit.y - 22);
  ctx.fillStyle = '#242720'; ctx.fillRect(unit.x - 16, unit.y - 17, 32, 3);
  ctx.fillStyle = enemy ? '#b45b48' : '#94a864'; ctx.fillRect(unit.x - 16, unit.y - 17, 32 * unit.hp / (enemy ? 70 : 100), 3);
}

function draw() {
  drawTerrain();
  enemies.forEach(u => drawUnit(u, true));
  allies.forEach(u => drawUnit(u));

  tracers.forEach(t => {
    ctx.strokeStyle = '#f2cf84'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(t.x1, t.y1); ctx.lineTo(t.x2, t.y2); ctx.stroke();
  });

  particles.forEach(p => {
    ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
  });
  ctx.globalAlpha = 1;

  if (target && target.hp > 0) {
    ctx.strokeStyle = '#edc56e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(target.x, target.y, 23 + Math.sin(performance.now() / 100) * 3, 0, Math.PI * 2); ctx.stroke();
  }
}

let last = performance.now();
let enemyTimer = 0;
function loop(now) {
  const dt = Math.min(.033, (now - last) / 1000); last = now;
  const unit = allies[activeIndex];
  if (!ended && unit && unit.hp > 0) {
    let dx = 0, dy = 0;
    if (keys.w) dy -= 2.4;
    if (keys.s) dy += 2.4;
    if (keys.a) dx -= 2.4;
    if (keys.d) dx += 2.4;
    moveUnit(unit, dx, dy);
  }
  enemyTimer += dt;
  if (!ended && enemyTimer > 1.2) { enemyTurn(dt); enemyTimer = 0; }

  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
  particles = particles.filter(p => p.life > 0);
  tracers.forEach(t => t.life -= dt);
  tracers = tracers.filter(t => t.life > 0);

  if (!ended) {
    if (!enemies.some(u => u.hp > 0)) endGame(true);
    if (!allies.some(u => u.hp > 0)) endGame(false);
  }
  draw();
  requestAnimationFrame(loop);
}

function endGame(victory) {
  ended = true;
  const banner = document.getElementById('banner');
  banner.textContent = victory ? 'SECTOR SECURED' : 'UNIT LOST';
  banner.classList.remove('hidden');
  document.getElementById('phase').textContent = victory ? 'MISSION COMPLETE' : 'MISSION FAILED';
}

buildRoster();
updateUI();
requestAnimationFrame(loop);
