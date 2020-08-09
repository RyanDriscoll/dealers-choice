import { createSelector } from "reselect";

const INITIAL_STATE = {
  players: {},
  playerOrder: [],
};

export const addPlayerAction = player => ({
  type: "ADD_PLAYER",
  payload: player,
});

export const updatePlayerAction = player => ({
  type: "UPDATE_PLAYER",
  payload: player,
});

export const updatePlayerOrderAction = playerOrder => ({
  type: "UPDATE_PLAYER_ORDER",
  payload: playerOrder,
});

export const removePlayerAction = id => ({
  type: "REMOVE_PLAYER",
  payload: id,
});

export const getIsOtherPlayer = createSelector(
  [state => state.players.playerOrder, (_, props) => props.locationId],
  (playerOrder, id) => playerOrder.includes(id)
);

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case "ADD_PLAYER":
      return {
        ...state,
        players: { ...state.players, [payload.playerId]: payload },
        // playerOrder: [...state.playerOrder, payload.playerId],
      };
    case "UPDATE_PLAYER":
      return {
        ...state,
        players: {
          ...state.players,
          [payload.playerId]: {
            ...state.players[payload.playerId],
            ...payload,
          },
        },
      };
    case "UPDATE_PLAYER_ORDER":
      return {
        ...state,
        playerOrder: payload,
      };
    case "REMOVE_PLAYER":
      return {
        ...state,
        players: { ...state.players, [payload]: null },
        playerOrder: state.playerOrder.filter(id => id !== payload),
      };
    default:
      return state;
  }
};
