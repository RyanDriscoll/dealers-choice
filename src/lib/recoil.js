import { atom, selectorFamily } from "recoil";

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
  get: ({ id, stateType }) => ({ get }) => {
    const allCards =
      stateType === "hands" ? get(handsState) : get(pileCardsState);
    const cards = allCards[id];
    return cards
      ? cards.reduce(
          (acc, curr) => {
            const [a, b] = acc;
            if (curr.onTable) {
              b.push(curr);
            } else {
              a.push(curr);
            }
            return [a, b];
          },
          [[], []]
        )
      : [[], []];
  },
});
