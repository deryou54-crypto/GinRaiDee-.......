// State
let selectedSymptoms = new Set();
let selectedDiseases = new Set();
let activeMeal = 'morning';

// Date
const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const now = new Date();
document.getElementById('today-date').textContent = `วัน${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear() + 543}`;

// Foods database (loaded from API)
let foods = {};

// Fetch food data from the API
async function loadFoods() {
  try {
    const res = await fetch('api/foods');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    foods = await res.json();
    renderFoods(activeMeal);
  } catch (err) {
    console.error('Failed to load foods from API:', err);
  }
}

loadFoods();
// Init slider after DOM is ready
window.addEventListener('load', initTabSlider);


function toggleSymptom(btn) {
  const s = btn.dataset.sym;
  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    selectedSymptoms.delete(s);
  } else {
    btn.classList.add('active');
    selectedSymptoms.add(s);
  }
}

function clearSymptoms() {
  selectedSymptoms.clear();
  document.querySelectorAll('.symptom-btn').forEach(btn => btn.classList.remove('active'));
}

function clearDiseases() {
  selectedDiseases.clear();
  syncDiseaseTags();
}

function toggleDisease(d) {
  if (d === 'ไม่มีโรค') {
    if (selectedDiseases.has('ไม่มีโรค')) {
      selectedDiseases.delete('ไม่มีโรค');
    } else {
      selectedDiseases.clear();
      selectedDiseases.add('ไม่มีโรค');
    }
  } else {
    selectedDiseases.delete('ไม่มีโรค');
    if (selectedDiseases.has(d)) {
      selectedDiseases.delete(d);
    } else {
      selectedDiseases.add(d);
    }
  }
  syncDiseaseTags();
}

function toggleDiseaseTag(el) {
  const d = el.dataset.d;
  toggleDisease(d);
}

function selectDiseaseFromDropdown(val) {
  if (!val) return;
  toggleDisease(val);
  // Reset dropdown to placeholder
  document.getElementById('disease-select').value = '';
}

function syncDiseaseTags() {
  document.querySelectorAll('.d-tag').forEach(t => {
    t.classList.toggle('active', selectedDiseases.has(t.dataset.d));
  });
}

function doSearch() {
  const panel = document.getElementById('result-panel');
  const inner = document.getElementById('result-inner');

  if (selectedDiseases.size === 0 && selectedSymptoms.size === 0) {
    inner.innerHTML = `<div class="search-warning">⚠️ กรุณาเลือกอาการ หรือโรคประจำตัวก่อนค้นหา</div>`;
    panel.style.display = 'block';
    return;
  }

  let msg = '<div class="advice-header">📋 คำแนะนำสำหรับคุณ</div><ul class="advice-list">';

  const adviceMap = {
    'เบาหวาน': '🩸 เบาหวาน — หลีกเลี่ยงอาหาร GI สูง เน้นผักใยสูง โปรตีนลีน และคาร์บซับซ้อน',
    'ความดันโลหิตสูง': '❤️ ความดันสูง — ลดโซเดียม หลีกเลี่ยงอาหารเค็ม เน้นโพแทสเซียม เช่น กล้วย ผักใบเขียว',
    'ไขมันสูง': '🫀 ไขมันในเลือดสูง — เน้นโอเมก้า-3 ไขมันดี หลีกเลี่ยงอาหารทอด มันสัตว์',
    'โรคไต': '🫘 โรคไต — จำกัดโปรตีน โพแทสเซียม ฟอสฟอรัส เลือกอาหารที่ไตไม่ต้องทำงานหนัก',
    'โรคหัวใจ': '🫶 โรคหัวใจ — เน้นไขมันดี ลดคอเลสเตอรอล เลี่ยงของทอด เกลือ น้ำตาล',
    'ภูมิแพ้กลูเตน': '🌾 ภูมิแพ้กลูเตน — หลีกเลี่ยงข้าวสาลี ข้าวบาร์เลย์ ข้าวไรย์ เลือกข้าวกล้อง ข้าวโพด มันเทศ',
    'แพ้นม': '🥛 แพ้นม/แลคโตส — หลีกเลี่ยงผลิตภัณฑ์นม เลือกนมพืช เต้าหู้ หรืออาหารเสริมแคลเซียม',
    'ไม่มีโรค': '🌿 สุขภาพดี — กินอาหารหลากหลายครบ 5 หมู่ เน้นผักผลไม้สด ธัญพืชไม่ขัดสี',
  };

  const symptomAdvice = {
    'ปวดหัว': '🤕 ปวดหัว — ดื่มน้ำให้เพียงพอ กินแมกนีเซียม (ผักใบเขียว ถั่ว) หลีกเลี่ยงคาเฟอีน',
    'ลำไส้แปรปรวน': '🤢 ลำไส้แปรปรวน — กินอาหารอ่อน ๆ โยเกิร์ต โปรไบโอติก หลีกเลี่ยงของมัน เผ็ด',
    'ปวดท้อง': '😣 ปวดท้อง — กินข้าวต้ม โจ๊ก ซุป อ่อน ๆ ย่อยง่าย หลีกเลี่ยงของทอด ของแข็ง',
    'กินได้น้อย': '😔 กินได้น้อย — กินมื้อเล็ก ๆ บ่อยครั้ง เน้นอาหารที่มีโภชนาการสูงต่อมื้อ',
    'อ่อนเพลีย': '😴 อ่อนเพลีย — เพิ่มธาตุเหล็ก วิตามินบี โปรตีน และคาร์โบไฮเดรตที่ดีเพื่อพลังงาน',
    'มีอื่น ๆ': '❓ อาการอื่น ๆ — ควรปรึกษาแพทย์หรือนักโภชนาการเพื่อการดูแลที่ตรงจุด',
  };

  selectedDiseases.forEach(d => {
    if (adviceMap[d]) {
      msg += `<li class="advice-item disease-advice">${adviceMap[d]}</li>`;
    }
  });
  selectedSymptoms.forEach(s => {
    if (symptomAdvice[s]) {
      msg += `<li class="advice-item symptom-advice">${symptomAdvice[s]}</li>`;
    }
  });

  msg += '</ul>';
  inner.innerHTML = msg;
  panel.style.display = 'block';
  renderFoods(activeMeal);
  document.getElementById('daily').scrollIntoView({ behavior: 'smooth' });
}

function moveTabSlider(btn) {
  const slider = document.getElementById('tab-slider');
  const tabs = document.getElementById('meal-tabs');
  if (!slider || !tabs) return;
  const tabsRect = tabs.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  slider.style.width = btnRect.width + 'px';
  slider.style.left = (btnRect.left - tabsRect.left) + 'px';
  slider.style.height = btnRect.height + 'px';
  slider.style.top = (btnRect.top - tabsRect.top) + 'px';
}

function initTabSlider() {
  const activeTab = document.querySelector('.meal-tab.active');
  if (activeTab) {
    const slider = document.getElementById('tab-slider');
    if (slider) slider.style.transition = 'none';
    moveTabSlider(activeTab);
    requestAnimationFrame(() => {
      if (slider) slider.style.transition = '';
    });
  }
}

function switchMeal(meal, btn) {
  activeMeal = meal;
  document.querySelectorAll('.meal-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  moveTabSlider(btn);
  renderFoods(meal);
}


const tagColors = { 'GI ต่ำ': 'green', 'โปรตีนสูง': 'blue', 'ไขมันต่ำ': 'green', 'ย่อยง่าย': 'green', 'โซเดียมต่ำ': 'blue', 'วิตามินสูง': 'green', 'ใยอาหารสูง': 'green', 'โอเมก้า-3': 'blue', 'คาร์บต่ำ': 'orange', 'เบตาแคโรทีน': 'orange', 'โปรตีนพืช': 'green', 'โปรไบโอติก': 'blue', 'พลังงานเร็ว': 'orange', 'ไขมันดี': 'green', 'สุขภาพหัวใจ': 'red', 'คาร์บสูง': 'orange' };

function renderFoods(meal) {
  const grid = document.getElementById('food-grid');
  const list = foods[meal] || [];

  grid.innerHTML = list.map((f, index) => {
    const avoided = [...selectedDiseases].some(d => f.avoid.includes(d));
    const relevantToSymptom = [...selectedSymptoms].some(s => f.good.includes(s));

    const selectedCount = selectedPlanFoods.filter(sf => sf.name === f.name).length;

    const highlight = (!avoided && relevantToSymptom) ? 'box-shadow:0 0 0 3px var(--green),0 8px 24px rgba(58,170,110,0.2);' : '';
    const opacity = avoided ? 'opacity:0.4;filter:grayscale(0.6);' : '';

    const tagsHtml = f.tags.map(t => {
      const c = tagColors[t] || 'green';
      return `<span class="ftag ${c}">${t}</span>`;
    }).join('') + (avoided ? '<span class="ftag red">⚠ ควรหลีกเลี่ยง</span>' : '') + (relevantToSymptom && !avoided ? '<span class="ftag green">✓ แนะนำสำหรับคุณ</span>' : '');

    const imgHtml = f.image ? `<img src="${f.image}" alt="${f.name}" style="width:100%;height:100%;object-fit:cover;display:block;">` : f.emoji;

    const selectedBadgeHtml = selectedCount > 0 ? `<div class="selected-badge">${selectedCount}</div>` : '';

    return `
    <div class="food-card" style="${opacity}${highlight}">
      ${selectedBadgeHtml}
      <div class="food-img" style="background:${f.image ? 'none' : 'linear-gradient(135deg, var(--green-light), #d4f0e2)'}">
        ${imgHtml}
        <span class="kcal-badge">${f.kcal}</span>
      </div>
      <div class="food-body">
        <div class="food-name">${f.name}</div>
        <div class="food-desc">${f.desc}</div>
        <div class="food-tags">${tagsHtml}</div>
        <div class="nutrient-row" style="margin-top:0.7rem;padding-top:0.6rem;border-top:1px solid var(--border)">
          <div class="ntr"><span class="nval">${f.p}g</span>โปรตีน</div>
          <div class="ntr"><span class="nval">${f.c}g</span>คาร์บ</div>
          <div class="ntr"><span class="nval">${f.f}g</span>ไขมัน</div>
          <div class="ntr"><span class="nval">${f.sugar}g</span>น้ำตาล</div>
        </div>
        <button class="add-to-plan-btn ${selectedCount > 0 ? 'selected' : ''}" onclick="addFoodToPlan('${meal}', ${index})">
          ${selectedCount > 0 ? `✓ เพิ่มในแผนแล้ว (${selectedCount})` : '➕ เพิ่มในแผนวันนี้'}
        </button>
      </div>
    </div>`;
  }).join('');
}

// ── HEALTH CALCULATOR & CALORIE PLANNER STATE & LOGIC ──
let currentGender = 'male';
let selectedPlanFoods = [];

function syncAgeSlider() {
  const num = document.getElementById('input-age');
  const slider = document.getElementById('slider-age');
  if (num && slider) {
    slider.value = num.value;
    calculateAll();
  }
}
function syncAgeInput() {
  const num = document.getElementById('input-age');
  const slider = document.getElementById('slider-age');
  if (num && slider) {
    num.value = slider.value;
    calculateAll();
  }
}

function syncHeightSlider() {
  const num = document.getElementById('input-height');
  const slider = document.getElementById('slider-height');
  if (num && slider) {
    slider.value = num.value;
    calculateAll();
  }
}
function syncHeightInput() {
  const num = document.getElementById('input-height');
  const slider = document.getElementById('slider-height');
  if (num && slider) {
    num.value = slider.value;
    calculateAll();
  }
}

function syncWeightSlider() {
  const num = document.getElementById('input-weight');
  const slider = document.getElementById('slider-weight');
  if (num && slider) {
    slider.value = num.value;
    calculateAll();
  }
}
function syncWeightInput() {
  const num = document.getElementById('input-weight');
  const slider = document.getElementById('slider-weight');
  if (num && slider) {
    num.value = slider.value;
    calculateAll();
  }
}

function setGender(g) {
  currentGender = g;
  const btnMale = document.getElementById('gender-male');
  const btnFemale = document.getElementById('gender-female');
  if (g === 'male') {
    btnMale.classList.add('active');
    btnFemale.classList.remove('active');
  } else {
    btnFemale.classList.add('active');
    btnMale.classList.remove('active');
  }
  calculateAll();
}

function calculateAll() {
  const ageEl = document.getElementById('input-age');
  const heightEl = document.getElementById('input-height');
  const weightEl = document.getElementById('input-weight');
  const actEl = document.getElementById('select-activity');
  const goalEl = document.getElementById('select-goal');

  if (!ageEl || !heightEl || !weightEl || !actEl || !goalEl) return;

  const age = parseFloat(ageEl.value) || 25;
  const height = parseFloat(heightEl.value) || 170;
  const weight = parseFloat(weightEl.value) || 65;
  const activity = parseFloat(actEl.value) || 1.2;
  const goal = goalEl.value || 'maintain';

  // 1. Calculate BMI
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const bmiFixed = bmi.toFixed(1);

  const bmiScoreEl = document.getElementById('bmi-score');
  if (bmiScoreEl) bmiScoreEl.textContent = bmiFixed;

  // Gauge pointer (Scale: 15 to 40)
  let pct = ((bmi - 15) / 25) * 100;
  pct = Math.max(0, Math.min(100, pct));
  const pointerEl = document.getElementById('bmi-pointer');
  const pointerLabelEl = document.getElementById('pointer-label');
  if (pointerEl) pointerEl.style.left = `${pct}%`;
  if (pointerLabelEl) pointerLabelEl.textContent = bmiFixed;

  // BMI Category & Advice (Asian Standard)
  let categoryText = 'น้ำหนักปกติ';
  let badgeColor = 'green';
  let adviceTitle = 'น้ำหนักปกติ (สุขภาพดี)';
  let adviceContent = 'คุณมีน้ำหนักตัวที่สมดุลและปลอดภัย ควรเน้นการรับประทานอาหารที่มีคุณค่าทางโภชนาการสูงและออกกำลังกายอย่างสม่ำเสมอเพื่อรักษาสุขภาพที่ดีในระยะยาว';

  if (bmi < 18.5) {
    categoryText = 'ผอม / น้ำหนักน้อย';
    badgeColor = 'blue';
    adviceTitle = 'ผอม / น้ำหนักน้อยกว่าเกณฑ์';
    adviceContent = 'ควรเพิ่มพลังงานและโปรตีนที่มีประโยชน์ รับประทานอาหารให้ครบ 5 หมู่ และสร้างกล้ามเนื้อด้วยการออกกำลังกายแบบเวทเทรนนิ่ง';
  } else if (bmi >= 18.5 && bmi <= 22.9) {
    categoryText = 'น้ำหนักปกติ';
    badgeColor = 'green';
    adviceTitle = 'น้ำหนักปกติ (สุขภาพดี)';
    adviceContent = 'คุณมีน้ำหนักตัวที่สมดุลและปลอดภัย ควรเน้นการรับประทานอาหารที่มีคุณค่าทางโภชนาการสูงและออกกำลังกายอย่างสม่ำเสมอเพื่อรักษาสุขภาพที่ดีในระยะยาว';
  } else if (bmi >= 23.0 && bmi <= 24.9) {
    categoryText = 'น้ำหนักเกิน (ท้วม)';
    badgeColor = 'yellow';
    adviceTitle = 'น้ำหนักเกินเกณฑ์มาตรฐาน (ท้วม)';
    adviceContent = 'ควรเริ่มปรับเปลี่ยนพฤติกรรมการกิน ลดอาหารหวาน มัน เค็ม เพิ่มการกินผักใยอาหารสูง และออกกำลังกายอย่างน้อย 150 นาทีต่อสัปดาห์';
  } else if (bmi >= 25.0 && bmi <= 29.9) {
    categoryText = 'อ้วนระดับ 1';
    badgeColor = 'orange';
    adviceTitle = 'สภาวะน้ำหนักอ้วน (ระดับ 1)';
    adviceContent = 'เสี่ยงต่อโรคเรื้อรัง เช่น ความดัน เบาหวาน ไขมันในเลือด ควรลดปริมาณพลังงานในแต่ละวัน ควบคุมคาร์โบไฮเดรตและไขมันอย่างจริงจัง';
  } else {
    categoryText = 'อ้วนระดับ 2 (อันตราย)';
    badgeColor = 'red';
    adviceTitle = 'สภาวะน้ำหนักอ้วนมาก (ระดับ 2 / อันตราย)';
    adviceContent = 'มีความเสี่ยงสูงต่อโรคหัวใจและหลอดเลือด ควรปรึกษาแพทย์หรือนักโภชนาการ และวางแผนลดน้ำหนักด้วยอาหารสุขภาพร่วมกับการออกกำลังกายอย่างปลอดภัย';
  }

  const badgeEl = document.getElementById('bmi-badge');
  if (badgeEl) {
    badgeEl.textContent = categoryText;
    badgeEl.className = `bmi-badge ${badgeColor}`;
  }

  const adviceCardEl = document.getElementById('bmi-advice-card');
  if (adviceCardEl) adviceCardEl.className = `bmi-advice-card ${badgeColor}`;
  const adviceTitleEl = document.getElementById('bmi-advice-title');
  if (adviceTitleEl) adviceTitleEl.textContent = adviceTitle;
  const adviceContentEl = document.getElementById('bmi-advice-content');
  if (adviceContentEl) adviceContentEl.textContent = adviceContent;

  // 2. Calculate BMR (Mifflin-St Jeor Equation)
  let bmr = 0;
  if (currentGender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  bmr = Math.round(bmr);
  const bmrEl = document.getElementById('bmr-val');
  if (bmrEl) bmrEl.textContent = bmr.toLocaleString();

  // 3. Calculate TDEE
  let tdee = Math.round(bmr * activity);
  const tdeeEl = document.getElementById('tdee-val');
  if (tdeeEl) tdeeEl.textContent = tdee.toLocaleString();

  // 4. Calculate Target Calories
  let targetKcal = tdee;
  if (goal === 'lose') {
    targetKcal = Math.max(bmr, Math.round(tdee * 0.85)); // 15% deficit, min BMR
  } else if (goal === 'gain') {
    targetKcal = Math.round(tdee * 1.15); // 15% surplus
  }

  const targetTextEl = document.getElementById('target-kcal-text');
  if (targetTextEl) targetTextEl.textContent = targetKcal.toLocaleString();
}

function applyCalorieGoal() {
  const targetText = document.getElementById('target-kcal-text');
  if (targetText) {
    const val = parseInt(targetText.textContent.replace(/,/g, ''), 10);
    const goalInput = document.getElementById('calorie-goal');
    if (goalInput && !isNaN(val)) {
      goalInput.value = val;
      updateCalorieProgress();
      document.getElementById('calorie-planner').scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// ── CALORIE & NUTRIENT PLANNER FUNCTIONS ──

function parseKcal(kcalStr) {
  if (typeof kcalStr !== 'string') return 0;
  const numbers = kcalStr.match(/\d+/g);
  if (!numbers) return 0;
  if (numbers.length >= 2) {
    return (parseFloat(numbers[0]) + parseFloat(numbers[1])) / 2;
  }
  return parseFloat(numbers[0]);
}

function addFoodToPlan(meal, index) {
  const list = foods[meal] || [];
  const food = list[index];
  if (!food) return;

  selectedPlanFoods.push({ ...food, kcalNum: parseKcal(food.kcal) });
  updateCalorieProgress();
  renderFoods(activeMeal);
}

function removeFoodFromPlan(index) {
  selectedPlanFoods.splice(index, 1);
  updateCalorieProgress();
  renderFoods(activeMeal);
}

function clearSelectedFoods() {
  selectedPlanFoods = [];
  updateCalorieProgress();
  renderFoods(activeMeal);
}

function updateCalorieProgress() {
  const goalInput = document.getElementById('calorie-goal');
  if (!goalInput) return;
  const targetGoal = Math.max(1, parseInt(goalInput.value, 10) || 2000);

  let totalKcal = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;
  let totalSugar = 0;

  selectedPlanFoods.forEach(f => {
    totalKcal += f.kcalNum || 0;
    totalP += f.p || 0;
    totalC += f.c || 0;
    totalF += f.f || 0;
    totalSugar += f.sugar || 0;
  });

  totalKcal = Math.round(totalKcal);

  // Update displays
  const consumedEl = document.getElementById('calories-consumed');
  const targetDisplayEl = document.getElementById('calories-target-display');
  if (consumedEl) consumedEl.textContent = totalKcal.toLocaleString();
  if (targetDisplayEl) targetDisplayEl.textContent = targetGoal.toLocaleString();

  // Progress Bar
  const pct = Math.min(100, Math.round((totalKcal / targetGoal) * 100));
  const fillEl = document.getElementById('calorie-progress-fill');
  if (fillEl) fillEl.style.width = `${pct}%`;

  // Status Box
  const statusBox = document.getElementById('calorie-status-box');
  const statusText = document.getElementById('calorie-status-text');
  if (statusBox && statusText) {
    const diff = targetGoal - totalKcal;
    if (selectedPlanFoods.length === 0) {
      statusBox.className = 'calorie-status-box info';
      statusText.innerHTML = 'คลิกปุ่ม ➕ เพิ่มในแผนวันนี้ บนเมนูอาหารด้านล่าง เพื่อวางแผนโภชนาการประจำวัน';
    } else if (diff > 100) {
      statusBox.className = 'calorie-status-box under';
      statusText.innerHTML = `ทานเพิ่มได้อีก <strong>${diff.toLocaleString()} kcal</strong> เพื่อให้บรรลุเป้าหมาย`;
    } else if (diff >= -100 && diff <= 100) {
      statusBox.className = 'calorie-status-box perfect';
      statusText.innerHTML = `🎉 ยินดีด้วย! คุณรับประทานอาหารได้ใกล้เคียงเป้าหมาย <strong>${targetGoal.toLocaleString()} kcal</strong> อย่างเหมาะสม`;
    } else {
      statusBox.className = 'calorie-status-box over';
      statusText.innerHTML = `⚠️ คุณรับประทานเกินเป้าหมายไป <strong>${Math.abs(diff).toLocaleString()} kcal</strong> ควรระวังของหวานหรืออาหารแคลอรี่สูง`;
    }
  }

  // Selected Food List
  const listEl = document.getElementById('selected-food-list');
  if (listEl) {
    if (selectedPlanFoods.length === 0) {
      listEl.innerHTML = '<div class="empty-list-msg">ยังไม่ได้เลือกอาหารในวันนี้</div>';
    } else {
      listEl.innerHTML = selectedPlanFoods.map((f, i) => `
        <div class="selected-food-item">
          <span class="sf-emoji">${f.emoji || '🥗'}</span>
          <div class="sf-info">
            <div class="sf-name">${f.name}</div>
            <div class="sf-kcal">${f.kcal} | P:${f.p}g C:${f.c}g F:${f.f}g</div>
          </div>
          <button class="sf-remove-btn" onclick="removeFoodFromPlan(${i})" title="ลบรายการนี้">✕</button>
        </div>
      `).join('');
    }
  }

  // Donut SVG & Macro Progress Bars
  const carbsEnergy = totalC * 4;
  const proteinEnergy = totalP * 4;
  const fatsEnergy = totalF * 9;
  const totalMacroEnergy = carbsEnergy + proteinEnergy + fatsEnergy;

  let carbPct = 0, proteinPct = 0, fatPct = 0;
  if (totalMacroEnergy > 0) {
    carbPct = (carbsEnergy / totalMacroEnergy) * 100;
    proteinPct = (proteinEnergy / totalMacroEnergy) * 100;
    fatPct = (fatsEnergy / totalMacroEnergy) * 100;
  }

  // SVG Segments (Carbs, Protein, Fats stacked clockwise)
  setDonutSegment('donut-carbs', carbPct, 100);
  setDonutSegment('donut-protein', proteinPct, 100 - carbPct);
  setDonutSegment('donut-fats', fatPct, 100 - carbPct - proteinPct);

  // Macro Text & Fill Bars
  const pVal = document.getElementById('macro-protein-val');
  const cVal = document.getElementById('macro-carbs-val');
  const fVal = document.getElementById('macro-fats-val');
  const sVal = document.getElementById('macro-sugar-val');
  if (pVal) pVal.textContent = `${totalP}g`;
  if (cVal) cVal.textContent = `${totalC}g`;
  if (fVal) fVal.textContent = `${totalF}g`;
  if (sVal) sVal.textContent = `${totalSugar}g`;

  // Standard target macro estimates based on targetGoal
  const targetProteinGrams = Math.max(1, (targetGoal * 0.3) / 4);
  const targetCarbsGrams = Math.max(1, (targetGoal * 0.4) / 4);
  const targetFatsGrams = Math.max(1, (targetGoal * 0.3) / 9);
  const targetSugarGrams = 30; // Max recommended sugar

  const pBar = document.getElementById('macro-protein-bar');
  const cBar = document.getElementById('macro-carbs-bar');
  const fBar = document.getElementById('macro-fats-bar');
  const sBar = document.getElementById('macro-sugar-bar');

  if (pBar) pBar.style.width = `${Math.min(100, Math.round((totalP / targetProteinGrams) * 100))}%`;
  if (cBar) cBar.style.width = `${Math.min(100, Math.round((totalC / targetCarbsGrams) * 100))}%`;
  if (fBar) fBar.style.width = `${Math.min(100, Math.round((totalF / targetFatsGrams) * 100))}%`;
  if (sBar) sBar.style.width = `${Math.min(100, Math.round((totalSugar / targetSugarGrams) * 100))}%`;
}

function setDonutSegment(id, percent, offset) {
  const el = document.getElementById(id);
  if (el) {
    el.setAttribute('stroke-dasharray', `${percent} ${100 - percent}`);
    el.setAttribute('stroke-dashoffset', offset);
  }
}

// Initial calculation on load
function initCalculators() {
  calculateAll();
  updateCalorieProgress();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalculators);
} else {
  initCalculators();
}
window.addEventListener('load', initCalculators);


// Scroll observer
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

// Dark Mode Toggle Logic
const themeToggle = document.getElementById('theme-toggle');

// Default to light mode unless explicitly saved as dark in localStorage
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.checked = true;
} else {
  document.body.classList.remove('dark-mode');
  themeToggle.checked = false;
}

themeToggle.addEventListener('change', () => {
  if (themeToggle.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
});

// ── USER LOGIN LOGIC ──
let currentUser = null;

function loadStoredUser() {
  try {
    const saved = localStorage.getItem('ginraidee_user');
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse user session:', e);
  }
  updateUserNav();
}

function updateUserNav() {
  const container = document.getElementById('user-status-container');
  if (!container) return;

  if (currentUser && currentUser.firstName && currentUser.lastName) {
    container.innerHTML = `
      <div class="user-profile">
        <span class="avatar-icon">👤</span>
        <span class="user-name" id="display-user-name" title="${currentUser.firstName} ${currentUser.lastName}">${currentUser.firstName} ${currentUser.lastName}</span>
        <button class="nav-btn logout-btn" onclick="handleLogout()" title="ออกจากระบบ">ออกจากระบบ</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="nav-btn login-btn" onclick="openLoginModal()">🔑 เข้าสู่ระบบ</button>
    `;
  }
}

function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.add('active');
    const fnInput = document.getElementById('first-name');
    if (fnInput) fnInput.focus();
  }
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function handleLogin(e) {
  if (e) e.preventDefault();
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');

  if (!firstNameInput || !lastNameInput) return;

  const fn = firstNameInput.value.trim();
  const ln = lastNameInput.value.trim();

  if (!fn || !ln) return;

  currentUser = { firstName: fn, lastName: ln };
  localStorage.setItem('ginraidee_user', JSON.stringify(currentUser));

  closeLoginModal();
  updateUserNav();

  // Reset form inputs
  firstNameInput.value = '';
  lastNameInput.value = '';
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('ginraidee_user');
  updateUserNav();
}

// Close modal when clicking outside content box
window.addEventListener('click', (e) => {
  const modal = document.getElementById('login-modal');
  if (modal && e.target === modal) {
    closeLoginModal();
  }
});

// Run initial user nav check
loadStoredUser();





