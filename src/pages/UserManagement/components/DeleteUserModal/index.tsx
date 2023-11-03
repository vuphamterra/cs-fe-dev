import { Button, Modal } from 'antd';
import deleteIcon from '~/assets/images/delete_icon_modal.png';
import styles from './index.module.scss';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { deleteUser, getListUser, getUserById } from '~/store/UserSlice';
import notification from '~/utils/notification';
// import notification from '~/utils/notification';

interface ModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const DeleteUserModal = (props: ModalProps) => {
  const { open, setOpen } = props;
  const dispatch = useAppDispatch();
  const loading = useAppSelector((s) => s.user.loading);
  const userId = useAppSelector((s) => s.user.selectedUserId);
  const selectedUser = useAppSelector((s) => s.user.user) || null;

  const headModal = (
    <div className={styles.modal_title}>
      <img src={deleteIcon} />
      <p>Delete User</p>
    </div>
  );

  const handleDeleteUser = () => {
    dispatch(deleteUser(userId)).then(() => {
      dispatch(getListUser()).then((response) => {
        const {
          payload: { payload },
        } = response;
        const { data } = payload;
        if (data.length > 0) {
          dispatch(getUserById(data[0].id));
        }
      });
      setOpen(false);
      notification.success({
        message: 'Delete User Successful!',
        description: (
          <p>
            User&nbsp;
            {selectedUser !== null && (
              <span style={{ fontWeight: 700 }}>{selectedUser.username}</span>
            )}
            &nbsp;has been deleted!
          </p>
        ),
      });
    });
  };

  return (
    <Modal
      className={styles.folder_delete_modal}
      title={headModal}
      centered
      open={open}
      onCancel={() => setOpen(false)}
      destroyOnClose
      footer={[
        <Button className={styles.btn_cancel} key="back" onClick={() => setOpen(false)}>
          Cancel
        </Button>,
        <Button
          className={styles.btn_delete}
          key="submit"
          loading={loading}
          onClick={handleDeleteUser}
        >
          Delete
        </Button>,
      ]}
    >
      <p className={styles.modal_body}>
        Are you sure you want to delete User&nbsp;
        {selectedUser !== null && <span style={{ fontWeight: 700 }}>{selectedUser.username}</span>}?
        This action cannot be undone.
      </p>
    </Modal>
  );
};

export default DeleteUserModal;
