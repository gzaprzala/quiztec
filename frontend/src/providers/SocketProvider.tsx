import { ReactNode, createContext, useContext, useEffect, useReducer, useState } from 'react';
import DotSpinner from '#components/DotSpinner/DotSpinner';
import { Manager, Socket } from 'socket.io-client';
import { useSession } from '#providers/SessionProvider';
import { ClientToServerEvents, ServerToClientEvents } from '#types/api/socket';
import { Show } from '#components/Show';

import style from './SessionProvider.module.scss';

export type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export type SocketContextState = {
  manager: Manager;
  client?: SocketClient;
};

export type SocketContextValue = [state: SocketContextState];

const defaultState: SocketContextState = {
  client: undefined,
  manager: new Manager(),
};

const SocketContext = createContext<SocketContextValue>([defaultState]);

export enum SocketReducerActions {
  SetClient,
}

export type SocketReducerAction = {
  type: SocketReducerActions.SetClient;
  payload: SocketClient;
};

const socketReducer = (oldState: SocketContextState, action: SocketReducerAction): SocketContextState => {
  switch (action.type) {
    case SocketReducerActions.SetClient: {
      return {
        ...oldState,
        client: action.payload,
      };
    }
    default: {
      return oldState;
    }
  }
};

export const SocketProvider = (props: { children: ReactNode }) => {
  const [state, setState] = useReducer(socketReducer, defaultState);
  const [session] = useSession();
  const [loaded, setLoaded] = useState(false);

  const registerSocketEvents = (socket: Socket) => {
    socket.on('connect', () => {
      console.log('Socket connected');
      setLoaded(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error(err);
    });

    socket.onAny((event, ...message) => {
      console.log(event, message);
    });
  };

  useEffect(() => {
    if (session.loggedIn) {
      const socket = state.manager.socket('/');

      setState({ type: SocketReducerActions.SetClient, payload: socket });
      registerSocketEvents(socket);
    } else {
      setLoaded(true);
    }

    return () => {
      state.client?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={[state]}>
      <Show
        when={loaded}
        fallback={
          <div className={style.container}>
            <DotSpinner />
            <span className={style.description}>Getting things ready</span>
          </div>
        }
      >
        {props.children}
      </Show>
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextValue => useContext(SocketContext);
