const INITIAL_STATE = {
  pileData: {},
  pileLocations: {},
};

export const addPileAction = pile => ({
  type: "ADD_PILE",
  payload: pile,
});

export const updatePileAction = pile => ({
  type: "UPDATE_PILE",
  payload: pile,
});

export const updatePileLocationAction = ({ locationId, pileId, index }) => ({
  type: "UPDATE_PILE_LOCATION",
  payload: { locationId, pileId, index },
});

export const removePileAction = id => ({
  type: "REMOVE_PILE",
  payload: id,
});

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case "ADD_PILE": {
      const pile = payload;
      const { pileId, locationId } = pile;
      const newState = { ...state };
      newState.pileData = { ...newState.pileData, [pileId]: pile };
      // newState.pileLocations = {
      //   ...newState.pileLocations,
      //   [locationId]: newState.pileLocations[locationId]
      //     ? [...newState.pileLocations[locationId], pileId]
      //     : [pileId],
      // };
      return newState;
    }

    case "UPDATE_PILE": {
      const pile = payload;
      const { pileId } = pile;
      const newState = { ...state };
      newState.pileData = {
        ...newState.pileData,
        [pileId]: { ...newState.pileData[pileId], ...pile },
      };
      return newState;
    }

    case "UPDATE_PILE_LOCATION": {
      const { pileId, locationId, index } = payload;
      const newState = { ...state };
      if (newState.pileData[pileId]) {
        const { locationId: prevLocationId } = newState.pileData[pileId];
        newState.pileLocations[prevLocationId] = newState.pileLocations[
          prevLocationId
        ].filter(id => id !== pileId);
        newState.pileData[pileId].locationId = locationId;
      }
      // newState.pileLocations[locationId] = newState.pileLocations[locationId]
      //   ? [
      //       ...newState.pileLocations[locationId].slice(0, index),
      //       pileId,
      //       ...newState.pileLocations[locationId].slice(index),
      //     ]
      //   : [pileId];

      return newState;
    }

    case "REMOVE_PILE": {
      const pileId = payload;
      const newState = { ...state };
      // const { locationId: prevLocationId } = newState.pileData[pileId];
      // newState.pileLocations[prevLocationId] = newState.pileLocations[
      //   prevLocationId
      // ].filter(id => id !== pileId);
      delete newState.pileData[pileId];
      return newState;
    }
    default:
      return state;
  }
};