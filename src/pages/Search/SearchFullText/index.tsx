import { Row, Col, Form, Input } from 'antd';
import styles from './SearchFullText.module.scss';

export const SearchFullText = () => {
  return (
    <div>
      <Row className={styles.general_search}>
        <Col className={styles.search_col} span={24}>
          <Form.Item name="searchtext" style={{ width: '100%', margin: 0 }}>
            <Input autoFocus size="large" placeholder="Search" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};
