import { Link } from 'react-router-dom';
import style from './Footer.module.scss';
import MaterialSymbol from '#components/MaterialSymbol/MaterialSymbol';

const Footer = () => {
  return (
    <div className={style.footerContainer}>
      <div className={style.footerContent}>
        <div className={style.footerLinks}>
          <Link
            to='https://github.com/gzaprzala/quiztec'
            className={style.footerLink}>
            <MaterialSymbol symbol='code' class={style.footerIcon} />
            <span>github</span>
          </Link>
          <Link to='' className={style.footerLink}>
            <MaterialSymbol symbol='lock' class={style.footerIcon} />
            <span>privacy</span>
          </Link>
          <Link to='' className={style.footerLink}>
            <MaterialSymbol symbol='gavel' class={style.footerIcon} />
            <span>terms</span>
          </Link>
          <Link to='' className={style.footerLink}>
            <MaterialSymbol symbol='shield' class={style.footerIcon} />
            <span>security</span>
          </Link>
          <Link to='' className={style.footerLink}>
            <MaterialSymbol symbol='mail' class={style.footerIcon} />
            <span>discord</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
