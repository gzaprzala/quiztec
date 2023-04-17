import { Link } from 'react-router-dom';
import style from './Footer.module.scss';
import MaterialSymbol from '#components/MaterialSymbol/MaterialSymbol';

const Footer = () => {
  return (
    <div className={style.footerContainer}>
      <div className={style.footerContent}>
        <div className={style.footerLinks}>
          <div className={style.footerLink}>
            <MaterialSymbol symbol='code' class={style.footerIcon} />
            <span>github</span>
          </div>
          <div className={style.footerLink}>
            <MaterialSymbol symbol='lock' class={style.footerIcon} />
            <span>privacy</span>
          </div>
          <div className={style.footerLink}>
            <MaterialSymbol symbol='gavel' class={style.footerIcon} />
            <span>terms</span>
          </div>
          <div className={style.footerLink}>
            <MaterialSymbol symbol='shield' class={style.footerIcon} />
            <span>security</span>
          </div>
          <div className={style.footerLink}>
            <MaterialSymbol symbol='mail' class={style.footerIcon} />
            <span>discord</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
