import { createSelector } from "reselect";

const INITIAL_STATE = {
  selectedPile: null,
  actionPanelOpen: false,
  // coordinates: { x: 0, y: 0 },
  // dragging: false,
};

export const setSelectedPileAction = pileId => ({
  type: "SET_SELECTED_PILE",
  payload: pileId,
});

export const setActionPanelOpenAction = bool => ({
  type: "SET_ACTION_PANEL_OPEN",
  payload: bool,
});

// export const setCoordinatesAction = coords => ({
//   type: "SET_COORDINATES",
//   payload: coords,
// });

// export const setDraggingAction = bool => ({
//   type: "SET_DRAGGING",
//   payload: bool,
// });

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case "SET_SELECTED_PILE":
      return {
        ...state,
        selectedPile: payload,
      };
    case "SET_ACTION_PANEL_OPEN":
      return {
        ...state,
        actionPanelOpen: payload,
      };
    // case "SET_COORDINATES":
    //   return {
    //     ...state,
    //     coordinates: payload,
    //   };
    // case "SET_DRAGGING":
    //   return {
    //     ...state,
    //     dragging: payload,
    //   };
    case "RESET_STATE":
      return INITIAL_STATE;
    default:
      return state;
  }
};
