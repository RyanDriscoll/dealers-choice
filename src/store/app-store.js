import { createSelector } from "reselect";

const INITIAL_STATE = {
  // coordinates: { x: 0, y: 0 },
  // dragging: false,
};

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
