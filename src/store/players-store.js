import { createSelector } from "reselect";

const INITIAL_STATE = {};

export const addPlayerAction = player => ({
  type: "ADD_PLAYER",
  payload: player,
});

export const updatePlayerAction = player => ({
  type: "UPDATE_PLAYER",
  payload: player,
});

export const removePlayerAction = id => ({
  type: "REMOVE_PLAYER",
  payload: id,
});

export const getPlayers = createSelector(
  [
    state => state.players,
    state => state.game.playerOrder,
    state => state.user.userId,
  ],
  (players, playerOrder, userId) => {
    const user = players[userId];
    if (!user) {
      return [null, []];
    }
    const playersArr = playerOrder.map(playerId => players[playerId]);
    const userIndex = playersArr.findIndex(p => p.playerId === userId);

    const result = [
      user,
      [...playersArr.slice(userIndex + 1), ...playersArr.slice(0, userIndex)],
    ];
    return result;
  }
);

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case "ADD_PLAYER":
      return { ...state, [payload.playerId]: payload };
    case "UPDATE_PLAYER":
      return {
        ...state,
        [payload.playerId]: {
          ...state[payload.playerId],
          ...payload,
        },
      };
    case "REMOVE_PLAYER":
      const newState = {
        ...state,
      };
      delete newState[payload];
      return newState;
    case "RESET_STATE":
      return INITIAL_STATE;
    default:
      return state;
  }
};
