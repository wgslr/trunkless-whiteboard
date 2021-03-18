/** After this time we stop looking for response among incoming messages */
export const SERVER_RESPONSE_TIMEOUT = 10_000;

export const SERVER_URL = process.env.FULL_WEBSOCKET_URL || 'ws://localhost:3001/ws';
