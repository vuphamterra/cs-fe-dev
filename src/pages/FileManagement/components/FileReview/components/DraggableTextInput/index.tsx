import { useState, useRef, useEffect } from 'react';
import styles from './index.module.scss';
import Draggable from 'react-draggable';
interface Props {
  setPosition: (state: any) => void;
  heightPdf: number;
  AnnotaionBarRef: any;
  setText: (state: string) => void;
  setAddNoteItem: (state: string) => void;
  handleChangeNewText: (text: any, id: string) => void;
  handleChangePosition: (position: any, index: string, t: number) => void;
  position: any;
  data: {
    color: any[];
    content: string;
    id: string;
    bold: boolean;
    italic: boolean;
    size: number;
    underline: boolean;
  };
}
function DraggableTextInput(props: Props) {
  const {
    setPosition = () => {},
    position = {},
    heightPdf = 0,
    handleChangeNewText = () => {},
    handleChangePosition = () => {},
    AnnotaionBarRef = null,
    data: {
      id: uid = '',
      content: text = '',
      color = [],
      bold = false,
      italic = false,
      size = 0,
      underline = false,
    },
  } = props;
  const [focus, setFocus] = useState(true);
  const [editText, setEditText] = useState(false);
  const [width, setWidth] = useState(10);
  const inputRef = useRef(null);
  const t = inputRef.current;
  const span = useRef();
  useEffect(() => {
    // console.log(t.getBoundingClientRect().x);
    const handleClickOutside = (event: any) => {
      const el: any = inputRef.current;
      const elBar: any = AnnotaionBarRef.current;

      if (el && !el?.contains(event.target) && !elBar.contains(event.target)) {
        setFocus(false);
        // setAddNoteItem(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputRef, position]);

  useEffect(() => {
    const spanValue: any = span.current;
    setWidth(spanValue.offsetWidth);
  }, [text]);
  return (
    <>
      <div className={styles.wrapperNote}>
        <Draggable onDrag={(e) => handleChangePosition(e, uid, t?.getBoundingClientRect().x)}>
          <div className={styles.innerText} ref={inputRef} onClick={() => setFocus(true)}>
            {focus ? (
              <div className={styles.grid}>
                <span className={styles.hide} ref={span}>
                  {text}
                </span>
                <input
                  value={text}
                  style={{ width: width + 5 + 'px' }}
                  autoFocus
                  // placeholder="Add Sample Text"
                  onChange={(e) => handleChangeNewText(e, uid)}
                />
              </div>
            ) : (
              <h3
                style={{
                  // position: 'absolute',
                  // left: position.layerX - 30,
                  // top: position.layerY,
                  // zIndex: 10,
                  // cursor: 'pointer',
                  textDecoration: underline ? 'underline' : 'none',
                  fontSize: size + 'px',
                  fontWeight: bold ? 700 : 500,
                  fontStyle: italic ? 'italic' : 'normal',
                  color: `rgb(${color[0]},${color[1]},${color[2]})`,
                }}
                className={styles.tempAddnote}
              >
                {text}
              </h3>
            )}
          </div>
        </Draggable>
      </div>
    </>
  );
}

export default DraggableTextInput;
