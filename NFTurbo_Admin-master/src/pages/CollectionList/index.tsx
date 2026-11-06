import { addCollection, uploadCollection, removeCollection, getCollectionList, updateQuantity, updatePrice, airDropCollection } from '@/services/ant-design-pro/api';
import { PlusOutlined, UploadOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormDateTimePicker,
  ProFormItem,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Upload, Modal } from 'antd';
import React, { useRef, useState } from 'react';

const { confirm } = Modal;

// 查询状态映射（用于搜索表单）
const QueryStateMap = {
  INIT: {
    text: '新创建',
  },
  SUCCEED: {
    text: '发布成功',
  },
  REMOVED: {
    text: '已下架',
  },
};

// 添加状态映射常量
const CollectionStateMap = {
  NOT_FOR_SALE: {
    text: '不可售卖',
    status: 'default',
  },
  SELLING: {
    text: '售卖中',
    status: 'success',
  },
  SOLD_OUT: {
    text: '售空',
    status: 'error',
  },
  COMING_SOON: {
    text: '即将开售',
    status: 'warning',
  },
  WAIT_FOR_SALE: {
    text: '等待开售',
    status: 'processing',
  },
};

/**
 * 下架
 *
 */
const handleRemove = async (selectedRow: any, action: any) => {
  const hide = message.loading('正在删除');

  try {
    await removeCollection({
      // identifier: selectedRow.id,
      collectionId: selectedRow.id
    });
    hide();
    message.success('下架操作成功！');
    action.reload();
    return true;
  } catch (error) {
    hide();
    message.error('操作失败，请重试！');
    action.reload();
    return false;
  }
};

const handleAirDrop = async (values: any) => {
  const hide = message.loading('正在空投...');
  try {
    await airDropCollection(values);
    hide();
    message.success('空投成功！');
    return true;
  } catch (error) {
    hide();
    message.error('空投失败，请重试！');
    return false;
  }
};

const TableList: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [updatePriceModelOpen, setUpdatePriceModelOpen] = useState<boolean>(false);
  const [updateQuantityModalOpen, setUpdateQuantityModalOpen] = useState<boolean>(false);
  const [airDropModalOpen, setAirDropModalOpen] = useState<boolean>(false);
  const [showBookingTime, setShowBookingTime] = useState<boolean>(true);

  const [fileList, setFileList] = useState<any>([]);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<any>({});
  
  const columns: ProColumns<API.CollectionListItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false
    },
    {
      title: '图片',
      dataIndex: 'cover',
      valueType: 'image',
      width: 50,
      search: false
    },
    {
      title: '商品名称',
      dataIndex: 'goodsName',
      valueType: 'textarea',
      width: 'auto',
      hideInSearch: false,
      fieldProps: {
        placeholder: '请输入藏品名称',
      },
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: 100,
      valueEnum: CollectionStateMap,
      hideInSearch: false,
      filters: true,
      onFilter: true,
      valueType: 'select',
      fieldProps: {
        placeholder: '请选择状态',
        options: Object.entries(QueryStateMap).map(([value, { text }]) => ({
          label: text,
          value: value,
        })),
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      valueType: 'money',
      width: 120,
      align: 'right',
      search: false
    },
    {
      title: '发行量',
      dataIndex: 'quantity',
      valueType: 'digit',
      width: 80,
      align: 'right',
      search: false
    },
    {
      title: '库存',
      dataIndex: 'inventory',
      valueType: 'digit',
      width: 80,
      align: 'right',
      search: false
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 168,
      search: false
    },
    {
      title: '开售时间',
      dataIndex: 'saleTime',
      valueType: 'dateTime',
      width: 168,
      search: false
    },
    {
      title: '同步链时间',
      dataIndex: 'syncChainTime',
      valueType: 'dateTime',
      width: 168,
      search: false
    },
    {
      title: '版本',
      dataIndex: 'version',
      valueType: 'digit',
      width: 50,
      align: 'center',
      search: false
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record, index, action) => [
        <a key="updateInventory" onClick={() => {
          setCurrentRow(record);
          setUpdateQuantityModalOpen(true);
        }}>改库存</a>,
        <a key="updatePrice" onClick={() => {
          setCurrentRow(record);
          setUpdatePriceModelOpen(true)
        }}>改价格</a>,
        <a key="remove" onClick={() => {
          confirm({
            title: '操作确认',
            icon: <ExclamationCircleFilled />,
            content: '操作后不可恢复，确认执行确认下架操作吗？',
            onOk() {
              handleRemove(record, action)
            },
            onCancel() {
              
            }
          })
        }}>下架</a>,
        <a key="airDrop" onClick={() => {
          setCurrentRow(record);
          setAirDropModalOpen(true);
        }}>空投</a>,
      ],
    },
  ];

  const uploadProps = {
    onRemove: (file: any) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: any) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <PageContainer>
      <ProTable<API.CollectionListItem, API.PageParams>
        headerTitle="藏品列表"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCreateModalOpen(true);
            }}
          >
            <PlusOutlined /> 创建藏品
          </Button>,
        ]}
        request={async (params, sort, filter) => {
          const collectionListData = await getCollectionList({
            page: params.current,
            pageSize: params.pageSize,
            state: params.state,
            keyWord: params.goodsName,
          });          
          
          return {
            data: collectionListData.data,
            success: collectionListData.success,
            total: collectionListData.total,
          };
        }}
        columns={columns}
        pagination={{
          pageSize: 10
        }}
      />
      <ModalForm
        title="创建藏品"
        width="400px"
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async (value) => {
          const formData = new FormData();
          formData.append('file_data', value.file_data.file);

          const uploadRst: any = await uploadCollection(formData);

          if (uploadRst?.success) {
            value.cover = uploadRst.data;
            delete value.file_data;

            if (!showBookingTime) {
              delete value.bookStartTime;
              delete value.bookEndTime;
            }

            const success = await addCollection(value);
            if (success) {
              message.success('成功新增藏品!');
              setCreateModalOpen(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }
        }}
      >
        <ProFormText
          label="藏品名称"
          rules={[
            {
              required: true,
              message: '藏品名称必填',
            },
          ]}
          width="md"
          name="name"
        />
       
        <ProFormText
          label="价格"
          rules={[
            {
              required: true,
              message: '请输入价格',
            },
          ]}
          width="md"
          name="price"
        />
        <ProFormText
          label="发行数量"
          rules={[
            {
              required: true,
              message: '请输入藏品发行数量',
            },
          ]}
          width="md"
          name="quantity"
        />
        <ProFormDateTimePicker rules={[
            {
              required: true,
              type: 'date',
              message: '请输入发售时间'
            }
          ]}
          label="发售时间"
          width="md"
          name="saleTime"/>
           <ProFormSelect
          label="是否可预约"
          rules={[
            {
              required: true,
              message: '请选择是否可预约',
            },
          ]}
          width="md"
          name="canBook"
          options={[
            {
              label: '可预约',
              value: 1,
            },
            {
              label: '不可预约',
              value: 0,
            },
          ]}
          fieldProps={{
            onChange: (value) => {
              setShowBookingTime(value === 1);
            },
          }}
        />
        
        {showBookingTime && (
          <>
            <ProFormDateTimePicker
              label="预约开始时间"
              rules={[
                {
                  required: true,
                  message: '请选择预约开始时间',
                },
              ]}
              width="md"
              name="bookStartTime"
            />
            <ProFormDateTimePicker
              label="预约结束时间"
              rules={[
                {
                  required: true,
                  message: '请选择预约结束时间',
                },
              ]}
              width="md"
              name="bookEndTime"
            />
          </>
        )}
        
        <ProFormTextArea 
          label="描述信息"
          width="md"
          name="detail" />
        <ProFormItem label="图片" required name="file_data">
          <Upload maxCount={1} multiple={false} {...uploadProps}>
            <Button icon={<UploadOutlined />}>上传图片</Button>
          </Upload>
        </ProFormItem>
        
      </ModalForm>
      <ModalForm
        title="修改价格"
        width="400px"
        open={updatePriceModelOpen}
        onOpenChange={setUpdatePriceModelOpen}
        onFinish={async (value) => {
          const success = await updatePrice({
            // identifier: currentRow.id,
            collectionId: currentRow.id,
            ...value
          });

          if (success) {
            setUpdatePriceModelOpen(false);
            message.success('成功修改价格!');

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          label="价格"
          addonBefore="¥"
          addonAfter="元"
          rules={[
            {
              required: true,
              message: "请输入价格",
            },
          ]}
          value={currentRow.price}
          width="sm"
          name="price"
        />
      </ModalForm>
      <ModalForm
        key="updateQuantity"
        title="修改发行量"
        width="400px"
        open={updateQuantityModalOpen}
        onOpenChange={setUpdateQuantityModalOpen}
        onFinish={async (value) => {
          const success = await updateQuantity({
            // identifier: currentRow.id,
            collectionId: currentRow.id,
            ...value
          });

          if (success) {
            setUpdateQuantityModalOpen(false);
            message.success('成功修改发行量及对应库存!');

            setCurrentRow({});

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          label="发行量"
          rules={[
            {
              required: true,
              message: "请输入发行数量",
            },
          ]}
          proFormFieldKey="aaa"
          value={currentRow.quantity}
          width="md"
          name="quantity"
        />
      </ModalForm>
      <ModalForm
        title="藏品空投"
        width="400px"
        open={airDropModalOpen}
        onOpenChange={setAirDropModalOpen}
        onFinish={async (value) => {
          const success = await handleAirDrop({
            collectionId: currentRow.id,
            recipientUserId: value.recipientUserId,
            quantity: value.quantity,
            bizType: "AIR_DROP"
          });

          if (success) {
            setAirDropModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          label="接收用户ID"
          rules={[
            {
              required: true,
              message: "请输入接收用户ID",
            },
          ]}
          width="md"
          name="recipientUserId"
        />
        <ProFormText
          label="空投数量"
          rules={[
            {
              required: true,
              message: "请输入空投数量",
            },
          ]}
          width="md"
          name="quantity"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default TableList;
