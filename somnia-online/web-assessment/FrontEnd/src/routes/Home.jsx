import { useCallback, useEffect, useState } from 'react';
import { Button, message } from 'antd';

import ContentPanel from '../components/core/layout/ContentPanel';
import { TransactionList, TransactionModal } from '../components/transactions';
import { transactionService } from '../helpers/services/transactionService';

const Home = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await transactionService.getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
      message.error('Could not load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const openCreate = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async values => {
    setSaving(true);
    try {
      if (editingTransaction) {
        await transactionService.updateTransaction(editingTransaction._id, values);
        message.success('Transaction updated');
      } else {
        await transactionService.createTransaction(values);
        message.success('Transaction added');
      }
      closeModal();
      await loadTransactions();
    } catch {
      message.error(editingTransaction ? 'Could not update transaction' : 'Could not add transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    try {
      await transactionService.deleteTransaction(id);
      message.success('Transaction deleted');
      await loadTransactions();
    } catch {
      message.error('Could not delete transaction');
    }
  };

  return (
    <ContentPanel
      title="Expense and Income Diary"
      titleAction={
        <Button type="primary" onClick={openCreate}>
          Add Transaction
        </Button>
      }
    >
      <TransactionList
        transactions={transactions}
        loading={loading}
        onEdit={record => {
          setEditingTransaction(record);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
      />
      <TransactionModal
        visible={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={saving}
        editingTransaction={editingTransaction}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      />
    </ContentPanel>
  );
};

export default Home;
