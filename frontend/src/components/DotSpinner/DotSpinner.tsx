import { CSSProperties } from 'react';

import style from './DotSpinner.module.scss';

export interface SpinnerProps {
  boundsWidth?: string;
  boundsHeight?: string;
}

const DotSpinner = (props: SpinnerProps) => {
  const aspectRatio = 1.83;

  const getSpinnerSize = (): string => {
    if (props.boundsWidth && props.boundsHeight) {
      return `min(calc(${props.boundsWidth} / ${aspectRatio}), ${props.boundsHeight})`;
    }

    if (props.boundsWidth) return `calc(${props.boundsWidth} / ${aspectRatio})`;
    if (props.boundsHeight) return props.boundsHeight;

    return '';
  };

  return (
    <div
      className={style.spinner}
      style={
        {
          fontSize: getSpinnerSize(),
        } as CSSProperties
      }
    >
      <span className={style.spinnerBall} />
      <span className={style.spinnerBall} />
      <span className={style.spinnerBall} />
      <span className={style.spinnerBall} />
    </div>
  );
};

export default DotSpinner;
