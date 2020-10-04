
let counts = {"🍎": 0, "🌳": 0};
const changers = {"🍎": {}, "🌳": {"🍎": 1}};
const costs = {"🍎": {}, "🌳": {"🍎": 10}};

const magnitudes = ['', 'K', 'G', 'P'];

const human = n => {
  let i = 0;
  while (n > 1e3) {
    n = (n / 1e3) | 0;
    i++;
  }
  return n + magnitudes[i];
}

const resourceForElement = el => {
  do {
    const resource = el.dataset.resource;
    if (resource) {
      return resource;
    }
    el = el.parentElement;
  } while (el != null);
};

const funded = resource => Object.entries(costs[resource])
  .every(([resource, amount]) => counts[resource] > amount);

const updaters = [];

const makeIncrementerUpdater = (resource, el) => {
  return () => {
    el.disabled = !funded(resource);
  };
};

const hookupIncrementer = el => {
  const product = resourceForElement(el);
  el.addEventListener('click', () => {
    if (funded(product)) {
      for (const [resource, amount] of Object.entries(costs[product])) {
        counts[resource] -= amount;
      }
      counts[product]++;
      draw();
    }
  });
  updaters.push(makeIncrementerUpdater(product, el));
};

for (const el of document.querySelectorAll(".incrementer")) {
  hookupIncrementer(el);
}

const makeCounterUpdater = el => {
  const resource = resourceForElement(el);
  return () => {
    el.innerText = human(counts[resource]);
  };
};

for (const el of document.querySelectorAll(".counter")) {
  updaters.push(makeCounterUpdater(el));
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const draw = () => {
  for (const update of updaters) {
    update();
  }
};

const tick = () => {
  for (const [ producer, rules ] of Object.entries(changers)) {
    for (const [ product, amount ] of Object.entries(rules)) {
      counts[product] += amount * counts[producer];
    }
  }
};

const main = async () => {
  for (;;) {
    tick();
    draw()
    await delay(1000);
  }
};

main();
