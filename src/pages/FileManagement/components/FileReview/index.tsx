/* eslint-disable multiline-ternary */
/* eslint-disable no-undef */
import { Empty, Select, Spin, Tooltip } from 'antd';
import React, { memo, useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack5';
import { PDFDocument, PDFName, PDFArray, PDFDict } from 'pdf-lib';
import ArrowDownIcon from '~/assets/images/fileManagement/ic_arrow_down.svg';
import ClockWiseIcon from '~/assets/images/fileManagement/ic_clock_wise.svg';
import CounterClockWiseIcon from '~/assets/images/fileManagement/ic_counter_clock.svg';
import FileListIcon from '~/assets/images/fileManagement/ic_file_list.svg';
import MinusIcon from '~/assets/images/fileManagement/ic_minus.svg';
import PlusIcon from '~/assets/images/fileManagement/ic_plus.svg';
import ArrowUpIcon from '~/assets/images/fileManagement/ic_up_arrow.svg';
import { getFolderDetail, setFileRemoveAnnoteString, streamFile } from '~/store/FileSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import styles from './FileReview.module.scss';
import { useNavigate } from 'react-router-dom';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import AnnotationBar from '../AnnotationBar';
import DraggableTextInput from './components/DraggableTextInput';
import DraggableAnnot from './components/DraggableAnnot';
import { blobToURL } from '~/utils';
import DraggableHighlight from './components/DraggableHighlight';
import DraggableExistHighlight from './components/DraggableExistHighlight';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const { Option } = Select;
interface Props {
  fileList: any;
  addNoteItem: string;
  pdf?: any;
  setPdf: any;
  newAnnotText: any[];
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  newAnnotHighlight: any[];
  setExpandSidebar: (value: any) => void;
  setAddNoteItem: (state: string) => void;
  setNewAnnotText: (state: any[]) => void;
  setIsBold: (state: boolean) => void;
  setIsItalic: (state: boolean) => void;
  setIsUnderline: (state: boolean) => void;
  setNewAnnotHighlight: (state: any[]) => void;
}

interface SizeList {
  label: string;
  value: number;
}

interface SizeLists extends Array<SizeList> {}
const PER_TOVIEW = 5;
const FileReview: React.FC<Props> = (props) => {
  const navigate = useNavigate();
  const {
    setExpandSidebar,
    addNoteItem = '',
    setPdf,
    isBold = false,
    isItalic = false,
    isUnderline = false,
    newAnnotText = [],
    newAnnotHighlight = [],
    setIsUnderline = () => {},
    setAddNoteItem = () => {},
    setNewAnnotText = () => {},
    setIsBold = () => {},
    setIsItalic = () => {},
    setNewAnnotHighlight = () => {},
  } = props;
  const [size, setSize] = useState<number>(1);
  const [degree, setDegree] = useState<number>(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [widthPdf, setWidthPdf] = useState(0);
  const [heightPdf, setHeightPdf] = useState(0);
  const [position, setPosition] = useState(null);
  const [inputId, setInputId] = useState('');
  const [listAnnots, setListAnnots] = useState([]);
  const [breakList, setBreakList] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(1);

  const [loadingNewPage, setLoadingNewPage] = useState(false);

  const [text, setText] = useState('');

  const dispatch = useAppDispatch();
  const fileList = useAppSelector((s) => s.file.files);
  const folderId = useAppSelector((s) => s.file.folderId);
  const loading = useAppSelector((s) => s.file.loading);
  const seletedFileId = useAppSelector((s) => s.file.currentFile?.id);
  const currentFile = useAppSelector((s) => s.file?.currentFile);
  const fileStream = useAppSelector((s) => s.file.streamFile);
  const fileBase64 = useAppSelector((s) => s.file.base64File);
  const fileRemoveAnnoteString = useAppSelector((s) => s.file.fileRemoveAnnoteString);

  const pdfFile = currentFile?.name?.includes('.pdf');
  const element = document.getElementById(`page-${pageNumber}`);
  const documentRef = useRef(null);
  const AnnotaionBarRef = useRef(null);
  const scrollContainer = useRef();

  useEffect(() => {
    if (currentFile) {
      setExpandSidebar(true);
    }
  }, []);

  useEffect(() => {
    if (seletedFileId) {
      dispatch(streamFile(seletedFileId));
    }
    if (folderId !== null) {
      dispatch(getFolderDetail(folderId));
    }
    setDegree(0);
    setSize(1);
    setPageLoaded(1);
    setBreakList(1);
    setNumPages(1);
  }, [seletedFileId]);

  useEffect(() => {
    const removeAnnot = async (pdfData: any) => {
      const pdfDoc = await PDFDocument.load(pdfData, { ignoreEncryption: true });
      const pdfPage = pdfDoc.getPage(0);

      if (pdfPage.node.Annots()) {
        const existingAnnots = pdfPage.node.Annots().asArray();

        const array = [];
        existingAnnots.forEach((v: any) => {
          if (!Object.keys(v).includes('dict')) {
            array.push(v);
          }
        });
        pdfPage.node.set(PDFName.of('Annots'), pdfDoc.context.obj([...array]));
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        const blob: any = new Blob([new Uint8Array(pdfBytes)]);
        const URL = await blobToURL(blob);
        dispatch(setFileRemoveAnnoteString(URL));
      } else {
        dispatch(setFileRemoveAnnoteString('data:application/octet-stream;base64,' + pdfData));
      }
    };
    removeAnnot(fileBase64);
    setNewAnnotText([]);
  }, [fileBase64]);

  useEffect(() => {
    if (element) {
      element.scrollIntoView();
    }
  }, [element]);

  const sizeList: SizeLists = [
    { label: '50', value: 0.5 },
    { label: '75', value: 0.75 },
    { label: '100', value: 1 },
    { label: '125', value: 1.25 },
    { label: '150', value: 1.5 },
    { label: '175', value: 1.75 },
    { label: '200', value: 2 },
  ];

  const plusSize = () => {
    if (size === 2) return false;
    setSize((state) => (state += 0.25));
  };

  const minusSize = () => {
    if (size === 0.5) return false;
    setSize((state) => (state -= 0.25));
  };

  const nextPage = () => {
    if (pageNumber === numPages) return false;
    setPageNumber((state) => state + 1);
  };

  const previousPage = () => {
    if (pageNumber === 1) return false;
    setPageNumber((state) => state - 1);
  };

  const clockWiseRotate = () => {
    if (degree === 270) {
      setDegree(0);
    } else {
      setDegree((prev) => prev + 90);
    }
  };

  const counterClockWiseRotate = () => {
    if (degree < 0) {
      setDegree(270 + degree);
    } else {
      setDegree((prev) => prev - 90);
    }
  };

  const expandFileList = () => {
    navigate('/folder-management/folder-details/files');
  };

  const empty = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Empty description={<strong>File not found</strong>} />
    </div>
  );

  const extractData = (dicts: any, type: string) => {
    if (type === '/FreeText') {
      const { value: contentValue } = dicts.lookup(PDFName.of('Contents')) || '';
      const { numberValue: rotateValue } = dicts.lookup(PDFName.of('Rotate')) || 0;
      const { numberValue: sizeValue } = dicts.lookup(PDFName.of('Size')) || 20;
      const { numberValue: xValue } = dicts.lookup(PDFName.of('X')) || 0;
      const { numberValue: yValue } = dicts.lookup(PDFName.of('Y')) || 0;
      const { value: idValue } = dicts.lookup(PDFName.of('id')) || 0;
      const { value: boldValue } = dicts.lookup(PDFName.of('bold')) || 0;
      const { value: italicValue } = dicts.lookup(PDFName.of('italic')) || 0;
      // const { numberValue:  } = dicts.lookup(PDFName.of('Color')) || 0;
      let colorArray;
      if (dicts?.lookup(PDFName.of('color'))) {
        colorArray = dicts
          ?.lookup(PDFName.of('color'))
          ?.asArray()
          ?.map((val: any) => val.numberValue) || [0, 0, 0];
      }
      return {
        content: contentValue,
        rotate: rotateValue,
        size: sizeValue,
        x: xValue,
        y: yValue,
        id: idValue,
        color: colorArray,
        bold: boldValue,
        italic: italicValue,
        type: 'text',
      };
    }
    if (type === '/Rect') {
      const { numberValue: xValue } = dicts.lookup(PDFName.of('X')) || 0;
      const { numberValue: yValue } = dicts.lookup(PDFName.of('Y')) || 0;
      const { value: idValue } = dicts.lookup(PDFName.of('id')) || 0;
      const { numberValue: widthValue } = dicts.lookup(PDFName.of('width')) || 0;
      const { numberValue: heightValue } = dicts.lookup(PDFName.of('height')) || 0;
      const { numberValue: opacityValue } = dicts.lookup(PDFName.of('CA')) || 0;
      let colorArray;
      if (dicts?.lookup(PDFName.of('color'))) {
        colorArray = dicts
          ?.lookup(PDFName.of('color'))
          ?.asArray()
          ?.map((val: any) => val.numberValue) || [0, 0, 0];
      }
      return {
        type: 'rect',
        x: xValue,
        y: yValue,
        id: idValue,
        color: colorArray,
        width: widthValue,
        height: heightValue,
        opacity: opacityValue,
      };
    }
  };
  // get exist annots
  const importExistAnnot = async (pdfData: any) => {
    const pdfDoc = await PDFDocument.load(pdfData, { ignoreEncryption: true });
    const pdfPage = pdfDoc.getPage(0);
    // const annots = [...existingAnnots];
    const arrayAnnot = [];
    const existingAnnotations = pdfPage.node.Annots();
    const size = existingAnnotations?.size();
    // const existingAnnots1 = pdfPage.node.Annots().asArray();
    // pdfPage.node.set(PDFName.of('Annots'), pdfDoc.context.obj([]));

    if (size) {
      for (let i = 0; i < size; i++) {
        const dicts: any = pdfPage.node.lookup(PDFName.of('Annots'), PDFArray).lookup(i, PDFDict);
        const type = dicts.lookup(PDFName.of('Subtype'));
        const { encodedName = '' } = type;
        // find data
        const obj = extractData(dicts, encodedName) || {};
        !Object.values(obj).includes(undefined) && arrayAnnot.push(obj);
      }
    }
    return arrayAnnot;
  };

  const handleChangeText = (e: any, index: string) => {
    const { value = '' } = e.target;
    const data = listAnnots.find((val: any) => val.id === index);
    const newData = { ...data, content: value, edit: true, type: 'text' };
    const newArray = listAnnots.map((val: any) => {
      return val.id === index ? newData : val;
    });
    setListAnnots(newArray);
  };
  const handleChangeNewText = (e: any, index: string) => {
    const { value = '' } = e.target;
    const data = newAnnotText.find((val: any) => val.id === index);
    const newData = { ...data, content: value };

    const newArray = newAnnotText.map((val: any) => {
      return val.id === index ? newData : val;
    });
    setNewAnnotText(newArray);
  };
  const handleChangeColorText = (e: any) => {
    const colorRgb = e.toRgb();
    const { r = 0, g = 0, b = 0 } = colorRgb;
    const editExistText = listAnnots.find((val: any) => val.id === inputId);
    const list = editExistText ? listAnnots : newAnnotText;
    const data = list.find((val: any) => val.id === inputId);
    const newData = { ...data, color: [r, g, b] };
    const newArray = list.map((val: any) => {
      return val.id === inputId ? newData : val;
    });

    editExistText ? setListAnnots(newArray) : setNewAnnotText(newArray);
  };

  const handleChangePosition = (val: any, index: string, t: number) => {
    const { layerY = 0 } = val;
    const docRef = documentRef.current || 0;
    const docWidth = docRef.getBoundingClientRect().x;
    setInputId(index);
    const newX = t - docWidth;

    const data = newAnnotText.find((val: any) => val.id === index);
    const newData = { ...data, x: newX, y: layerY };
    const newArray = newAnnotText.map((val: any) => {
      return val.id === index ? newData : val;
    });
    setNewAnnotText(newArray);
  };
  const handleChangeEditPosition = (val: any, index: string, t: number) => {
    const { layerY = 0 } = val;
    const docRef = documentRef.current || 0;
    const docWidth = docRef.getBoundingClientRect().x;
    setInputId(index);
    const newX = t - docWidth;

    const data = listAnnots.find((val: any) => val.id === index);
    const newData = { ...data, x: newX, y: layerY, edit: true };
    const newArray = listAnnots.map((val: any) => {
      return val.id === index ? newData : val;
    });
    setListAnnots(newArray);
  };
  const handleChangeBoldText = () => {
    const editExistText = listAnnots.find((val: any) => val.id === inputId);
    const list = editExistText ? listAnnots : newAnnotText;

    const data = list.find((val: any) => val.id === inputId);
    const newData = { ...data, bold: !data.bold };
    const newArray = list.map((val: any) => {
      return val.id === inputId ? newData : val;
    });
    editExistText ? setListAnnots(newArray) : setNewAnnotText(newArray);
  };
  const handleChangeSizeText = (e: any) => {
    const editExistText = listAnnots.find((val: any) => val.id === inputId);
    const list = editExistText ? listAnnots : newAnnotText;

    const data = list.find((val: any) => val.id === inputId);
    const newData = { ...data, size: e };
    const newArray = list.map((val: any) => {
      return val.id === inputId ? newData : val;
    });
    editExistText ? setListAnnots(newArray) : setNewAnnotText(newArray);
  };
  const handleChangeItalicText = () => {
    const editExistText = listAnnots.find((val: any) => val.id === inputId);

    const list = editExistText ? listAnnots : newAnnotText;

    const data = list.find((val: any) => val.id === inputId);
    const newData = { ...data, italic: !data.italic };
    const newArray = list.map((val: any) => {
      return val.id === inputId ? newData : val;
    });
    editExistText ? setListAnnots(newArray) : setNewAnnotText(newArray);
  };

  const handleChangeUnderlineText = () => {
    const editExistText = listAnnots.find((val: any) => val.id === inputId);
    const list = editExistText ? listAnnots : newAnnotText;

    const data = list.find((val: any) => val.id === inputId);
    const newData = { ...data, underline: !data.underline };
    const newArray = list.map((val: any) => {
      return val.id === inputId ? newData : val;
    });
    editExistText ? setListAnnots(newArray) : setNewAnnotText(newArray);
  };

  const handleChangeReSizeHighlight = (id: string, width: number, height: number) => {
    const editExistHightLight = listAnnots.find((val: any) => val.id === inputId);
    const list = editExistHightLight ? listAnnots : newAnnotHighlight;

    const data = list.find((val: any) => val.id === id);
    const newData = { ...data, width, height };
    const newArray = list.map((val: any) => {
      return val.id === id ? newData : val;
    });
    editExistHightLight ? setListAnnots(newArray) : setNewAnnotHighlight(newArray);
  };
  const handleChangePositionHighlight = (id: string, x: number, y: number) => {
    setInputId(id);

    const data = newAnnotHighlight.find((val: any) => val.id === id);
    const newData = { ...data, x, y };
    const newArray = newAnnotHighlight.map((val: any) => {
      return val.id === id ? newData : val;
    });
    setNewAnnotHighlight(newArray);
  };

  const handleChangeOpacityHighlight = (opacity: number) => {
    const editExistHightLight = listAnnots.find((val: any) => val.id === inputId);
    const list = editExistHightLight ? listAnnots : newAnnotHighlight;

    const data = list.find((val: any) => val.id === inputId);
    const newData = { ...data, opacity };
    const newArray = list.map((val: any) => {
      return val.id === inputId ? newData : val;
    });
    editExistHightLight ? setListAnnots(newArray) : setNewAnnotHighlight(newArray);
  };

  const handleChangeColorHighlight = (e: any) => {
    const editExistHightLight = listAnnots.find((val: any) => val.id === inputId);
    const list = editExistHightLight ? listAnnots : newAnnotHighlight;
    const colorRgb = e.toRgb();
    const { r = 0, g = 0, b = 0 } = colorRgb;
    const data = list.find((val: any) => val.id === inputId);
    const newData = { ...data, color: [r, g, b] };
    const newArray = list.map((val: any) => {
      return val.id === inputId ? newData : val;
    });
    editExistHightLight ? setListAnnots(newArray) : setNewAnnotHighlight(newArray);
  };

  const handleChangeEditPositionHighlight = (val: any, index: string) => {
    const { x = 0, y = 0 } = val;
    setInputId(index);

    const data = listAnnots.find((val: any) => val.id === index);
    const newData = { ...data, x, y, edit: true, type: 'rect' };
    const newArray = listAnnots.map((val: any) => {
      return val.id === index ? newData : val;
    });
    setListAnnots(newArray);
  };

  const renderExistAnnot = () => {
    return listAnnots.map((val: any, index: number) => {
      const { type = '' } = val;
      return type === 'text' ? (
        <DraggableAnnot
          data={val}
          originalHeight={heightPdf}
          key={index}
          onChange={handleChangeText}
          handleChangeEditPosition={handleChangeEditPosition}
          setAddNoteItem={setAddNoteItem}
        />
      ) : type === 'rect' ? (
        <DraggableExistHighlight
          data={val}
          heightPdf={heightPdf}
          setAddNoteItem={setAddNoteItem}
          handleChangeEditPositionHighlight={handleChangeEditPositionHighlight}
          handleChangeReSizeHighlight={handleChangeReSizeHighlight}
        />
      ) : (
        <></>
      );
    });
  };
  const handleResetAddNew = () => {
    setNewAnnotText([]);
    setNewAnnotHighlight([]);
    setListAnnots([]);
    setAddNoteItem(null);
  };
  const pdfFiles = new Array(numPages).fill(0).map((_e, index) => index + 1);
  // const stylesWidth: any = { '--width-var-pdf': `${widthPdf}px` };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleScroll = (e: any) => {
    const r: any = scrollContainer.current;
    const y = r?.scrollTop - 8;
    const heightCheck =
      Math.abs(degree) === 90 || Math.abs(degree) === 270 ? widthPdf * size : heightPdf * size;
    const numberPage =
      size < 1
        ? Math.ceil((y * numPages) / (heightCheck * numPages)) + 1
        : Math.round((y * numPages) / (heightCheck * numPages)) + 1;

    // break each time load 5 item
    const breakNumber = Math.ceil(numberPage / PER_TOVIEW);
    setScrollY(y);
    if (numberPage > pageLoaded) {
      setPageLoaded(numberPage);
    }
    if (y > scrollY && numberPage >= pageLoaded) {
      if (numberPage === breakNumber * PER_TOVIEW) {
        setLoadingNewPage(true);
        setTimeout(() => {
          setBreakList((prev) => prev + 1);
          setLoadingNewPage(false);
        }, 1000);
      } else {
        setBreakList(breakNumber);
      }
    }

    setPageNumber(numberPage);
  };
  const pageToLoad = (totalPage: number) => {
    if (totalPage >= PER_TOVIEW && breakList * PER_TOVIEW - totalPage < 0) {
      return breakList * PER_TOVIEW;
    } else if (breakList * PER_TOVIEW - totalPage >= 0) {
      return breakList * PER_TOVIEW - (breakList * PER_TOVIEW - totalPage);
    } else {
      return totalPage;
    }
  };

  // Lazy load pdf
  const renderPagePdf = () => {
    const loadPages = pageToLoad(numPages);
    const pdfRender = new Array(loadPages).fill(0).map((_e, index) => index + 1);
    return pdfRender.map((index) => (
      <div key={index} id={`page-${index}`}>
        <Page
          className={styles.page}
          pageNumber={index}
          noData={fileRemoveAnnoteString === null ? 'No PDF file specified.' : ''}
          renderAnnotationLayer={false}
          renderTextLayer={true}
          scale={size}
          loading={'Loading...'}
          key={index}
          onLoadSuccess={async (data) => {
            // setTest(fileStream);
            const { originalWidth = 0, originalHeight = 0 } = data;
            setWidthPdf(originalWidth);
            setHeightPdf(originalHeight);
            const listAnnot = await importExistAnnot(fileBase64);
            setListAnnots(listAnnot);
            setPdf(fileBase64);
          }}
        />
      </div>
    ));
  };

  return (
    <>
      {addNoteItem && (
        <AnnotationBar
          widthPdf={widthPdf}
          heightPdf={heightPdf}
          text={text}
          setPdf={setPdf}
          newAnnotText={newAnnotText}
          listAnnots={listAnnots}
          handleChangeColorText={handleChangeColorText}
          setIsBold={setIsBold}
          isBold={isBold}
          setIsItalic={setIsItalic}
          isItalic={isItalic}
          isUnderline={isUnderline}
          setIsUnderline={setIsUnderline}
          handleChangeBoldText={handleChangeBoldText}
          handleChangeItalicText={handleChangeItalicText}
          handleChangeUnderlineText={handleChangeUnderlineText}
          handleChangeSizeText={handleChangeSizeText}
          AnnotaionBarRef={AnnotaionBarRef}
          addNoteItem={addNoteItem}
          newAnnotHighlight={newAnnotHighlight}
          handleChangeOpacityHighlight={handleChangeOpacityHighlight}
          handleChangeColorHighlight={handleChangeColorHighlight}
          handleResetAddNew={handleResetAddNew}
        />
      )}
      <div className={styles.file_review_sec}>
        <Spin spinning={loading} className={styles.loading_content}>
          <div className={styles.file_content}>
            <div
              className={styles.view_file_box}
              onScroll={(e) => handleScroll(e)}
              ref={scrollContainer}
            >
              {fileList.length === 0 ? (
                empty
              ) : pdfFile ? (
                <div id="contentBox" className={styles.view_pdf}>
                  <div className={styles.innerContent} ref={documentRef}>
                    {listAnnots.length ? renderExistAnnot() : <></>}
                    {addNoteItem === '1' && newAnnotText.length ? (
                      newAnnotText.map((val: any, index: number) => {
                        return (
                          <DraggableTextInput
                            setText={setText}
                            setPosition={setPosition}
                            position={position}
                            heightPdf={heightPdf}
                            setAddNoteItem={setAddNoteItem}
                            handleChangeNewText={handleChangeNewText}
                            key={index}
                            data={val}
                            handleChangePosition={handleChangePosition}
                            AnnotaionBarRef={AnnotaionBarRef}
                          />
                        );
                      })
                    ) : addNoteItem === '3' && newAnnotHighlight.length ? (
                      newAnnotHighlight.map((val: any, i: number) => (
                        <DraggableHighlight
                          data={val}
                          key={i}
                          handleChangeReSizeHighlight={handleChangeReSizeHighlight}
                          handleChangePositionHighlight={handleChangePositionHighlight}
                        />
                      ))
                    ) : (
                      <></>
                    )}
                    <Document
                      className={styles.document}
                      rotate={degree}
                      file={fileRemoveAnnoteString}
                      onLoadSuccess={async ({ numPages }) => {
                        setNumPages(numPages);
                      }}
                      renderMode="svg"
                      onLoadError={(err) => console.log(err)}
                      key={fileRemoveAnnoteString}
                    >
                      {Array(pdfFiles) && renderPagePdf()}
                      {loadingNewPage && <Spin />}
                    </Document>
                  </div>
                </div>
              ) : (
                <div
                  className={styles.view_img}
                  style={{ transformOrigin: '50% 0%', transform: `scale(${size})` }}
                >
                  <img
                    style={{
                      transform: ` rotate(${degree}deg)`,
                    }}
                    src={fileStream}
                    alt="image"
                  />
                </div>
              )}
            </div>
          </div>
        </Spin>

        <div className={styles.toolbar}>
          <div className={styles.block}>
            <Tooltip title="Zoom Out" color="#000000">
              <img
                onClick={minusSize}
                src={MinusIcon as any}
                alt="icon"
                className={size === 0.5 ? 'notAllow' : null}
              />
            </Tooltip>
            <Select value={size} style={{ width: 80 }} onChange={(val) => setSize(val)}>
              {sizeList.map((item) => {
                return (
                  <Option value={item.value} key={item.label}>
                    {item.label}%
                  </Option>
                );
              })}
            </Select>
            <Tooltip title="Zoom In" color="#000000">
              <img
                className={size === 2 ? 'notAllow' : null}
                onClick={plusSize}
                src={PlusIcon as any}
                alt="icon"
              />
            </Tooltip>
          </div>
          <div className={styles.block}>
            <Tooltip title="Rotate Left" color="#000000">
              <img onClick={clockWiseRotate} src={ClockWiseIcon as any} alt="icon" />
            </Tooltip>
            <Tooltip title="Rotate Right" color="#000000">
              <img onClick={counterClockWiseRotate} src={CounterClockWiseIcon as any} alt="icon" />
            </Tooltip>
            {/* <FullScreenIcon /> */}
          </div>
          <div className={styles.block}>
            <Tooltip title="Previous Page" color="#000000">
              <img onClick={previousPage} src={ArrowUpIcon as any} alt="icon" />
            </Tooltip>
            <div style={{ userSelect: 'none' }} className={styles.page}>
              Page {pdfFile && pageNumber <= numPages ? pageNumber : numPages} of{' '}
              {pdfFile ? numPages : 1}
            </div>
            <Tooltip title="Next Page" color="#000000">
              <img onClick={nextPage} src={ArrowDownIcon as any} alt="icon" />
            </Tooltip>
            <Tooltip title="Show all files" color="#000000">
              <img onClick={expandFileList} src={FileListIcon as any} alt="icon" />
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(FileReview);
