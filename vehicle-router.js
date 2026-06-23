(() => {
  'use strict';

  const LAST_VEHICLE_KEY = 'carseats-last-vehicle';
  const VEHICLE_PATHS = {
    seven: 'index.html',
    five: 'five-seat.html',
  };

  const currentPage = window.location.pathname.split('/').pop() || 'home.html';
  const searchParams = new URLSearchParams(window.location.search);

  if (currentPage === 'index.html') {
    localStorage.setItem(LAST_VEHICLE_KEY, 'seven');
    return;
  }

  if (currentPage === 'five-seat.html') {
    localStorage.setItem(LAST_VEHICLE_KEY, 'five');
    return;
  }

  if (currentPage !== 'home.html' && currentPage !== '') {
    return;
  }

  if (searchParams.has('choose')) {
    return;
  }

  const lastVehicle = localStorage.getItem(LAST_VEHICLE_KEY);
  const targetPath = VEHICLE_PATHS[lastVehicle];

  if (targetPath) {
    window.location.replace(targetPath);
  }
})();
