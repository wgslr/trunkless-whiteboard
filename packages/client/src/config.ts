/** After this time we stop looking for response among incoming messages */
export const SERVER_RESPONSE_TIMEOUT = 10_000;

const is_localhost = () => {
  const hostname = window.location.hostname;
  return hostname === '127.0.0.1' || hostname === 'localhost';
};

const get_ws_url = () => {
  if (is_localhost()) {
    return 'ws://127.0.0.1:3001/ws';
  } else {
    return 'wss://trunkless-whiteboard.website/ws';
  }
};
export const SERVER_URL = get_ws_url();

// dimensions enforced by server
export const WHITEBOARD_WIDTH = 1000;
export const WHITEBOARD_HEIGHT = 800;

// local dispaly of whiteboard will be this many times smaller
export const SCALE_FACTOR = 0.75;

// dimensions enforced by server
export const DISPLAY_WIDTH = WHITEBOARD_WIDTH * SCALE_FACTOR;
export const DISPLAY_HEIGHT = WHITEBOARD_HEIGHT * SCALE_FACTOR;
