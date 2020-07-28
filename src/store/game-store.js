const INITIAL_STATE = {
  gameId: "",
  playerOrder: "",
  name: "",
  dealer: "",
};

export const updateGameAction = ({ key, value }) => ({
  type: "UPDATE_GAME",
  payload: { key, value },
});

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case "UPDATE_GAME":
      return {
        ...state,
        [payload.key]: payload.value,
      };
    default:
      return state;
  }
};
