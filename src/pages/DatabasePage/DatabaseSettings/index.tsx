/* eslint-disable camelcase */
import _ from 'lodash';
import moment from 'moment';
import { useRef, useState } from 'react';
import { Button, Input, Spin } from 'antd';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { NewDB, NotepadEdit, VCheck, X } from '~/components/Icons';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import LogoutModal from '~/components/LogoutModal';
import RemoveDBModal from '../components/RemoveDBModal';
import ConfirmModal from '~/components/ConfirmModal';
import NewDBForm from '../components/NewDBForm';
import {
  DATABASE,
  getDatabases,
  selectDb,
  toggleInInstallDBProcess,
  updateDatabase,
} from '~/store/DatabaseSlice';
import { INITIAL_SETTING_STEP } from '~/constants';
import styles from './DatabaseSettings.module.scss';

const DatabaseSettings = () => {
  const appDispatch = useAppDispatch();
  const { databases: listDatabase, loading: loadingDb } = useAppSelector((s) => s.db);
  const selectedDB = useAppSelector((s) => s.db.selectedDb);
  const creatingDB = useAppSelector((s) => s.db.creating);
  const currentUser = useAppSelector((s) => s.auth.user);
  const isSuperAdmin = useAppSelector((s) => s.auth.isSuperAdmin);
  const [switchDB, setSwicthDB] = useState<boolean>(false);
  const [removeDbModalOpening, setRemoveDbModalOpening] = useState(false);
  const [removingDbId, setRemovingDbId] = useState(null);
  const [isCreateDbModalOpen, setIsCreateDbModalOpen] = useState(false);
  const [editingDb, setEditingDb] = useState<DATABASE>(null);
  const [organizationName, setOrganizationName] = useState('');
  const createDBForm = useRef(null);
  const { setting: { root_path: rootPath = '' } = {} } = selectedDB;

  const onClickRemoveDB = (id: number) => {
    setRemovingDbId(id);
    setRemoveDbModalOpening(true);
  };

  const onRemoveDbModalCancel = () => {
    setRemovingDbId(null);
    setRemoveDbModalOpening(false);
  };

  const onCreateNewDatabase = () => {
    setIsCreateDbModalOpen(true);
    appDispatch(toggleInInstallDBProcess(INITIAL_SETTING_STEP.SECOND));
  };

  const handleCreateDbModalOk = () => {
    createDBForm.current.submit();
  };

  const handleCreateDbModalCancel = () => {
    setIsCreateDbModalOpen(false);
  };

  const handleDbCreated = () => {
    setIsCreateDbModalOpen(false);
  };

  const handleChangeOrganizationName = (value) => {
    setOrganizationName(value);
  };

  const handleUpdateOrganizationName = () => {
    if (!editingDb || !organizationName) {
      return;
    }
    const { id } = editingDb;
    appDispatch(updateDatabase({ id, organization_name: _.trim(organizationName) })).then(() => {
      appDispatch(getDatabases({})).then((res) => {
        const {
          payload: { statusCode },
        } = res;
        if (statusCode && statusCode === 200) {
          const { payload: { payload: { data = [] } = {} } = {} } = res;
          if (Array.isArray(data) && data.length) {
            const db = data.find((item) => item.id === selectedDB.id);
            if (db) {
              appDispatch(selectDb(db));
            }
          }
        }
      });
      setEditingDb(null);
      setOrganizationName('');
    });
  };

  const handleCancelUpdateOrganizationName = () => {
    setEditingDb(null);
  };

  const renderCreateDbModalFooter = (
    cancelText: string,
    okText: string,
    handleOk: () => void,
    handleCancel: () => void,
  ) => {
    return (
      <div className={styles.modal_footer}>
        <Button
          disabled={creatingDB}
          className={`${styles.cs_modal_cancel_btn} ${creatingDB ? styles.disabled : ''}`}
          onClick={handleCancel}
        >
          {cancelText}
        </Button>
        <Button
          disabled={creatingDB}
          className={`${styles.cs_modal_ok_btn} ${creatingDB ? styles.disabled : ''}`}
          onClick={handleOk}
        >
          {okText}
        </Button>
      </div>
    );
  };

  const renderOrganizationName = (id, setting) => {
    if (editingDb && editingDb.id === id) {
      const { organization_name = '' } = setting || {};
      const name = organizationName || organization_name;
      return (
        <div className="d-flex">
          <div>
            <Input
              required
              defaultValue={organization_name}
              onChange={(e) => handleChangeOrganizationName(e.target.value)}
            />
          </div>
          <div className={styles.edit_org_name_btns}>
            <Button
              disabled={!name || name === ''}
              shape="circle"
              icon={<VCheck width={16} height={16} fill="" />}
              onClick={() => handleUpdateOrganizationName()}
            />
            <Button
              shape="circle"
              icon={<X width={16} height={16} fill="" />}
              onClick={() => handleCancelUpdateOrganizationName()}
            />
          </div>
        </div>
      );
    }
    return (
      <>
        <p>{setting && setting.organization_name ? setting.organization_name : '--'}</p>
        <span className={styles.edit_btn} onClick={() => handleEditDb(id)}>
          <NotepadEdit width={24} height={24} fill="" />
        </span>
      </>
    );
  };

  const handleEditDb = (id: number) => {
    const db = listDatabase.find((item) => item.id === id);
    if (!db) {
      return;
    }
    setEditingDb(db);
  };

  return (
    <div className="scroll_content">
      <ConfirmModal
        headerTitle="Create New Database"
        headerIcon={<NewDB width={20} height={20} fill="" />}
        handleOk={handleCreateDbModalOk}
        handleCancel={handleCreateDbModalCancel}
        isOpen={isCreateDbModalOpen}
        centered
        closable={!creatingDB}
        maskClosable={!creatingDB}
        footer={renderCreateDbModalFooter(
          'Cancel',
          'Create',
          handleCreateDbModalOk,
          handleCreateDbModalCancel,
        )}
        wrapClassName="primary_modal_container"
        destroyOnClose
      >
        <div className={styles.form_container}>
          <NewDBForm insideModal ref={createDBForm} successCb={handleDbCreated} />
        </div>
      </ConfirmModal>
      <LogoutModal show={switchDB} onHide={() => setSwicthDB(false)} />
      <RemoveDBModal
        isOpening={removeDbModalOpening}
        dbId={removingDbId}
        cancel={onRemoveDbModalCancel}
      />
      <div className="container-fluid">
        <Row>
          <Col md={12} lg={12} style={{ marginLeft: '5px' }}>
            <div className="data_manage_css">
              <div className="data_maan_txt d-flex align-items-center justify-content-between">
                <div>
                  <p
                    style={{
                      fontSize: '20px',
                      fontFamily: 'Inter',
                      fontWeight: 600,
                      fontStyle: 'normal',
                      lineHeight: '30px',
                      marginBottom: '8px',
                    }}
                  >
                    Data Management
                  </p>
                  <p
                    style={{
                      fontSize: '16px',
                      fontWeight: 400,
                      fontFamily: 'Inter',
                      color: '#6c737f',
                    }}
                  >
                    Overview all database created under your account.
                  </p>
                </div>
                {isSuperAdmin && (
                  <Button
                    className="btn-blue"
                    icon={<NewDB width={20} height={20} fill="" />}
                    onClick={onCreateNewDatabase}
                  >
                    Create New Database
                  </Button>
                )}
              </div>
              <hr />
              {Array.isArray(listDatabase) &&
                listDatabase.map(({ id, connection, host, port, created_at, schema, setting }) => (
                  <div className={styles.db_info} key={id}>
                    {editingDb && editingDb.id === id && loadingDb && (
                      <div className={styles.db_loading}>
                        <Spin />
                      </div>
                    )}
                    <Row>
                      <Col className={styles.column_style} md={2} lg={2}>
                        Connection:
                      </Col>
                      <Col md={10} lg={10}>
                        <p>{connection}</p>
                      </Col>
                      <Col className={styles.column_style} md={2} lg={2}>
                        Database Name:
                      </Col>
                      <Col md={10} lg={10}>
                        <p>{schema}</p>
                      </Col>
                      <Col className={styles.column_style} md={2} lg={2}>
                        Port:
                      </Col>
                      <Col md={10} lg={10}>
                        <p>{port}</p>
                      </Col>
                      <Col className={styles.column_style} md={2} lg={2}>
                        Hosting:
                      </Col>
                      <Col md={10} lg={10}>
                        <p>{host}</p>
                      </Col>
                      <Col className={styles.column_style} md={2} lg={2}>
                        Created date:
                      </Col>
                      <Col md={10} lg={10}>
                        <p>{moment(String(created_at)).format('MM/DD/YYYY')}</p>
                      </Col>
                      <Col className={styles.column_style} md={2} lg={2}>
                        Organization Name:
                      </Col>
                      <Col md={10} lg={10} className="d-flex">
                        {renderOrganizationName(id, setting)}
                      </Col>
                    </Row>
                    {currentUser.roles?.includes('SA') && (
                      <>
                        <div className={styles.databse_brdr}></div>
                        <div className="d-flex gap-3 align-items-center pt-md-3">
                          <button
                            className={
                              selectedDB.id !== id ? styles.install_db_btn : styles.selected_db
                            }
                            onClick={() => setSwicthDB(true)}
                            disabled={selectedDB.id === id}
                          >
                            Switch
                          </button>
                          <button
                            className={`${styles.remove_btn} ${selectedDB.id === id ? styles.disabled : ''
                              }`}
                            disabled={selectedDB.id === id}
                            onClick={() => onClickRemoveDB(id)}
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DatabaseSettings;
