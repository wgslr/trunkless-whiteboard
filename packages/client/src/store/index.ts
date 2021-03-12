const notes: any[] = [];
const notesDrafts: any[] = [];

export const getCombinedState = () => {
  return {
    notes: notes.concat(notesDrafts)
  };
};
