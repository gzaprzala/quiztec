import { createBrowserRouter } from 'react-router-dom';
import Home from '#pages/Home/Home';
import Login from '#pages/Login/Login';
import Register from '#pages/Register/Register';
import Categories from '#pages/Categories/Categories';
import Profile from '#pages/Profile/Profile';
import Quiz from '#pages/Test/Quiz';
import NewQuiz from '#pages/NewQuiz/NewQuiz';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/categories',
    element: <Categories />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/newquiz',
    element: <NewQuiz />,
  },
  {
    path: '/quiz/:id',
    element: <Quiz />,
  },
]);
