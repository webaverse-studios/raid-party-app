import RoomsJSON from './rooms.json';

/**
 * Save a list of rooms to the local storage.
 */
export function saveRooms(rooms) {
  localStorage.setItem('rooms', JSON.stringify(rooms));
}

/**
 * Load a list of rooms from the local storage or default to a pre-made list.
 */
export function loadRooms() {
  let parsed = [];

  try {
    const saved = localStorage.getItem('rooms');

    // Firs time the page is loaded we return a default list
    if (!saved) {
      return RoomsJSON;
    }

    parsed = JSON.parse(saved);
  } catch (error) {
    console.warn('Error loading rooms from local storage.');
  }

  return parsed;
}
