/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Rnd } from 'react-rnd';
import styles from './index.module.scss';

interface Props {
  data: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
    color: number[];
  };
  heightPdf: number;
  setAddNoteItem: (state: string) => void;
  handleChangeEditPositionHighlight: (state: any, index: string) => void;
  handleChangeReSizeHighlight: (id: string, width: number, height: number) => void;
  // handleChangePositionHighlight: (id: string, x: number, y: number) => void;
}
function DraggableExistHighlight(props: Props) {
  const {
    data: { x = 0, y = 0, width = 0, color = [], height = 0, opacity = 0, id = '' },
    heightPdf = 0,
    setAddNoteItem = () => {},
    handleChangeEditPositionHighlight = () => {},
    handleChangeReSizeHighlight = () => {},
  } = props;
  const newY = heightPdf - y - height;
  return (
    <div
      style={{
        width: '200',
        height: '200',
      }}
    >
      <Rnd
        onDragStop={(e, d) => {
          const { x = 0, y = 0 } = d;
          // handleChangePositionHighlight(id, x, y);
          const obj = { x, y };
          handleChangeEditPositionHighlight(obj, id);
        }}
        style={{ background: `rgb(${color[0]},${color[1]},${color[2]})`, opacity }}
        default={{ x, y: newY, width, height }}
        onMouseDown={() => setAddNoteItem('3')}
        bounds="window"
        onResizeStop={(e, direction, ref, delta, position) => {
          // const numberWidth: number = ref.style.width;
          const width = +ref.style.width.replace('px', '');
          const height = +ref.style.height.replace('px', '');
          handleChangeReSizeHighlight(id, width, height);
          // setWitdh(numberWidth);
        }}
        className={styles.DraggableExistHighlight}
      ></Rnd>
    </div>
  );
}

export default DraggableExistHighlight;
