'use strict';

/* =========================================================================
   Utilities
   ========================================================================= */
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Runs `cb` once on the next transitionend for `prop`, with a timeout
 *  fallback in case the event never fires (e.g. element hidden mid-flight). */
function onTransitionEndOnce(el, prop, cb, fallbackMs = 500) {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    el.removeEventListener('transitionend', handler);
    clearTimeout(timer);
    cb();
  };
  const handler = (e) => { if (e.propertyName === prop) finish(); };
  el.addEventListener('transitionend', handler);
  const timer = setTimeout(finish, fallbackMs);
}

/* =========================================================================
   i18n — перемикання UA <-> EN.
   Мова зберігається в localStorage і зчитується на кожній із трьох сторінок
   (index.html, product.html, cart.html), бо всі вони підключають цей файл.
   Перемикання відбувається через перезавантаження сторінки (setLang нижче) —
   це свідомо простіше й надійніше за перерендер усього "на льоту", і working
   узгоджено з тим, що товарні дані/hero вже читаються заново при кожному
   завантаженні сторінки.
   ========================================================================= */
const SITE_LANG_KEY = 'vcd_lang';

function getLang() {
  return localStorage.getItem(SITE_LANG_KEY) === 'en' ? 'en' : 'ua';
}

function setLang(lang) {
  localStorage.setItem(SITE_LANG_KEY, lang === 'en' ? 'en' : 'ua');
  // Знімаємо прапорець, щоб банер-попередження показався знову — вже новою мовою.
  sessionStorage.removeItem('warningShown');
  location.reload();
}

// Словник статичних фраз інтерфейсу. Ключ -> {ua, en}.
const I18N = {
  skipLink:        { ua: 'Перейти до основного контенту', en: 'Skip to main content' },
  menuLabel:       { ua: 'Меню', en: 'Menu' },
  mainNavAria:     { ua: 'Основна навігація', en: 'Main navigation' },
  navCart:         { ua: 'Кошик', en: 'Cart' },
  navCatalog:      { ua: 'Каталог', en: 'Catalog' },
  navHits:         { ua: 'Хіти', en: 'Hits' },
  navContacts:     { ua: 'Контакти', en: 'Contacts' },
  navHome:         { ua: 'На головну', en: 'Home' },
  logoAriaTop:     { ua: 'FLYQ — на початок сторінки', en: 'FLYQ — back to top' },
  logoAriaHome:    { ua: 'VCD — на головну', en: 'VCD — home' },

  titleHome:       { ua: 'FLYQ — знаряддя як праці, так і помсти', en: 'FLYQ — tools for labor and for revenge' },
  titleProduct:    { ua: 'Товар — VCD', en: 'Product — VCD' },
  titleCart:       { ua: 'Кошик — VCD', en: 'Cart — VCD' },
  metaHomeDesc:    { ua: 'FLYQ — український виробник дронів. Понад 67 років на ринку техніки, яка не підводить.',
                     en: 'FLYQ — a Ukrainian drone manufacturer. Over 67 years on the market for technology that never lets you down.' },
  metaProductDesc: { ua: 'VCD — технічні характеристики та замовлення дронів.', en: 'VCD — drone specifications and ordering.' },

  heroCarouselRole:{ ua: 'карусель', en: 'carousel' },
  heroSlidesAria:  { ua: 'Пропозиції', en: 'Offers' },
  heroDotsAria:    { ua: 'Слайди пропозицій', en: 'Offer slides' },
  heroPrevAria:    { ua: 'Попередній слайд', en: 'Previous slide' },
  heroNextAria:    { ua: 'Наступний слайд', en: 'Next slide' },
  heroSlideLabel:  { ua: 'Слайд', en: 'Slide' },

  railPrevAria:    { ua: 'Попередні товари', en: 'Previous products' },
  railNextAria:    { ua: 'Наступні товари', en: 'Next products' },
  viewProduct:     { ua: 'Переглянути', en: 'View' },

  footerTagline:   { ua: 'Знаряддя як праці, так і помсти', en: 'Tools for labor and for revenge' },
  igLabel:         { ua: 'VCD в Instagram', en: 'VCD on Instagram' },
  tgLabel:         { ua: 'VCD у Telegram', en: 'VCD on Telegram' },

  warningTitle:    { ua: 'Попередження', en: 'Warning' },
                    
  warningText:     { ua: 'Цей сайт є демонстраційним проєктом. Інформація про продукцію, характеристики, фотографії та інші матеріали використовуються лише з навчальною метою і не є реальною комерційною пропозицією.',
                     en: 'This site is a demo project. Product information, specifications, photos and other materials are used for educational purposes only.' },
  warningClose:    { ua: 'Зрозуміло', en: 'Got it' },

  authNickPh:      { ua: 'Нікнейм', en: 'Nickname' },
  authPassPh:      { ua: 'Пароль', en: 'Password' },
  authNickErr:     { ua: 'Введіть нікнейм', en: 'Enter a nickname' },
  authPassErr:     { ua: 'Введіть пароль', en: 'Enter a password' },
  authCancel:      { ua: 'Скасувати', en: 'Cancel' },
  authErrorText:   { ua: 'успішно зареєстровано Вітаємо .',
                     en: 'all good WELCOME.' },

  galleryPrev:     { ua: 'Попередній вигляд', en: 'Previous view' },
  galleryNext:     { ua: 'Наступний вигляд', en: 'Next view' },
  galleryViewLabel:{ ua: 'Вигляд', en: 'View' },
  galleryMore:     { ua: 'додаткові фото скоро з\'являться', en: 'additional photos coming soon' },
  qtyMinus:        { ua: 'Зменшити кількість', en: 'Decrease quantity' },
  qtyPlus:         { ua: 'Збільшити кількість', en: 'Increase quantity' },
  orderBtn:        { ua: 'Замовити', en: 'Order' },
  orderAdded:      { ua: 'Додано', en: 'Added' },
  videoPlay:       { ua: 'Відтворити відео', en: 'Play video' },
  videoPause:      { ua: 'Пауза', en: 'Pause' },
  videoNotice:     { ua: 'Відеоогляд цієї моделі скоро з’явиться', en: 'Video review of this model is coming soon' },

  cartHeading:     { ua: 'Ваш кошик', en: 'Your cart' },
  cartEmpty:       { ua: 'Кошик порожній.', en: 'Your cart is empty.' },
  cartToCatalog:   { ua: 'Перейти до каталогу', en: 'Go to catalog' },
  cartAddMore:     { ua: 'Замовити ще', en: 'Add more' },
  cartCheckout:    { ua: 'Оформити замовлення', en: 'Place order' },
  cartRemove:      { ua: 'Видалити', en: 'Remove' },
  stockTitle:      { ua: 'Товар відсутній', en: 'Out of stock' },
  stockText:       { ua: 'Вибачте, товар зараз не в наявності.<br>Ми повідомимо вас про появу.',
                     en: 'Sorry, this item is currently out of stock.<br>We will notify you when it is back.' },
  stockContinue:   { ua: 'Продовжити', en: 'Continue' },
};

function tr(key) {
  const entry = I18N[key];
  return entry ? entry[getLang()] : key;
}

// Три теги товарів повторюються на 8 позиціях — простіше тримати одну
// табличку відповідностей, ніж дублювати переклад у кожному об'єкті PRODUCTS.
const TAG_EN = { 'Розвідка': 'Recon', 'Атака': 'Attack', 'Швидкість': 'Speed' , 'МАСОВЕ ЗНИЖЧЕННЯ': 'Anigilaton', };
function localizedTag(uaTag) {
  return getLang() === 'en' ? (TAG_EN[uaTag] || uaTag) : uaTag;
}

// Повертає товар із підміненими на англійські tag/description/extra,
// коли активна англійська мова. Ім'я бренду (напр. "FLYQ Raven") не
// перекладається — воно однакове в обох мовах.
function localizedProduct(product) {
  if (!product || getLang() !== 'en') return product;
  return {
    ...product,
    tag: localizedTag(product.tag),
    description: product.description_en || product.description,
    extra: product.extra_en || product.extra,
  };
}

// Атрибути, які перекладаються через відповідність data-* -> реальний атрибут.
const I18N_ATTR_MAP = {
  'data-i18n-aria': 'aria-label',
  'data-i18n-placeholder': 'placeholder',
  'data-i18n-roledesc': 'aria-roledescription',
  'data-i18n-content': 'content',
};

// Одноразовий прохід по статичній розмітці сторінки: підставляє переклад
// у всі елементи з data-i18n* атрибутами. Викликається в DOMContentLoaded
// на кожній із трьох сторінок (index/product/cart), оскільки всі вони
// підключають цей файл.
function applyStaticTranslations() {
  const lang = getLang();
  document.documentElement.lang = lang === 'en' ? 'en' : 'uk';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = tr(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = tr(el.getAttribute('data-i18n-html'));
  });
  Object.entries(I18N_ATTR_MAP).forEach(([dataAttr, targetAttr]) => {
    document.querySelectorAll(`[${dataAttr}]`).forEach((el) => {
      el.setAttribute(targetAttr, tr(el.getAttribute(dataAttr)));
    });
  });
  const titleEl = document.querySelector('title[data-i18n-title]');
  if (titleEl) document.title = tr(titleEl.getAttribute('data-i18n-title'));
}

/* =========================================================================
   Product data (single source of truth for both rails)
   ========================================================================= */
const PRODUCTS = [
  { id: 'raven',   name: 'FLYQ Raven',   tag: 'Розвідка',  views: 1240, image: 'raven.jpg', price: 10299,
    videoSrc: 'https://assets.mixkit.co/videos/44644/44644-360.mp4',
 description: [  'VCD Raven — легкий розвідувальний дрон, який оператор запускає прямо з руки за лічені секунди. Рішення для миттєвої тактичної розвідки й спостереження в інтересах піхотних підрозділів та невеликих груп, коли рішення потрібно ухвалювати негайно.',
      'Стабілізоване електронно-оптичне й інфрачервоне корисне навантаження передає відео та координати цілі в реальному часі — вдень і вночі. Мінімум налаштувань, максимум польотного часу: змінні акумулятори дозволяють повторний виліт за лічені хвилини.',
    ],  extra: {
      heading: 'Перевірено в полі',
      text: 'Маса та розмах крил розраховані на перенесення однією людиною без додаткового спорядження. Проста, надійна конструкція не потребує штабу техобслуговування поруч — тільки оператора й ціль.',
    },
    description_en: [ 'The VCD Raven is a lightweight reconnaissance drone that an operator can hand-launch in seconds. Built for instant tactical reconnaissance and observation for infantry units and small teams, when decisions have to be made right now.',
      'A stabilized electro-optical and infrared payload streams video and target coordinates in real time — day or night. Minimal setup, maximum flight time: swappable batteries allow a relaunch within minutes.',
    ], extra_en: {
      heading: 'Field-proven',
      text: 'Its weight and wingspan are sized to be carried by a single person with no extra gear. A simple, reliable build needs no maintenance crew nearby — just an operator and a target.',
    },},
  
    { id: 'hornet',  name: 'FLYQ Hornet',  tag: 'Атака',     views: 2830, image: 'hornet.jpg', price: 14929, videoSrc: 'https://assets.mixkit.co/videos/623/623-360.mp4',   description: [
      'VCD Hornet — безпілотник фіксованого крила з розмахом близько двох метрів і штовхаючим гвинтом позаду. Компонування навмисне: передня частина фюзеляжу лишається вільною для датчиків і систем наведення, нічим не затулена.',
      'Корпус із поєднання нейлонових полімерів, дюралюмінію та вуглецевих композитів дає малу вагу, достатню жорсткість і знижену акустичну й радіолокаційну сигнатуру — Hornet важко почути до останньої фази підходу.',
    ],
    extra: {
      heading: 'Крейсер і піке',
      text: 'Крейсерська швидкість — 100–120 км/год, на кінцевій фазі атаки Hornet розганяється до 200–300 км/год. Дві камери високої роздільності з 10-кратним оптичним зумом працюють і на маршруті, і під час ідентифікації цілі; робоча висота — 300–500 м, максимальна — до 5000 м.',
    },
    description_en: [ 'The VCD Hornet is a fixed-wing drone with roughly a two-meter wingspan and a rear pusher propeller. The layout is deliberate: the nose stays completely clear for sensors and guidance systems.',
      'A hull combining nylon polymers, duralumin and carbon composites keeps weight low, rigidity high, and its acoustic and radar signature reduced — the Hornet is hard to hear until the final approach.',
    ], extra_en: {
      heading: 'Cruise and dive',
      text: 'Cruise speed is 100–120 km/h, accelerating to 200–300 km/h during the final attack run. Two high-resolution cameras with 10x optical zoom cover both the route and target identification; operating altitude is 300–500 m, up to 5000 m maximum.',
    },},
  
    { id: 'ghost',   name: 'FLYQ Ghost',   tag: 'Розвідка',  views: 980,  image: 'ghost.jpg', price: 149999, videoSrc: 'https://assets.mixkit.co/videos/44641/44641-360.mp4', description: [
      'VCD Ghost створений для розвідки там, де важлива тиша. Мультироторна платформа з приглушеним приводом і мінімальною тепловою сигнатурою здатна годинами утримувати позицію спостереження, лишаючись непоміченою.',
      'Автономний режим утримання точки дозволяє оператору перемкнутися на інші завдання, поки Ghost веде безперервне відеоспостереження та передає координати в реальному часі захищеним каналом зв’язку.',
    ],
    extra: {
      heading: 'Тихіше за тишу',
      text: 'Композитні лопаті та знижена швидкість обертання роблять Ghost одним із найтихіших апаратів лінійки — вибір для розвідки на близькій дистанції, де кожен зайвий децибел коштує місії.',
    },
    description_en: [ 'The VCD Ghost is built for reconnaissance where silence matters. A multirotor platform with a quiet drivetrain and a minimal heat signature can hold an observation position for hours without being noticed.',
      'An autonomous position-hold mode frees the operator for other tasks while the Ghost keeps up continuous video surveillance and relays coordinates in real time over an encrypted link.',
    ], extra_en: {
      heading: 'Quieter than silence',
      text: 'Composite blades and a lower rotor speed make the Ghost one of the quietest aircraft in the lineup — the choice for close-range reconnaissance, where every extra decibel can cost the mission.',
    }, },
  
    { id: 'striker', name: 'FLYQ Striker', tag: 'Атака',     views: 3510, image: 'striker.jpg' , price: 22299,  videoSrc: 'https://assets.mixkit.co/videos/44708/44708-360.mp4', description: [
      'VCD Striker — мультироторний дрон-перехоплювач, створений для виявлення й супроводу повітряних цілей в автономному режимі. Бортова система на основі штучного інтелекту утримує захоплену ціль навіть під час різких маневрів.',
      'Компактна й маневрена платформа виходить у точку перехоплення швидше, ніж оператор встигає підтвердити другу ціль. Striker розрахований на щільну роботу в парі з наземними розрахунками ППО ближньої дії.',
    ],
    extra: {
      heading: 'Автономне наведення',
      text: 'Алгоритми супроводу цілі працюють без постійного втручання оператора: Striker сам утримує курс перехоплення, звільняючи розрахунок для рішення про застосування.',
    },
    description_en: [ 'The VCD Striker is a multirotor interceptor drone built to detect and track aerial targets autonomously. An onboard AI system keeps a locked target even through sharp maneuvers.',
      'A compact, agile platform, it reaches the intercept point faster than an operator can confirm a second target. The Striker is designed to work closely alongside short-range ground air-defense crews.',
    ], extra_en: {
      heading: 'Autonomous guidance',
      text: 'Target-tracking algorithms run without constant operator input: the Striker holds its own intercept course, freeing the crew to focus on the engagement decision.',
    }, },
  
    { id: 'falcon',  name: 'FLYQ Falcon',  tag: 'МАСОВЕ ЗНИЖЧЕННЯ', views: 1670, price: 77774, image: 'falcon.jpg', videoSrc: 'https://assets.mixkit.co/videos/44642/44642-360.mp4',
    description: [
      'VCD Falcon — новий дрон для нового десятиліття. V-подібна дворотора рушійна система разом із фірмовою технологією нахилу ротора та нелінійним алгоритмом керування забезпечує до 50 хвилин безперервного польоту.',
      'Повільніше обертання гвинтів і фірмова геометрія лопатей дають вищу підйомну ефективність при нижчому рівні шуму — Falcon чути значно пізніше, ніж бачити.',
    ],
    extra: {
      heading: 'Бачить перешкоди наперед',
      text: 'Система візуальної інерційної одометрії у парі з фронтальною стереокамерою будує карту оточення в реальному часі, розпізнає перешкоди та коригує курс автоматично — навіть на максимальній швидкості.',
    },
    description_en: [ 'The VCD Falcon is a new drone for a new decade. A V-shaped twin-rotor propulsion system, paired with proprietary rotor-tilt technology and a nonlinear control algorithm, delivers up to 50 minutes of continuous flight.',
      'Slower propeller rotation and a proprietary blade geometry give higher lift efficiency at a lower noise level — you\'ll see the Falcon long before you hear it.',
    ], extra_en: {
      heading: 'Sees obstacles ahead',
      text: 'A visual-inertial odometry system paired with a front stereo camera maps its surroundings in real time, recognizes obstacles and adjusts course automatically — even at top speed.',
    }, },
  
    { id: 'recon',   name: 'FLYQ Recon',   tag: 'Розвідка',  views: 740,  price: 19999, image: 'recon.jpg', videoSrc: 'https://assets.mixkit.co/videos/2788/2788-360.mp4',
    description: [
      'VCD Recon — розвідувальна система повного циклу: від виявлення цілі до корекції вогню та об’єктивної оцінки результату. Два незалежні, стійкі до заглушення канали зв’язку тримають апарат на зв’язку навіть у складних погодних умовах.',
      'Денна камера зі 100-кратним зумом і сучасний тепловізор для нічних операцій дають екіпажу однаково впевнену картину о будь-якій порі доби.',
    ],
    extra: {
      heading: 'Повний цикл місії',
      text: 'Recon супроводжує підрозділ від початку розвідки до фіксації результату — без передачі завдання іншому апарату й без втрати часу на переналаштування обладнання.',
    },
    description_en: [ 'The VCD Recon is a full-cycle reconnaissance system: from target detection to fire correction and objective result assessment. Two independent, jam-resistant communication links keep the aircraft connected even in harsh weather.',
      'A daytime camera with 100x zoom and a modern thermal imager for night operations give the crew an equally confident picture at any hour.',
    ], extra_en: {
      heading: 'Full mission cycle',
      text: 'The Recon stays with the unit from the start of reconnaissance through to confirming the result — no handoff to another aircraft, and no time lost reconfiguring equipment.',
    }, },
  
    { id: 'wraith',  name: 'FLYQ Wraith',  tag: 'Атака',     views: 2110, price: 29999, image: 'wraith.jpg' , videoSrc: 'https://assets.mixkit.co/videos/581/581-360.mp4',
    description: [
      'VCD Wraith — повітряна платформа радіоелектронної розвідки, створена для пошуку джерел випромінювання там, де GPS, зв’язок і традиційні безпілотні системи перестають працювати.',
      'Wraith будує чисту спектральну теплову карту, яка показує походження сигналів, і дозволяє оператору візуально підтвердити кожну точку — швидко й без здогадок.',
    ],
    extra: {
      heading: 'Бачить те, що глушать',
      text: 'Сучасне поле бою перенасичене глушниками GPS, FPV-каналами та станціями керування чужими безпілотниками. Якщо загрозу не видно — нею не можна керувати. Wraith знаходить випромінювачі навіть під щільним придушенням і передає підрозділу дані цілевказання, потрібні для дії, а не здогадок.',
    },
    description_en: [ 'The VCD Wraith is an airborne electronic-reconnaissance platform built to locate sources of radio emissions in places where GPS, communications and conventional drone systems stop working.',
      'The Wraith builds a clean spectral heat map that shows where signals originate, letting the operator visually confirm every point — quickly, and without guesswork.',
    ], extra_en: {
      heading: 'Sees what\'s being jammed',
      text: 'Today\'s battlefield is saturated with GPS jammers, FPV links, and other drones\' control stations. If a threat can\'t be seen, it can\'t be managed. The Wraith finds emitters even under heavy jamming and hands the unit the targeting data it needs to act — not guess.',
    },},
  
  
    { id: 'talon',   name: 'FLYQ Talon',   tag: 'Швидкість', views: 1390, price: 15555, image: 'talon.jpg', videoSrc: 'https://assets.mixkit.co/videos/613/613-360.mp4',
    description: [
      'VCD Talon не розкриває всіх деталей власної конструкції — та визнає головне: цільна композитна конструкція зробила апарат майже на пів тонни легшим за попередню лінійку, а кількість деталей скоротилася вдвічі.',
      'Менша складність пришвидшила виробництво приблизно на третину. Замість суворо структурованого інженерного процесу команда Talon працювала гнучко — з простором для компромісів і швидких ітерацій.',
    ],
    extra: {
      heading: 'Легший. Простіший. Швидший.',
      text: 'Кожна деталь, яку вдалося прибрати з конструкції, — це деталь, яка не зможе відмовити в польоті. Talon будували за принципом: менше деталей, менше причин для збою.',
    },
    description_en: [ 'The VCD Talon doesn\'t reveal every detail of its own construction — but it does admit the key point: a one-piece composite build made it nearly half a ton lighter than the previous lineup, with half as many parts.',
      'Lower complexity sped up production by roughly a third. Instead of a strictly structured engineering process, the Talon team worked flexibly, with room for trade-offs and fast iteration.',
    ], extra_en: {
      heading: 'Lighter. Simpler. Faster.',
      text: 'Every part removed from the design is one less part that could fail in flight. The Talon was built on one principle: fewer parts, fewer reasons to fail.',
    }, }
];



function buildProductCard(product, rank) {
  const p = localizedProduct(product);

  const li = document.createElement('li');
  li.className = 'product-card';
  li.dataset.id = p.id;

  const rankMarkup = rank ? `<span class="product-card__rank">№${rank}</span>` : '';

  // TODO(next prompt): product.html doesn't exist yet — these links are
  // wired up ahead of time so nothing needs to change here once it does.
  li.innerHTML = `
    <a class="product-card__link" href="product.html?id=${p.id}" aria-label="${tr('viewProduct')} ${p.name}">
      <span class="product-card__frame" aria-hidden="true">
        <span class="corner corner--tl"></span>
        <span class="corner corner--tr"></span>
        <span class="corner corner--bl"></span>
        <span class="corner corner--br"></span>
      </span>
    <img 
 class="product-card__image"
 src="${p.image}"
 alt="${p.name}">
      ${rankMarkup}
      <span class="product-card__meta">
        <span class="product-card__name">${p.name}</span>
        <span class="product-card__tag">${p.tag}</span>
      </span>
    </a>
  `;
  return li;
}

function renderRail(trackId, items, { ranked = false } = {}) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const frag = document.createDocumentFragment();
  items.forEach((product, i) => frag.appendChild(buildProductCard(product, ranked ? i + 1 : null)));
  track.appendChild(frag);
}

/* =========================================================================
   Hero carousel — flip transition between slides
   ========================================================================= */
const HERO_SLIDES = [
  
   {
  id: 'why-us',
  eyebrow: 'Чому саме ми',
  eyebrow_en: 'Why us',
  text: 'Бо краще за нас ніхто не зробить.',
  text_en: 'Because no one does it better than us.',
  image: 'anlywe.jpg',
  fit: 'cover',
},
  

  {
    id: 'about',
    eyebrow: 'Про магазин',
    eyebrow_en: 'About us',
    text: 'FLYQ — ми виготовляємо знаряддя як праці, так і помсти. Вже близько "67" років на ринку дронів, які не підводять.',
    text_en: 'FLYQ — we build tools for both labor and revenge. Around "67" years on the market for drones that never let you down.',
    image: 'who.jpg',
     fit: 'cover',
  },

    {
  id: 'delivery',
  eyebrow: 'Доставка',
  eyebrow_en: 'Delivery',
  text: 'Ми забезпечуємо швидку доставку по всій Україні через надійні логістичні сервіси. Ти можеш отримати товар навіть у найвіддаленішому куточку країни.',
  text_en: 'We provide fast delivery across Ukraine through reliable logistics services. You can get your order even in the most remote corner of the country.',
  image: 'carusel2.jpg',
  fit: 'cover',
},


{
    id: 'ahaha',
    eyebrow: 'найкращий наш винахід — Falcon',
    eyebrow_en: 'our best invention — the Falcon',
    text: 'Falcon — хаахахахахахахахахаххахахахаха все розлітається воно горить всі бігають суєтятьтся а мені воно нравиться.',
    text_en: 'Falcon — hahahahahahahahahahaha everything flies apart it\'s on fire everyone\'s running around panicking and I love it.',
    image: 'falcon.jpg',
     fit: 'cover',
  },



];

function initHero() {
  const slideEl   = document.getElementById('heroSlide');
  const mediaEl   = document.getElementById('heroMedia');
  const eyebrowEl = document.getElementById('heroEyebrow');
  const textEl    = document.getElementById('heroText');
  const dotsEl    = document.getElementById('heroDots');
  const prevBtn   = document.getElementById('heroPrev');
  const nextBtn   = document.getElementById('heroNext');

  if (!slideEl || !mediaEl || !eyebrowEl || !textEl || !dotsEl || !prevBtn || !nextBtn) {
    return; // markup missing — fail quietly rather than throwing on a marketing page
  }

  let index = 0;
  let animating = false;
  let autoplayTimer = null;
  const AUTOPLAY_MS = 3000;

  dotsEl.innerHTML = HERO_SLIDES
    .map((s, i) => {
      const eyebrow = getLang() === 'en' ? (s.eyebrow_en || s.eyebrow) : s.eyebrow;
      return `<button type="button" role="tab" aria-selected="${i === 0}" aria-label="${tr('heroSlideLabel')} ${i + 1}: ${eyebrow}"></button>`;
    })
    .join('');
  const dotButtons = Array.from(dotsEl.children);

  function paint(i) {
    const s = HERO_SLIDES[i];
    const lang = getLang();
    mediaEl.style.backgroundImage = s.image ? `url(${s.image})` : 'none';
    mediaEl.classList.toggle('hero__media--cover', s.fit === 'cover');
    eyebrowEl.textContent = lang === 'en' ? (s.eyebrow_en || s.eyebrow) : s.eyebrow;
    textEl.textContent = lang === 'en' ? (s.text_en || s.text) : s.text;
    dotButtons.forEach((d, di) => d.setAttribute('aria-selected', String(di === i)));
  }

  function goTo(targetIndex) {
    if (animating || targetIndex === index) return;
    animating = true;

    if (prefersReducedMotion()) {
      index = targetIndex;
      paint(index);
      animating = false;
      return;
    }

    slideEl.setAttribute('data-anim', 'out');
    onTransitionEndOnce(slideEl, 'transform', () => {
      index = targetIndex;
      paint(index);

      slideEl.setAttribute('data-anim', 'in-start');
      void slideEl.offsetWidth; // force reflow so the next state transitions
      requestAnimationFrame(() => {
        slideEl.setAttribute('data-anim', 'in');
        onTransitionEndOnce(slideEl, 'transform', () => {
          slideEl.removeAttribute('data-anim');
          animating = false;
        });
      });
    });
  }

  function next() { goTo((index + 1) % HERO_SLIDES.length); }
  function prev() { goTo((index - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); }

  function restartAutoplay() {
    clearInterval(autoplayTimer);
    if (prefersReducedMotion()) return;
    autoplayTimer = setInterval(next, AUTOPLAY_MS);
  }

  nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });
  dotButtons.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); restartAutoplay(); }));

  const stage = slideEl.closest('.hero__stage');
  stage.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  stage.addEventListener('mouseleave', restartAutoplay);

  paint(0);
  restartAutoplay();
}

/* =========================================================================
   Product rails — native smooth scroll driven by the arrow buttons
   ========================================================================= */
function initRail(trackId) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const prevBtn = document.querySelector(`[data-rail-prev="${trackId}"]`);
  const nextBtn = document.querySelector(`[data-rail-next="${trackId}"]`);
  if (!prevBtn || !nextBtn) return;

  function step() {
    const card = track.querySelector('.product-card');
    if (!card) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function refresh() {
    const max = track.scrollWidth - track.clientWidth - 1;
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft >= max;
  }

  prevBtn.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: step(), behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', debounce(refresh, 50), { passive: true });
  window.addEventListener('resize', debounce(refresh, 150));

  

  refresh();
}

/* =========================================================================
   Header language toggle
   ========================================================================= */
function initHeaderLang() {
  const langBtns = document.querySelectorAll('.header-lang [data-lang]');
  if (!langBtns.length) return;

  const currentLang = getLang();

  langBtns.forEach((btn) => {
    const lang = btn.getAttribute('data-lang');
    if (lang === currentLang) btn.classList.add('is-active');

    btn.addEventListener('click', () => {
      if (lang === currentLang) return; // already active
      setLang(lang);
    });
  });
}

/* =========================================================================
   Mobile menu toggle
   ========================================================================= */
function initMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('siteNav');
  if (!toggle || !nav) return;

  const close = () => { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
  const open  = () => { toggle.setAttribute('aria-expanded', 'true');  nav.classList.add('is-open'); };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
}

/* =========================================================================
   Defensive fallback if logo.png doesn't resolve (e.g. moved on deploy)
   ========================================================================= */
function initLogoFallback() {
  document.querySelectorAll('img.js-logo').forEach((img) => {
    img.addEventListener('error', () => {
      const span = document.createElement('span');
      span.className = 'logo-fallback';
      span.textContent = 'VCD';
      img.replaceWith(span);
    }, { once: true });
  });
}




/* =========================================================================
   Decorative drone background — scroll parallax (drifts opposite to scroll)
   ========================================================================= */
function initDroneParallax() {
  const bg = document.querySelector('.drone-bg');
  const items = document.querySelectorAll('.drone-bg__item');
  if (!bg || !items.length) return;

  // .drone-bg is position:absolute with only position:absolute children, so it
  // never gets an intrinsic height and collapses to 0px — every item's top:%
  // then resolves against nothing. This is why the drones could stay invisible
  // even with correct images/opacity. Give it a real height explicitly.
  function sizeDroneBg() {
    bg.style.height = document.documentElement.scrollHeight + 'px';
  }
  sizeDroneBg();
  window.addEventListener('load', sizeDroneBg);
  window.addEventListener('resize', debounce(sizeDroneBg, 200));

  if (prefersReducedMotion()) return; // drones stay put, no scroll-driven motion

  let ticking = false;
  function update() {
    const y = window.scrollY;
    items.forEach((el) => {
      const depth = parseFloat(el.dataset.depth) || 0.1;
      const flip = el.dataset.flip === '1' ? ' scaleX(-1)' : '';
      el.style.transform = `translateY(${(-y * depth).toFixed(1)}px)${flip}`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update(); // set initial position
}

/* =========================================================================
   Boot
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {

  // Переклад статичної розмітки — перед усім іншим, і на всіх трьох сторінках,
  // бо цей файл підключають index.html, product.html та cart.html.
  applyStaticTranslations();

  const bestShot = [...PRODUCTS].sort((a, b) => b.views - a.views).slice(0, 6);

  renderRail('ourProductsTrack', PRODUCTS);
  renderRail('bestShotTrack', bestShot, { ranked: true });

  initHero();
  initRail('ourProductsTrack');
  initRail('bestShotTrack');
  initMenu();
  initHeaderLang();
  initLogoFallback();
  initDroneParallax();

  // Банер попередження
  initWarningBanner();

  // Вхід / реєстрація (демо)
  initAuthModal();

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

});


/* =========================================================================
   Warning banner
   ========================================================================= */
function initWarningBanner() {

  // Банер тільки на головній сторінці
  if (!window.location.pathname.endsWith("index.html") &&
      window.location.pathname !== "/" &&
      !window.location.pathname.endsWith("/")) {
    return;
  }

  const overlay = document.getElementById("warningOverlay");
  const closeBtn = document.getElementById("warningClose");
  const closeEnBtn = document.getElementById("warningCloseEn");
  const closeUaBtn = document.getElementById("warningCloseUa");

  if (!overlay || !closeBtn) return;

  // Показувати лише один раз за сесію
  if (sessionStorage.getItem("warningShown")) {
    overlay.remove();
    return;
  }

  sessionStorage.setItem("warningShown", "true");

  function closeBanner() {
    overlay.style.opacity = "0";

    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
    }, 300);
  }

  closeBtn.addEventListener("click", closeBanner);

  // Eng/UA не закривають банер назавжди — вони перемикають мову сайту і
  // (через setLang -> location.reload) показують цей самий банер знову,
  // вже перекладеним, бо sessionStorage-прапорець "warningShown" скидається.
  if (closeEnBtn) closeEnBtn.addEventListener("click", () => setLang('en'));
  if (closeUaBtn) closeUaBtn.addEventListener("click", () => setLang('ua'));

  // Автоматичне закриття через 60 секунд
  setTimeout(closeBanner, 10000);
}


/* =========================================================================
   Auth modal — демо-вхід/реєстрація (бекенду немає).
   Хедер LOGIN/SIGN UP -> модалка нікнейм+пароль -> будь-яка з кнопок
   веде до однієї й тієї відповіді -> після закриття
   банера хедер показує введений нікнейм замість кнопок.
   Стан зберігається в localStorage, тож переживає перезавантаження.
   ========================================================================= */
function initAuthModal() {
  const controls = document.getElementById('authControls');
  const overlay = document.getElementById('authOverlay');
  const errorOverlay = document.getElementById('authErrorOverlay');
  if (!controls || !overlay || !errorOverlay) return; // не index.html — вихід

  const form = document.getElementById('authForm');
  const nicknameInput = document.getElementById('authNickname');
  const passwordInput = document.getElementById('authPassword');
  const nicknameError = document.getElementById('authNicknameError');
  const passwordError = document.getElementById('authPasswordError');
  const cancelBtn = document.getElementById('authCancel');
  const errorCloseBtn = document.getElementById('authErrorClose');

  function renderControls() {
    const savedName = localStorage.getItem('vcd_nickname');
    controls.innerHTML = '';
    if (savedName) {
      const wrapper = document.createElement('div');
      wrapper.className = 'auth-user-wrapper';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'auth-user';
      nameSpan.textContent = savedName;

      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'btn btn--ghost auth-logout';
      logoutBtn.type = 'button';
      // Переклад тексту кнопки залежно від мови
      logoutBtn.textContent = getLang() === 'en' ? 'Logout' : 'Вийти';
      logoutBtn.setAttribute('data-auth', 'logout');

      wrapper.appendChild(nameSpan);
      wrapper.appendChild(logoutBtn);
      controls.appendChild(wrapper);
    } else {
      controls.innerHTML = `
        <button class="btn btn--ghost" type="button" data-auth="signup">SIGN UP</button>
        <button class="btn btn--ghost" type="button" data-auth="login">LOGIN</button>
      `;
    }
  }

  function openModal() {
    overlay.style.display = 'flex';
    nicknameInput.value = '';
    passwordInput.value = '';
    nicknameError.hidden = true;
    passwordError.hidden = true;
    nicknameInput.classList.remove('is-invalid');
    passwordInput.classList.remove('is-invalid');
    nicknameInput.focus();
  }

  function closeModal() {
    overlay.style.display = 'none';
  }

  function validate() {
    const nickname = nicknameInput.value.trim();
    const password = passwordInput.value.trim();
    let valid = true;

    nicknameError.hidden = Boolean(nickname);
    nicknameInput.classList.toggle('is-invalid', !nickname);
    if (!nickname) valid = false;

    passwordError.hidden = Boolean(password);
    passwordInput.classList.toggle('is-invalid', !password);
    if (!password) valid = false;

    return valid ? nickname : null;
  }

  // Кнопки хедера перестворюються (renderControls), тому слухач вішаємо
  // на контейнер (делегування), а не на самі кнопки.
  controls.addEventListener('click', (e) => {
    const authEl = e.target.closest('[data-auth]');
    if (!authEl) return;
    if (authEl.getAttribute('data-auth') === 'logout') {
      // Виходимо: видаляємо nickname з localStorage, оновлюємо header
      localStorage.removeItem('vcd_nickname');
      renderControls();
      return;
    }
    openModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nickname = validate();
    if (!nickname) return; // помилки вже показані інлайн, далі не йдемо

    sessionStorage.setItem('vcd_pending_nickname', nickname);
    closeModal();
    errorOverlay.style.display = 'flex';
  });

  cancelBtn.addEventListener('click', closeModal);

  errorCloseBtn.addEventListener('click', () => {
    errorOverlay.style.display = 'none';
    const pending = sessionStorage.getItem('vcd_pending_nickname');
    if (pending) {
      localStorage.setItem('vcd_nickname', pending);
      sessionStorage.removeItem('vcd_pending_nickname');
      renderControls();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (overlay.style.display === 'flex') closeModal();
    if (errorOverlay.style.display === 'flex') errorOverlay.style.display = 'none';
  });

  renderControls();
}



