import { Modal } from 'antd';
import TransactionForm from './TransactionForm';

const TransactionModal = ({ visible, onClose, onSubmit, loading, editingTransaction, title = 'Add Transaction' }) => {
  const handleSubmit = data => {
    onSubmit(data);
  };

  return (
    <Modal title={title} open={visible} onCancel={onClose} footer={null} destroyOnClose width={600}>
      <TransactionForm
        initialValues={editingTransaction}
        onSubmit={handleSubmit}
        loading={loading}
        isEditing={!!editingTransaction}
      />
    </Modal>
  );
};

export default TransactionModal;
