import { MouseEventHandler } from 'react';
import style from './MaterialSymbol.module.scss';


export type SymbolColorType = 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'primary';
export type SymbolHighlightColorType = SymbolColorType | 'none';
export type SymbolSizeType = 'smallest' | 'smaller' | 'small' | 'alt' | 'medium' | 'big';

export interface MaterialSymbolProps {
  symbol: string;
  class?: string;
  onClick?: MouseEventHandler<HTMLSpanElement> | undefined;
}

const MaterialSymbol = (props: MaterialSymbolProps) => {
  const classes = [
    'material-symbols-rounded',
    style.materialSymbol,
    props.class,
  ].join(' ');

  return (
    <span className={classes} onClick={props.onClick}>
      {props.symbol}
    </span>
  );
};

export default MaterialSymbol;
