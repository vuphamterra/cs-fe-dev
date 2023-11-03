/* eslint-disable camelcase */
import { useEffect, useState, FC } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Form, Row, Button } from 'antd';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { searchFullText, setSearchType, searchFoldersByIndexField } from '~/store/FolderSlice';
import SearchIndexField from './SearchIndexField';
import { SearchFullText } from './SearchFullText';
import { SearchField } from './interfaces';
import { DATE_FORMAT } from '~/constants';
import styles from './index.module.scss';

type Props = {
  onCriteriaChange: (criteria: any) => void;
  onSearch: (value: boolean) => void;
};

const SearchFolder: FC<Props> = (props) => {
  const [searchIndexForm] = Form.useForm();
  const [searchFulltextForm] = Form.useForm();
  const currentDrawer = useAppSelector((s) => s.draw.currentDrawer) || null;
  const dispatch = useAppDispatch();
  const [searchList, setSearchList] = useState<Array<SearchField>>([]);
  const [resetSearch, setResetSearch] = useState<boolean>(false);
  const { searchCondition, searchType } = useAppSelector((store) => store.folder);
  const [selectedDrawer, setSelectedDrawer] = useState(null);

  useEffect(() => {
    if (!selectedDrawer || (currentDrawer && selectedDrawer.id !== currentDrawer.id)) {
      setSelectedDrawer(currentDrawer);
      // Reset current search criteria
      handleResetSearch();
    }
  }, [currentDrawer]);

  const handleSearchFieldCallback = (searchFieldData: SearchField[]) => {
    setTimeout(() => {
      if (searchType === 'searchIndexField') {
        props.onCriteriaChange(searchIndexForm.getFieldsValue());
      } else if (searchType === 'searchFullText') {
        props.onCriteriaChange(searchFulltextForm.getFieldsValue());
      }
    });
    setSearchList(searchFieldData);
  };

  const handleSearchIndex = () => {
    const formData = searchIndexForm.getFieldsValue();
    const dataSubmit = _.cloneDeep(searchList);
    for (const data of dataSubmit) {
      for (const [name, value] of Object.entries(formData)) {
        const splitName = name.split('___');
        if (splitName.length === 1) {
          if (name === data.fieldName) {
            data.description = value as string;
            data.from = '';
            data.to = '';
          }
        } else {
          data.description = '';
          if (splitName[1] === 'from') {
            const dateFrom = value as any;
            data.from = dateFrom.format(DATE_FORMAT[data.format_name]);
            data.to = '';
          } else if (splitName[1] === 'to') {
            data.from = data.from || '';
            const dateFrom = value as any;
            data.to = dateFrom.format(DATE_FORMAT[data.format_name]);
          }
        }
      }
    }
    // remove unnecessary fields and trim
    const searchPayload = dataSubmit
      .map(({ id, isSelected, fieldName, ...data }) => data)
      .filter(
        (item) => !_.isEmpty(item.description) || (!_.isEmpty(item.from) && !_.isEmpty(item.to)),
      )
      .map((item) => {
        if (item.type_code === 'TXT') {
          return {
            ...item,
            description: _.trim(item.description),
          };
        }
        return { ...item };
      });

    // API
    if (!currentDrawer || !currentDrawer.id || _.isEmpty(dataSubmit)) {
      return;
    }
    dispatch(
      searchFoldersByIndexField({
        drawer_id: currentDrawer.id,
        condition: searchCondition,
        search: searchPayload,
      }),
    ).then(() => {
      props.onSearch(true);
    });
  };

  const handleSearchFull = () => {
    const searchtext = _.trim(searchFulltextForm.getFieldsValue().searchtext);
    if (currentDrawer && currentDrawer.id) {
      dispatch(
        searchFullText({
          drawer_id: currentDrawer.id,
          description: searchtext,
        }),
      ).then(() => {
        props.onSearch(true);
      });
    }
  };

  const handleTabChange = (key: string) => {
    dispatch(setSearchType(key));
    handleResetSearch();
  };

  const handleResetSearch = () => {
    setResetSearch(true);
    searchIndexForm.resetFields();
    searchFulltextForm.resetFields();
    props.onCriteriaChange(null);
    props.onSearch(false);
    if (currentDrawer && currentDrawer.id) {
      dispatch(searchFoldersByIndexField({ drawer_id: currentDrawer.id }));
    }
  };

  return (
    <div className={`${styles.search_containner} search_folder`}>
      <Row className={styles.general_search}>
        <div className={styles.advance_search_main}>
          <Tabs
            id="controlled-tab-example"
            activeKey={searchType}
            onSelect={handleTabChange}
            className={`mb-3 ${styles.advance_search_tabs}`}
          >
            <Tab eventKey="searchIndexField" title="Search Index Field">
              <Form
                form={searchIndexForm}
                name="searchIndexField"
                layout="vertical"
                onFinish={handleSearchIndex}
                onValuesChange={(changedValue, allValues) => {
                  props.onCriteriaChange(allValues);
                }}
              >
                <SearchIndexField
                  reset={resetSearch}
                  onReset={(value) => setResetSearch(value)}
                  handleSearchFieldCallback={handleSearchFieldCallback}
                />
              </Form>
            </Tab>
            <Tab eventKey="searchFullText" title="Search Full Text">
              <Form
                form={searchFulltextForm}
                name="searchFullText"
                layout="vertical"
                onFinish={handleSearchFull}
                onValuesChange={(changedValue, allValues) => {
                  props.onCriteriaChange(allValues);
                }}
              >
                <SearchFullText />
              </Form>
            </Tab>
          </Tabs>
        </div>
        <div className={styles.btn_container}>
          <div>
            <Button size="middle" className={styles.cancel_btn} onClick={handleResetSearch}>
              Clear
            </Button>
          </div>
          <div>
            <Button
              size="middle"
              className={styles.index_search_btn}
              type="primary"
              onClick={() => {
                if (searchType === 'searchIndexField') {
                  searchIndexForm.submit();
                } else if (searchType === 'searchFullText') {
                  searchFulltextForm.submit();
                }
              }}
            >
              Search
            </Button>
          </div>
        </div>
      </Row>
    </div>
  );
};

export default SearchFolder;
