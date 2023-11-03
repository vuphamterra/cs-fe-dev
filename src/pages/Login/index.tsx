import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spin, Tooltip } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { DASHBOARD, INITIAL_SETTING_STEP } from '~/constants';
import { selectDashboard, authenticate, setErrorMessage, logout } from '~/store/AuthSlice';
import LanguageDropdown from '~/components/LanguageDropdown';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import notification from '~/utils/notification';
import { DATABASE, selectDb, toggleInInstallDBProcess } from '~/store/DatabaseSlice';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import BuildVersion from '~/components/BuildVersion';
import loginsrcimage from '~/assets/images/loginimg.png';
import fplock from '~/assets/images/fplock.png';
import styles from './styles.module.scss';
import { LogoutIcon } from '~/components/Icons';

const Login = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, selectedDashboard, isSuperAdmin, isAdmin, loading, errorMessage } =
    useAppSelector((state) => state.auth);
  const { databases, loading: dbLoading, selectedDb } = useAppSelector((state) => state.db);
  const [isRevealPwd, setIsRevealPwd] = useState(false);
  const [forgotshow, setForgotShow] = useState(false);
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      notification.error(errorMessage);
      dispatch(setErrorMessage(null));
    }
  }, [errorMessage]);

  const handleLogout = async () => {
    dispatch(logout(''));
    navigate('/');
  };

  const handleDatabaseSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const db = databases.find((item) => item.id === +e.target.value);
    dispatch(selectDb(db ?? null));
  };

  const handleGotoDashboard = () => {
    if (selectedDb) {
      navigate(selectedDashboard === DASHBOARD.ADMIN ? '/dashboard' : '/folder-management');
    } else {
      notification.error({ message: 'Error', description: 'No database selected' });
    }
  };

  const onClickAddDBBtn = () => {
    dispatch(toggleInInstallDBProcess(INITIAL_SETTING_STEP.FIRST));
    navigate('/app-setting');
  };

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formValid = form.checkValidity();
    setValidated(!formValid);
    if (!formValid) {
      return;
    }
    const formData = new FormData(form);
    const formDataObj = Object.fromEntries(formData.entries());

    const data = {
      username: formDataObj.username as string,
      password: formDataObj.password as string,
    };

    dispatch(authenticate(data));
  };

  const [email, setEmail] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
  };

  const renderLoginView = () => {
    return (
      <Col xs={12} md={5} lg={5} className="m-auto">
        <div className={styles.login_card}>
          <div className={styles.login_card_sec}>
            <h1>ClickScan Portal</h1>
            <p className={styles.p_grey_grey}>
              Please enter your credential below to access to
              <strong> ClickScan System.</strong>
            </p>
            <div>
              <Form noValidate validated={validated} onSubmit={!loading ? onFormSubmit : null}>
                <Form.Group className="mb-4" controlId="username">
                  <Form.Label className="login-form_label">{t('username')}</Form.Label>
                  <Form.Control
                    autoFocus
                    type="text"
                    name="username"
                    value={username}
                    placeholder={t('enter_username')}
                    onChange={(e) => {
                      setUserName(e.target.value);
                    }}
                    required
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">Username is required</Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="password" className="password_field mb-5">
                  <Form.Label className="login-form_label">{t('password')}</Form.Label>
                  <Form.Control
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    placeholder={t('enter_password')}
                    type={isRevealPwd ? 'text' : 'password'}
                    required
                    disabled={loading}
                  ></Form.Control>

                  {isRevealPwd && (
                    <EyeOutlined
                      className={styles.pwd_eye_icon}
                      onClick={() => setIsRevealPwd((prevState) => !prevState)}
                    />
                  )}
                  {!isRevealPwd && (
                    <EyeInvisibleOutlined
                      className={styles.pwd_eye_icon}
                      onClick={() => setIsRevealPwd((prevState) => !prevState)}
                    />
                  )}
                  <Form.Control.Feedback type="invalid">Password is required</Form.Control.Feedback>
                </Form.Group>
                {/* <div>
                  <p className="p-blue1 login_fp" onClick={() => setForgotShow(true)}>
                    {t('forgot_pw')}
                  </p>
                </div> */}
                <Button disabled={loading} className="btn-blue" type="submit">
                  {loading ? 'Logging in...' : t('login_in')}
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </Col>
    );
  };

  const renderSelectingDashboardView = () => {
    return (
      <Col xs={12} md={5} lg={5} className="m-auto">
        <div className={styles.login_card}>
          <div className={styles.login_card_sec}>
            <h1>ClickScan Portal</h1>
            <p className={styles.p_grey_grey}>
              Please select the ClickScan system you want to access.
            </p>
            <div className="d-flex gap-3">
              <Button
                className={styles.btn_outline_primary}
                variant="outline-primary"
                type="button"
                onClick={() => dispatch(selectDashboard(DASHBOARD.ADMIN))}
              >
                Admin
              </Button>
              <Button
                className={styles.btn_outline_primary}
                variant="outline-primary"
                type="button"
                onClick={() => dispatch(selectDashboard(DASHBOARD.CLIENT))}
              >
                Client
              </Button>
            </div>
          </div>
        </div>
      </Col>
    );
  };

  const renderSelectingDBView = () => {
    return (
      <Col xs={12} md={5} lg={5} className="m-auto">
        <div className={styles.login_card}>
          <div className={styles.login_card_sec}>
            <h1>
              {(isSuperAdmin || isAdmin) && selectedDashboard === DASHBOARD.ADMIN
                ? 'Admin Portal'
                : 'Client Portal'}
            </h1>
            <p className={styles.p_grey_grey}>
              Please select a database to access settings and configuration.
            </p>
            <div>
              <Form>
                <Form.Label className="login-form_label">
                  Connection
                  {dbLoading && <Spin className={styles.spinner} size="small" />}
                </Form.Label>
                <div className="d-flex justify-content-between gap-3">
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    value={selectedDb ? selectedDb.id : ''}
                    onChange={handleDatabaseSelect}
                  >
                    <option key="blank" value="">
                      -- Select database --
                    </option>
                    {databases.map((db: DATABASE) => (
                      <option key={db.id} value={db.id}>
                        {db.connection}
                      </option>
                    ))}
                  </select>
                  {isSuperAdmin && selectedDashboard === DASHBOARD.ADMIN && (
                    <Button
                      variant="outline-primary"
                      className={styles.btn_outline_primary}
                      onClick={onClickAddDBBtn}
                    >
                      Add Database
                    </Button>
                  )}
                </div>

                <Button className="btn-blue mt-5" type="button" onClick={handleGotoDashboard}>
                  Continue
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </Col>
    );
  };

  return (
    <section className={styles.login_sec}>
      <div className={styles.login_sec_card}>
        <div className={styles.language_dropdown_container}>
          <LanguageDropdown overlayClassName="login_lng_dropdown" />
          {isLoggedIn && (
            <span style={{ display: 'flex' }} onClick={handleLogout}>
              <Tooltip placement="topLeft" title={'Logout'} color="volcano">
                <LogoutIcon width={44} height={44} fill="" />
              </Tooltip>
            </span>
          )}
        </div>
        <div className={styles.login_sec_main}>
          <Row>
            <Col xs={12} md={7} lg={7}>
              <div className={styles.login_sec_heading}>
                <h3 className={styles.heading_text}>Welcome to</h3>
                <h2 className={styles.heading_text}>ClickScan !</h2>
              </div>
              <div>
                <h4 className={styles.mobile_heading}>
                  Welcome to <span>ClickScan !</span>
                </h4>
              </div>

              <div className={styles.login_image_sec}>
                <img src={loginsrcimage} alt="" className={styles.login_image} />
              </div>
            </Col>
            {!isLoggedIn && renderLoginView()}
            {isLoggedIn &&
              (isSuperAdmin || isAdmin) &&
              !selectedDashboard &&
              renderSelectingDashboardView()}
            {isLoggedIn &&
              ((!isSuperAdmin && !isAdmin) || selectedDashboard) &&
              renderSelectingDBView()}
          </Row>
        </div>
        <BuildVersion />
      </div>

      <Modal
        show={forgotshow}
        onHide={() => setForgotShow(false)}
        centered
        className="fortgotpassword_modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="forgot_modaltitle">
              <img src={fplock} alt="" />
              <h4>{t('forgot_pw')}</h4>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <p className="p-grey description">
            Click <span>“Request Reset Password”</span> button and an email will
            be sent to
            <span>your administrative email address.</span> Check inbox and
            click the reset link provided.
          </p> */}
          <Form>
            <Form.Group className="mb-2 mt-2" controlId="email">
              <Form.Label className="login-form_label">Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                id="email"
                placeholder={t('enter_email')}
                className="login_form-placeholeder"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <div className="mt-3">
              <Button className="btn btn-white fpcancel" onClick={() => setForgotShow(false)}>
                {t('cancel')}
              </Button>
              <Button className="btn btn-blue fprequest_reset" onClick={handleFormSubmit}>
                {t('request_reset_pw')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
        {/* <Modal.Footer>
          <Button
            className="btn btn-white fpcancel"
            onClick={() => setForgotShow(false)}
          >
            Cancel
          </Button>
          <Button className="btn btn-blue fprequest_reset" onClick={forgetPassword}>
            Request Reset Password
          </Button>
        </Modal.Footer> */}
      </Modal>
    </section>
  );
};

export default Login;
