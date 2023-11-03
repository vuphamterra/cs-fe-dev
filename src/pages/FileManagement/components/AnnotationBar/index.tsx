import React, { useState } from 'react';
import styles from './index.module.scss';
import { Button, ColorPicker, MenuProps, Select } from 'antd';
import { BoldOutlined, ItalicOutlined, UnderlineOutlined } from '@ant-design/icons';
import {
  PDFDocument,
  StandardFonts,
  drawText,
  rgb,
  degrees,
  PDFName,
  PDFString,
  PDFArray,
  PDFContext,
  PDFDict,
  PDFContentStream,
  drawLine,
  drawRectangle,
  popGraphicsState,
  setGraphicsState,
} from 'pdf-lib';
import ShapeSquare from '~/assets/images/shape-square.svg';
import ShapeCircle from '~/assets/images/shape-circle.svg';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { blobToURL } from '~/utils';
import { setFileBase64 } from '~/store/FileSlice';
interface Props {
  widthPdf: number;
  heightPdf: number;
  text: string;
  newAnnotText: any[];
  listAnnots: any[];
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  AnnotaionBarRef: any;
  addNoteItem: string;
  newAnnotHighlight: any[];
  setIsUnderline: (state: boolean) => void;
  setIsBold: (state: boolean) => void;
  setIsItalic: (state: boolean) => void;
  setPdf: (state: any) => void;
  handleChangeColorText: (color: any) => void;
  handleChangeBoldText: () => void;
  handleChangeItalicText: () => void;
  handleChangeUnderlineText: () => void;
  handleChangeSizeText: (state: any) => void;
  handleChangeOpacityHighlight: (state: number) => void;
  handleChangeColorHighlight: (state: any) => void;
  handleResetAddNew: () => void;
}

function AnnotationBar(props: Props) {
  const {
    widthPdf = 0,
    newAnnotText = [],
    heightPdf = 0,
    listAnnots = [],
    isBold = false,
    isItalic = false,
    isUnderline = false,
    AnnotaionBarRef = null,
    addNoteItem = '',
    newAnnotHighlight = [],
    setPdf = () => {},
    setIsUnderline = () => {},
    setIsItalic = () => {},
    setIsBold = () => {},
    handleResetAddNew = () => {},
    handleChangeBoldText = () => {},
    handleChangeColorText = () => {},
    handleChangeItalicText = () => {},
    handleChangeUnderlineText = () => {},
    handleChangeSizeText = () => {},
    handleChangeOpacityHighlight = () => {},
    handleChangeColorHighlight = () => {},
  } = props;
  const [fontStyle, setFontStyle] = useState('Courier');
  const fileBase64 = useAppSelector((s) => s.file.base64File);
  const dispatch = useAppDispatch();
  const createRectHighlight = async (page: any, context: PDFContext, font: any, params: any) => {
    const { x = 0, y = 0, id, color = [], opacity = 0, width = 0, height = 0 } = params;
    const newX = x;
    const newY = heightPdf - y - height;
    //
    const dict = context.obj({
      Type: 'XObject',
      Subtype: 'Form',
      FormType: 1,
    });
    const operators = [
      setGraphicsState('GS1'),
      ...drawRectangle({
        x: newX,
        y: newY,
        width,
        height,
        borderWidth: 0,
        color: rgb(color[0] / 255, color[1] / 255, color[2] / 255),
        borderColor: undefined,
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0),
      }),
    ];
    const extGState = page.doc.context.obj({
      GS1: { Type: 'ExtGState', ca: opacity, CA: opacity },
    });
    page.node.normalizedEntries().Resources.set(PDFName.of('ExtGState'), extGState);
    page.pushOperators(
      popGraphicsState(),
      // Push an operator that sets the graphics state to `GS1`
    );
    const stream = PDFContentStream.of(dict, operators, false);
    const streamRef = context.register(stream);
    const appearance = context.obj({ N: streamRef });

    const noteAnnotation = context.obj({
      Type: PDFName.of('Annots'),
      Subtype: PDFName.of('Rect'),

      color,
      id: PDFString.of(id),
      X: newX,
      Y: newY,
      width,
      height,
      Rotate: 0,
      CA: opacity,
      ca: opacity,
      AP: appearance,
    }) as PDFDict;

    const annots = page.node.lookup(PDFName.of('Annots'), PDFArray);
    annots.push(noteAnnotation);
  };

  const createFreeTextAnnotation = async (
    page: any,
    context: PDFContext,
    font: any,
    params: any,
  ) => {
    const {
      x = 0,
      y = 0,
      content = '',
      id,
      color = [],
      bold = false,
      italic = false,
      underline = false,
      size = 0,
    } = params;
    const newX = x;
    const newY = heightPdf - y;
    const newFont = fontStyle + checkNewFont(bold, italic, fontStyle);
    const fontkey = StandardFonts[newFont];
    const dict = context.obj({
      Type: 'XObject',
      Subtype: 'Form',
      FormType: 1,
      BBox: [0, 0, widthPdf, heightPdf],
      Resources: context.obj({
        Font: context.obj({
          [fontkey]: font.ref,
        }),
      }),
    });
    const widthText = font.widthOfTextAtSize(content, +size);
    let operators;
    if (underline) {
      operators = [
        ...drawText(font.encodeText(content), {
          color: rgb(color[0] / 255, color[1] / 255, color[2] / 255),
          font: fontkey,
          size: +size,
          rotate: degrees(0),
          xSkew: degrees(0),
          ySkew: degrees(0),
          x: newX,
          y: newY,
        }),
        ...drawLine({
          start: { x: newX, y: newY - 2 },
          end: { x: newX + widthText, y: newY - 2 },
          thickness: 0.6,
          color: rgb(0, 0, 0),
        }),
      ];
    } else {
      operators = [
        ...drawText(font.encodeText(content), {
          color: rgb(color[0] / 255, color[1] / 255, color[2] / 255),
          font: fontkey,
          size: +size,
          rotate: degrees(0),
          xSkew: degrees(0),
          ySkew: degrees(0),
          x: newX,
          y: newY,
        }),
      ];
    }

    const stream = PDFContentStream.of(dict, operators, false);
    // const test = context.contentStream(stream);
    const streamRef = context.register(stream);
    const appearance = context.obj({ N: streamRef });
    // const contentStream = context.register(
    //   context.contentStream(
    //     drawText(font.encodeText(content), {
    //       x: newX,
    //       y: newY,
    //       font: fontkey,
    //       size: +size,
    //       color: rgb(color[0] / 255, color[1] / 255, color[2] / 255),
    //       xSkew: degrees(0),
    //       ySkew: degrees(0),
    //       rotate: degrees(0),
    //     }),
    //   ),
    // );
    // const appearance = context.obj({ N: contentStream });

    const noteAnnotation = context.obj({
      Type: PDFName.of('Annots'),
      Subtype: PDFName.of('FreeText'),
      Contents: PDFString.of(content),
      Rect: [0, 0, 0 + widthPdf, heightPdf],
      // F: AnnotationFlags.NoZoom,
      color,
      Size: size,
      id: PDFString.of(id),
      X: newX,
      Y: newY,
      Rotate: 0,
      CA: 0.5,
      ca: 0.1,
      bold,
      italic,
      underline,
      // CA: 1,
      AP: appearance,
    }) as PDFDict;
    // const ref = appearance.values()[0];

    const annots = page.node.lookup(PDFName.of('Annots'), PDFArray);
    annots.push(noteAnnotation);
  };
  const listEditAnnot = () => {
    return listAnnots.filter((val: any) => val.edit === true);
  };
  const checkNewFont = (bold: boolean, italic: boolean, style: any) => {
    if (bold && !italic) {
      return 'Bold';
    } else if (italic && !bold) {
      return fontStyle === 'TimesRoman' ? 'Italic' : 'Oblique';
    } else if (italic && bold) {
      return fontStyle === 'TimesRoman' ? 'BoldItalic' : 'BoldOblique';
    } else {
      return '';
    }
  };
  const saveChangePDF = async () => {
    // const { originalHeight } = pageDetail;
    // const { layerX = 0, layerY = 0 } = position;
    // const newX = layerX - 30;
    // const newY = heightPdf - layerY;
    // const url = '../../fonts/Roboto-Regular.ttf';
    // const fontBytes = await fetch(url).then(async (res) => {
    //   const data = await res.arrayBuffer();
    //   return data;
    // });
    const pdfDoc = await PDFDocument.load(fileBase64, { ignoreEncryption: true });
    // pdfDoc.registerFontkit(fontkit);
    const newFont = fontStyle + checkNewFont(isBold, isItalic, fontStyle);
    const pdfFont = await pdfDoc.embedFont(StandardFonts[newFont]);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    // const context = firstPage.node.context;
    const removeEmptyContent = newAnnotText.filter((val: any) => val.content !== '');
    for (let i = 0; i < removeEmptyContent.length; i++) {
      await createFreeTextAnnotation(
        firstPage,
        firstPage.node.context,
        pdfFont,
        removeEmptyContent[i],
      );
    }
    for (let i = 0; i < newAnnotHighlight.length; i++) {
      await createRectHighlight(firstPage, firstPage.node.context, pdfFont, newAnnotHighlight[i]);
    }

    // firstPage.drawText('sfvc', {
    //   x: 40,
    //   y: 450,
    //   size: 20,
    //   font: pdfFont,
    //   color: rgb(0, 0.53, 0.71),
    // });

    if (listEditAnnot().length) {
      const editAnnot = listEditAnnot();
      console.log(editAnnot);
      for (let i = 0; i < editAnnot.length; i++) {
        if (editAnnot[i].type === 'text') {
          await createFreeTextAnnotation(firstPage, firstPage.node.context, pdfFont, editAnnot[i]);
        } else if (editAnnot[i].type === 'rect') {
          await createRectHighlight(firstPage, firstPage.node.context, pdfFont, editAnnot[i]);
        }
      }
      const existingAnnots = firstPage.node.Annots().asArray();
      // const removeOld = listEditAnnot().filter((val: any) => {
      //   existingAnnots.for;
      // });
      console.log([1, 2, 1, 2].lastIndexOf(2));

      const getAnnotId = existingAnnots.map((val: any, index: number) => {
        return Object.keys(val).includes('dict') ? extractId(val.entries()) : index;
      });

      const getEditAnnot = existingAnnots.filter((val: any, index: number) => {
        const dataId = Object.keys(val).includes('dict') && extractId(val.entries());
        return Object.keys(val).includes('dict') ? getAnnotId.lastIndexOf(dataId) === index : val;
      });

      const annots = [...getEditAnnot];
      firstPage.node.set(PDFName.of('Annots'), pdfDoc.context.obj(annots));
    }
    // const contentStream = firstPage.node.context.register(
    //   firstPage.node.context.contentStream(
    //     drawText(pdfFont.encodeText(text), {
    //       x: newX,
    //       y: newY,
    //       font: 'F0',
    //       size: 20,
    //       color: rgb(0, 0, 1),
    //       xSkew: degrees(0),
    //       ySkew: degrees(0),
    //       rotate: degrees(0),
    //     }),
    //   ),
    // );
    // const appearance = firstPage.node.context.obj({ N: contentStream });
    // const noteAnnotation = firstPage.node.context.obj({
    //   Type: PDFName.of('Annot'),
    //   Subtype: PDFName.of('FreeText'),
    //   color: 'rgb(0,0,1)',

    //   X: newX,
    //   Y: newY,
    //   Size: 20,
    //   Rotate: 0,
    //   // Open: false, // Is the annotation open by default?
    //   // Name: 'Note',
    //   // Rect: [100, firstPage.getHeight() / 2, 400, 400],
    //   // CA: 1,
    //   Contents: PDFString.of(text),
    //   // AP: pdfDoc.context.obj({ N: imageAppearanceStreamRef }),
    //   AP: appearance,
    // });

    // // firstPage.node.set(PDFName.of('Annots'), pdfDoc.context.obj([annotationRef, existAnnot[0]]));

    // annots.push(noteAnnotation);
    // console.log(annotationRef);

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    const blob: any = new Blob([new Uint8Array(pdfBytes)]);
    const URL = await blobToURL(blob);
    dispatch(setFileBase64(URL));
    handleResetAddNew();
    setPdf(URL);
  };

  const extractId = (array: any) => {
    let data;
    array.forEach(([key, t]) => {
      if (key.toString() === '/id') {
        data = t.value;
      }
    });
    return data;
  };
  const textControl = (
    <>
      <div className={styles.item}>
        <p>Text annotation</p>
      </div>
      <div className={styles.item}>
        <span>Font</span>
        <Select
          className={styles.selectItem}
          defaultValue="Courier"
          onChange={(e) => setFontStyle(e)}
          options={[
            { value: 'Courier', label: 'Courier' },
            { value: 'Helvetica', label: 'Helvetica' },
            { value: 'TimesRoman', label: 'Times Roman' },
            { value: 'ZapfDingbats', label: 'ZapfDingbats' },
          ]}
        />
      </div>
      <div className={styles.item}>
        <span>Size</span>
        <Select
          className={styles.selectItem}
          defaultValue={14}
          onChange={(e: number) => handleChangeSizeText(e)}
          options={[
            { value: 8, label: '8' },
            { value: 9, label: '9' },
            { value: 10, label: '10' },
            { value: 11, label: '11' },
            { value: 12, label: '12' },
            { value: 14, label: '14' },
            { value: 18, label: '18' },
            { value: 24, label: '24' },
            { value: 30, label: '30' },
            { value: 36, label: '36' },
            { value: 48, label: '48' },
            { value: 60, label: '60' },
          ]}
        />
      </div>
      <div className={styles.item}>
        {/* <Dropdown menu={{ items, selectable: true }} trigger={['hover']}>
            <Space className={styles.selectedItem}>
              <span className="color-palete color-1"></span>
              <DownOutlined />
            </Space>
          </Dropdown> */}
        <ColorPicker onChange={(e) => handleChangeColorText(e)} />
      </div>
      <div className={`${styles.item} ${styles.styleControl}`}>
        <div className={styles.styleText}>
          <BoldOutlined
            onClick={() => {
              handleChangeBoldText();
              setIsBold(!isBold);
            }}
            className={isBold ? 'style-text active' : 'style-text'}
          />
        </div>
        <div className={styles.styleText}>
          <ItalicOutlined
            className={isItalic ? 'style-text active' : 'style-text'}
            onClick={() => {
              setIsItalic(!isItalic);
              handleChangeItalicText();
            }}
          />
        </div>
        <div className={styles.styleText}>
          <UnderlineOutlined
            className={isUnderline ? 'style-text active' : 'style-text'}
            onClick={() => {
              setIsUnderline(!isUnderline);
              handleChangeUnderlineText();
            }}
          />
        </div>
      </div>
    </>
  );

  const shapeControl = (
    <>
      <div className={styles.item}>
        <p>Shape properties</p>
      </div>
      <div className={styles.item}>
        <Select
          className={styles.selectItem}
          defaultValue="Highlight"
          onChange={(e) => setFontStyle(e)}
          options={[
            { value: 'highlight', label: 'Highlight' },
            { value: 'redact', label: 'Redact' },
            { value: 'Custom', label: 'Custom' },
          ]}
        />
      </div>
      <div className={`${styles.item} ${styles.styleControl}`}>
        <div className={styles.shape}>
          <img src={ShapeSquare} alt="" />
        </div>
        <div className={styles.shape}>
          <img src={ShapeCircle} alt="" />
        </div>
      </div>
      <div className={styles.item}>
        <ColorPicker defaultValue={'#333'} onChange={(e) => handleChangeColorHighlight(e)} />
      </div>
      <div className={styles.item}>
        <span>Opacity</span>
        <Select
          className={styles.selectItem}
          defaultValue="0.5"
          onChange={(e) => handleChangeOpacityHighlight(+e)}
          options={[
            { value: '1', label: '100%' },
            { value: '0.9', label: '90%' },
            { value: '0.8', label: '80%' },
            { value: '0.7', label: '70%' },
            { value: '0.6', label: '60%' },
            { value: '0.5', label: '50%' },
            { value: '0.4', label: '40%' },
            { value: '0.3', label: '30%' },
            { value: '0.2', label: '20%' },
            { value: '0.1', label: '10%' },
          ]}
        />
      </div>
    </>
  );
  const renderControl = () => {
    switch (addNoteItem) {
      case '1':
        return textControl;
      case '3':
        return shapeControl;
      default:
        break;
    }
  };
  return (
    <div className={styles.AnnotationBar} ref={AnnotaionBarRef}>
      <div className={styles.annotationControl}>
        {renderControl()}
        <div className={`${styles.item} ${styles.buttonControl}`}>
          <Button className={styles.outlineButton} onClick={() => handleResetAddNew()}>
            Cancel
          </Button>
          <Button className={styles.fillButton} onClick={() => saveChangePDF()}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AnnotationBar;
