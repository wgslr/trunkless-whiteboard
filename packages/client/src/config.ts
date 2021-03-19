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
export const SERVER_URL = 'ws://127.0.0.1:3001/ws';// get_ws_url();
