import { atom } from "recoil";

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
