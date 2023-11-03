import { useEffect, createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Row, Col, Input, theme } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import notification from '~/utils/notification';
import { clearMessage, saveAppSetting, toggleInInstallDBProcess } from '~/store/DatabaseSlice';
import { INITIAL_SETTING_STEP } from '~/constants';
import InfoTooltip from '~/components/InfoTooltip';
import styles from './GeneralSettings.module.scss';
import { checkFileLocationPath } from '~/store/DrawerSlice';

const { useToken } = theme;

export default function GeneralSettings() {
  const { token } = useToken();
  const navigate = useNavigate();
  const { message, appSetting } = useAppSelector((state) => state.db);
  const appDispatch = useAppDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    if (message) {
      notification[message.type](message);
      appDispatch(clearMessage());
    }
  }, [message]);

  const handleNextBtn = () => {
    form
      .validateFields()
      .then((values) => {
        const { rootPath = '', organizationName = '' } = values || {};
        // Save app setting to store
        const setting = {
          rootPath,
          organizationName: organizationName || 'Terralogic',
        };
        appDispatch(saveAppSetting(setting));
        // Go to next step
        appDispatch(toggleInInstallDBProcess(INITIAL_SETTING_STEP.SECOND));
        navigate('/add-database');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const formInitialValues = {
    rootPath: appSetting && appSetting.rootPath ? appSetting.rootPath : '',
    organizationName: appSetting && appSetting.organizationName ? appSetting.organizationName : '',
  };

  return (
    <div className={styles.container}>
      <h2>
        Set Up Database{' '}
        {/* <InfoTooltip
          placement="right"
          title="Set up the location of your Drawer within the Database on the Server"
          color={token.colorPrimary}
        /> */}
      </h2>
      <Form form={form} layout="vertical" initialValues={formInitialValues}>
        <Row>
          <Col span={24}>
            {/* <Form.Item
              required
              name="rootPath"
              label={createElement('span', {}, [
                'Root Path',
                ' ',
                <InfoTooltip
                  key={uuidv4()}
                  placement="right"
                  title="The location/path of your Drawer on the Database Server"
                  color={token.colorPrimary}
                />,
              ])}
              rules={[
                () => ({
                  validator: async (rule, value) => {
                    if (!value) {
                      return Promise.reject(new Error('Root Path is required'));
                    }
                    const res = await appDispatch(checkFileLocationPath({ imgPath: value }));
                    const { payload: { statusCode = '' } = {} } = res || {};
                    if (statusCode === 200) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('This file location is not eligible'));
                  },
                }),
              ]}
            >
              <Input autoFocus />
            </Form.Item> */}
          </Col>
          <Col span={24}>
            <Form.Item
              name="organizationName"
              label={createElement('span', {}, [
                'Organization Name',
                ' ',
                <InfoTooltip
                  key={uuidv4()}
                  placement="right"
                  title="The name of your organization, which will be display on the menu bar of the WebApp"
                  color={token.colorPrimary}
                />,
              ])}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="text-end">
            <Button className="btn-blue" type="primary" onClick={handleNextBtn}>
              Next
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
