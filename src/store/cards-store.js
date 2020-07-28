import { createSelector } from "reselect";

const INITIAL_STATE = {
  cardData: {},
  cardLocations: {},
};

export const addCardAction = card => ({
  type: "ADD_CARD",
  payload: card,
});

export const updateCardAction = cardUpdates => ({
  type: "UPDATE_CARD",
  payload: cardUpdates,
});

export const updateCardLocationAction = ({ locationId, cardId, index }) => ({
  type: "UPDATE_CARD_LOCATION",
  payload: { locationId, cardId, index },
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
  (cards, { locationId }) => {
    const foundCards = cards.cardLocations[locationId];
    return foundCards ? foundCards.map(cardId => cards.cardData[cardId]) : [];
  }
);

export default (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case "ADD_CARD": {
      const card = payload;
      const { cardId, locationId } = card;
      const newState = { ...state };
      newState.cardData = { ...newState.cardData, [cardId]: card };
      newState.cardLocations = {
        ...newState.cardLocations,
        [locationId]: newState.cardLocations[locationId]
          ? [...newState.cardLocations[locationId], cardId]
          : [cardId],
      };
      return newState;
    }

    case "UPDATE_CARD": {
      const card = payload;
      const { cardId } = card;
      const newState = { ...state };
      newState.cardData = {
        ...newState.cardData,
        [cardId]: { ...newState.cardData[cardId], ...card },
      };
      return newState;
    }

    case "UPDATE_CARD_LOCATION": {
      const { cardId, locationId, index } = payload;
      const newState = { ...state };
      const { locationId: prevLocationId } = newState.cardData[cardId];
      newState.cardLocations[prevLocationId] = newState.cardLocations[
        prevLocationId
      ].filter(id => id !== cardId);
      newState.cardData[cardId].locationId = locationId;
      newState.cardLocations[locationId] = newState.cardLocations[locationId]
        ? [
            ...newState.cardLocations[locationId].slice(0, index),
            cardId,
            ...newState.cardLocations[locationId].slice(index),
          ]
        : [cardId];

      return newState;
    }

    case "REMOVE_CARD": {
      const cardId = payload;
      const newState = { ...state };
      const { locationId: prevLocationId } = newState.cardData[cardId];
      newState.cardLocations[prevLocationId] = newState.cardLocations[
        prevLocationId
      ].filter(id => id !== cardId);
      delete newState.cardData[cardId];
      return newState;
    }

    default:
      return state;
  }
};
