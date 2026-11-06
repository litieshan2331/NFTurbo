import { getUserList, freezeUser, unfreezeUser } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { message } from 'antd';
import React, { useRef } from 'react';


const hanldFreezeUser = async (selectedRow: any, action: any) => {
  const hide = message.loading('处理中');

  try {
    await freezeUser({
      userId: selectedRow.userId
    });
    hide();
    message.success('冻结操作成功！');
    action.reload();
    return true;
  } catch (error) {
    hide();
    message.error('操作失败，请重试！');
    action.reload();
    return false;
  }
};

const hanldUnFreezeUser = async (selectedRow: any, action: any) => {
  const hide = message.loading('处理中');

  try {
    await unfreezeUser({
      userId: selectedRow.userId
    });
    hide();
    message.success('解冻操作成功！');
    action.reload();
    return true;
  } catch (error) {
    hide();
    message.error('操作失败，请重试！');
    action.reload();
    return false;
  }
};

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.CollectionListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'userId',
      width: 80,
      search: false
    },
    {
      title: '头像',
      dataIndex: 'profilePhotoUrl',
      valueType: 'image',
      width: 50,
      search: false
    },
    {
      title: '昵称',
      dataIndex: 'nickName',
      valueType: 'text',
      width: 'auto',
      search: false
    },
    {
      title: '电话',
      dataIndex: 'telephone',
      valueType: 'text',
      width: 120,
      search: true
    },
    {
      title: '区块链平台',
      dataIndex: 'blockChainPlatform',
      valueType: 'text',
      width: 120,
      search: false
    },
    {
      title: '状态',
      dataIndex: 'state',
      valueType: 'text',
      width: 80,
      search: true,
      align: 'center',
      valueEnum: {
        'ACTIVE': {
          text: '启用',
          status: 'Success',
        },
        'FROZEN': {
          text: '冻结中',
          status: 'Error'
        },
        'INIT': {
          text: '待实名',
          status: 'Warning'
        },
        'AUTH': {
          text: '待上链',
          status: 'Warning'
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record, index, action) => {
        if(record.state !== 'FROZEN') {
          return [<a key="freeze" onClick={() => {
            hanldFreezeUser(record, action);
          }}>冻结</a>]
        } else if(record.state === 'FROZEN') {
          return [
            <a key="unfreze" onClick={() => {
              hanldUnFreezeUser(record, action);
            }}>解冻</a>
          ]
        }
      },
    },
  ];


  return (
    <PageContainer>
      <ProTable<API.CollectionListItem, API.PageParams>
        headerTitle="用户列表"
        actionRef={actionRef}
        rowKey="key"
        toolBarRender={() => [
        ]}
        pagination={{
          pageSize: 10
        }}

        request={async (params: any, sort, filter) => {
          // 这里需要返回一个 Promise,在返回之前你可以进行数据转化
          // 如果需要转化参数可以在这里进行修改
          
          const listData = await getUserList({
            page: params.current,
            pageSize: params.pageSize,
            state: params.state || 'ACTIVE',
            telephone: params.telephone
          });          
          
          return listData;
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default TableList;
