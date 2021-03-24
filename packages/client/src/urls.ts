export const pushWhiteboardId = (whiteboardId: string) => {
  window.history.pushState(null, '', `/${whiteboardId}`);
};

export const pushFrontPage = () => {
  window.history.pushState(null, '', `/`);
};
