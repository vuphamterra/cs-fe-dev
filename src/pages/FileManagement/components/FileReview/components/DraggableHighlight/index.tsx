import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import styles from './index.module.scss';

interface Props {
  data: {
    id: string;
    opacity: number;
    color: number[];
  };
  handleChangeReSizeHighlight: (id: string, width: number, height: number) => void;
  handleChangePositionHighlight: (id: string, x: number, y: number) => void;
}

function DraggableHighlight(props: Props) {
  const {
    data: { id = '', opacity = 0, color = [] },
    handleChangeReSizeHighlight = () => {},
    handleChangePositionHighlight = () => {},
  } = props;
  return (
    <div
      style={{
        width: '200',
        height: '200',
      }}
    >
      <Rnd
        // size={{ width: 100, height: 100 }}
        // position={{ x: 100, y: 100 }}
        onDragStop={(e, d) => {
          const { x = 0, y = 0 } = d;
          handleChangePositionHighlight(id, x, y);
        }}
        style={{ background: `rgb(${color[0]},${color[1]},${color[2]})`, opacity }}
        default={{ x: 0, y: 0, width: 100, height: 50 }}
        bounds="window"
        onResizeStop={(e, direction, ref, delta, position) => {
          // const numberWidth: number = ref.style.width;
          const width = +ref.style.width.replace('px', '');
          const height = +ref.style.height.replace('px', '');
          handleChangeReSizeHighlight(id, width, height);
          // setWitdh(numberWidth);
        }}
        className={styles.DraggableHighlight}
      ></Rnd>
    </div>
  );
}

export default DraggableHighlight;
