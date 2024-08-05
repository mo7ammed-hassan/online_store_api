const Notification = require('../middleWare/asyncWrapper');
const HttpStatusText = require('../utils/httpStatusText');
const AppError = require('../utils/appError');
const asyncWrapper = require('../middleWare/asyncWrapper');
const OneSignal = require('onesignal-node');
const dotenv = require('dotenv');
dotenv.config();

const client = new OneSignal.Client({
  applicationId: process.env.ONESIGNAL_APP_ID,
  restApiKey: process.env.ONESIGNAL_REST_API_KEY,
});

const sendNotification = asyncWrapper(
  async (req, res, next) => {
    const { title, description, imageUrl } = req.body;

    const notificationBody = {
      headings: { en: title },
      contents: { en: description },
      included_segments: ['All'],
      ...(imageUrl && { big_picture: imageUrl })
    };

    const response = await client.createNotification(notificationBody);
    const notificationId = response.body.id;
    console.log('Notification sent to all users:', notificationId);
    const notification = new Notification({ notificationId, title, description, imageUrl });
    const newNotification = await notification.save();

    res.json({ success: true, message: 'Notification sent successfully', data: null });
  }
);

const getNotification = asyncWrapper(
  async (req, res, next) => {
    const notificationId = req.params.id;

    const response = await client.viewNotification(notificationId);
    const androidStats = response.body.platform_delivery_stats;

    const result = {
      platform: 'Android',
      success_delivery: androidStats.android.successful,
      failed_delivery: androidStats.android.failed,
      errored_delivery: androidStats.android.errored,
      opened_notification: androidStats.android.converted
    };
    console.log('Notification details:', androidStats);
    res.json({ success: true, message: 'success', data: result });
  }
);

const getAllNotifications = asyncWrapper(
  async (req, res, next) => {
    const notifications = await Notification.find({}).sort({ _id: -1 });
    res.json({ success: true, message: 'Notifications retrieved successfully', data: notifications });
  }
);

const deleteNotification = asyncWrapper(
  async (req, res, next) => {
    const notificationID = req.params.id;
    const notification = await Notification.findByIdAndDelete(notificationID);
    if (!notification) {
      const error = AppError.create("No notification found with that ID", 404, HttpStatusText.FAIL)
      return next(error);
    }
    res.json({ success: true, message: "All notifications deleted successfully." });
  }
);

module.exports = {
  sendNotification,
  getNotification,
  getAllNotifications,
  deleteNotification,
}