import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import styles from './index.module.scss';
interface Props {
  data: {
    content: string;
    x: number;
    y: number;
    rotate: number;
    size: number;
    color: number[];
    id: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
  originalHeight: number;
  onChange: (text: string, index: string) => void;
  setAddNoteItem: (state: string) => void;
  handleChangeEditPosition: (state: any, id: string, t: number) => void;
}
const DraggableAnnot: React.FC<Props> = (props: Props) => {
  const {
    data: {
      content = '',
      x = 0,
      y = 0,
      rotate = 0,
      size = 0,
      color = [],
      id = '',
      bold,
      italic,
      underline,
    },
    originalHeight = 0,
    onChange = () => {},
    setAddNoteItem = () => {},
    handleChangeEditPosition = () => {},
  } = props;
  const [focus, setFocus] = useState(false);
  const [width, setWidth] = useState(10);

  const ref = useRef(null);
  const t = ref.current;
  const span = useRef();

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      const el: any = ref.current;
      if (el && !el?.contains(event.target)) {
        setFocus(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    const spanValue: any = span.current;
    setWidth(spanValue?.offsetWidth);
  }, [content, focus]);
  return (
    <div className={styles.wrapper}>
      <Draggable
        defaultPosition={{ x: x, y: originalHeight - y }}
        onMouseDown={() => setAddNoteItem('1')}
        onStop={(e) => handleChangeEditPosition(e, id, t?.getBoundingClientRect().x)}
      >
        <div className={styles.innderText} ref={ref} onClick={() => setFocus(true)}>
          {focus ? (
            <div className={styles.grid}>
              <span className={styles.hide} style={{ fontSize: `${size}px` }} ref={span}>
                {content}
              </span>
              <input
                type="text"
                defaultValue={content}
                style={{
                  fontSize: `${size}px`,
                  transform: `rotate(${rotate}deg)`,
                  width: width + 5 + 'px',
                }}
                onChange={(e: any) => onChange(e, id)}
              />
            </div>
          ) : (
            <h3
              style={{
                fontSize: `${size}px`,
                transform: `rotate(${rotate}deg)`,
                color: `rgb(${color[0]},${color[1]}, ${color[2]})`,
                fontWeight: bold ? 700 : 500,
                fontStyle: italic ? 'italic' : 'normal',
                textDecoration: underline ? 'underline' : 'none',
              }}
            >
              {content}
            </h3>
          )}
        </div>
      </Draggable>
    </div>
  );
};

export default DraggableAnnot;
