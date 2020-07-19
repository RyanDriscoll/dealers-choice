import { atom, selectorFamily, atomFamily } from "recoil";

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
  default: [],
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

export const selectedCardsState = atom({
  key: "selectedCardsState",
  default: [],
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
