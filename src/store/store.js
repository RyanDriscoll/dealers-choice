import { createStore, combineReducers, applyMiddleware } from "redux";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import { createLogger } from "redux-logger";
import user from "store/user-store";
import players from "store/players-store";
import game from "store/game-store";
import cards from "store/cards-store";

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
  user,
  players,
  game,
  cards,
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
    return nextState;
  } else {
    return combinedReducer(state, action);
  }
};

// create a makeStore function
const makeStore = context => createStore(reducer, bindMiddleware([logger]));

// export an assembled wrapper
export const wrapper = createWrapper(makeStore, { debug: true });
