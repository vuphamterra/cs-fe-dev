import React from 'react';
import { MenuOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table } from 'antd';
import _ from 'lodash';
import type { ColumnsType } from 'antd/es/table';
import { TrashBin } from '~/components/Icons';
import { LIST_OPTION } from '../../interfaces';
import styles from './UserDefinedList.module.scss';

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

type UserDefinedListProps = {
  dataSource: LIST_OPTION[];
  setDataSource: (data: LIST_OPTION[]) => void;
  removeOption: (option: LIST_OPTION) => void;
};

const UserDefinedList: React.FC<UserDefinedListProps> = (props) => {
  const columns: ColumnsType<LIST_OPTION> = [
    {
      key: 'sort',
      width: 50,
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      key: 'action',
      width: 50,
      render(value) {
        return (
          <span className={styles.delete_option_btn} onClick={() => props.removeOption(value)}>
            <TrashBin className={styles.delete_option_icon} width={24} height={24} fill="" />
          </span>
        );
      },
    },
  ];

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const dataSource = _.cloneDeep(props.dataSource);
      const activeIndex = dataSource.findIndex((i) => i.key === active.id);
      const overIndex = dataSource.findIndex((i) => i.key === over?.id);
      const rearrangedDataSource = arrayMove(dataSource, activeIndex, overIndex);
      props.setDataSource(rearrangedDataSource);
    }
  };

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

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        // rowKey array
        items={props.dataSource.map((i) => i.key)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          className={`${styles.table_container} scroll_content`}
          components={{
            body: {
              row: Row,
            },
          }}
          rowKey="key"
          columns={columns}
          dataSource={props.dataSource}
          pagination={{ position: [], pageSize: 1000 }}
        />
      </SortableContext>
    </DndContext>
  );
};

export default UserDefinedList;
