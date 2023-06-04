import { Link } from "react-router-dom";
import style from "./Navbar.module.scss";
import MaterialSymbol from "#components/MaterialSymbol/MaterialSymbol";
import { useState } from "react";
import { useSession } from "#providers/SessionProvider";

const Navbar = () => {
  const [session, { logout }] = useSession();
  const [menuActive, setMenuActive] = useState(false);

  return (
    <div className={style.navbarContainer}>
      <div className={style.navbarLeft}>
        <Link to="/">
          <div className={style.navbarLogo}>
            <MaterialSymbol symbol="neurology" class={style.navbarIcon} />
            <span className={style.navbarText}>
              <span className={style.navbarTextBold}>quiz</span>
              tec
            </span>
          </div>
        </Link>
      </div>
      <div className={style.navbarRight}>
        {session.loggedIn && session.user?.profileImageUrl === null && (
          <Link to="/profile">
            <MaterialSymbol symbol="account_circle" class={style.navbarIcon} />
          </Link>
        )}
        {session.loggedIn && session.user?.profileImageUrl !== null && (
          <Link to="/profile">
            <img
              className={style.navbarAvatar}
              src={session.user?.profileImageUrl}
              alt="?"
            />
          </Link>
        )}

        <MaterialSymbol
          symbol="menu"
          class={style.navbarMenuIcon}
          onClick={() => {
            setMenuActive(!menuActive);
          }}
        />
        <div
          className={[
            style.navbarMenu,
            menuActive ? style.navbarMenuDown : style.navbarMenuUp,
          ].join(" ")}
        >
          <Link to="/">Homepage</Link>

          <Link to="/categories">Categories</Link>

          <Link to="/leaderboard">Leaderboard</Link>

          {session.loggedIn && <Link to="/statistics">Statistics</Link>}
          {session.loggedIn && <Link to="/newquiz">Create new quiz</Link>}
          {session.loggedIn && <span onClick={logout}>Logout</span>}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
