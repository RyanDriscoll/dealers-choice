import { createStore, combineReducers, applyMiddleware } from "redux";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";
import user from "store/user-store";
import players from "store/players-store";
import game from "store/game-store";
import cards from "store/cards-store";
import piles from "store/piles-store";
import app from "store/app-store";

const logger = createLogger({
  collapsed: true,
});

const bindMiddleware = middleware => {
  if (process.env.NODE_ENV !== "production") {
    const { composeWithDevTools } = require("redux-devtools-extension");
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const combinedReducer = combineReducers({
  app,
  user,
  players,
  game,
  cards,
  piles,
});

// create your reducer
const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    if (state.user) nextState.user = state.user;
    if (state.players) nextState.players = state.players;
    if (state.game) nextState.game = state.game;
    if (state.cards) nextState.cards = state.cards;
    if (state.piles) nextState.piles = state.piles;
    return nextState;
  } else {
    return combinedReducer(state, action);
  }
};

// create a makeStore function
const makeStore = context =>
  createStore(reducer, bindMiddleware([thunk, logger]));

// export an assembled wrapper
export const wrapper = createWrapper(makeStore, { debug: true });
