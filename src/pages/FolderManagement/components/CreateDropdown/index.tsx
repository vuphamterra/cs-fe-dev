import { Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import styles from './styles.module.scss';

type Props = {
  handleCreateSingleFolder: () => void;
  handleCreateMultipleFolders: () => void;
};

const CreateDropdown = (props: Props) => {
  const items = [
    {
      key: '1',
      label: <p>Create Single Folder</p>,
      onClick: props.handleCreateSingleFolder,
    },
    {
      key: '2',
      label: <p>Create Multiple Folders</p>,
      onClick: props.handleCreateMultipleFolders,
    },
  ];

  return (
    <>
      <Dropdown
        overlayClassName="dropdown_head_folder"
        className={styles.dropdown_create}
        menu={{ items }}
        trigger={['click']}
      >
        <div className={styles.btn_create}>
          <p>Create New Folder</p>
          <DownOutlined />
        </div>
      </Dropdown>
    </>
  );
};
export default CreateDropdown;
