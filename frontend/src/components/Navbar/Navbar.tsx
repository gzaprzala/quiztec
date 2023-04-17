import { Link } from 'react-router-dom';
import style from './Navbar.module.scss';
import MaterialSymbol from '#components/MaterialSymbol/MaterialSymbol';
import { useState } from 'react';

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);
  console.log(menuActive);

  return (
    <div className={style.navbarContainer}>
      <div className={style.navbarLeft}>
        <Link to='/'>
          <div className={style.navbarLogo}>
            <MaterialSymbol symbol='neurology' class={style.navbarIcon} />
            <span className={style.navbarText}>
              <span className={style.navbarTextBold}>quiz</span>
              tec
            </span>
          </div>
        </Link>
      </div>
      <div className={style.navbarRight}>
        <MaterialSymbol symbol='account_circle' class={style.navbarIcon} />
        <MaterialSymbol
          symbol='menu'
          class={style.navbarMenuIcon}
          onClick={() => {
            setMenuActive(!menuActive);
          }}
        />
        <div
          className={
            menuActive ? style.navbarMenuDown : style.navbarMenuUp
          }></div>
      </div>
    </div>
  );
};

export default Navbar;
