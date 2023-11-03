/* eslint-disable multiline-ternary */
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { Dropdown, Input, MenuProps, Skeleton } from 'antd';
import { useState } from 'react';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import {
  getFilesByFolder,
  rearrangeFile,
  setCurrentFile,
  streamFile,
  setCurrentFilePosition,
  duplicateFile
} from '~/store/FileSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import notification from '~/utils/notification';
import styles from './FileList.module.scss';
import { StrictModeDroppable } from './StrictModeDroppable';
import ModalCopyFileTo from '../../components/ModalCopyFileTo';

const FileList = () => {
  const dispatch = useAppDispatch();
  const files = useAppSelector((s) => s.file.files);
  const seletedFileId = useAppSelector((s) => s.file.currentFile?.id);
  const folderId = useAppSelector((s) => s.file.folderId);
  const loading = useAppSelector((s) => s.file.loadingList);
  const currentDrawer = useAppSelector((s) => s.draw.currentDrawer);

  const [editIndexFile, setEditIndexFile] = useState<boolean>(false);
  const [indexFile, setIndexFile] = useState<number>(1);
  const [isVisibleCopyFile, setIsVisibleCopyFile] = useState<boolean>(false);

  const [fileId, setFileId] = useState<number>(0);

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a onClick={() => onDuplicateFile()}>
          Duplicate File
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a onClick={() => onCopyTo()}>
          Copy File To
        </a>
      ),
    },
  ];

  const handleOnDragEnd = ({ destination, source }: DropResult) => {
    if (!destination) return;

    const newArr = [...files];
    const [reoderItem] = newArr.splice(source.index, 1);
    newArr.splice(destination.index, 0, reoderItem);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const orderData = newArr.map(({ thumbnail, name, ...data }) => data);
    const fileChangeIndex = newArr.filter((i) => i.order_no === source.index + 1)[0];
    dispatch(
      rearrangeFile({
        id: folderId,
        files: orderData.map((i, index) => [{ id: i.id, ordered: index + 1 }][0]),
      }),
    ).then(() => {
      dispatch(getFilesByFolder(folderId)).then(() => {
        dispatch(setCurrentFile(fileChangeIndex));
        dispatch(setCurrentFilePosition(destination.index + 1));
        dispatch(streamFile(fileChangeIndex.id));
      });
    });
  };

  const handleRearrangeFile = () => {
    const newArr = [...files];
    const fileChangeIndex = newArr.findIndex((i) => i.id === seletedFileId);
    const fileChange = newArr.splice(fileChangeIndex, 1)[0];
    if (indexFile < 1 || indexFile > files.length) {
      notification.error({
        message: 'Failed',
        description: 'Please input valid Index !',
      });
    } else {
      newArr.splice(indexFile - 1, 0, fileChange);
      const orderData = newArr.map((i, index) => [{ id: i.id, ordered: index }][0]);
      dispatch(
        rearrangeFile({
          id: folderId,
          files: orderData,
        }),
      ).then(() => {
        dispatch(getFilesByFolder(folderId)).then(() => {
          const file = files.filter((i) => i.id === seletedFileId)[0];
          dispatch(setCurrentFile(file));
          dispatch(streamFile(file.id));
          setEditIndexFile(false);
        });
      });
    }
  };

  const onRightClickMenuContex = (oderNo: number) => {
    setFileId(oderNo);
  };

  const onDuplicateFile = () => {
    dispatch(
      duplicateFile({
        fileId: seletedFileId
      }),
    ).then(() => {
      dispatch(getFilesByFolder(folderId));
    });
  };

  const onCopyTo = () => {
    setIsVisibleCopyFile(true);
  };

  return (
    <div className={styles.container}>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <StrictModeDroppable droppableId="files">
          {(provided) => (
            <ul className="fileList" {...provided.droppableProps} ref={provided.innerRef}>
              {files.map((file, index) => {
                return (
                  <Draggable key={file.id} draggableId={`${file.id}`} index={index}>
                    {(provided) => (
                      <Dropdown menu={{ items }} trigger={['contextMenu']}>
                        <li
                          onContextMenu={() => onRightClickMenuContex(file.id)}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={async () => {
                            dispatch(setCurrentFile(file));
                            setIndexFile(index + 1);
                          }}
                        >
                          <div
                            className={`${styles.thumbContainer} ${seletedFileId === file.id ? styles.selected : ''
                              }`}
                          >
                            {loading ? (
                              <Skeleton.Image active />
                            ) : (
                              <img
                                src={`data:image/png;base64,${file.thumbnail}`}
                                alt=""
                                onClick={() => {
                                  setEditIndexFile(false);
                                  dispatch(setCurrentFile(file));
                                  dispatch(setCurrentFilePosition(index + 1));
                                  setIndexFile(index + 1);
                                }}
                              />
                            )}
                          </div>
                          {seletedFileId === file.id ? (
                            <div className={styles.edit_index_file}>
                              {editIndexFile ? (
                                <>
                                  <Input
                                    size="small"
                                    value={indexFile}
                                    onChange={(e) => setIndexFile(parseInt(e.target.value))}
                                    type="number"
                                    style={{ width: 44 }}
                                    disabled={loading}
                                    onPressEnter={() => handleRearrangeFile()}
                                  />
                                  <CheckCircleOutlined
                                    onClick={() => handleRearrangeFile()}
                                    disabled={loading}
                                    style={{ color: 'green' }}
                                  />
                                  <CloseCircleOutlined
                                    onClick={() => setEditIndexFile(false)}
                                    disabled={loading}
                                    style={{ color: 'red' }}
                                  />
                                </>
                              ) : (
                                <>
                                  <p>{index + 1}</p>
                                  <EditOutlined onClick={() => setEditIndexFile(true)} />
                                </>
                              )}
                            </div>
                          ) : (
                            <p>{index + 1}</p>
                          )}
                        </li>
                      </Dropdown>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </ul>
          )}
        </StrictModeDroppable>
      </DragDropContext>
      <ModalCopyFileTo
        setVisible={setIsVisibleCopyFile}
        visible={isVisibleCopyFile}
        fileId={fileId}
      />
    </div>
  );
};

export default FileList;
