import { FC } from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd/es/button';
import styles from './CSButton.module.scss';

const CSButton: FC<ButtonProps> = (props) => {
  return (
    <Button className={styles.cs_btn} {...props}>
      {props.children}
    </Button>
  );
};

export default CSButton;
