/** After this time we stop looking for response among incoming messages */
export const SERVER_RESPONSE_TIMEOUT = 10_000;

const get_ws_url = () => {
  const location = window.location;
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}/ws`;
};
export const SERVER_URL = 'ws://127.0.0.1:3001/ws';// get_ws_url();
