import { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';

import searchImg from '~/assets/images/searching.png';
import sonyLogo from '~/assets/images/sony_logo.png';
import hpLogo from '~/assets/images/hp_logo.png';
import addScanner from '~/assets/images/add_scanner.png';

import styles from './styles.module.scss';

interface ModalProps {
  open: boolean;
  setOpen: (val: any) => void;
}

const AddNewScanner = (props: ModalProps) => {
  const { open, setOpen } = props;
  const [searchPercent, setSearchPercent] = useState<number>(0);

  useEffect(() => {
    if (open && searchPercent < 100) {
      setTimeout(() => {
        setSearchPercent((prev) => prev + 5);
      }, 800);
    }
  }, [searchPercent, open]);

  const renderSearching = () => {
    return (
      <div className={styles.search_scanner}>
        <img src={searchImg} />
        <p>{`Searching Scanner... (${searchPercent}%)`}</p>
      </div>
    );
  };

  const modalTitle = (
    <div className={styles.modal_header}>
      <img src={addScanner} />
      <div>
        <p className={styles.title}>Export Folder Settings</p>
        <p className={styles.sub_title}>Please select some export settings.</p>
      </div>
    </div>
  );

  const modalActions = (
    <div className={styles.modal_actions}>
      <Button onClick={() => setOpen(false)} className={styles.cancel_btn}>
        Cancel
      </Button>
      <Button className={styles.export_btn}>Confirm</Button>
    </div>
  );

  const renderAddNewScanner = () => {
    return (
      <div className={styles.select_scanner}>
        <p>Select scanner you want to add</p>
        <div className={styles.scanner_result}>
          <img src={sonyLogo} />
          <p>Scanner Sony</p>
        </div>
        <div className={styles.scanner_result}>
          <img src={hpLogo} />
          <p>Scanner HP</p>
        </div>
      </div>
    );
  };

  return (
    <Modal
      className={styles.modal_add_scanner}
      open={open}
      onCancel={() => {
        setOpen(false);
        setSearchPercent(0);
      }}
      centered
      title={searchPercent < 100 ? '' : modalTitle}
      footer={searchPercent < 100 ? '' : modalActions}
    >
      {searchPercent < 100 ? renderSearching() : renderAddNewScanner()}
    </Modal>
  );
};
export default AddNewScanner;
