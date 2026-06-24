(() => {
  'use strict';

  const MAIN_STORAGE_KEY = 'carsv4';
  const SMALL_CAR_STORAGE_KEY = 'carsv4-small-car';

  const SMALL_SEATS = ['front', 'back1', 'back2', 'back3'];
  const BACK_SEATS = ['back1', 'back2', 'back3'];

  const SMALL_SEAT_NAMES = {
    front: 'קדמי ליד הנהג',
    back1: 'אחורי שמאל',
    back2: 'אחורי אמצע',
    back3: 'אחורי ימין',
  };

  const GENDER_ICONS = {
    m: '👦',
    f: '👧',
  };

  let children = [];
  let trips = [];
  let fixedSeats = {};
  let selectedChildIds = [];
  let parentCount = 1;
  let currentAssignment = null;
  let fixedSeatChildId = null;

  function element(id) {
    return document.getElementById(id);
  }

  function createElement(tag, className = '', text = '') {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  }

  function loadData() {
    try {
      const mainState = JSON.parse(localStorage.getItem(MAIN_STORAGE_KEY) || '{}');
      children = Array.isArray(mainState.children) ? mainState.children : [];

      const smallCarState = JSON.parse(
        localStorage.getItem(SMALL_CAR_STORAGE_KEY) || '{}',
      );

      trips = Array.isArray(smallCarState.trips) ? smallCarState.trips : [];
      fixedSeats = normalizeFixedSeats(smallCarState.fixedSeats || {});
    } catch (error) {
      console.error('Failed to load five-seat data', error);
      children = [];
      trips = [];
      fixedSeats = {};
    }
  }

  function normalizeFixedSeats(value) {
    const childIds = new Set(children.map((child) => child.id));
    const normalized = {};

    Object.entries(value).forEach(([childId, seat]) => {
      if (childIds.has(childId) && SMALL_SEATS.includes(seat)) {
        normalized[childId] = seat;
      }
    });

    return normalized;
  }

  function saveData() {
    localStorage.setItem(
      SMALL_CAR_STORAGE_KEY,
      JSON.stringify({
        version: 3,
        trips: trips.slice(0, 300),
        fixedSeats,
      }),
    );
  }

  function childById(childId) {
    return children.find((child) => child.id === childId);
  }

  function childName(childId, trip) {
    return childById(childId)?.name || trip?.childNames?.[childId] || 'ילד/ה שנמחק/ה';
  }

  function getFrontStats(childId) {
    const relevantTrips = trips.filter(
      (trip) =>
        trip.parentCount === 1 &&
        trip.children.includes(childId),
    );

    const count = relevantTrips.filter((trip) => trip.front === childId).length;
    const tripsSinceLastFront = relevantTrips.findIndex(
      (trip) => trip.front === childId,
    );

    return {
      count,
      tripsSinceLastFront:
        tripsSinceLastFront === -1
          ? Number.MAX_SAFE_INTEGER
          : tripsSinceLastFront,
    };
  }

  function rankForFront(childIds) {
    return [...childIds].sort((firstId, secondId) => {
      const first = getFrontStats(firstId);
      const second = getFrontStats(secondId);

      if (first.count !== second.count) {
        return first.count - second.count;
      }

      if (first.tripsSinceLastFront !== second.tripsSinceLastFront) {
        return second.tripsSinceLastFront - first.tripsSinceLastFront;
      }

      return childName(firstId).localeCompare(childName(secondId), 'he');
    });
  }

  function getCapacity() {
    return parentCount === 1 ? 4 : 3;
  }

  function setParentCount(count) {
    parentCount = count;
    currentAssignment = null;

    const capacity = getCapacity();

    if (selectedChildIds.length > capacity) {
      selectedChildIds = selectedChildIds.slice(0, capacity);
    }

    element('oneParentBtn').classList.toggle('selected', parentCount === 1);
    element('twoParentsBtn').classList.toggle('selected', parentCount === 2);
    element('smallCapacityHint').textContent =
      parentCount === 1
        ? 'עם הורה אחד יש מקום לעד ארבעה ילדים, ואחד מהם יושב מקדימה.'
        : 'עם שני הורים יש מקום לעד שלושה ילדים, וכולם יושבים מאחור.';

    element('smallResult').hidden = true;
    renderChildren();
  }

  function renderChildren() {
    const list = element('smallChildrenList');

    if (!children.length) {
      list.replaceChildren(
        createElement(
          'div',
          'empty',
          'אין ילדים. יש להוסיף אותם תחילה במסך הרכב המשפחתי.',
        ),
      );
      return;
    }

    list.replaceChildren(
      ...children.map((child) => {
        const row = createElement('div', 'row');
        const button = createElement('button', 'row-main');
        const selected = selectedChildIds.includes(child.id);

        button.type = 'button';
        button.append(
          createElement('span', 'avatar', GENDER_ICONS[child.gender] || '🧒'),
          createElement('span', '', child.name),
          createElement('span', `check ${selected ? 'on' : ''}`, selected ? '✓' : '○'),
        );

        button.addEventListener('click', () => toggleChild(child.id));
        row.append(button);
        return row;
      }),
    );
  }

  function renderFixedSeatSettings() {
    const container = element('smallFixedSeats');

    if (!children.length) {
      container.replaceChildren(
        createElement('div', 'empty', 'אין ילדים שאפשר להגדיר להם מקום קבוע.'),
      );
      return;
    }

    container.replaceChildren(
      ...children.map(createFixedSeatSettingsRow),
    );
  }

  function createFixedSeatSettingsRow(child) {
    const row = createElement('div', 'row');
    const details = createElement('div');

    details.append(
      createElement('strong', '', `${GENDER_ICONS[child.gender] || '🧒'} ${child.name}`),
    );

    if (fixedSeats[child.id]) {
      details.append(
        createElement('div', 'fixed-label', `📌 ${SMALL_SEAT_NAMES[fixedSeats[child.id]]}`),
      );
    }

    const fixedSeatButton = createElement('button', 'small-btn', 'מושב קבוע');
    fixedSeatButton.addEventListener('click', () => openSmallFixedSeatDialog(child.id));

    row.append(details, fixedSeatButton);
    return row;
  }

  function openSmallFixedSeatDialog(childId) {
    fixedSeatChildId = childId;

    const child = childById(childId);
    element('smallFixedTitle').textContent = `מושב קבוע — ${child.name}`;

    const buttons = SMALL_SEATS.map((seat) =>
      createSmallFixedSeatButton(child, seat),
    );

    element('smallFixedOptions').replaceChildren(...buttons);
    element('smallFixedDialog').showModal();
  }

  function createSmallFixedSeatButton(child, seat) {
    const existingOwner = children.find(
      (candidate) =>
        candidate.id !== child.id &&
        fixedSeats[candidate.id] === seat,
    );

    const label = existingOwner
      ? `${SMALL_SEAT_NAMES[seat]} — תפוס`
      : SMALL_SEAT_NAMES[seat];

    const button = createElement('button', 'choice', label);
    button.type = 'button';
    button.disabled = Boolean(existingOwner);
    button.classList.toggle('selected', fixedSeats[child.id] === seat);

    button.addEventListener('click', () => {
      fixedSeats[child.id] = seat;
      saveData();
      element('smallFixedDialog').close();
      currentAssignment = null;
      element('smallResult').hidden = true;
      renderAll();
    });

    return button;
  }

  function removeSmallFixedSeat() {
    if (!fixedSeatChildId) {
      return;
    }

    delete fixedSeats[fixedSeatChildId];
    saveData();
    element('smallFixedDialog').close();
    currentAssignment = null;
    element('smallResult').hidden = true;
    renderAll();
  }

  function toggleChild(childId) {
    if (selectedChildIds.includes(childId)) {
      selectedChildIds = selectedChildIds.filter((id) => id !== childId);
    } else {
      const capacity = getCapacity();

      if (selectedChildIds.length === capacity) {
        alert(
          parentCount === 1
            ? 'עם הורה אחד אפשר לבחור עד ארבעה ילדים.'
            : 'עם שני הורים אפשר לבחור עד שלושה ילדים.',
        );
        return;
      }

      selectedChildIds = [...selectedChildIds, childId];
    }

    currentAssignment = null;
    element('smallResult').hidden = true;
    renderChildren();
  }

  function validateFixedSeatsForSelection() {
    const occupiedSeats = new Map();

    for (const childId of selectedChildIds) {
      const fixedSeat = fixedSeats[childId];

      if (!fixedSeat) {
        continue;
      }

      if (parentCount === 2 && fixedSeat === 'front') {
        return (
          `${childName(childId)} מוגדר/ת קבוע במושב הקדמי, ` +
          'אבל בנסיעה עם שני הורים המושב הקדמי תפוס על ידי הורה נוסף.'
        );
      }

      if (occupiedSeats.has(fixedSeat)) {
        return (
          `המושב ${SMALL_SEAT_NAMES[fixedSeat]} מוגדר גם ל` +
          `${childName(occupiedSeats.get(fixedSeat))} וגם ל${childName(childId)}.`
        );
      }

      occupiedSeats.set(fixedSeat, childId);
    }

    return null;
  }

  function generateAssignment() {
    if (!selectedChildIds.length) {
      alert('יש לבחור לפחות ילד/ה אחד/ת.');
      return;
    }

    const fixedSeatError = validateFixedSeatsForSelection();

    if (fixedSeatError) {
      alert(fixedSeatError);
      return;
    }

    const seats = {};
    const fixedChildIds = new Set();

    placeFixedChildren(seats, fixedChildIds);

    let remainingChildIds = selectedChildIds.filter(
      (childId) => !fixedChildIds.has(childId),
    );

    if (parentCount === 1 && !seats.front && remainingChildIds.length) {
      const frontChildId = rankForFront(remainingChildIds)[0];
      seats.front = frontChildId;
      remainingChildIds = remainingChildIds.filter((id) => id !== frontChildId);
    }

    assignBackSeats(seats, remainingChildIds);

    currentAssignment = {
      parentCount,
      front: parentCount === 1 ? seats.front || null : null,
      back: BACK_SEATS.map((seat) => seats[seat]).filter(Boolean),
      seats,
    };

    renderAssignment();
  }

  function placeFixedChildren(seats, fixedChildIds) {
    selectedChildIds.forEach((childId) => {
      const fixedSeat = fixedSeats[childId];

      if (!fixedSeat) {
        return;
      }

      if (parentCount === 2 && fixedSeat === 'front') {
        return;
      }

      seats[fixedSeat] = childId;
      fixedChildIds.add(childId);
    });
  }

  function assignBackSeats(seats, childIds) {
    const freeBackSeats = BACK_SEATS.filter((seat) => !seats[seat]);

    childIds.forEach((childId, index) => {
      const seat = freeBackSeats[index];

      if (seat) {
        seats[seat] = childId;
      }
    });
  }

  function renderAssignment() {
    const { front, seats } = currentAssignment;

    element('smallFrontSeat').textContent =
      parentCount === 1 && front ? childName(front) : 'הורה נוסף';
    element('smallFrontSeat').classList.toggle('fixed', fixedSeats[front] === 'front');
    element('smallBack1').textContent = seats.back1 ? childName(seats.back1) : 'פנוי';
    element('smallBack2').textContent = seats.back2 ? childName(seats.back2) : 'פנוי';
    element('smallBack3').textContent = seats.back3 ? childName(seats.back3) : 'פנוי';
    element('smallBack1').classList.toggle('fixed', fixedSeats[seats.back1] === 'back1');
    element('smallBack2').classList.toggle('fixed', fixedSeats[seats.back2] === 'back2');
    element('smallBack3').classList.toggle('fixed', fixedSeats[seats.back3] === 'back3');
    element('smallMessage').textContent = buildAssignmentMessage();
    element('smallResult').hidden = false;
  }

  function buildAssignmentMessage() {
    if (parentCount === 2) {
      return 'שני ההורים נוסעים, ולכן כל הילדים יושבים מאחור.';
    }

    const frontChildId = currentAssignment.front;

    if (frontChildId && fixedSeats[frontChildId] === 'front') {
      return `${childName(frontChildId)} יושב/ת במושב הקדמי הקבוע.`;
    }

    return `${childName(frontChildId)} הבא/ה בתור למושב הקדמי.`;
  }

  function saveTrip() {
    if (!currentAssignment) {
      return;
    }

    trips.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
      parentCount,
      children: [...selectedChildIds],
      childNames: Object.fromEntries(
        selectedChildIds.map((id) => [id, childName(id)]),
      ),
      front: currentAssignment.front,
      back: [...currentAssignment.back],
      seats: { ...currentAssignment.seats },
    });

    saveData();
    selectedChildIds = [];
    currentAssignment = null;
    element('smallResult').hidden = true;
    showSmallTab('history');
    renderAll();
    alert('הנסיעה נשמרה.');
  }

  function renderQueue() {
    const queue = element('smallQueue');

    if (!children.length) {
      queue.replaceChildren(createElement('div', 'empty', 'אין ילדים בתורנות.'));
      return;
    }

    queue.replaceChildren(
      ...rankForFront(children.map((child) => child.id)).map((childId, index) => {
        const stats = getFrontStats(childId);
        const row = createElement('div', 'row');
        const fixedSeatText = fixedSeats[childId]
          ? ` · קבוע: ${SMALL_SEAT_NAMES[fixedSeats[childId]]}`
          : '';

        row.append(
          createElement('span', 'queue-rank', String(index + 1)),
          createElement('span', 'avatar', GENDER_ICONS[childById(childId)?.gender] || '🧒'),
          createElement(
            'span',
            '',
            `${childName(childId)} · ${stats.count} פעמים מקדימה${fixedSeatText}`,
          ),
        );
        return row;
      }),
    );
  }

  function renderHistory() {
    element('smallTripCounter').textContent = `${trips.length} נסיעות`;
    const history = element('smallHistory');

    if (!trips.length) {
      history.replaceChildren(createElement('div', 'empty', 'אין נסיעות עדיין.'));
      return;
    }

    history.replaceChildren(
      ...trips.slice(0, 20).map((trip) => {
        const row = createElement('div', 'row');
        const frontText =
          trip.parentCount === 2 || !trip.front
            ? 'קדמי: הורה נוסף'
            : `קדמי: ${childName(trip.front, trip)}`;

        row.append(
          createElement('span', '', new Date(trip.createdAt).toLocaleDateString('he-IL')),
          createElement('span', '', frontText),
        );
        return row;
      }),
    );
  }

  function renderAll() {
    renderChildren();
    renderFixedSeatSettings();
    renderQueue();
    renderHistory();
  }

  function setupSmallTabs() {
    document.querySelectorAll('[data-small-tab]').forEach((button) => {
      button.addEventListener('click', () => showSmallTab(button.dataset.smallTab));
    });
  }

  function showSmallTab(tabName) {
    document.querySelectorAll('[data-small-tab]').forEach((button) => {
      button.classList.toggle('active', button.dataset.smallTab === tabName);
    });

    document.querySelectorAll('[id^="small-tab-"]').forEach((section) => {
      section.hidden = section.id !== `small-tab-${tabName}`;
    });
  }

  element('oneParentBtn').addEventListener('click', () => setParentCount(1));
  element('twoParentsBtn').addEventListener('click', () => setParentCount(2));
  element('smallGenerateBtn').addEventListener('click', generateAssignment);
  element('smallSaveBtn').addEventListener('click', saveTrip);
  element('smallEditBtn').addEventListener('click', () => {
    element('smallResult').hidden = true;
  });
  element('smallRemoveFixedBtn').addEventListener('click', removeSmallFixedSeat);

  loadData();
  setupSmallTabs();
  setParentCount(1);
  renderAll();
})();
