import { createBrowserRouter } from "react-router-dom";
import Home from "#pages/Home/Home";
import Login from "#pages/Login/Login";
import Register from "#pages/Register/Register";
import Categories from "#pages/Categories/Categories";
import Profile from "#pages/Profile/Profile";
import Quiz from "#pages/Test/Quiz";
import NewQuiz from "#pages/NewQuiz/NewQuiz";
import Leaderboard from "#pages/Leaderboard/Leaderboard";
import Stats from "#pages/Stats/Stats";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/categories",
    element: <Categories />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/newquiz",
    element: <NewQuiz />,
  },
  {
    path: "/quiz/:id",
    element: <Quiz />,
  },
  {
    path: "/leaderboard",
    element: <Leaderboard />,
  },
  {
    path: "/statistics",
    element: <Stats />,
  },
]);
