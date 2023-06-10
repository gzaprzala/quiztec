import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { SessionProvider } from '#providers/SessionProvider';

import './index.scss';
import { NotificationProvider } from '#providers/NotificationProvider';
import { SocketProvider } from '#providers/SocketProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <SessionProvider>
    <SocketProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </SocketProvider>
  </SessionProvider>,
);

const updateAppHeight = () => {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
};

window.addEventListener('resize', updateAppHeight);
updateAppHeight();
