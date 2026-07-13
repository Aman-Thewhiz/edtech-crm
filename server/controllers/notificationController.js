import * as notificationService from '../services/notificationService.js';

function envelope(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

// ============ NOTIFICATION ENDPOINTS ============

export async function getNotifications(req, res, next) {
  try {
    const data = await notificationService.getNotifications(req.user.sub, req.query);
    return res.json({
      success: true,
      data: data.data,
      message: 'Notifications loaded',
      unreadCount: data.unreadCount,
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getNotification(req, res, next) {
  try {
    const notification = await notificationService.getNotificationById(req.params.id);
    return envelope(res, { notification }, 'Notification loaded');
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markNotificationAsRead(req.params.id);
    return envelope(res, { notification }, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllNotificationsAsRead(req.user.sub);
    return envelope(res, result, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const result = await notificationService.deleteNotification(req.params.id);
    return envelope(res, result, 'Notification deleted');
  } catch (error) {
    next(error);
  }
}

export async function deleteAllNotifications(req, res, next) {
  try {
    const result = await notificationService.deleteAllNotifications(req.user.sub);
    return envelope(res, result, 'All notifications deleted');
  } catch (error) {
    next(error);
  }
}

// ============ NOTIFICATION PREFERENCE ENDPOINTS ============

export async function getPreference(req, res, next) {
  try {
    const preference = await notificationService.getOrCreatePreference(req.user.sub);
    return envelope(res, preference, 'Notification preference loaded');
  } catch (error) {
    next(error);
  }
}

export async function updatePreference(req, res, next) {
  try {
    const preference = await notificationService.updatePreference(req.user.sub, req.body);
    return envelope(res, preference, 'Notification preference updated');
  } catch (error) {
    next(error);
  }
}
