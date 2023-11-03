import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { logout } from '~/store/AuthSlice';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { DASHBOARD } from '~/constants';
import buttonimg from '~/assets/images/Buttons.png';

interface iprops {
  show: boolean;
  onHide: () => void;
}
const LogoutModal: React.FC<iprops> = ({ show, onHide }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isSuperAdmin, isAdmin, selectedDashboard } = useAppSelector((state) => state.auth);

  const logoutFun = async () => {
    dispatch(logout(''));
    navigate('/');
    onHide();
  };

  return (
    <div>
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="log__out__modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            <div className="d-flex align-items-center gap-2">
              <img src={buttonimg} alt="" />
              <h5>Log out</h5>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0 leaving__txt pt-md-3">
            Are you leaving{' '}
            <span className="admin_scan_txt">
              ClickScan Portal{' '}
              {(isSuperAdmin || isAdmin) && selectedDashboard === DASHBOARD.ADMIN
                ? 'Admin'
                : 'Client'}{' '}
              ?
            </span>{' '}
            You can log back in using your{' '}
            {isSuperAdmin || isAdmin ? DASHBOARD.ADMIN : DASHBOARD.CLIENT} account.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex align-items-center">
            <button onClick={onHide} className="btn_No_No">
              No
            </button>
            <button className="btn_orange_admin" onClick={logoutFun}>
              Yes, log out
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LogoutModal;
