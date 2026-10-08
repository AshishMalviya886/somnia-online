import Api from '../core/Api';

export const transactionService = {
  /**
   * Get all transactions for the current user
   * @param {Object} filters - Optional filters (type, category, startDate, endDate, filter)
   * @returns {Promise<Array>}
   */
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.filter) params.append('filter', filters.filter);
    if (filters.sorter) params.append('sorter', filters.sorter);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const url = queryString ? `/transactions?${queryString}` : '/transactions';

    const response = await Api.get(url);
    return response.data;
  },

  /**
   * Get a single transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>}
   */
  getTransaction: async id => {
    const response = await Api.get(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Create a new transaction
   * @param {Object} data - Transaction data (type, amount, category, date, description)
   * @returns {Promise<Object>}
   */
  createTransaction: async data => {
    const response = await Api.post('/transactions', data);
    return response.data;
  },

  /**
   * Update a transaction
   * @param {string} id - Transaction ID
   * @param {Object} data - Updated transaction data
   * @returns {Promise<Object>}
   */
  updateTransaction: async (id, data) => {
    const response = await Api.patch(`/transactions/${id}`, data);
    return response.data;
  },

  /**
   * Delete a transaction
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>}
   */
  deleteTransaction: async id => {
    const response = await Api.delete(`/transactions/${id}`);
    return response.data;
  }
};

export default transactionService;
