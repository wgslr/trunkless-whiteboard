/** After this time we stop looking for response among incoming messages */
export const SERVER_RESPONSE_TIMEOUT = 10_000;

const get_ws_url = () => {
  const location = window.location;
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}/ws`;
};
export const SERVER_URL = get_ws_url();
