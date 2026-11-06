import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Table, Modal, Form, Input, Select, message, InputNumber, DatePicker, Space, Upload } from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { request } from 'umi';
import moment from 'moment';

interface BlindBox {
  id: number;
  name: string;
  state: string;
  cover: string;
  detail: string;
  price: number;
  inventory: number;
  quantity: number;
}

// 添加状态枚举
const BOX_STATUS = {
  INIT: 'INIT',
  SUCCEED: 'SUCCEED',
  REMOVED: 'REMOVED',
} as const;

const BOX_STATUS_MAP = {
  [BOX_STATUS.INIT]: '未处理',
  [BOX_STATUS.SUCCEED]: '发布成功',
  [BOX_STATUS.REMOVED]: '已下架',
};

// 添加稀有度枚举
const RARITY_OPTIONS = {
  LEGENDARY: '传说',
  EPIC: '史诗',
  RARE: '稀有',
  COMMON: '普通',
  UNIQUE:'独特',
MYTHICAL:'神话'

};

const BlindBoxList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlindBox[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [collectionCovers, setCollectionCovers] = useState<Record<number, string>>({});

  const fetchBlindBoxList = async (params: any) => {
    setLoading(true);
    try {
      const response = await request('/admin/box/blindBoxList', {
        method: 'GET',
        params: {
          state: params.state || 'SUCCEED',
          keyWord: params.keyWord,
          currentPage: params.current,
          pageSize: params.pageSize,
        },
      });
      
      if (response.success) {
        setData(response.data);
        setPagination({
          ...pagination,
          current: response.page,
          pageSize: response.size,
          total: response.total,
        });
      } else {
        message.error(response.message || '获取数据失败');
      }
    } catch (error) {
      message.error('获取数据失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlindBoxList({
      current: 1,
      pageSize: 10,
    });
  }, []);

  const handleTableChange = (newPagination: any) => {
    fetchBlindBoxList({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      ...searchForm.getFieldsValue(),
    });
  };

  const onSearch = () => {
    fetchBlindBoxList({
      current: 1,
      pageSize: pagination.pageSize,
      ...searchForm.getFieldsValue(),
    });
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 转换表单数据格式
      const submitData = {
        ...values,
        saleTime: values.saleTime.format('YYYY-MM-DD HH:mm:ss'),
        canBook: false, // 默认不可预约
        collectionBoxParams: values.collectionBoxParams.map((item: any) => ({
          ...item,
          quantity: Number(item.quantity),
          referencePrice: Number(item.referencePrice),
        })),
      };

      const response = await request('/admin/box/createBlindBox', {
        method: 'POST',
        data: submitData,
      });

      if (response.success) {
        message.success('创建成功');
        // 清空表单和状态
        form.resetFields();
        setCoverUrl('');
        setCollectionCovers({});
        setIsModalVisible(false);
        // 刷新列表
        fetchBlindBoxList({
          current: 1,
          pageSize: pagination.pageSize,
          ...searchForm.getFieldsValue(),
        });
      } else {
        message.error(response.message || '创建失败');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCoverUrl('');
    setCollectionCovers({});
  };

  const columns = [
    {
      title: '盲盒名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '封面',
      dataIndex: 'cover',
      key: 'cover',
      render: (cover: string) => (
        <img src={cover} alt="封面" style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '库存/总量',
      key: 'inventory',
      render: (record: BlindBox) => `${record.inventory}/${record.quantity}`,
    },
  ];

  // 修改上传组件的属性配置
  const uploadProps = (field: string, fieldIndex?: number) => ({
    name: 'file_data',
    action: field === 'cover' ? '/admin/box/uploadBlindBox' : '/admin/box/uploadCollection',
    showUploadList: false,
    headers: {
      'Accept': 'application/json',
    },
    data: {
      fieldName: fieldIndex,
    },
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      return true;
    },
    onChange(info: any) {
      if (info.file.status === 'done') {
        if (info.file.response.success) {
          const imageUrl = info.file.response.data;
          if (field === 'cover') {
            form.setFieldsValue({ cover: imageUrl });
            setCoverUrl(imageUrl);
          } else {
            const fieldName = fieldIndex as number;
            // 获取当前所有的 collectionBoxParams
            const currentParams = form.getFieldValue('collectionBoxParams') || [];
            // 更新特定索引的 collectionCover
            currentParams[fieldName] = {
              ...currentParams[fieldName],
              collectionCover: imageUrl,
            };
            // 更新整个数组
            form.setFieldsValue({
              collectionBoxParams: currentParams,
            });
            // 更新预览状态
            setCollectionCovers(prev => ({
              ...prev,
              [fieldName]: imageUrl
            }));
          }
          message.success('上传成功');
        } else {
          message.error(info.file.response.message || '上传失败');
        }
      } else if (info.file.status === 'error') {
        message.error('上传失败');
      }
    },
  });

  return (
    <PageContainer>
      <Form
        form={searchForm}
        layout="inline"
        style={{ marginBottom: 24 }}
        onFinish={onSearch}
      >
        <Form.Item name="state" initialValue={BOX_STATUS.SUCCEED}>
          <Select style={{ width: 120 }}>
            <Select.Option value={BOX_STATUS.INIT}>未处理</Select.Option>
            <Select.Option value={BOX_STATUS.SUCCEED}>发布成功</Select.Option>
            <Select.Option value={BOX_STATUS.REMOVED}>已下架</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="keyWord">
          <Input placeholder="请输入搜索关键词" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            创建盲盒
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <Modal
        title="创建盲盒"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            collectionBoxParams: [{}],
          }}
        >
          <Form.Item
            name="name"
            label="盲盒名称"
            rules={[{ required: true, message: '请输入盲盒名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="detail"
            label="盲盒描述"
            rules={[{ required: true, message: '请输入盲盒描述' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="cover"
            label="盲盒封面"
            rules={[{ required: true, message: '请上传盲盒封面' }]}
          >
            <div>
              <Input.Group compact style={{ marginBottom: coverUrl ? '8px' : 0 }}>
                <Input 
                  style={{ width: 'calc(100% - 100px)' }} 
                  placeholder="请上传盲盒封面"
                  readOnly
                  value={coverUrl}
                />
                <Upload {...uploadProps('cover')}>
                  <Button icon={<UploadOutlined />}>上传</Button>
                </Upload>
              </Input.Group>
              {coverUrl && (
                <div style={{ marginTop: 8 }}>
                  <img src={coverUrl} alt="盲盒封面" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="总数量"
            rules={[{ required: true, message: '请输入总数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="saleTime"
            label="销售时间"
            rules={[{ required: true, message: '请选择销售时间' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.List name="collectionBoxParams">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ marginBottom: 24, padding: 24, border: '1px dashed #d9d9d9' }}>
                    <Space align="baseline" style={{ marginBottom: 8 }}>
                      <h4>藏品 #{name + 1}</h4>
                      {fields.length > 1 && (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      )}
                    </Space>

                    <Form.Item
                      {...restField}
                      name={[name, 'collectionName']}
                      label="藏品名称"
                      rules={[{ required: true, message: '请输入藏品名称' }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'collectionCover']}
                      label="藏品封面"
                      rules={[{ required: true, message: '请上传藏品封面' }]}
                    >
                      <div>
                        <Input.Group compact style={{ marginBottom: collectionCovers[name] ? '8px' : 0 }}>
                          <Input 
                            style={{ width: 'calc(100% - 100px)' }} 
                            placeholder="请上传藏品封面"
                            readOnly
                            value={collectionCovers[name]}
                          />
                          <Upload {...uploadProps('collection', name)}>
                            <Button icon={<UploadOutlined />}>上传</Button>
                          </Upload>
                        </Input.Group>
                        {collectionCovers[name] && (
                          <div style={{ marginTop: 8 }}>
                            <img 
                              src={collectionCovers[name]} 
                              alt="藏品封面" 
                              style={{ maxWidth: '200px', maxHeight: '200px' }} 
                            />
                          </div>
                        )}
                      </div>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'collectionDetail']}
                      label="藏品描述"
                      rules={[{ required: true, message: '请输入藏品描述' }]}
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      label="数量"
                      rules={[{ required: true, message: '请输入数量' }]}
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'referencePrice']}
                      label="参考价格"
                      rules={[{ required: true, message: '请输入参考价格' }]}
                    >
                      <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'rarity']}
                      label="稀有度"
                      rules={[{ required: true, message: '请选择稀有度' }]}
                    >
                      <Select>
                        {Object.entries(RARITY_OPTIONS).map(([value, label]) => (
                          <Select.Option key={value} value={value}>
                            {label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加藏品
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BlindBoxList; 