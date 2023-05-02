import { ReactNode, createContext, useContext, useEffect, useReducer, useState } from 'react';
import { FrontendUser, GetFrontendUser } from '#types/api/auth';

export type SessionContextState = {
  loggedIn: boolean;
  user?: FrontendUser;
};

export type SessionContextValue = [
  state: SessionContextState,
  actions: {
    fetchUser: () => Promise<FrontendUser | null>;
    invalidate: () => void;
    logout: () => void;
  },
];

const defaultState: SessionContextState = {
  loggedIn: false,
};

export const SessionContext = createContext<SessionContextValue>([
  defaultState,
  {
    fetchUser: async () => null,
    invalidate: () => {},
    logout: () => {},
  },
]);

const sessionReducer = (oldState: SessionContextState, newState: Partial<SessionContextState>) => ({
  ...oldState,
  ...newState,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useReducer(sessionReducer, defaultState);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (): Promise<FrontendUser | null> => {
    const response = await fetch('/api/v1/auth/user', {
      cache: 'no-store',
    });

    if (response.ok) {
      const { data } = (await response.json()) as GetFrontendUser;
      setState({ loggedIn: true, user: data });

      return data;
    }

    setState({ loggedIn: false, user: undefined });
    return null;
  };

  const invalidate = () => {
    setState({ loggedIn: false, user: undefined });

    location.pathname = '/';
  };

  const logout = async () => {
    const response = await fetch('/api/v1/auth/logout', { method: 'POST' });

    if (response.ok) {
      invalidate();
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    console.log('User logged in:', state.loggedIn);
    setLoading(false);
  }, [state.loggedIn]);

  return (
    <SessionContext.Provider
      value={[
        state,
        {
          fetchUser,
          invalidate,
          logout,
        },
      ]}
    >
      {!loading && children}
    </SessionContext.Provider>
  );
}

export const useSession = (): SessionContextValue => useContext(SessionContext);