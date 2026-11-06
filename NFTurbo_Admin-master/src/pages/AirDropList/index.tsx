import { getAirDropList } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import React, { useRef } from 'react';

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  
  const columns: ProColumns<API.AirDropListItem>[] = [
    {
      title: '藏品ID',
      dataIndex: 'collectionId',
      width: 100,
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '接收用户ID',
      dataIndex: 'recipientUserId',
      width: 120,
      hideInTable: false,
      hideInSearch: false,
    },
    {
      title: '空投数量',
      dataIndex: 'quantity',
      width: 100,
      align: 'right',
      hideInSearch: true,
    },
    {
      title: '空投时间',
      dataIndex: 'airDropTime',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.AirDropListItem, API.PageParams>
        headerTitle="空投记录"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => []}
        request={async (params, sorter, filter) => {
          const response = await getAirDropList({
            currentPage: params.current,
            pageSize: params.pageSize,
            collectionId: params.collectionId as number,
            userId: params.recipientUserId as string,
          });
          
          return {
            data: response.data,
            success: response.success,
            total: response.total,
          };
        }}
        columns={columns}
        pagination={{
          pageSize: 10,
        }}
      />
    </PageContainer>
  );
};

export default TableList; 