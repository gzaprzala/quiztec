import { ReactNode } from "react";

import style from './Page.module.scss';


export interface PageProps {
  children?: ReactNode;
}

export default function Page(props: PageProps) {
  return (
    <div className={style.container}>
      {props.children}
    </div>
  );
}