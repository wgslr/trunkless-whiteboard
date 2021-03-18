/** After this time we stop looking for response among incoming messages */
export const SERVER_RESPONSE_TIMEOUT = 10_000;

const { location } = window;
export const SERVER_URL = `ws://${location.host}/ws`;
