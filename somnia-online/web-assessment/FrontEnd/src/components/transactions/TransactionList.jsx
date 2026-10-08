import { Table, Tag, Space, Button, Popconfirm, Empty, Spin } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';

const TransactionList = ({ transactions = [], loading = false, onEdit, onDelete, onTypeFilter, onCategoryFilter }) => {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: date => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Income', value: 'Income' },
        { text: 'Expense', value: 'Expense' }
      ],
      onFilter: (value, record) => record.type === value,
      render: type => <Tag color={type === 'Income' ? 'green' : 'red'}>{type}</Tag>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category),
      render: category => <Tag>{category}</Tag>
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount, record) => (
        <span style={{ color: record.type === 'Income' ? '#52c41a' : '#f5222d' }}>
          {record.type === 'Income' ? '+' : '-'}
          {amount.toFixed(2)}
        </span>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="small" onClick={() => onEdit(record)} icon={<FontAwesomeIcon icon={faPen} />} />
          <Popconfirm
            title="Delete Transaction"
            description="Are you sure you want to delete this transaction?"
            onConfirm={() => onDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small" icon={<FontAwesomeIcon icon={faTrash} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Spin spinning={loading}>
      {transactions.length === 0 ? (
        <Empty description="No transactions yet" style={{ marginTop: '50px' }} />
      ) : (
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      )}
    </Spin>
  );
};

export default TransactionList;
