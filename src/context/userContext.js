import React, { createContext, useReducer, useContext } from "react";

const UserStateContext = createContext();
const UserDispatchContext = createContext();

function userReducer(state, action) {
  switch (action.type) {
    case "ADD_USER": {
      return { userId: action.payload };
    }
    case "REMOVE_USER": {
      return { userId: null };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, { userId: null });
  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}
function useUserState() {
  const context = useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}
function useUserDispatch() {
  const context = useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

function useUser() {
  return [useUserState(), useUserDispatch()];
}
export { UserProvider, useUser, useUserState, useUserDispatch };
