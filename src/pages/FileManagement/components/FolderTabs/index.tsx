/* eslint-disable no-redeclare */
import { Tabs, MenuProps, Dropdown } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFilesByFolder, getFolderDetail, setCurrentFolderId } from '~/store/FileSlice';
import { FolderOpenOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import styles from './FolderTabs.module.scss';
import { truncate } from 'lodash';
import { updateSelectedFolders } from '~/store/FolderSlice';

let tabs = [];
let tabKey = '';

const FolderTabs = () => {
  const { selectedFolders, folders } = useAppSelector((store) => store.folder);
  const { drawers, currentDrawer } = useAppSelector((store) => store.draw);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState<string>(`${selectedFolders[0]}`);
  // const [tabKey, setTabKey] = useState<string>('');
  const [isRightClick, setIsRightClick] = useState<boolean>(false);

  useEffect(() => {
    if (selectedTab) {
      dispatch(getFilesByFolder(parseInt(selectedTab)));
    }
  }, [selectedTab]);

  useEffect(() => {
    if (selectedFolders.length === 0) {
      navigate('/folder-management');
    } else {
      tabs =
        selectedFolders
          .map((item) => item)
          .map((item) => {
            return {
              key: `${item}`,
              label: (
                <Dropdown menu={{ items }} trigger={['contextMenu']} >
                  <div id={item.toString()} style={{ height: '100%', width: '100%', alignItems: 'center', padding: '10px' }} >
                    {`${truncate(drawers.filter((i) => i.id === currentDrawer.id)[0].name, {
                      length: 18,
                    })}-Folder-${(folders.filter((i) => i.csId === item))[0]?.csId || 1}`}
                  </div>
                </Dropdown>
              ),
              closable: true,
            };
          });
      setSelectedTab(`${selectedFolders[0]}`);
    }
  }, [selectedFolders]);

  const onRightClickMenuContex = (e: any) => {
    tabKey = e.target.id;
    setIsRightClick(true);
  };

  const onSelectMenuContex = (id: number) => {
    switch (id) {
      case 1:
        onCloseTab(tabKey);
        break;

      case 2:
        dispatch(updateSelectedFolders([]));
        break;

      default:
        onCloseTabsButThis(tabKey);
        break;
    }
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a onClick={() => onSelectMenuContex(1)}>
          Close Current Tab
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a onClick={() => onSelectMenuContex(2)}>
          Close All Tabs
        </a>
      ),
      disabled: selectedFolders.length > 1 ? false : true
    },
    {
      key: '3',
      label: (
        <a onClick={() => onSelectMenuContex(3)}>
          Close All But This
        </a>
      ),
      disabled: selectedFolders.length > 1 ? false : true
    },
  ];

  const onCloseTab = (key: string) => {
    const filteredItems = tabs.filter((item) => item.key !== key);
    tabs = filteredItems.map((item) => ({ ...item, closable: filteredItems.length > 1 }));
    console.log(selectedTab);
    dispatch(updateSelectedFolders(filteredItems.map((i) => parseInt(i.key))));
    if (selectedTab === key) {
      setSelectedTab(filteredItems[0].key);
    }
  };

  const onCloseTabsButThis = (key: string) => {
    const filteredItems = tabs.filter((item) => item.key === key);
    tabs = filteredItems.map((item) => ({ ...item, closable: filteredItems.length > 1 }));
    console.log(selectedTab);
    dispatch(updateSelectedFolders(filteredItems.map((i) => parseInt(i.key))));
    if (selectedTab === key) {
      setSelectedTab(filteredItems[0].key);
    }
  };

  const onChangeHandler = (key: any) => {
    if (isRightClick) {
      setIsRightClick(false);
      return;
    }
    navigate('/folder-management/folder-details/files');
    setSelectedTab(key);
    dispatch(setCurrentFolderId(key));
    dispatch(getFilesByFolder(key));
    dispatch(getFolderDetail(key));
  };

  return (
    <div className={styles.container}>
      <div className={styles.select_folder}>
        <FolderOpenOutlined onClick={() => navigate('/folder-management')} />
      </div>
      <Tabs
        className={styles.tabs}
        type="editable-card"
        hideAdd
        items={tabs}
        onEdit={onCloseTab}
        activeKey={selectedTab}
        onChange={onChangeHandler}
        key={selectedTab}
        onContextMenu={(e) => onRightClickMenuContex(e)}
      />
    </div>
  );
};

export default FolderTabs;
