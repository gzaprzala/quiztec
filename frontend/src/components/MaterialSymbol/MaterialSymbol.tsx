import style from './MaterialSymbol.module.scss';


interface MaterialSymbolProps {
  symbol: string;
  class?: string;
}

const MaterialSymbol = (props: MaterialSymbolProps) => {
  const classes = [
    'material-symbols-rounded',
    style.materialSymbol,
    props.class
  ].join(' ');

  return (
    <span className={classes}>
      {props.symbol}
    </span>
  );
}

export default MaterialSymbol;