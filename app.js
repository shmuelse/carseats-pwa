(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants and application state
  // ---------------------------------------------------------------------------

  const STORAGE_KEY = 'carsv4';
  const LEGACY_STORAGE_KEY = 'carsv3';

  const SEATS = ['front', 'mid1', 'mid2', 'mid3', 'back1', 'back2'];
  const MIDDLE_SEATS = ['mid1', 'mid2', 'mid3'];
  const BACK_SEATS = ['back1', 'back2'];

  const SEAT_NAMES = {
    front: 'קדמי',
    mid1: 'אמצע שמאל',
    mid2: 'אמצע אמצע',
    mid3: 'אמצע ימין',
    back1: 'אחורי שמאל',
    back2: 'אחורי ימין',
  };

  const GENDER_ICONS = {
    m: '👦',
    f: '👧',
  };

  let state = createEmptyState();
  let draftTrip = createEmptyDraftTrip();
  let activeSeat = null;
  let fixedSeatChildId = null;
  let deferredInstallPrompt = null;

  // ---------------------------------------------------------------------------
  // State creation and persistence
  // ---------------------------------------------------------------------------

  function createEmptyState() {
    return {
      version: 4,
      parents: ['אבא', 'אמא'],
      children: [],
      trips: [],
    };
  }

  function createEmptyDraftTrip(type = 'short', parents = []) {
    return {
      type,
      parents,
      children: [],
      seats: {},
    };
  }

  function createId() {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }

    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).slice(2);
    return `${timestamp}-${randomPart}`;
  }

  function loadState() {
    try {
      const currentData = localStorage.getItem(STORAGE_KEY);

      if (currentData) {
        state = normalizeState(JSON.parse(currentData));
        return;
      }

      const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);

      if (legacyData) {
        state = migrateLegacyState(JSON.parse(legacyData));
        saveState();
      }
    } catch (error) {
      console.error('Failed to load local data', error);
      state = createEmptyState();
      alert('הנתונים המקומיים נפגמו ולא נטענו. אפשר לייבא גיבוי מההגדרות.');
    }
  }

  function normalizeState(value) {
    const normalized = createEmptyState();

    if (!value || typeof value !== 'object') {
      return normalized;
    }

    if (Array.isArray(value.parents)) {
      normalized.parents = value.parents.slice(0, 2).map(String);
    }

    while (normalized.parents.length < 2) {
      normalized.parents.push(`הורה ${normalized.parents.length + 1}`);
    }

    if (Array.isArray(value.children)) {
      normalized.children = value.children
        .filter(Boolean)
        .map((child) => ({
          id: String(child.id || createId()),
          name: String(child.name || '').trim(),
          gender: GENDER_ICONS[child.gender] ? child.gender : 'n',
          fixedSeat: SEATS.includes(child.fixedSeat) ? child.fixedSeat : null,
        }))
        .filter((child) => child.name);
    }

    if (Array.isArray(value.trips)) {
      normalized.trips = value.trips.slice(0, 300);
    }

    return normalized;
  }

  function migrateLegacyState(legacyState) {
    const migrated = createEmptyState();
    const childIdByName = new Map();

    if (Array.isArray(legacyState.parents)) {
      migrated.parents = legacyState.parents.slice(0, 2).map(String);
    }

    migrated.children = (legacyState.children || [])
      .map((legacyChild) => {
        const child = {
          id: createId(),
          name: String(legacyChild.name || '').trim(),
          gender: GENDER_ICONS[legacyChild.gender] ? legacyChild.gender : 'n',
          fixedSeat: SEATS.includes(legacyChild.fixedSeat)
            ? legacyChild.fixedSeat
            : null,
        };

        childIdByName.set(child.name, child.id);
        return child;
      })
      .filter((child) => child.name);

    migrated.trips = (legacyState.trips || [])
      .slice(0, 300)
      .map((legacyTrip) => migrateLegacyTrip(legacyTrip, migrated, childIdByName));

    return migrated;
  }

  function migrateLegacyTrip(legacyTrip, migratedState, childIdByName) {
    const seats = {};

    Object.entries(legacyTrip.seats || {}).forEach(([seat, childName]) => {
      const childId = childIdByName.get(childName);

      if (SEATS.includes(seat) && childId) {
        seats[seat] = childId;
      }
    });

    return {
      id: String(legacyTrip.id || createId()),
      createdAt: parseLegacyDate(legacyTrip.date, legacyTrip.time),
      type: legacyTrip.type === 'long' ? 'long' : 'short',
      parentNames: (legacyTrip.parents || [])
        .map((index) => migratedState.parents[index])
        .filter(Boolean),
      children: (legacyTrip.children || [])
        .map((name) => childIdByName.get(name))
        .filter(Boolean),
      childNames: Object.fromEntries(
        migratedState.children.map((child) => [child.id, child.name]),
      ),
      seats,
    };
  }

  function parseLegacyDate(date, time) {
    const parsedDate = new Date(`${date || ''} ${time || ''}`);

    if (Number.isNaN(parsedDate.getTime())) {
      return new Date().toISOString();
    }

    return parsedDate.toISOString();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save local data', error);
      alert('השמירה נכשלה. מומלץ לייצא גיבוי ולבדוק מקום פנוי בדפדפן.');
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Child and trip helpers
  // ---------------------------------------------------------------------------

  function getChild(childId) {
    return state.children.find((child) => child.id === childId);
  }

  function getChildName(childId, historicalTrip) {
    return (
      getChild(childId)?.name ||
      historicalTrip?.childNames?.[childId] ||
      'ילד/ה שנמחק/ה'
    );
  }

  function getSeatZone(seat) {
    if (seat === 'front') {
      return 'front';
    }

    if (String(seat).startsWith('back')) {
      return 'back';
    }

    return 'mid';
  }

  function findChildSeat(trip, childId) {
    return Object.keys(trip.seats || {}).find(
      (seat) => trip.seats[seat] === childId,
    );
  }

  // ---------------------------------------------------------------------------
  // Rotation and seat-assignment engine
  // ---------------------------------------------------------------------------

  function getRotationStats(childId, tripType, targetZone) {
    const relevantTrips = state.trips.filter(
      (trip) =>
        trip.type === tripType &&
        trip.children?.includes(childId),
    );

    let count = 0;
    let tripsSinceLastTime = Number.MAX_SAFE_INTEGER;

    relevantTrips.forEach((trip, index) => {
      const childSeat = findChildSeat(trip, childId);

      if (getSeatZone(childSeat) !== targetZone) {
        return;
      }

      count += 1;

      if (tripsSinceLastTime === Number.MAX_SAFE_INTEGER) {
        tripsSinceLastTime = index;
      }
    });

    return {
      count,
      tripsSinceLastTime,
    };
  }

  function rankChildrenForZone(childIds, tripType, targetZone) {
    return [...childIds].sort((firstId, secondId) => {
      const firstStats = getRotationStats(firstId, tripType, targetZone);
      const secondStats = getRotationStats(secondId, tripType, targetZone);

      if (firstStats.count !== secondStats.count) {
        return firstStats.count - secondStats.count;
      }

      if (firstStats.tripsSinceLastTime !== secondStats.tripsSinceLastTime) {
        return secondStats.tripsSinceLastTime - firstStats.tripsSinceLastTime;
      }

      return getChildName(firstId).localeCompare(getChildName(secondId), 'he');
    });
  }

  function getAvailableCapacity() {
    const regularChildSeats = 5;
    const frontSeatAvailable = draftTrip.parents.length === 1;

    return regularChildSeats + (frontSeatAvailable ? 1 : 0);
  }

  function validateFixedSeats(selectedChildIds) {
    const occupiedFixedSeats = new Map();

    for (const childId of selectedChildIds) {
      const child = getChild(childId);

      if (!child?.fixedSeat) {
        continue;
      }

      if (occupiedFixedSeats.has(child.fixedSeat)) {
        const previousChildId = occupiedFixedSeats.get(child.fixedSeat);
        return (
          `המושב ${SEAT_NAMES[child.fixedSeat]} מוגדר גם ל` +
          `${getChildName(previousChildId)} וגם ל${child.name}.`
        );
      }

      occupiedFixedSeats.set(child.fixedSeat, childId);
    }

    if (occupiedFixedSeats.has('front') && draftTrip.parents.length !== 1) {
      return 'מושב קדמי קבוע לילד זמין רק כאשר נבחר הורה אחד בדיוק.';
    }

    return null;
  }

  function generateAssignment() {
    if (!draftTrip.children.length) {
      alert('יש לבחור לפחות ילד/ה אחד/ת.');
      return;
    }

    const capacity = getAvailableCapacity();

    if (draftTrip.children.length > capacity) {
      alert(
        `נבחרו ${draftTrip.children.length} ילדים, ` +
          `אך יש רק ${capacity} מושבים זמינים בהרכב הזה.`,
      );
      return;
    }

    const fixedSeatError = validateFixedSeats(draftTrip.children);

    if (fixedSeatError) {
      alert(fixedSeatError);
      return;
    }

    const seats = {};
    const fixedChildIds = new Set();

    placeChildrenInFixedSeats(seats, fixedChildIds);

    let remainingChildIds = draftTrip.children.filter(
      (childId) => !fixedChildIds.has(childId),
    );

    remainingChildIds = assignFrontSeat(seats, remainingChildIds);
    assignMiddleAndBackSeats(seats, remainingChildIds);

    draftTrip.seats = seats;

    const validationError = validateAssignment();

    if (validationError) {
      alert(validationError);
      return;
    }

    renderCar();
    element('setupView').hidden = true;
    element('assignmentView').hidden = false;
    element('assignmentMessage').textContent =
      'סידור המושבים מוכן. אפשר ללחוץ על מושב ולערוך ידנית.';
  }

  function placeChildrenInFixedSeats(seats, fixedChildIds) {
    draftTrip.children.forEach((childId) => {
      const child = getChild(childId);

      if (!child?.fixedSeat) {
        return;
      }

      seats[child.fixedSeat] = childId;
      fixedChildIds.add(childId);
    });
  }

  function assignFrontSeat(seats, remainingChildIds) {
    const frontSeatAvailable = draftTrip.parents.length === 1;

    if (!frontSeatAvailable || seats.front || !remainingChildIds.length) {
      return remainingChildIds;
    }

    const nextChildId = rankChildrenForZone(
      remainingChildIds,
      draftTrip.type,
      'front',
    )[0];

    seats.front = nextChildId;

    return remainingChildIds.filter((childId) => childId !== nextChildId);
  }

  function assignMiddleAndBackSeats(seats, remainingChildIds) {
    const freeMiddleSeats = MIDDLE_SEATS.filter((seat) => !seats[seat]);
    const freeBackSeats = BACK_SEATS.filter((seat) => !seats[seat]);

    const requiredBackSeats = Math.max(
      0,
      remainingChildIds.length - freeMiddleSeats.length,
    );

    const backSeatChildIds = rankChildrenForZone(
      remainingChildIds,
      draftTrip.type,
      'back',
    ).slice(0, requiredBackSeats);

    backSeatChildIds.forEach((childId, index) => {
      seats[freeBackSeats[index]] = childId;
    });

    const middleSeatChildIds = remainingChildIds.filter(
      (childId) => !backSeatChildIds.includes(childId),
    );

    middleSeatChildIds.forEach((childId, index) => {
      seats[freeMiddleSeats[index]] = childId;
    });
  }

  function validateAssignment() {
    const assignedChildIds = Object.values(draftTrip.seats);
    const selectedChildIds = new Set(draftTrip.children);

    if (assignedChildIds.length !== new Set(assignedChildIds).size) {
      return 'אותו ילד שובץ ביותר ממושב אחד.';
    }

    if (assignedChildIds.some((childId) => !selectedChildIds.has(childId))) {
      return 'קיים במושבים ילד שלא נבחר לנסיעה.';
    }

    if (assignedChildIds.length !== draftTrip.children.length) {
      return 'לא כל הילדים שובצו למושב.';
    }

    if (draftTrip.parents.length !== 1 && draftTrip.seats.front) {
      return 'המושב הקדמי אינו זמין בהרכב ההורים הנוכחי.';
    }

    for (const childId of draftTrip.children) {
      const fixedSeat = getChild(childId)?.fixedSeat;

      if (fixedSeat && draftTrip.seats[fixedSeat] !== childId) {
        return (
          `${getChildName(childId)} חייב/ת לשבת במושב הקבוע: ` +
          `${SEAT_NAMES[fixedSeat]}.`
        );
      }
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Trip saving
  // ---------------------------------------------------------------------------

  function saveTrip() {
    const validationError = validateAssignment();

    if (validationError) {
      alert(validationError);
      return;
    }

    state.trips.unshift({
      id: createId(),
      createdAt: new Date().toISOString(),
      type: draftTrip.type,
      parentNames: draftTrip.parents.map((index) => state.parents[index]),
      children: [...draftTrip.children],
      childNames: Object.fromEntries(
        draftTrip.children.map((childId) => [childId, getChildName(childId)]),
      ),
      seats: { ...draftTrip.seats },
    });

    state.trips = state.trips.slice(0, 300);
    saveState();

    draftTrip = createEmptyDraftTrip(
      draftTrip.type,
      [...draftTrip.parents],
    );

    element('assignmentView').hidden = true;
    element('setupView').hidden = false;

    renderAll();
    alert('הנסיעה נשמרה.');
  }

  // ---------------------------------------------------------------------------
  // Trip setup rendering
  // ---------------------------------------------------------------------------

  function renderTripSetup() {
    element('tripCounter').textContent = `${state.trips.length} נסיעות`;

    element('shortBtn').classList.toggle(
      'selected',
      draftTrip.type === 'short',
    );
    element('longBtn').classList.toggle(
      'selected',
      draftTrip.type === 'long',
    );

    renderParentChoices();
    renderChildChoices();
  }

  function renderParentChoices() {
    const parentButtons = state.parents.map((parentName, index) => {
      const button = createElement(
        'button',
        'choice',
        parentName || `הורה ${index + 1}`,
      );

      button.classList.toggle('selected', draftTrip.parents.includes(index));
      button.addEventListener('click', () => toggleParent(index));

      return button;
    });

    element('parentsGrid').replaceChildren(...parentButtons);
  }

  function toggleParent(index) {
    if (draftTrip.parents.includes(index)) {
      draftTrip.parents = draftTrip.parents.filter(
        (parentIndex) => parentIndex !== index,
      );
    } else {
      draftTrip.parents = [...draftTrip.parents, index];
    }

    renderTripSetup();
  }

  function renderChildChoices() {
    const childrenList = element('childrenList');

    if (!state.children.length) {
      childrenList.replaceChildren(
        createElement('div', 'empty', 'אין ילדים. יש להוסיף ילדים בהגדרות.'),
      );
      return;
    }

    const childRows = state.children.map((child) => {
      const row = createElement('div', 'row');
      const button = createElement('button', 'row-main');
      const isSelected = draftTrip.children.includes(child.id);

      button.type = 'button';
      button.append(
        createElement('span', 'avatar', GENDER_ICONS[child.gender]),
        createElement('span', '', child.name),
        createElement('span', `check ${isSelected ? 'on' : ''}`, isSelected ? '✓' : '○'),
      );

      button.addEventListener('click', () => toggleChild(child.id));
      row.append(button);

      return row;
    });

    childrenList.replaceChildren(...childRows);
  }

  function toggleChild(childId) {
    if (draftTrip.children.includes(childId)) {
      draftTrip.children = draftTrip.children.filter(
        (selectedId) => selectedId !== childId,
      );
    } else {
      draftTrip.children = [...draftTrip.children, childId];
    }

    renderTripSetup();
  }

  // ---------------------------------------------------------------------------
  // Car and manual assignment rendering
  // ---------------------------------------------------------------------------

  function renderCar() {
    document.querySelectorAll('[data-seat]').forEach((button) => {
      const seat = button.dataset.seat;
      const childId = draftTrip.seats[seat];

      button.replaceChildren();
      button.className = 'seat';

      if (!childId) {
        button.textContent = '+';
        return;
      }

      const child = getChild(childId);

      button.classList.add('occupied');

      if (child?.fixedSeat === seat) {
        button.classList.add('fixed');
      }

      button.append(
        createElement('span', '', GENDER_ICONS[child?.gender || 'n']),
        createElement('span', '', getChildName(childId)),
      );
    });
  }

  function openAssignmentDialog(seat) {
    activeSeat = seat;
    element('assignTitle').textContent = `בחר ילד/ה — ${SEAT_NAMES[seat]}`;

    const options = draftTrip.children.map((childId) =>
      createAssignmentOption(childId, seat),
    );

    element('assignOptions').replaceChildren(...options);
    element('assignDialog').showModal();
  }

  function createAssignmentOption(childId, seat) {
    const child = getChild(childId);
    const row = createElement('div', 'row');
    const button = createElement('button', 'row-main');

    button.type = 'button';
    button.append(
      createElement('span', 'avatar', GENDER_ICONS[child?.gender || 'n']),
      createElement('span', '', getChildName(childId)),
    );

    button.addEventListener('click', () => assignChildToSeat(childId, seat));
    row.append(button);

    return row;
  }

  function assignChildToSeat(childId, seat) {
    const child = getChild(childId);

    if (child?.fixedSeat && child.fixedSeat !== seat) {
      alert(`${child.name} מוגדר/ת למושב קבוע: ${SEAT_NAMES[child.fixedSeat]}.`);
      return;
    }

    const fixedSeatOwner = state.children.find(
      (candidate) =>
        candidate.fixedSeat === seat &&
        draftTrip.children.includes(candidate.id),
    );

    if (fixedSeatOwner && fixedSeatOwner.id !== childId) {
      alert(`המושב שמור ל${fixedSeatOwner.name}.`);
      return;
    }

    Object.keys(draftTrip.seats).forEach((existingSeat) => {
      if (draftTrip.seats[existingSeat] === childId) {
        delete draftTrip.seats[existingSeat];
      }
    });

    draftTrip.seats[seat] = childId;
    element('assignDialog').close();
    renderCar();
  }

  function clearActiveSeat() {
    const childId = draftTrip.seats[activeSeat];

    if (childId && getChild(childId)?.fixedSeat === activeSeat) {
      alert('אי אפשר להסיר ילד מהמושב הקבוע שלו.');
      return;
    }

    delete draftTrip.seats[activeSeat];
    element('assignDialog').close();
    renderCar();
  }

  // ---------------------------------------------------------------------------
  // Queue and history rendering
  // ---------------------------------------------------------------------------

  function renderQueues() {
    ['front', 'back'].forEach((targetZone) => {
      ['short', 'long'].forEach((tripType) => {
        renderQueue(targetZone, tripType);
      });
    });
  }

  function renderQueue(targetZone, tripType) {
    const container = element(`q-${targetZone}-${tripType}`);
    const eligibleChildIds = state.children
      .filter((child) => !child.fixedSeat)
      .map((child) => child.id);

    if (!eligibleChildIds.length) {
      container.replaceChildren(
        createElement('div', 'empty', 'אין ילדים בתורנות.'),
      );
      return;
    }

    const rankedChildIds = rankChildrenForZone(
      eligibleChildIds,
      tripType,
      targetZone,
    );

    const rows = rankedChildIds.map((childId, index) => {
      const child = getChild(childId);
      const childStats = getRotationStats(childId, tripType, targetZone);
      const row = createElement('div', 'row');

      row.append(
        createElement('span', 'queue-rank', String(index + 1)),
        createElement('span', 'avatar', GENDER_ICONS[child?.gender || 'n']),
        createElement(
          'span',
          '',
          `${getChildName(childId)} · ${childStats.count} פעמים`,
        ),
      );

      return row;
    });

    container.replaceChildren(...rows);
  }

  function renderHistory() {
    const tripsWithChildInFront = state.trips.filter(
      (trip) => trip.seats?.front,
    ).length;

    element('stats').replaceChildren(
      createStatCard('סה״כ נסיעות', state.trips.length),
      createStatCard('עם ילד בקדמי', tripsWithChildInFront),
    );

    const historyList = element('historyList');

    if (!state.trips.length) {
      historyList.replaceChildren(
        createElement('div', 'empty', 'אין נסיעות עדיין.'),
      );
      return;
    }

    const rows = state.trips.slice(0, 30).map(createHistoryRow);
    historyList.replaceChildren(...rows);
  }

  function createHistoryRow(trip) {
    const row = createElement('div', 'row');
    const date = new Date(trip.createdAt);
    const childrenNames = (trip.children || [])
      .map((childId) => getChildName(childId, trip))
      .join(', ');

    const frontSeatText = trip.seats?.front
      ? ` · קדמי: ${getChildName(trip.seats.front, trip)}`
      : '';

    row.append(
      createElement('div', '', date.toLocaleDateString('he-IL')),
      createElement('div', '', `${childrenNames || '—'}${frontSeatText}`),
      createElement('div', 'hint', trip.type === 'long' ? 'ארוכה' : 'קצרה'),
    );

    return row;
  }

  function createStatCard(label, value) {
    const card = createElement('div', 'stat');
    card.append(
      createElement('span', '', label),
      createElement('strong', '', String(value)),
    );
    return card;
  }

  // ---------------------------------------------------------------------------
  // Settings and child management
  // ---------------------------------------------------------------------------

  function renderSettings() {
    element('parent0').value = state.parents[0] || '';
    element('parent1').value = state.parents[1] || '';

    const settingsList = element('childrenSettings');

    if (!state.children.length) {
      settingsList.replaceChildren(
        createElement('div', 'empty', 'אין ילדים עדיין.'),
      );
      return;
    }

    settingsList.replaceChildren(
      ...state.children.map(createChildSettingsRow),
    );
  }

  function createChildSettingsRow(child) {
    const row = createElement('div', 'row');
    const details = createElement('div');

    details.append(
      createElement('strong', '', `${GENDER_ICONS[child.gender]} ${child.name}`),
    );

    if (child.fixedSeat) {
      details.append(
        createElement('div', 'fixed-label', `📌 ${SEAT_NAMES[child.fixedSeat]}`),
      );
    }

    const renameButton = createElement('button', 'small-btn', 'ערוך');
    const fixedSeatButton = createElement('button', 'small-btn', 'מושב קבוע');
    const deleteButton = createElement('button', 'small-btn', 'מחק');

    renameButton.addEventListener('click', () => renameChild(child.id));
    fixedSeatButton.addEventListener('click', () => openFixedSeatDialog(child.id));
    deleteButton.addEventListener('click', () => deleteChild(child.id));

    row.append(details, renameButton, fixedSeatButton, deleteButton);
    return row;
  }

  function renameChild(childId) {
    const child = getChild(childId);
    const value = prompt('שם חדש:', child.name);

    if (value === null) {
      return;
    }

    const newName = value.trim();

    if (!newName) {
      alert('השם אינו יכול להיות ריק.');
      return;
    }

    if (isDuplicateChildName(newName, childId)) {
      alert('כבר קיים ילד בשם הזה.');
      return;
    }

    child.name = newName;
    saveState();
    renderAll();
  }

  function deleteChild(childId) {
    const child = getChild(childId);

    if (!confirm(`למחוק את ${child.name}? ההיסטוריה הישנה תישמר.`)) {
      return;
    }

    state.children = state.children.filter(
      (candidate) => candidate.id !== childId,
    );

    draftTrip.children = draftTrip.children.filter(
      (selectedId) => selectedId !== childId,
    );

    Object.keys(draftTrip.seats).forEach((seat) => {
      if (draftTrip.seats[seat] === childId) {
        delete draftTrip.seats[seat];
      }
    });

    saveState();
    renderAll();
  }

  function addChild() {
    const nameInput = element('newChildName');
    const name = nameInput.value.trim();

    if (!name) {
      alert('יש להזין שם.');
      return;
    }

    if (isDuplicateChildName(name)) {
      alert('כבר קיים ילד בשם הזה.');
      return;
    }

    state.children.push({
      id: createId(),
      name,
      gender: element('newChildGender').value,
      fixedSeat: null,
    });

    nameInput.value = '';
    saveState();
    renderAll();
  }

  function isDuplicateChildName(name, excludedChildId = null) {
    const normalizedName = name.toLocaleLowerCase('he');

    return state.children.some(
      (child) =>
        child.id !== excludedChildId &&
        child.name.toLocaleLowerCase('he') === normalizedName,
    );
  }

  function openFixedSeatDialog(childId) {
    fixedSeatChildId = childId;

    const child = getChild(childId);
    element('fixedTitle').textContent = `מושב קבוע — ${child.name}`;

    const buttons = SEATS.map((seat) =>
      createFixedSeatButton(child, seat),
    );

    element('fixedOptions').replaceChildren(...buttons);
    element('fixedDialog').showModal();
  }

  function createFixedSeatButton(child, seat) {
    const existingOwner = state.children.find(
      (candidate) =>
        candidate.id !== child.id &&
        candidate.fixedSeat === seat,
    );

    const label = existingOwner
      ? `${SEAT_NAMES[seat]} — תפוס`
      : SEAT_NAMES[seat];

    const button = createElement('button', 'choice', label);
    button.type = 'button';
    button.disabled = Boolean(existingOwner);
    button.classList.toggle('selected', child.fixedSeat === seat);

    button.addEventListener('click', () => {
      child.fixedSeat = seat;
      saveState();
      element('fixedDialog').close();
      renderAll();
    });

    return button;
  }

  function removeFixedSeat() {
    const child = getChild(fixedSeatChildId);

    if (!child) {
      return;
    }

    child.fixedSeat = null;
    saveState();
    element('fixedDialog').close();
    renderAll();
  }

  // ---------------------------------------------------------------------------
  // Backup and restore
  // ---------------------------------------------------------------------------

  function exportBackup() {
    const backup = JSON.stringify(state, null, 2);
    const blob = new Blob([backup], { type: 'application/json' });
    const downloadLink = document.createElement('a');

    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `carseats-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
  }

  async function importBackup(file) {
    try {
      const fileContents = await file.text();
      const importedState = normalizeState(JSON.parse(fileContents));

      const approved = confirm(
        `לייבא ${importedState.children.length} ילדים ו-` +
          `${importedState.trips.length} נסיעות? הנתונים הנוכחיים יוחלפו.`,
      );

      if (!approved) {
        return;
      }

      state = importedState;
      draftTrip = createEmptyDraftTrip();
      saveState();
      renderAll();
    } catch (error) {
      console.error('Failed to import backup', error);
      alert('קובץ הגיבוי אינו תקין.');
    } finally {
      element('importInput').value = '';
    }
  }

  // ---------------------------------------------------------------------------
  // Navigation and application rendering
  // ---------------------------------------------------------------------------

  function showTab(tabName) {
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.hidden = tab.id !== `tab-${tabName}`;
    });

    document.querySelectorAll('.nav-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === tabName);
    });

    if (tabName === 'queue') {
      renderQueues();
    }

    if (tabName === 'history') {
      renderHistory();
    }

    if (tabName === 'settings') {
      renderSettings();
    }
  }

  function renderAll() {
    renderTripSetup();
    renderQueues();
    renderHistory();
    renderSettings();
  }

  // ---------------------------------------------------------------------------
  // DOM utilities and event binding
  // ---------------------------------------------------------------------------

  function element(id) {
    return document.getElementById(id);
  }

  function createElement(tag, className = '', text) {
    const node = document.createElement(tag);

    if (className) {
      node.className = className;
    }

    if (text !== undefined) {
      node.textContent = text;
    }

    return node;
  }

  function bindEvents() {
    bindNavigationEvents();
    bindTripEvents();
    bindSettingsEvents();
    bindBackupEvents();
    bindInstallEvent();
  }

  function bindNavigationEvents() {
    document.querySelectorAll('.nav-btn').forEach((button) => {
      button.addEventListener('click', () => showTab(button.dataset.tab));
    });
  }

  function bindTripEvents() {
    document.querySelectorAll('[data-trip-type]').forEach((button) => {
      button.addEventListener('click', () => {
        draftTrip.type = button.dataset.tripType;
        renderTripSetup();
      });
    });

    document.querySelectorAll('[data-seat]').forEach((button) => {
      button.addEventListener('click', () =>
        openAssignmentDialog(button.dataset.seat),
      );
    });

    element('generateBtn').addEventListener('click', generateAssignment);
    element('saveTripBtn').addEventListener('click', saveTrip);
    element('clearSeatBtn').addEventListener('click', clearActiveSeat);

    element('editTripBtn').addEventListener('click', () => {
      element('assignmentView').hidden = true;
      element('setupView').hidden = false;
    });
  }

  function bindSettingsEvents() {
    element('parent0').addEventListener('change', (event) => {
      updateParentName(0, event.target.value);
    });

    element('parent1').addEventListener('change', (event) => {
      updateParentName(1, event.target.value);
    });

    element('addChildBtn').addEventListener('click', addChild);
    element('removeFixedBtn').addEventListener('click', removeFixedSeat);

    element('newChildName').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        addChild();
      }
    });

    element('clearHistoryBtn').addEventListener('click', clearHistory);
  }

  function updateParentName(index, value) {
    state.parents[index] = value.trim() || `הורה ${index + 1}`;
    saveState();
    renderAll();
  }

  function clearHistory() {
    if (!confirm('למחוק את כל היסטוריית הנסיעות?')) {
      return;
    }

    state.trips = [];
    saveState();
    renderAll();
  }

  function bindBackupEvents() {
    element('exportBtn').addEventListener('click', exportBackup);

    element('importInput').addEventListener('change', (event) => {
      const [file] = event.target.files;

      if (file) {
        importBackup(file);
      }
    });
  }

  function bindInstallEvent() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;

      const installButton = createElement(
        'button',
        'primary',
        'התקן כאפליקציה',
      );

      installButton.addEventListener('click', installApplication);
      element('installBanner').replaceChildren(installButton);
    });
  }

  async function installApplication() {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;

    deferredInstallPrompt = null;
    element('installBanner').replaceChildren();
  }

  // ---------------------------------------------------------------------------
  // Application startup
  // ---------------------------------------------------------------------------

  loadState();
  bindEvents();
  renderAll();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js')
      .catch((error) => console.error('Service worker registration failed', error));
  }
})();
