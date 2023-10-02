import React, { createContext, useReducer, useContext } from "react";
import type { User } from "@/types/user";
import type { Achievements } from "@/types/achievement";
import type { Game } from "@/types/game";
import type { Socket } from "socket.io-client";

type State = {
  user: User | null;
  achievement: Achievements[] | [];
  game: Game[] | [];
  socket: Socket;
};


type Action = {
  type: "SET_USER";
  payload: User | null;
} | {
  type: "SET_ACHIEVEMENT";
  payload: Achievements[] | [];
} | {
  type: "SET_GAME";
  payload: Game[] | [];
} | {
  type: "SET_SOCKET";
  payload: Socket | null;
};

type Dispatch = (action: Action) => void;

const initialState: State = {
  user: null,
  achievement: [],
  game: [],
  socket: null,
};

const StateContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const stateReducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_ACHIEVEMENT":
      return { ...state, achievement: action.payload };
    case "SET_GAME":
      return { ...state, game: action.payload };
    case "SET_SOCKET":
      return { ...state, socket: action.payload };
    default:
      return state;
  }
};

type StateProviderProps = { children: React.ReactNode };

const StateProvider = ({ children }: StateProviderProps) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const value = { state, dispatch };
  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
};

const useStateContext = () => {
  const context = useContext(StateContext);

  if (context) return context;

  throw new Error(`useStateContext must be used within a StateContextProvider`);
};

export { StateProvider, useStateContext };
