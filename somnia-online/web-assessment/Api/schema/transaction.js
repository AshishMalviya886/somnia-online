module.exports = {
  createTransaction: {
    $id: 'createTransaction',
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['Income', 'Expense'],
        errorMessage: 'Type must be either "Income" or "Expense"'
      },
      amount: {
        type: 'number',
        exclusiveMinimum: 0,
        errorMessage: 'Amount must be greater than 0'
      },
      category: {
        type: 'string',
        minLength: 1,
        maxLength: 64,
        isNotEmpty: true,
        errorMessage: 'Category is required and must be between 1 and 64 characters'
      },
      date: {
        type: 'string',
        format: 'date-time',
        errorMessage: 'Date must be a valid ISO date string'
      },
      description: {
        type: 'string',
        maxLength: 512
      }
    },
    required: ['type', 'amount', 'category', 'date'],
    additionalProperties: false
  },
  updateTransaction: {
    $id: 'updateTransaction',
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['Income', 'Expense'],
        errorMessage: 'Type must be either "Income" or "Expense"'
      },
      amount: {
        type: 'number',
        exclusiveMinimum: 0,
        errorMessage: 'Amount must be greater than 0'
      },
      category: {
        type: 'string',
        minLength: 1,
        maxLength: 64,
        isNotEmpty: true,
        errorMessage: 'Category is required and must be between 1 and 64 characters'
      },
      date: {
        type: 'string',
        format: 'date-time',
        errorMessage: 'Date must be a valid ISO date string'
      },
      description: {
        type: 'string',
        maxLength: 512
      }
    },
    additionalProperties: false
  }
};
