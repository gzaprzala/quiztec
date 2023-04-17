import { ReactNode } from "react";
import Footer from '#components/Footer/Footer';
import Navbar from '#components/Navbar/Navbar';

import style from './Page.module.scss';


export interface PageProps {
  children?: ReactNode;
}

export default function Page(props: PageProps) {
  return (
    <div className={style.container}>
      <Navbar />
      {props.children}
      <Footer />
    </div>
  );
}