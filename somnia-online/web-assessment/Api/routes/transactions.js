const express = require('express');
const controller = require('../controllers/transactions');
const { isAuth } = require('../middlewares/isAuth');

const router = express.Router();

router
  .route('/')
  .get(isAuth, controller.get)
  .post(isAuth, controller.create);

router
  .route('/:id')
  .get(isAuth, controller.getById)
  .patch(isAuth, controller.update)
  .delete(isAuth, controller.delete);

module.exports = router;
