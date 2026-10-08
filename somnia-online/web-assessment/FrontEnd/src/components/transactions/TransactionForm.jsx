import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button, Space } from 'antd';
import dayjs from 'dayjs';

const TransactionForm = ({ initialValues, onSubmit, loading, isEditing }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        type: initialValues.type,
        amount: initialValues.amount,
        category: initialValues.category,
        date: initialValues.date ? dayjs(initialValues.date) : null,
        description: initialValues.description
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleSubmit = values => {
    onSubmit({
      type: values.type,
      amount: values.amount,
      category: values.category,
      date: values.date.toISOString(),
      description: values.description || ''
    });
  };

  const categoryOptions = [
    { label: 'Salary', value: 'Salary' },
    { label: 'Bonus', value: 'Bonus' },
    { label: 'Investment', value: 'Investment' },
    { label: 'Other Income', value: 'Other Income' },
    { label: 'Food', value: 'Food' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Shopping', value: 'Shopping' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Other Expense', value: 'Other Expense' }
  ];

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
      <Form.Item
        name="type"
        label="Type"
        rules={[{ required: true, message: 'Please select transaction type' }]}
      >
        <Select
          placeholder="Select Income or Expense"
          options={[
            { label: 'Income', value: 'Income' },
            { label: 'Expense', value: 'Expense' }
          ]}
        />
      </Form.Item>

      <Form.Item
        name="amount"
        label="Amount"
        rules={[
          { required: true, message: 'Please enter amount' },
          { pattern: /^[0-9]*\.?[0-9]+$/, message: 'Amount must be a valid number' }
        ]}
      >
        <InputNumber
          placeholder="0.00"
          step={0.01}
          min={0.01}
          style={{ width: '100%' }}
          precision={2}
        />
      </Form.Item>

      <Form.Item
        name="category"
        label="Category"
        rules={[{ required: true, message: 'Please select a category' }]}
      >
        <Select placeholder="Select category" options={categoryOptions} allowClear />
      </Form.Item>

      <Form.Item
        name="date"
        label="Date"
        rules={[{ required: true, message: 'Please select date' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ max: 512, message: 'Description cannot exceed 512 characters' }]}
      >
        <Input.TextArea
          placeholder="Optional description"
          rows={3}
          maxLength={512}
          showCount
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditing ? 'Update Transaction' : 'Create Transaction'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TransactionForm;
