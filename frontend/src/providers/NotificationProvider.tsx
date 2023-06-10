import MaterialSymbol from '#components/MaterialSymbol/MaterialSymbol';
import TemplateButton from '#components/TemplateButton/TemplateButton';
import { quickSwitch } from '#shared/utils';
import { CSSProperties, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';

import style from './NotificationProvider.module.scss';
import { useSocket } from '#providers/SocketProvider';
import { Achievement } from '#shared/types/api/achievement';

export type NotificationType = 'success' | 'info' | 'error' | 'achievement';

export type Notification = {
  id: number;
  title: string;
  message: string | JSX.Element;
  type: NotificationType;
  duration?: number;
};

export type NotificationContextState = {
  notificationIdSequence: number;
  maxNotifications: number;
  notifications: Notification[];
};

export type NotificationContextValue = [
  state: NotificationContextState,
  actions: {
    /**
     * Adds a notification to the notification queue.
     * @param notification The notification to add.
     * @returns The id of the notification.
     */
    addNotification: (notification: Omit<Notification, 'id'>) => number;

    /**
     * Removes a notification from the notification queue.
     * @param id The id of the notification to remove.
     */
    removeNotification: (id: number) => void;

    /**
     * Skips to the next notification in the queue.
     * @returns The id of the skipped notification.
     */
    nextNotification: () => number;

    /**
     * Clears all notifications from the queue.
     * @returns The number of notifications cleared.
     */
    clearNotifications: () => number;

    /**
     * Sets the maximum number of notifications that can be displayed at once.
     * @param value The new maximum number of notifications.
     */
    setMaxNotifications: (value: number) => void;
  },
];

export const defaultState: NotificationContextState = {
  notificationIdSequence: 0,
  maxNotifications: 3,
  notifications: [],
};

const NotificationContext = createContext<NotificationContextValue>([
  defaultState,
  {
    addNotification: () => 0,
    removeNotification: () => null,
    nextNotification: () => 0,
    clearNotifications: () => 0,
    setMaxNotifications: () => null,
  },
]);

export enum NotificationReducerActions {
  AddNotification,
  RemoveNotification,
  NextNotification,
  ClearNotifications,
  SetMaxNotifications,
}

export type NotificationReducerAction =
  | {
      type: NotificationReducerActions.AddNotification;
      notification: Omit<Notification, 'id'>;
    }
  | {
      type: NotificationReducerActions.RemoveNotification;
      id: number;
    }
  | {
      type: NotificationReducerActions.NextNotification;
    }
  | {
      type: NotificationReducerActions.ClearNotifications;
    }
  | {
      type: NotificationReducerActions.SetMaxNotifications;
      value: number;
    };

export type NotificationProps = {
  index: number;
  notification: Notification;
  removeNotification: NotificationContextValue[1]['removeNotification'];
};

const Notification = ({ index, notification, removeNotification }: NotificationProps) => {
  const [shown, setShown] = useState(true);
  const [timeoutHandle, setTimeoutHandle] = useState(-1);

  const removeTimeout = useCallback(() => {
    if (timeoutHandle !== -1) {
      clearTimeout(timeoutHandle);
      setTimeoutHandle(-1);
    }
  }, [timeoutHandle]);

  const removeElement = useCallback(() => {
    setShown(false);

    setTimeout(() => {
      removeNotification(notification.id);
    }, 200);
  }, [notification.id]);

  const createTimeout = useCallback(() => {
    if (index === 0 && notification.duration !== undefined && timeoutHandle === -1) {
      console.log('Registering timeout for notification', notification.id);

      const handle = setTimeout(() => {
        removeElement();
      }, notification.duration) as unknown as number;

      setTimeoutHandle(handle);
    }
  }, [timeoutHandle, index, notification.duration]);

  useEffect(() => {
    createTimeout();
  }, [index]);

  useEffect(() => {
    return () => {
      removeTimeout();
    };
  }, []);

  const symbol = quickSwitch<string, NotificationType>(notification.type, {
    success: 'check_circle',
    info: 'info',
    error: 'warning',
    achievement: 'emoji_events',
    default: 'help',
  });

  return (
    <li
      className={[style.notification, shown ? '' : style.hideNotification].join(' ')}
      onMouseEnter={removeTimeout}
      onMouseLeave={createTimeout}
      style={
        {
          '--notification-duration': notification.duration ? `${notification.duration}ms` : 'unset',
        } as CSSProperties
      }
    >
      <MaterialSymbol symbol={symbol} />
      <div className={style.content}>
        <span className={style.title}>{notification.title}</span>
        {typeof notification === 'string' ? <p>{notification}</p> : notification.message}
      </div>
      <TemplateButton className={style.closeButton} onClick={removeElement}>
        <MaterialSymbol symbol="close" />
      </TemplateButton>
    </li>
  );
};

const notificationReducer = (oldState: NotificationContextState, action: NotificationReducerAction) => {
  switch (action.type) {
    case NotificationReducerActions.AddNotification:
      return {
        ...oldState,
        notifications: [...oldState.notifications, { ...action.notification, id: oldState.notificationIdSequence }],
        notificationIdSequence: oldState.notificationIdSequence + 1,
      };

    case NotificationReducerActions.RemoveNotification:
      return {
        ...oldState,
        notifications: oldState.notifications.filter((notification) => notification.id !== action.id),
      };

    case NotificationReducerActions.NextNotification:
      return {
        ...oldState,
        notifications: oldState.notifications.slice(1),
      };

    case NotificationReducerActions.ClearNotifications:
      return {
        ...oldState,
        notifications: [],
      };

    case NotificationReducerActions.SetMaxNotifications:
      return {
        ...oldState,
        maxNotifications: action.value,
      };

    default:
      return oldState;
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useReducer(notificationReducer, defaultState);
  const [socket] = useSocket();

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = state.notificationIdSequence;

    setState({
      type: NotificationReducerActions.AddNotification,
      notification,
    });

    return id;
  };

  const removeNotification = (id: number) => {
    setState({
      type: NotificationReducerActions.RemoveNotification,
      id,
    });
  };

  const nextNotification = () => {
    const targetId = state.notifications[0].id;

    removeNotification(state.notifications[0].id);
    return targetId;
  };

  const clearNotifications = () => {
    const length = state.notifications.length;

    setState({
      type: NotificationReducerActions.ClearNotifications,
    });

    return length;
  };

  const setMaxNotifications = (value: number) => {
    setState({
      type: NotificationReducerActions.SetMaxNotifications,
      value,
    });
  };

  const notificationOverflowLength = useMemo(
    () => Math.max(0, state.notifications.length - state.maxNotifications),
    [state.notifications, state.maxNotifications],
  );

  const showAchievement = (achievement: Achievement) => {
    addNotification({
      title: 'Achievement unlocked',
      message: (
        <>
          <span className={style.achievementName}>{achievement.name}</span>
          <span className={style.achievementDescription}>{achievement.description}</span>
        </>
      ),
      type: 'achievement',
      duration: 5000,
    });
  };

  useEffect(() => {
    socket.client?.on('UNL_ACHIEVEMENT', showAchievement);

    return () => {
      socket.client?.off('UNL_ACHIEVEMENT', showAchievement);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={[
        state,
        {
          addNotification,
          removeNotification,
          nextNotification,
          clearNotifications,
          setMaxNotifications,
        },
      ]}
    >
      {children}

      <ul className={style.container}>
        {state.notifications.slice(0, state.maxNotifications).map((notification, index) => {
          return <Notification key={notification.id} index={index} notification={notification} removeNotification={removeNotification} />;
        })}

        {notificationOverflowLength > 0 && <div className={style.overflowCounter}>and {notificationOverflowLength} more...</div>}
      </ul>
    </NotificationContext.Provider>
  );
}

export const useNotification = (): NotificationContextValue => useContext(NotificationContext);
