const Transaction = require('../models/transaction');
const { SendData, ServerError, NotFound } = require('../helpers/response');
const getter = require('../helpers/getter');

const transactionQuery = ({ filter, type, category, startDate, endDate }) => {
  const query = {};

  if (filter) {
    query.description = new RegExp(filter, 'i');
  }

  if (type) {
    query.type = type;
  }

  if (category) {
    query.category = new RegExp(category, 'i');
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  return query;
};

module.exports.get = async (req, res, next) => {
  try {
    const { user } = res.locals;
    const query = transactionQuery(req.query);
    query.user = user.id;

    const data = await getter(Transaction, query, req, res, [...Transaction.getFields('listing')]);

    return next(SendData(data));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.create = async (req, { locals: { user } }, next) => {
  try {
    const data = new Transaction({
      ...req.body,
      user: user.id
    });

    data.__history = {
      user: user.id,
      event: 'create',
      method: 'post'
    };

    await data.save();

    return next(SendData(data.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.getById = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const targetTransaction = await Transaction.findOne(
      { _id: id, user: user.id },
      Transaction.getFields('cp')
    );

    if (!targetTransaction) return next(NotFound());

    return next(SendData(targetTransaction.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.update = async ({ params: { id }, body }, { locals: { user } }, next) => {
  try {
    const targetTransaction = await Transaction.findOne({ _id: id, user: user.id });

    if (!targetTransaction) return next(NotFound());

    const data = Object.assign(targetTransaction, body);

    data.__history = {
      event: 'update',
      method: 'patch',
      user: user.id
    };

    await data.save();

    return next(SendData(data.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.delete = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const targetTransaction = await Transaction.findOne({ _id: id, user: user.id });

    if (!targetTransaction) return next(NotFound());

    targetTransaction.__history = {
      event: 'delete',
      method: 'delete',
      user: user.id
    };

    await targetTransaction.softDelete();

    return next(SendData({ message: 'Transaction deleted successfully' }));
  } catch (err) {
    return next(ServerError(err));
  }
};
