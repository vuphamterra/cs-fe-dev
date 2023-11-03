import React from 'react';
import './index.scss';

interface Props {
  color?: string;
  text: string;
  fontWeight?: number;
  backgroundColor?: string;
  fontSize?: number;
  margin?: string;
  onHandleClick?: (value: any) => void;
  disabled?: boolean;
}

const CustomButton: React.FC<Props> = (props) => {
  const {
    color = 'black',
    text,
    fontWeight = 700,
    backgroundColor = 'transparent',
    fontSize = 16,
    disabled = false,
    margin = '0px',
    onHandleClick = () => {},
  } = props;
  return (
    <div
      onClick={onHandleClick}
      style={{ color, fontWeight, backgroundColor, fontSize, margin }}
      className={`CustomButton ${disabled ? 'disabled' : null}`}
    >
      <span>{text}</span>
    </div>
  );
};

export default CustomButton;
