const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification');

router.route('/')
  .get(notificationController.getAllNotifications)
  .post(notificationController.sendNotification)

router.route('/:id')
  .get(notificationController.getNotification)
  .delete(notificationController.deleteNotification)


module.exports = router;
