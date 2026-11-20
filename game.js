const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const keys = Object.create(null);
const theaters = {
  city: [{ name: 'Old Town', region: 'Dense urban district', seed: 1 }, { name: 'Harbor City', region: 'Port and industrial quarter', seed: 2 }, { name: 'Hill District', region: 'Hillside neighborhoods', seed: 3 }],
  state: [{ name: 'North Province', region: 'Rural roads and villages', seed: 4 }, { name: 'River State', region: 'River crossings and farmland', seed: 5 }, { name: 'Coastal State', region: 'Coastline and lowlands', seed: 6 }],
  country: [{ name: 'Republic of Ardent', region: 'National campaign theater', seed: 7 }, { name: 'Vesper Union', region: 'Mountain and plains theater', seed: 8 }, { name: 'Sable Coast', region: 'Littoral campaign theater', seed: 9 }],
  world: [{ name: 'Western Front', region: 'Continental theater', seed: 10 }, { name: 'Eastern Front', region: 'Continental theater', seed: 11 }, { name: 'Global Response', region: 'Worldwide operations', seed: 12 }]
};
const allianceNames = { coalition: 'Allied Coalition', pact: 'Northern Pact', independent: 'Independent Forces' };
const unitTemplates = [
  { name: 'Viper', role: 'Rifleman', hp: 100, ammo: 8, color: '#9cab70' },
  { name: 'Bulldog', role: 'Heavy', hp: 120, ammo: 6, color: '#b49a67' },
  { name: 'Ghost', role: 'Scout', hp: 90, ammo: 7, color: '#7e9a82' }
];
const difficultySettings = {
  easy: { enemies: 3, hp: 55, damage: 5, cooldown: 2.2, label: 'EASY' },
  medium: { enemies: 5, hp: 70, damage: 9, cooldown: 1.5, label: 'MEDIUM' },
  difficult: { enemies: 7, hp: 82, damage: 13, cooldown: 1.05, label: 'DIFFICULT' },
  impossible: { enemies: 9, hp: 100, damage: 18, cooldown: .7, label: 'IMPOSSIBLE' }
};
const text = {
  en: { menuEyebrow:'GLOBAL TACTICAL COMMAND', menuSubtitle:'Choose your settings and deploy to the front.', difficultyLabel:'DIFFICULTY', languageLabel:'LANGUAGE', easy:'Easy', medium:'Medium', difficult:'Difficult', impossible:'Impossible', start:'START CAMPAIGN', menuHint:'You can change your campaign setup before deployment.', command:'GLOBAL TACTICAL COMMAND', round:'ROUND', mapScale:'MAP SCALE', theater:'THEATER', alliance:'ALLIANCE', naval:'Naval invasion', deploy:'DEPLOY', alliedRoster:'ALLIED ROSTER', pactRoster:'PACT ROSTER', forceRoster:'FORCE ROSTER', move:'MOVE', selectUnit:'SELECT UNIT', target:'TARGET', attack:'ATTACK', theaterIntel:'THEATER INTELLIGENCE', unit:'UNIT', health:'HEALTH', ammo:'AMMO', status:'STATUS', ready:'READY', down:'DOWN', missionObjective:'MISSION OBJECTIVE', commandLabel:'COMMAND', hostiles:'HOSTILES', allies:'ALLIES', forces:'FORCES', pact:'PACT', operation:'OPERATION', deployed:'CAMPAIGN — DEPLOYED', navalPhase:'NAVAL LANDING — BEACHHEAD ASSAULT', eliminate:'ELIMINATE ALL HOSTILES', stopLanding:'STOP THE LANDING FORCE AND SECURE THE BEACHHEAD', ammoEmpty:'AMMO DEPLETED — DEPLOY TO REARM', secured:'THEATER SECURED', failed:'MISSION FAILED', complete:'OPERATION COMPLETE — DEPLOY FOR NEXT THEATER', defeated:'FORCES DEFEATED — REDEPLOY TO TRY AGAIN', readyPhase:'DEPLOYMENT PHASE' },
  es: { menuEyebrow:'MANDO TÁCTICO GLOBAL', menuSubtitle:'Elige tus ajustes y despliega en el frente.', difficultyLabel:'DIFICULTAD', languageLabel:'IDIOMA', easy:'Fácil', medium:'Media', difficult:'Difícil', impossible:'Imposible', start:'INICIAR CAMPAÑA', menuHint:'Puedes cambiar la campaña antes del despliegue.', command:'MANDO TÁCTICO GLOBAL', round:'RONDA', mapScale:'ESCALA DEL MAPA', theater:'TEATRO', alliance:'ALIANZA', naval:'Invasión naval', deploy:'DESPLEGAR', alliedRoster:'FUERZAS ALIADAS', pactRoster:'FUERZAS DEL PACTO', forceRoster:'FUERZAS', move:'MOVER', selectUnit:'ELEGIR UNIDAD', target:'OBJETIVO', attack:'ATACAR', theaterIntel:'INFORMACIÓN DEL TEATRO', unit:'UNIDAD', health:'SALUD', ammo:'MUNICIÓN', status:'ESTADO', ready:'LISTO', down:'FUERA DE COMBATE', missionObjective:'OBJETIVO DE MISIÓN', commandLabel:'MANDO', hostiles:'HOSTILES', allies:'ALIADOS', forces:'FUERZAS', pact:'PACTO', operation:'OPERACIÓN', deployed:'CAMPAÑA — DESPLEGADA', navalPhase:'DESEMBARCO NAVAL — ASALTO A LA PLAYA', eliminate:'ELIMINA A TODOS LOS HOSTILES', stopLanding:'DETÉN EL DESEMBARCO Y ASEGURA LA PLAYA', ammoEmpty:'SIN MUNICIÓN — DESPLIEGA PARA REABASTECER', secured:'TEATRO ASEGURADO', failed:'MISIÓN FALLIDA', complete:'OPERACIÓN COMPLETADA — DESPLIEGA EN OTRO TEATRO', defeated:'FUERZAS DERROTADAS — VUELVE A DESPLEGAR', readyPhase:'FASE DE DESPLIEGUE' },
  fr: { menuEyebrow:'COMMANDE TACTIQUE MONDIALE', menuSubtitle:'Choisissez vos paramètres et déployez sur le front.', difficultyLabel:'DIFFICULTÉ', languageLabel:'LANGUE', easy:'Facile', medium:'Moyen', difficult:'Difficile', impossible:'Impossible', start:'LANCER LA CAMPAGNE', menuHint:'Vous pouvez modifier la campagne avant le déploiement.', command:'COMMANDE TACTIQUE MONDIALE', round:'TOUR', mapScale:'ÉCHELLE DE CARTE', theater:'THÉÂTRE', alliance:'ALLIANCE', naval:'Invasion navale', deploy:'DÉPLOYER', alliedRoster:'FORCES ALLIÉES', pactRoster:'FORCES DU PACTE', forceRoster:'FORCES', move:'DÉPLACER', selectUnit:'CHOISIR UNITÉ', target:'CIBLER', attack:'ATTAQUER', theaterIntel:'RENSEIGNEMENTS DU THÉÂTRE', unit:'UNITÉ', health:'SANTÉ', ammo:'MUNITIONS', status:'ÉTAT', ready:'PRÊT', down:'HORS COMBAT', missionObjective:'OBJECTIF DE MISSION', commandLabel:'COMMANDE', hostiles:'HOSTILES', allies:'ALLIÉS', forces:'FORCES', pact:'PACTE', operation:'OPÉRATION', deployed:'CAMPAGNE — DÉPLOYÉE', navalPhase:'DÉBARQUEMENT NAVAL — ASSAUT DE LA PLAGE', eliminate:'ÉLIMINEZ TOUS LES HOSTILES', stopLanding:'ARRÊTEZ LE DÉBARQUEMENT ET SÉCURISEZ LA PLAGE', ammoEmpty:'MUNITIONS ÉPUISÉES — REDÉPLOYEZ POUR RÉAPPROVISIONNER', secured:'THÉÂTRE SÉCURISÉ', failed:'MISSION ÉCHOUÉE', complete:'OPÉRATION TERMINÉE — DÉPLOYEZ SUR UN AUTRE THÉÂTRE', defeated:'FORCES VAINCUES — REDÉPLOYEZ', readyPhase:'PHASE DE DÉPLOIEMENT' }
};
let language = localStorage.getItem('ironFrontLanguage') || 'en';
let allies = [], enemies = [], obstacles = [], particles = [], tracers = [];
let activeIndex = 0, round = 1, ended = true, target = null, enemyTimer = 0, naval = false, currentScale = 'city', currentTheater = theaters.city[0];
const byId = id => document.getElementById(id);
const scaleSelect = byId('mapScale'), locationSelect = byId('location'), allianceSelect = byId('alliance'), navalInput = byId('navalMode');
function tr(key) { return (text[language] && text[language][key]) || text.en[key] || key; }
function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(node => { const key = node.dataset.i18n; if (text[language][key]) node.textContent = text[language][key]; });
  byId('inGameLanguage').value = language;
  if (allies.length) { buildRoster(); updateUI(); updateTheaterInfo(); }
}
function changeLanguage(value) { language = text[value] ? value : 'en'; localStorage.setItem('ironFrontLanguage', language); applyLanguage(); }
function populateTheaters() {
  locationSelect.innerHTML = theaters[scaleSelect.value].map((place, i) => `<option value="${i}">${place.name}</option>`).join('');
  updateTheaterInfo();
}
function updateTheaterInfo() {
  currentScale = scaleSelect.value; currentTheater = theaters[currentScale][Number(locationSelect.value) || 0];
  byId('theaterScale').textContent = `${currentScale.toUpperCase()} ${tr('operation')}`;
  byId('theaterName').textContent = currentTheater.name; byId('theaterRegion').textContent = currentTheater.region;
  byId('allianceNote').textContent = allianceNames[allianceSelect.value];
  byId('teamLabel').textContent = allianceSelect.value === 'pact' ? tr('pact') : allianceSelect.value === 'independent' ? tr('forces') : tr('allies');
  byId('rosterTitle').textContent = tr(allianceSelect.value === 'pact' ? 'pactRoster' : allianceSelect.value === 'independent' ? 'forceRoster' : 'alliedRoster');
}
function createObstacles() {
  const seed = currentTheater.seed, count = currentScale === 'city' ? 8 : currentScale === 'state' ? 6 : currentScale === 'country' ? 5 : 4;
  return Array.from({ length: count }, (_, i) => {
    const x = 300 + ((seed * 67 + i * 139) % 570), y = 55 + ((seed * 31 + i * 97) % 420);
    const w = 48 + ((seed + i * 17) % (currentScale === 'city' ? 64 : 90)), h = 30 + ((seed * 3 + i * 23) % 52);
    return { x: Math.min(x, W - w - 24), y: Math.min(y, H - h - 24), w, h };
  });
}
function deploy() {
  ended = false; target = null; round = 1; enemyTimer = 0; particles = []; tracers = []; activeIndex = 0;
  currentScale = scaleSelect.value; currentTheater = theaters[currentScale][Number(locationSelect.value) || 0]; naval = navalInput.checked; obstacles = createObstacles();
  allies = unitTemplates.map((u, i) => ({ ...u, x: 130 + (i % 2) * 55, y: 170 + i * 92, angle: 0, cooldown: 0 }));
  const points = naval ? [[760,92],[825,190],[755,300],[850,430],[640,470],[900,130],[890,340],[700,175],[930,245]] : [[760,100],[820,205],[750,330],[855,455],[620,250],[910,100],[900,300],[690,460],[920,210]];
  const setting = difficultySettings[byId('difficulty').value];
  enemies = points.slice(0, setting.enemies).map(([x,y], i) => ({ name: naval ? 'Landing Force' : 'Hostile', x, y, hp: setting.hp, maxHp: setting.hp, damage: setting.damage, attackCooldown: setting.cooldown, angle: Math.PI, cooldown: .7 + i * .4 }));
  byId('banner').classList.add('hidden');
  byId('phase').textContent = naval ? tr('navalPhase') : `${currentScale.toUpperCase()} ${tr('deployed')}`;
  byId('objective').textContent = naval ? tr('stopLanding') : tr('eliminate');
  updateTheaterInfo(); buildRoster(); updateUI();
}
function buildRoster() {
  const roster = byId('roster'); roster.innerHTML = '';
  allies.forEach((unit, i) => {
    const card = document.createElement('button'); card.type = 'button'; card.className = `unit-card${i === activeIndex ? ' active' : ''}${unit.hp <= 0 ? ' dead' : ''}`; card.disabled = unit.hp <= 0;
    card.innerHTML = `<span class="unit-icon">▰</span><span><strong>${unit.name}</strong><small>${unit.role}</small><span class="hp-track"><span class="hp-fill" style="width:${Math.max(0, unit.hp / unitTemplates[i].hp * 100)}%"></span></span></span>`;
    card.addEventListener('click', () => selectUnit(i)); roster.appendChild(card);
  });
}
function selectUnit(index) { if (!allies[index] || allies[index].hp <= 0 || ended) return; activeIndex = index; buildRoster(); updateUI(); }
function updateUI() {
  const unit = allies[activeIndex]; byId('activeName').textContent = unit?.name || '—';
  byId('health').textContent = unit ? `${Math.max(0, unit.hp)}%` : '—'; byId('ammo').textContent = unit ? String(unit.ammo).padStart(2, '0') : '—';
  byId('status').textContent = unit?.hp <= 0 ? tr('down') : tr('ready'); byId('round').textContent = round;
  byId('allies').textContent = allies.filter(u => u.hp > 0).length; byId('enemies').textContent = enemies.filter(u => u.hp > 0).length;
}
scaleSelect.addEventListener('change', populateTheaters); locationSelect.addEventListener('change', updateTheaterInfo); allianceSelect.addEventListener('change', updateTheaterInfo);
byId('deploy').addEventListener('click', deploy);
byId('language').value = language; byId('language').addEventListener('change', e => changeLanguage(e.target.value)); byId('inGameLanguage').addEventListener('change', e => changeLanguage(e.target.value));
byId('startGame').addEventListener('click', () => { byId('mainMenu').classList.add('hidden'); byId('gameScreen').classList.remove('hidden'); deploy(); });
window.addEventListener('keydown', e => { const key = e.key.toLowerCase(); if (['w','a','s','d',' '].includes(key)) e.preventDefault(); keys[key] = true; if (key === ' ') attack(); if (/^[1-3]$/.test(key)) selectUnit(Number(key) - 1); });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => Object.keys(keys).forEach(key => { keys[key] = false; }));
canvas.addEventListener('click', e => { const rect = canvas.getBoundingClientRect(), x = (e.clientX - rect.left) * W / rect.width, y = (e.clientY - rect.top) * H / rect.height; target = enemies.find(u => u.hp > 0 && Math.hypot(u.x - x, u.y - y) < 26) || null; });
function collides(x, y, radius = 14) { return x < radius || x > W - radius || y < radius || y > H - radius || obstacles.some(o => x + radius > o.x && x - radius < o.x + o.w && y + radius > o.y && y - radius < o.y + o.h); }
function moveUnit(unit, dx, dy) { if (!collides(unit.x + dx, unit.y)) unit.x += dx; if (!collides(unit.x, unit.y + dy)) unit.y += dy; if (dx || dy) unit.angle = Math.atan2(dy, dx); }
function hasLineOfSight(a, b) { for (let i=1;i<30;i++) { const t=i/30,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t; if (obstacles.some(o=>x>o.x&&x<o.x+o.w&&y>o.y&&y<o.y+o.h)) return false; } return true; }
function attack() {
  if (ended) return; const unit = allies[activeIndex]; if (!unit || unit.hp <= 0) return;
  if (!unit.ammo) { byId('phase').textContent = tr('ammoEmpty'); return; }
  const victim = target?.hp > 0 ? target : enemies.find(u => u.hp > 0); if (!victim) return;
  unit.ammo--; unit.angle = Math.atan2(victim.y - unit.y, victim.x - unit.x); tracers.push({ x1:unit.x,y1:unit.y,x2:victim.x,y2:victim.y,life:.12 });
  if (Math.hypot(victim.x-unit.x,victim.y-unit.y)<470 && hasLineOfSight(unit,victim)) { victim.hp -= unit.role==='Heavy'?30:24; burst(victim.x,victim.y,'#e3a85d',8); if(victim.hp<=0){victim.hp=0;target=null;burst(victim.x,victim.y,'#8f4d3e',14);} } else burst(victim.x,victim.y,'#d8d0bd',4);
  round++; buildRoster(); updateUI();
}
function enemyTurn() {
  enemies.forEach(enemy => { if(enemy.hp<=0)return; enemy.cooldown-=1.2; if(enemy.cooldown>0)return;
    const living=allies.filter(u=>u.hp>0); if(!living.length)return;
    const victim=living.reduce((nearest,unit)=>Math.hypot(unit.x-enemy.x,unit.y-enemy.y)<Math.hypot(nearest.x-enemy.x,nearest.y-enemy.y)?unit:nearest);
    const distance=Math.hypot(victim.x-enemy.x,victim.y-enemy.y); enemy.angle=Math.atan2(victim.y-enemy.y,victim.x-enemy.x);
    if(distance>260&&!collides(enemy.x+Math.cos(enemy.angle),enemy.y+Math.sin(enemy.angle),12)){enemy.x+=Math.cos(enemy.angle)*12;enemy.y+=Math.sin(enemy.angle)*12;}
    else if(hasLineOfSight(enemy,victim)){tracers.push({x1:enemy.x,y1:enemy.y,x2:victim.x,y2:victim.y,life:.12});victim.hp-=enemy.damage+Math.floor(Math.random()*4);burst(victim.x,victim.y,'#cf735d',5);if(victim.hp<=0)victim.hp=0;}
    enemy.cooldown=enemy.attackCooldown+Math.random()*.55;
  }); buildRoster(); updateUI();
}
function burst(x,y,color,count){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*180,vy:(Math.random()-.5)*180,life:.4+Math.random()*.5,color});}
function drawTerrain(){ctx.fillStyle=naval?'#6d806c':'#777d67';ctx.fillRect(0,0,W,H);if(naval){ctx.fillStyle='#426b78';ctx.fillRect(0,0,W,88);ctx.fillStyle='#b7a77b';ctx.fillRect(0,88,W,38);ctx.fillStyle='rgba(255,255,255,.22)';for(let x=0;x<W;x+=65){ctx.beginPath();ctx.moveTo(x,85);ctx.lineTo(x+35,92);ctx.strokeStyle='#c1d0c3';ctx.stroke();}}
  ctx.strokeStyle='rgba(36,42,34,.16)';ctx.lineWidth=1;for(let x=0;x<W;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  obstacles.forEach(o=>{ctx.fillStyle=currentScale==='city'?'#45483e':'#555c48';ctx.fillRect(o.x,o.y,o.w,o.h);ctx.strokeStyle='#777c69';ctx.strokeRect(o.x+3,o.y+3,o.w-6,o.h-6);ctx.fillStyle='rgba(20,22,18,.25)';ctx.fillRect(o.x+8,o.y+o.h-7,o.w-16,3);});}
function drawUnit(unit,enemy=false){if(unit.hp<=0){ctx.save();ctx.translate(unit.x,unit.y);ctx.rotate(.7);ctx.fillStyle='#393d35';ctx.fillRect(-15,-5,30,10);ctx.restore();return;}
  ctx.save();ctx.translate(unit.x,unit.y);ctx.rotate(unit.angle);ctx.fillStyle=enemy?'#7e463f':unit.color;ctx.strokeStyle='#252820';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=enemy?'#9f5d50':'#c4c8a9';ctx.fillRect(6,-3,24,6);ctx.restore();
  ctx.fillStyle='#e0decb';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText(enemy?(naval?'LANDING FORCE':'HOSTILE'):unit.name.toUpperCase(),unit.x,unit.y-22);ctx.fillStyle='#242720';ctx.fillRect(unit.x-16,unit.y-17,32,3);ctx.fillStyle=enemy?'#b45b48':'#94a864';const max=enemy?unit.maxHp:unitTemplates.find(t=>t.name===unit.name).hp;ctx.fillRect(unit.x-16,unit.y-17,32*unit.hp/max,3);}
function draw(){drawTerrain();enemies.forEach(u=>drawUnit(u,true));allies.forEach(u=>drawUnit(u));tracers.forEach(t=>{ctx.strokeStyle='#f2cf84';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(t.x1,t.y1);ctx.lineTo(t.x2,t.y2);ctx.stroke();});particles.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);});ctx.globalAlpha=1;if(target?.hp>0){ctx.strokeStyle='#edc56e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(target.x,target.y,23+Math.sin(performance.now()/100)*3,0,Math.PI*2);ctx.stroke();}}
let last=performance.now();
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;const unit=allies[activeIndex];if(!ended&&unit?.hp>0){const speed=145*dt;let dx=0,dy=0;if(keys.w)dy-=speed;if(keys.s)dy+=speed;if(keys.a)dx-=speed;if(keys.d)dx+=speed;const length=Math.hypot(dx,dy)||1;moveUnit(unit,dx/length*Math.min(speed,Math.hypot(dx,dy)),dy/length*Math.min(speed,Math.hypot(dx,dy)));}
  enemyTimer+=dt;if(!ended&&enemyTimer>=1.2){enemyTurn();enemyTimer=0;}particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);tracers.forEach(t=>t.life-=dt);tracers=tracers.filter(t=>t.life>0);
  if(!ended&&enemies.length){if(!enemies.some(u=>u.hp>0))endGame(true);else if(!allies.some(u=>u.hp>0))endGame(false);}if(!byId('gameScreen').classList.contains('hidden'))draw();requestAnimationFrame(loop);}
function endGame(victory){ended=true;const banner=byId('banner');banner.textContent=victory?tr('secured'):tr('failed');banner.classList.remove('hidden');byId('phase').textContent=victory?tr('complete'):tr('defeated');}
applyLanguage();populateTheaters();requestAnimationFrame(loop);
