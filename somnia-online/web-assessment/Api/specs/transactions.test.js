const supertest = require('supertest');

const app = require('../app');
const db = require('../db/connect-test');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const { genereteAuthToken } = require('../helpers/auth');

const agent = supertest.agent(app);

let user1;
let user1Token;
let user2;
let user2Token;

beforeAll(async () => await db.connect());
beforeEach(async () => {
  await db.clear();

  const User1Creation = async () => {
    user1 = await new User({
      email: 'user1@test.com',
      password: 'testtest',
      name: 'User',
      lastname: 'One',
      lang: 'EN',
      active: true,
      roles: ['user']
    }).save();

    user1Token = genereteAuthToken(user1).token;
  };

  const User2Creation = async () => {
    user2 = await new User({
      email: 'user2@test.com',
      password: 'testtest',
      name: 'User',
      lastname: 'Two',
      lang: 'EN',
      active: true,
      roles: ['user']
    }).save();

    user2Token = genereteAuthToken(user2).token;
  };

  return Promise.all([User1Creation(), User2Creation()]);
});

afterEach(() => jest.clearAllMocks());
afterAll(async () => await db.close());

describe('Transactions API', () => {
  describe('POST /transactions - Create transaction', () => {
    test('User can create an income transaction', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .send({
          type: 'Income',
          amount: 1000,
          category: 'Salary',
          date: new Date('2024-01-15'),
          description: 'Monthly salary'
        })
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual({
            _id: expect.any(String),
            type: 'Income',
            amount: 1000,
            category: 'Salary',
            date: expect.any(String),
            description: 'Monthly salary',
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          });
        }));

    test('User can create an expense transaction', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .send({
          type: 'Expense',
          amount: 50.75,
          category: 'Food',
          date: new Date('2024-01-16'),
          description: 'Lunch'
        })
        .expect(200)
        .then(res => {
          expect(res.body.type).toBe('Expense');
          expect(res.body.amount).toBe(50.75);
          expect(res.body.category).toBe('Food');
        }));

    test('Transaction requires type', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .send({
          amount: 1000,
          category: 'Salary',
          date: new Date('2024-01-15')
        })
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe(201);
        }));

    test('Transaction requires amount', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .send({
          type: 'Income',
          category: 'Salary',
          date: new Date('2024-01-15')
        })
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe(201);
        }));

    test('Transaction amount must be greater than 0', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .send({
          type: 'Income',
          amount: 0,
          category: 'Salary',
          date: new Date('2024-01-15')
        })
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe(200);
        }));

    test('Transaction type must be Income or Expense', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .send({
          type: 'Transfer',
          amount: 1000,
          category: 'Salary',
          date: new Date('2024-01-15')
        })
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe(200);
        }));

    test('Transaction requires category', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .send({
          type: 'Income',
          amount: 1000,
          date: new Date('2024-01-15')
        })
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe(201);
        }));

    test('Transaction requires valid date', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .send({
          type: 'Income',
          amount: 1000,
          category: 'Salary',
          date: 'invalid-date'
        })
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe(200);
        }));

    test('Unauthorized user cannot create transaction', () =>
      agent
        .post('/transactions')
        .send({
          type: 'Income',
          amount: 1000,
          category: 'Salary',
          date: new Date('2024-01-15')
        })
        .expect(401));
  });

  describe('GET /transactions - Get all transactions', () => {
    test('User can get their transactions', async () => {
      await new Transaction({
        user: user1.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15'),
        description: 'Monthly salary'
      }).save();

      await new Transaction({
        user: user1.id,
        type: 'Expense',
        amount: 50,
        category: 'Food',
        date: new Date('2024-01-16'),
        description: 'Lunch'
      }).save();

      return agent
        .get('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].user).toBeUndefined();
          expect(res.body[0].type).toBeDefined();
          expect(res.body[0].amount).toBeDefined();
        });
    });

    test('User only sees their transactions', async () => {
      await new Transaction({
        user: user1.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15')
      }).save();

      await new Transaction({
        user: user2.id,
        type: 'Income',
        amount: 2000,
        category: 'Bonus',
        date: new Date('2024-01-15')
      }).save();

      return agent
        .get('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].amount).toBe(1000);
        });
    });

    test('Can filter transactions by type', async () => {
      await new Transaction({
        user: user1.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15')
      }).save();

      await new Transaction({
        user: user1.id,
        type: 'Expense',
        amount: 50,
        category: 'Food',
        date: new Date('2024-01-16')
      }).save();

      return agent
        .get('/transactions?type=Expense')
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].type).toBe('Expense');
        });
    });

    test('Empty transaction list returns empty array', () =>
      agent
        .get('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toStrictEqual([]);
        }));

    test('Unauthorized user cannot get transactions', () =>
      agent.get('/transactions').expect(401));
  });

  describe('GET /transactions/:id - Get single transaction', () => {
    test('User can get their transaction by ID', async () => {
      const transaction = await new Transaction({
        user: user1.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15'),
        description: 'Monthly salary'
      }).save();

      return agent
        .get(`/transactions/${transaction.id}`)
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(200)
        .then(res => {
          expect(res.body._id).toBe(transaction.id);
          expect(res.body.type).toBe('Income');
          expect(res.body.amount).toBe(1000);
        });
    });

    test('User cannot get another user\'s transaction', async () => {
      const transaction = await new Transaction({
        user: user2.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15')
      }).save();

      return agent
        .get(`/transactions/${transaction.id}`)
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(404)
        .then(res => {
          expect(res.body.error).toBe(404);
        });
    });

    test('Invalid transaction ID returns validation error', () =>
      agent
        .get('/transactions/invalid-id')
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe(200);
        }));

    test('Non-existent transaction ID returns 404', () =>
      agent
        .get('/transactions/507f1f77bcf86cd799439011')
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(404)
        .then(res => {
          expect(res.body.error).toBe(404);
        }));
  });

  describe('PATCH /transactions/:id - Update transaction', () => {
    test('User can update their transaction', async () => {
      const transaction = await new Transaction({
        user: user1.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15'),
        description: 'Monthly salary'
      }).save();

      return agent
        .patch(`/transactions/${transaction.id}`)
        .set('Cookie', `accessToken=${user1Token}`)
        .send({
          amount: 1200,
          description: 'Updated monthly salary'
        })
        .expect(200)
        .then(res => {
          expect(res.body._id).toBe(transaction.id);
          expect(res.body.amount).toBe(1200);
          expect(res.body.description).toBe('Updated monthly salary');
          expect(res.body.type).toBe('Income');
        });
    });

    test('User can change transaction type', async () => {
      const transaction = await new Transaction({
        user: user1.id,
        type: 'Expense',
        amount: 50,
        category: 'Food',
        date: new Date('2024-01-16')
      }).save();

      return agent
        .patch(`/transactions/${transaction.id}`)
        .set('Cookie', `accessToken=${user1Token}`)
        .send({
          type: 'Income'
        })
        .expect(200)
        .then(res => {
          expect(res.body.type).toBe('Income');
        });
    });

    test('User cannot update another user\'s transaction', async () => {
      const transaction = await new Transaction({
        user: user2.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15')
      }).save();

      return agent
        .patch(`/transactions/${transaction.id}`)
        .set('Cookie', `accessToken=${user1Token}`)
        .send({ amount: 2000 })
        .expect(404)
        .then(res => {
          expect(res.body.error).toBe(404);
        });
    });

    test('Updated amount must be valid', async () => {
      const transaction = await new Transaction({
        user: user1.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15')
      }).save();

      return agent
        .patch(`/transactions/${transaction.id}`)
        .set('Cookie', `accessToken=${user1Token}`)
        .send({ amount: -100 })
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe(200);
        });
    });

    test('Updated type must be valid', async () => {
      const transaction = await new Transaction({
        user: user1.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15')
      }).save();

      return agent
        .patch(`/transactions/${transaction.id}`)
        .set('Cookie', `accessToken=${user1Token}`)
        .send({ type: 'Transfer' })
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe(200);
        });
    });
  });

  describe('DELETE /transactions/:id - Delete transaction', () => {
    test('User can delete their transaction', async () => {
      const transaction = await new Transaction({
        user: user1.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15')
      }).save();

      return agent
        .delete(`/transactions/${transaction.id}`)
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('Transaction deleted successfully');
        })
        .then(() =>
          agent
            .get(`/transactions/${transaction.id}`)
            .set('Cookie', `accessToken=${user1Token}`)
            .expect(404)
        );
    });

    test('User cannot delete another user\'s transaction', async () => {
      const transaction = await new Transaction({
        user: user2.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15')
      }).save();

      return agent
        .delete(`/transactions/${transaction.id}`)
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(404)
        .then(res => {
          expect(res.body.error).toBe(404);
        });
    });

    test('Invalid transaction ID returns validation error', () =>
      agent
        .delete('/transactions/invalid-id')
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(400)
        .then(res => {
          expect(res.body.error).toBe(200);
        }));

    test('Non-existent transaction ID returns 404', () =>
      agent
        .delete('/transactions/507f1f77bcf86cd799439011')
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(404)
        .then(res => {
          expect(res.body.error).toBe(404);
        }));

    test('Soft deleted transaction does not appear in list', async () => {
      const transaction = await new Transaction({
        user: user1.id,
        type: 'Income',
        amount: 1000,
        category: 'Salary',
        date: new Date('2024-01-15')
      }).save();

      await agent
        .delete(`/transactions/${transaction.id}`)
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(200);

      return agent
        .get('/transactions')
        .set('Cookie', `accessToken=${user1Token}`)
        .expect(200)
        .then(res => {
          expect(res.body).toHaveLength(0);
        });
    });
  });
});
