const INITIAL_STATE = {
  userId: null,
};

export const addUserAction = userId =>
  console.log(userId) || { type: "ADD_USER", payload: userId };

export const removeUserAction = () => ({ type: "REMOVE_USER" });

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case "ADD_USER":
      return {
        ...state,
        userId: action.payload,
      };
    case "REMOVE_USER":
      return {
        ...state,
        userId: null,
      };
    default:
      return state;
  }
};
