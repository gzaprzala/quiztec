import style from './TemplateButton.module.scss';


export type TemplateButtonProps = JSX.IntrinsicElements['button'];

const TemplateButton = (props: TemplateButtonProps) => {
  const customClass = [style.button, props.className].join(' ');

  return (
    <button {...props} className={customClass} >
      {props.children}
    </button>
  );
};

export default TemplateButton;
