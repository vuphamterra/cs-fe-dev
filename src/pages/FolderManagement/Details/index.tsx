import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { truncate } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Info as InfoIcon, Table as TableIcon } from '~/components/Icons';
import { useAppSelector } from '~/store/hooks';
import { formatSocialSecurity } from '~/utils';
import { FOLDER_MODEL_EXTENDED } from '../interfaces';
import styles from './Details.module.scss';

export default function DetailsFolder() {
  const navigate = useNavigate();
  const { activeId } = useParams();
  const { folders, fields } = useAppSelector((store) => store.folder);
  const [selectedFolder, setSelectedFolder] = useState<FOLDER_MODEL_EXTENDED>(null);

  useEffect(() => {
    if (folders && folders.length) {
      const folder = folders.find((item) => item.csId === parseInt(activeId));
      if (!folder) {
        navigate('/not-found');
        return;
      }
      setSelectedFolder(folder);
    }
  }, [activeId]);

  return (
    <div className={styles.view_detail}>
      <div className={styles.close_btn_layout}>
        <Button
          className={styles.close_btn}
          icon={<CloseOutlined />}
          onClick={() => navigate('/folder-management')}
        />
      </div>
      <div className={styles.content_detail}>
        <div className={styles.index_field}>
          <div className={styles.card_head}>
            <TableIcon width={20} height={20} fill="" className={styles.folder_info_icon} />
            <p>Index Fields</p>
          </div>
          <div className={styles.body_info}>
            {fields.map((field) => {
              const value =
                selectedFolder && selectedFolder[field.name]
                  ? field.formatId === 8
                    ? formatSocialSecurity(selectedFolder[field.name])
                    : selectedFolder[field.name]
                  : '--';
              return (
                <div key={field.name}>
                  <p className={styles.title}>{field.name}</p>
                  <p className={styles.infomation}>{value}</p>
                </div>
              );
            })}
          </div>
        </div>
        <hr />
        <div className={styles.folder_info}>
          <div className={styles.info}>
            <InfoIcon width={20} height={20} fill="" className={styles.folder_info_icon} />
            <p>Info</p>
          </div>
          <div className={styles.body_info}>
            <p className={styles.title}>Documents</p>
            <p className={styles.infomation}>
              {selectedFolder ? selectedFolder.fileCount : 0} files
            </p>
            <p className={styles.title}>Size</p>
            <p className={styles.infomation}>{selectedFolder ? selectedFolder.fileSize : ''}</p>
            <p className={styles.title}>Last modified</p>
            <p className={styles.infomation}>
              {selectedFolder ? moment(selectedFolder.updated_at).format('HH:mm DD MMM YYYY') : ''}{' '}
              by{' '}
              <span style={{ fontWeight: '600' }}>
                {selectedFolder ? selectedFolder.updatedBy : ''}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
