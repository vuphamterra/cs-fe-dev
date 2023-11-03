/* eslint-disable indent */
/* eslint-disable multiline-ternary */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Checkbox, Col, Collapse, Row, Spin } from 'antd';

import noData from '~/assets/images/nodata.svg';
import styles from './styles.module.scss';

import {
  getUserPermission,
  handleChangeUserPermission,
  handleSetSelectedPermissionId,
  resetCurrentUserPermisson,
  updateUserPermission,
} from '~/store/UserSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';

const { Panel } = Collapse;

interface Props {
  userId: number;
}

export default function UserPermission(props: Props) {
  const { userId } = props;
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.user.user);
  const listPermission = useAppSelector((s) => s.user.listPermission);
  const listDrawerPermission = useAppSelector((s) => s.user.userPermission) || null;
  const selectedPermissionId = useAppSelector((s) => s.user.selectedPermissionId) || null;
  const loading = useAppSelector((s) => s.user.loading);
  const [change, setChange] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId && currentUser && listDrawerPermission === null) {
      dispatch(getUserPermission(userId));
    }
  }, [currentUser, userId, listPermission]);

  const getAllListDrawerPermisson =
    listDrawerPermission?.length > 0
      ? listDrawerPermission?.map((i) => i.permission.map((i) => i.id))
      : [];
  let globalPermission = [];
  if (getAllListDrawerPermisson.length > 0) {
    globalPermission = getAllListDrawerPermisson.shift().filter(function (v) {
      return getAllListDrawerPermisson.every(function (a) {
        return a.indexOf(v) !== -1;
      });
    });
  }

  // Change permissions.length === 11 when enable Configuration permission
  const header = (drawerName, drawerId, permissions) => (
    <div>
      <Checkbox onChange={() => handleCheckAllDrawer(drawerId)} checked={permissions.length === 10}>
        {drawerName}
      </Checkbox>
    </div>
  );

  const handleGlobalCheck = (permission: any) => {
    setChange(true);
    let newArr = [...listDrawerPermission];
    let listPermission = newArr.map((i) => i.permission);
    if (globalPermission.includes(permission.id)) {
      listPermission = listPermission.map((i) => i.filter((i) => i.id !== permission.id));
    } else {
      listPermission = listPermission.map((i) =>
        i.map((i) => i.id).includes(permission.id) ? [...i] : [...i, permission],
      );
    }
    newArr = newArr.map((i, index) => {
      return { ...i, permission: listPermission[index] };
    });
    dispatch(handleChangeUserPermission(newArr));
    const selectedPermission = newArr.map(
      (i) => [{ id: i.id, permission: [i.permission][0].map((per) => per.id) }][0],
    );
    dispatch(handleSetSelectedPermissionId(selectedPermission));
  };

  const handleCheckPermission = (drawerId: number, permissionId: number, permission: any) => {
    setChange(true);
    const newArr = [...listDrawerPermission];
    let selectedDrawer = newArr.filter((i) => i.id === drawerId)[0];
    let permissions = selectedDrawer.permission;
    if (permissions.map((i) => i.id).includes(permissionId)) {
      permissions = permissions.filter((i) => i.id !== permissionId);
    } else {
      permissions = [...permissions, permission];
    }
    selectedDrawer = { ...selectedDrawer, permission: permissions };
    const indexDrawer = newArr.findIndex((i) => i.id === drawerId);
    newArr[indexDrawer] = selectedDrawer;
    dispatch(handleChangeUserPermission(newArr));
    const selectedPermission = newArr.map(
      (i) => [{ id: i.id, permission: [i.permission][0].map((per) => per.id) }][0],
    );
    dispatch(handleSetSelectedPermissionId(selectedPermission));
  };

  const handleCheckAllDrawer = (drawerId: number) => {
    setChange(true);
    const newArr = [...listDrawerPermission];
    let selectedDrawer = newArr.filter((i) => i.id === drawerId)[0];
    let permissions = selectedDrawer.permission;
    if (permissions.length === listPermission.length) {
      permissions = [];
    } else {
      permissions = listPermission;
    }
    selectedDrawer = { ...selectedDrawer, permission: permissions };
    const indexDrawer = newArr.findIndex((i) => i.id === drawerId);
    newArr[indexDrawer] = selectedDrawer;
    dispatch(handleChangeUserPermission(newArr));
    const selectedPermission = newArr.map(
      (i) => [{ id: i.id, permission: [i.permission][0].map((per) => per.id) }][0],
    );
    dispatch(handleSetSelectedPermissionId(selectedPermission));
  };

  const handleGlobalAllCheck = (e: any) => {
    setChange(true);
    let newArr = [...listDrawerPermission];
    let listPermissionInScope = newArr.map((i) => i.permission);
    listPermission.forEach(permission => {
      if (!e.target.checked) {
        listPermissionInScope = listPermissionInScope.map((i) => i.filter((i) => i.id !== permission.id));
      } else {
        listPermissionInScope = listPermissionInScope.map((i) =>
          i.map((i) => i.id).includes(permission.id) ? [...i] : [...i, permission],
        );
      }
    });
    newArr = newArr.map((i, index) => {
      return { ...i, permission: listPermissionInScope[index] };
    });
    dispatch(handleChangeUserPermission(newArr));
    const selectedPermission = newArr.map(
      (i) => [{ id: i.id, permission: [i.permission][0].map((per) => per.id) }][0],
    );
    dispatch(handleSetSelectedPermissionId(selectedPermission));
  };

  const handleSavePermission = () => {
    const params = {
      userId,
      permissions: selectedPermissionId,
    };
    dispatch(updateUserPermission(params)).then(() => {
      dispatch(getUserPermission(userId));
      setChange(false);
    });
  };

  const handleCancel = () => {
    dispatch(resetCurrentUserPermisson());
    setChange(false);
  };

  return (
    <div className={styles.user_permission}>
      <div className={styles.head_btn}>
        <div className={styles.left_head}>
          <h6>User Permissions</h6>
          <p>
            To set up new Drawer, go to &nbsp;
            <a onClick={() => navigate('/drawer-management')}>Drawer Management</a>
          </p>
        </div>
        <div className={styles.right_head}>
          {change && (
            <>
              <Button className={styles.btn_cancel} onClick={handleCancel}>
                Cancel
              </Button>
              <Button className={styles.btn_save} onClick={handleSavePermission}>
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      <Spin spinning={loading}>
        <div className={styles.global_permission}>
          <div className={styles.title_accordion}>
            <Checkbox
              onChange={(e) => handleGlobalAllCheck(e)}
              checked={listPermission.length === globalPermission.length}
              disabled={listDrawerPermission?.length === 0}
            >
              Global Permissions
            </Checkbox>

          </div>
          {/* Global Permission */}
          <div className={styles.list_global_permission}>
            {currentUser && listDrawerPermission?.length !== 0 ? (
              <Row>
                {listPermission.length !== 0 &&
                  listPermission.map((permission) => (
                    <Col key={permission.id} span={6}>
                      <Checkbox
                        style={{ margin: 4 }}
                        checked={globalPermission.includes(permission.id)}
                        onChange={() => handleGlobalCheck(permission)}
                      >
                        {permission.name}
                      </Checkbox>
                    </Col>
                  ))}
              </Row>
            ) : (
              <div className={styles.nodata_user}>
                <img src={noData} />
                <p>No data</p>
              </div>
            )}
          </div>
        </div>
        {/* Drawer permission */}
        <div className={styles.drawer_permission}>
          <div className={styles.title_accordion}>Drawer Permissions</div>
          <div className={styles.user_permission_contain}>
            {listDrawerPermission?.length === 0 || currentUser === null ? (
              <div className={styles.nodata_user}>
                <img src={noData} />
                <p>No data</p>
              </div>
            ) : (
              Array.isArray(listDrawerPermission) &&
              listDrawerPermission?.map(({ id, name, permission }) => (
                <Collapse
                  key={id}
                  className={styles.collapse_permission}
                  defaultActiveKey={['1']}
                  expandIconPosition="end"
                >
                  <Panel
                    className={styles.panel_permission}
                    key={id}
                    header={header(name, id, permission)}
                    collapsible="icon"
                  >
                    <Row>
                      {listPermission.length !== 0 &&
                        listPermission.map((permissionItem) => (
                          <Col key={permissionItem.id} span={6}>
                            <Checkbox
                              style={{ margin: 4 }}
                              checked={permission.map((i) => i.id).includes(permissionItem.id)}
                              onChange={() =>
                                handleCheckPermission(id, permissionItem.id, permissionItem)
                              }
                            >
                              {permissionItem.name}
                            </Checkbox>
                          </Col>
                        ))}
                    </Row>
                  </Panel>
                </Collapse>
              ))
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
}
