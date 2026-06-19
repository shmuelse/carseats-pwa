(() => {
  'use strict';

  const MAIN_STORAGE_KEY = 'carsv4';
  const SMALL_CAR_STORAGE_KEY = 'carsv4-small-car';

  const GENDER_ICONS = {
    m: '👦',
    f: '👧',
    n: '🧒',
  };

  let children = [];
  let trips = [];
  let selectedChildIds = [];
  let parentCount = 1;
  let currentAssignment = null;

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
    } catch (error) {
      console.error('Failed to load five-seat data', error);
      children = [];
      trips = [];
    }
  }

  function saveData() {
    localStorage.setItem(
      SMALL_CAR_STORAGE_KEY,
      JSON.stringify({ version: 2, trips: trips.slice(0, 300) }),
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

  function generateAssignment() {
    if (!selectedChildIds.length) {
      alert('יש לבחור לפחות ילד/ה אחד/ת.');
      return;
    }

    if (parentCount === 1) {
      const ranked = rankForFront(selectedChildIds);
      const front = ranked[0];
      const back = selectedChildIds.filter((id) => id !== front);

      currentAssignment = { parentCount, front, back };
    } else {
      currentAssignment = {
        parentCount,
        front: null,
        back: [...selectedChildIds],
      };
    }

    renderAssignment();
  }

  function renderAssignment() {
    const { front, back } = currentAssignment;

    element('smallFrontSeat').textContent =
      parentCount === 1 ? childName(front) : 'הורה נוסף';
    element('smallBack1').textContent = back[0] ? childName(back[0]) : 'פנוי';
    element('smallBack2').textContent = back[1] ? childName(back[1]) : 'פנוי';
    element('smallBack3').textContent = back[2] ? childName(back[2]) : 'פנוי';
    element('smallMessage').textContent =
      parentCount === 1
        ? `${childName(front)} הבא/ה בתור למושב הקדמי.`
        : 'שני ההורים נוסעים, ולכן כל הילדים יושבים מאחור.';
    element('smallResult').hidden = false;
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
    });

    saveData();
    selectedChildIds = [];
    currentAssignment = null;
    element('smallResult').hidden = true;
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
        row.append(
          createElement('span', 'queue-rank', String(index + 1)),
          createElement('span', 'avatar', GENDER_ICONS[childById(childId)?.gender] || '🧒'),
          createElement('span', '', `${childName(childId)} · ${stats.count} פעמים מקדימה`),
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
    renderQueue();
    renderHistory();
  }

  element('oneParentBtn').addEventListener('click', () => setParentCount(1));
  element('twoParentsBtn').addEventListener('click', () => setParentCount(2));
  element('smallGenerateBtn').addEventListener('click', generateAssignment);
  element('smallSaveBtn').addEventListener('click', saveTrip);
  element('smallEditBtn').addEventListener('click', () => {
    element('smallResult').hidden = true;
  });

  loadData();
  setParentCount(1);
  renderAll();
})();
