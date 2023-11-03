import React, { FC, useEffect, useState } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import styles from './IndexFieldTable.module.scss';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { INDEX_FIELD, LIST_OPTION } from '../../interfaces';
import { trimAndReplace } from '../../utils';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { Pencil, TrashBin } from '~/components/Icons';
import { setDrawerList } from '~/store/DrawerSlice';

interface DataType {
  key: string | number;
  id: string | number;
  name: string;
  type: number;
  format: number;
  width: string;
  redflags: any;
  userDefinedList: LIST_OPTION[];
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const Row = ({ children, ...props }: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if ((child as React.ReactElement).key === 'sort') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <MenuOutlined
                ref={setActivatorNodeRef}
                style={{ touchAction: 'none', cursor: 'move' }}
                {...listeners}
              />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};
interface Props {
  data: INDEX_FIELD[];
  onEditRow?: (rowData: INDEX_FIELD) => void;
  onDeleteRow?: (rowData: INDEX_FIELD) => void;
  editing: boolean;
}

const IndexFieldTable: FC<Props> = ({ data, onEditRow, onDeleteRow, editing }) => {
  const dispatch = useAppDispatch();
  const { types } = useAppSelector((store) => store.indexField);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const getDataSource: () => DataType[] = () => {
    // eslint-disable-next-line react/prop-types
    return data.map((item: INDEX_FIELD) => ({
      key: item.key ? item.key : trimAndReplace(item.name, ' ', '_'),
      id: item.key ? item.key : trimAndReplace(item.name, ' ', '_'),
      name: item.name,
      type: item.type,
      format: item.format,
      width: item.width,
      redflags: item.redflags,
      userDefinedList: item.userDefinedList,
    }));
  };

  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    if (!editing) {
      setSelectedRowKeys([]);
    }
  }, [editing]);

  useEffect(() => {
    if (data.length > 0) {
      setDataSource(getDataSource());
    }
  }, [data]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((previous) => {
        const activeIndex = previous.findIndex((i) => i?.key === active?.id);
        const overIndex = previous.findIndex((i) => i?.key === over?.id);
        return arrayMove(previous, activeIndex, overIndex);
      });
    }
  };

  dispatch(setDrawerList(dataSource));

  const onClickEdit = (record) => {
    setSelectedRowKeys([record.key]);
    onEditRow(record);
  };

  const onClickDelete = (record) => {
    onDeleteRow(record);
  };

  const getColumns: () => ColumnsType<DataType> = () => [
    {
      key: 'sort',
    },
    {
      title: 'Field Name',
      dataIndex: 'name',
      key: 'fieldName',
    },
    {
      title: 'Field Type',
      dataIndex: 'type',
      key: 'fieldType',
      render(value) {
        const type = types.find((item) => item.id === value);
        return type ? type.name : '--';
      },
    },
    {
      title: 'Width',
      dataIndex: 'width',
      key: 'width',
      render(value) {
        return value > 0 ? value : '-';
      },
    },
    {
      title: 'Required',
      dataIndex: 'redflags',
      key: 'required',
      render(value) {
        return value.required ? 'Yes' : 'No';
      },
    },
    {
      title: 'Unique',
      dataIndex: 'redflags',
      key: 'unique',
      render(value) {
        return value.uniqueKey ? 'Yes' : 'No';
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render(value, record) {
        return (
          <>
            <a className={styles.edit_btn} onClick={() => onClickEdit(record)}>
              <Pencil width={16} height={16} fill="" />
            </a>
            <a className={styles.delete_btn} onClick={() => onClickDelete(record)}>
              <TrashBin width={16} height={16} fill="" />
            </a>
          </>
        );
      },
    },
  ];

  const onSelectedRowKeysChange = (rowKeys) => {
    setSelectedRowKeys(rowKeys);
  };

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        // rowKey array
        items={dataSource.map((i) => i.key)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`index_field_table ${styles.container}`}>
          <Table
            components={editing && {
              body: {
                row: Row,
              },
            }}
            rowKey="key"
            columns={getColumns()}
            dataSource={dataSource}
            pagination={{ position: ['bottomRight'] }}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectedRowKeysChange,
              type: 'radio',
              renderCell: () => '',
            }}
            bordered
          />
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default IndexFieldTable
