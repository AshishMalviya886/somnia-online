const mongoose = require('mongoose');
const softDelete = require('../helpers/softDelete');
const dbFields = require('../helpers/dbFields');
const mongooseHistory = require('../helpers/mongooseHistory');

const { Schema } = mongoose;

const schema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true
    },
    type: {
      type: String,
      enum: ['Income', 'Expense'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 512
    }
  },
  {
    timestamps: true
  }
);

schema.plugin(softDelete);
schema.plugin(dbFields, {
  fields: {
    public: ['_id', 'type', 'amount', 'category', 'date', 'description', 'createdAt'],
    listing: ['_id', 'type', 'amount', 'category', 'date', 'description', 'createdAt', 'updatedAt'],
    cp: ['_id', 'type', 'amount', 'category', 'date', 'description', 'createdAt', 'updatedAt']
  }
});

schema.plugin(
  mongooseHistory({
    mongoose,
    modelName: 'transactions_h',
    userCollection: 'User',
    accountCollection: 'Company',
    userFieldName: 'user',
    accountFieldName: 'company',
    noDiffSaveOnMethods: []
  })
);

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', schema);
