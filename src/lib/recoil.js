import { atom, selectorFamily, atomFamily, selector } from "recoil";

export const userState = atom({
  key: "userState",
  default: null,
});

export const gameState = atom({
  key: "gameState",
  default: null,
});

export const playersState = atom({
  key: "playersState",
  default: {},
});

export const playerOrderState = atom({
  key: "playerOrderState",
  default: [
    "y0P9jkga43gsvpkwE1nSSMtiZmV2",
    "NnZ7XTq5IEPgBTpFspqaTwz2YSe2",
    "pU2LNVX0X9S9JpMVkP8O1UqKTGx2",
    "1znhVJSDGXQHOnvkz8onN1WPxi33",
  ],
});

export const otherPlayerOrderSelector = selectorFamily({
  key: "otherPlayerOrderSelector",
  get: userId => ({ get }) => {
    const playerOrder = get(playerOrderState);
    return playerOrder;
    // const index = playerOrder.indexOf(userId);
    // const newOrder = [
    //   ...playerOrder.slice(index),
    //   ...playerOrder.slice(0, index),
    // ];
    // return newOrder;
  },
});

export const isDealerSelector = selectorFamily({
  key: "isDealerSelector",
  get: userId => ({ get }) => {
    const { dealer } = get(gameState);
    return dealer === userId;
  },
});

export const cardsState = atom({
  key: "cardsState",
  default: [],
});

export const cardLocationsState = atom({
  key: "cardLocationsState",
  default: {},
});

export const handsState = atom({
  key: "handsState",
  default: {},
});

export const pilesState = atom({
  key: "pilesState",
  default: [],
});

export const pileCardsState = atom({
  key: "pileCardsState",
  default: {},
});

export const selectedCardsState = selector({
  key: "selectedCardsState",
  get: ({ get }) => {
    const cards = get(cardsState);
    return cards.filter(card => card.selected).map(c => c.cardId);
  },
});

export const cardsStateSelector = selectorFamily({
  key: "cardsStateSelector",
  get: ({ locationId, location }) => ({ get }) => {
    const cards = get(cardsState);
    return cards.filter(
      c => c.location === location && c.locationId === locationId
    );
  },
});

// export const cardsStateSelector = selectorFamily({
//   key: "cardsStateSelector",
//   get: ({ id, stateType }) => ({ get }) => {
//     const allCards =
//       stateType === "hands" ? get(handsState) : get(pileCardsState);
//     const cards = allCards[id];
//     return cards
//       ? cards.reduce(
//           (acc, curr) => {
//             const [a, b] = acc;
//             if (curr.onTable) {
//               b.push(curr);
//             } else {
//               a.push(curr);
//             }
//             return [a, b];
//           },
//           [[], []]
//         )
//       : [[], []];
//   },
// });
