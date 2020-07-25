import { createSelector } from "reselect";

const INITIAL_STATE = {
  cardData: {},
  cardLocations: {},
};

export const addCardAction = card => ({
  type: "ADD_CARD",
  payload: card,
});

export const updateCardAction = card => ({
  type: "UPDATE_CARD",
  payload: card,
});

export const removeCardAction = cardId => ({
  type: "REMOVE_CARD",
  payload: cardId,
});

export const getSelectedCards = createSelector(
  [state => state.cards.cardData],
  cardData =>
    Object.values(cardData)
      .filter(card => card.selected)
      .map(c => c.cardId)
);

export const getCards = createSelector(
  [state => state.cards, (_, props) => props],
  (cards, { location, locationId }) => {
    const locator = `${location}+${locationId}`;
    const foundCards = cards.cardLocations[locator];
    return foundCards ? foundCards.map(cardId => cards.cardData[cardId]) : [];
  }
);

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case "ADD_CARD": {
      const card = payload;
      const { cardId, location, locationId } = card;
      const locator = `${location}+${locationId}`;
      const newState = { ...state };
      newState.cardData = { ...newState.cardData, [cardId]: card };
      newState.cardLocations = {
        ...newState.cardLocations,
        [locator]: newState.cardLocations[locator]
          ? [...newState.cardLocations[locator], cardId]
          : [cardId],
      };
      return newState;
    }

    case "UPDATE_CARD": {
      const card = payload;
      const { cardId, location, locationId } = card;
      const locator = `${location}+${locationId}`;
      const newState = { ...state };
      const {
        location: prevLocation,
        locationId: prevLocationId,
      } = newState.cardData[cardId];
      const prevLocator = `${prevLocation}+${prevLocationId}`;
      if (locator !== prevLocator) {
        newState.cardLocations[prevLocator] = newState.cardLocations[
          prevLocator
        ].filter(id => id !== cardId);
        newState.cardLocations[locator] = newState.cardLocations[locator]
          ? [...newState.cardLocations[locator], cardId]
          : [cardId];
      }
      newState.cardData = {
        ...newState.cardData,
        [cardId]: { ...newState.cardData[cardId], ...card },
      };
      return newState;
    }

    case "REMOVE_CARD": {
      const cardId = payload;
      const newState = { ...state };
      const {
        location: prevLocation,
        locationId: prevLocationId,
      } = newState.cardData[cardId];
      const prevLocator = `${prevLocation}+${prevLocationId}`;
      newState.cardLocations[prevLocator] = newState.cardLocations[
        prevLocator
      ].filter(id => id !== cardId);
      newState.cardData[cardId] = null;
      return newState;
    }

    default:
      return state;
  }
};
