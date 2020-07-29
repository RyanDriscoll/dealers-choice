import { createSelector } from "reselect";

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

export const getUserIsDealer = createSelector(
  [state => state.game.dealer, state => state.user.userId],
  (dealer, userId) => dealer === userId
);

export const getPlayerIsDealer = createSelector(
  [state => state.game.dealer, (_, props) => props.player.playerId],
  (dealer, playerId) => dealer === playerId
);

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
