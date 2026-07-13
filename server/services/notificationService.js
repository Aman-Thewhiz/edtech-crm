import Notification from '../models/Notification.js';
import NotificationPreference from '../models/NotificationPreference.js';
import User from '../models/User.js';

// ============ NOTIFICATION FUNCTIONS ============

function mapNotification(notification) {
  return {
    _id: notification._id,
    recipient: notification.recipient,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    relatedEntity: notification.relatedEntity,
    relatedEntityId: notification.relatedEntityId,
    actionUrl: notification.actionUrl,
    isRead: notification.isRead,
    readAt: notification.readAt,
    priority: notification.priority,
    createdAt: notification.createdAt,
  };
}

export async function createNotification(data) {
  const notification = await Notification.create({
    recipient: data.recipient,
    type: data.type,
    title: data.title,
    message: data.message,
    relatedEntity: data.relatedEntity,
    relatedEntityId: data.relatedEntityId,
    actionUrl: data.actionUrl,
    priority: data.priority || 'medium',
    expiresAt: data.expiresAt,
  });

  // Check if email should be sent
  const preference = await NotificationPreference.findOne({ user: data.recipient });
  if (preference && preference.emailNotifications.enabled) {
    const typeKey = data.type.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    if (preference.emailNotifications[typeKey]) {
      await sendEmailNotification(notification, data.recipient);
    }
  }

  return notification.populate('recipient');
}

export async function getNotifications(userId, filters = {}) {
  const query = { recipient: userId, isDeleted: false };

  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await Notification.countDocuments(query);
  const data = await Notification.find(query)
    .populate('recipient')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
    isDeleted: false,
  });

  return {
    data: data.map(mapNotification),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    unreadCount,
  };
}

export async function getNotificationById(id) {
  const notification = await Notification.findById(id).populate('recipient');

  if (!notification || notification.isDeleted) {
    throw new Error('Notification not found.');
  }

  return mapNotification(notification);
}

export async function markNotificationAsRead(id) {
  const notification = await Notification.findByIdAndUpdate(
    id,
    {
      isRead: true,
      readAt: new Date(),
    },
    { new: true }
  ).populate('recipient');

  if (!notification) {
    throw new Error('Notification not found.');
  }

  return mapNotification(notification);
}

export async function markAllNotificationsAsRead(userId) {
  await Notification.updateMany(
    { recipient: userId, isRead: false, isDeleted: false },
    { isRead: true, readAt: new Date() }
  );

  return { message: 'All notifications marked as read' };
}

export async function deleteNotification(id) {
  const notification = await Notification.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new Error('Notification not found.');
  }

  return { message: 'Notification deleted' };
}

export async function deleteAllNotifications(userId) {
  await Notification.updateMany(
    { recipient: userId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() }
  );

  return { message: 'All notifications deleted' };
}

// ============ NOTIFICATION PREFERENCE FUNCTIONS ============

function mapNotificationPreference(preference) {
  return {
    _id: preference._id,
    user: preference.user,
    inAppNotifications: preference.inAppNotifications,
    emailNotifications: preference.emailNotifications,
    emailAddress: preference.emailAddress,
    digestFrequency: preference.digestFrequency,
    quietHours: preference.quietHours,
    createdAt: preference.createdAt,
    updatedAt: preference.updatedAt,
  };
}

export async function getOrCreatePreference(userId) {
  let preference = await NotificationPreference.findOne({ user: userId, isDeleted: false });

  if (!preference) {
    const user = await User.findById(userId);
    preference = await NotificationPreference.create({
      user: userId,
      emailAddress: user.email,
    });
  }

  return mapNotificationPreference(preference);
}

export async function updatePreference(userId, data) {
  const preference = await NotificationPreference.findOneAndUpdate(
    { user: userId, isDeleted: false },
    data,
    { new: true, upsert: true }
  );

  return mapNotificationPreference(preference);
}

export async function getPreference(userId) {
  const preference = await NotificationPreference.findOne({ user: userId, isDeleted: false });

  if (!preference) {
    throw new Error('Notification preference not found.');
  }

  return mapNotificationPreference(preference);
}

// ============ EMAIL NOTIFICATION HELPER ============

export async function sendEmailNotification(notification, userId) {
  try {
    const user = await User.findById(userId);
    const preference = await NotificationPreference.findOne({ user: userId });

    if (!user || !preference || !preference.emailNotifications.enabled) {
      return;
    }

    // Check quiet hours
    if (preference.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (currentTime >= preference.quietHours.startTime && currentTime <= preference.quietHours.endTime) {
        return;
      }
    }

    // TODO: Integrate with email service (Nodemailer, SendGrid, etc.)
    // For now, just mark as sent
    await Notification.findByIdAndUpdate(notification._id, {
      emailSent: true,
      emailSentAt: new Date(),
      emailAddress: user.email,
    });

    console.log(`Email notification sent to ${user.email}: ${notification.title}`);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// ============ BULK NOTIFICATION CREATION ============

export async function notifyLeadAssignment(leadId, assignedToUserId, assignedByUser) {
  await createNotification({
    recipient: assignedToUserId,
    type: 'lead_assigned',
    title: 'New Lead Assigned',
    message: `A new lead has been assigned to you by ${assignedByUser.name}`,
    relatedEntity: 'lead',
    relatedEntityId: leadId,
    actionUrl: `/leads/${leadId}`,
    priority: 'high',
  });
}

export async function notifyLeaveStatusChange(leaveRequestId, employeeId, status) {
  const statusText = status === 'approved' ? 'approved' : 'rejected';
  await createNotification({
    recipient: employeeId,
    type: 'leave_status_changed',
    title: `Leave Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
    message: `Your leave request has been ${statusText}`,
    relatedEntity: 'leave',
    relatedEntityId: leaveRequestId,
    actionUrl: `/leaves/requests/${leaveRequestId}`,
    priority: 'high',
  });
}

export async function notifyAdmissionStatusChange(admissionId, studentId, status) {
  const statusText = status.replace(/_/g, ' ').toUpperCase();
  await createNotification({
    recipient: studentId,
    type: 'admission_status_changed',
    title: `Admission Status: ${statusText}`,
    message: `Your admission status has been updated to ${statusText}`,
    relatedEntity: 'admission',
    relatedEntityId: admissionId,
    actionUrl: `/admissions/${admissionId}`,
    priority: 'high',
  });
}

export async function notifyInvoiceOverdue(invoiceId, studentId) {
  await createNotification({
    recipient: studentId,
    type: 'invoice_overdue',
    title: 'Invoice Overdue',
    message: 'An invoice is overdue. Please make payment as soon as possible.',
    relatedEntity: 'invoice',
    relatedEntityId: invoiceId,
    actionUrl: `/invoices/${invoiceId}`,
    priority: 'high',
  });
}

export async function notifyPayrollProcessed(payrollId, employeeId) {
  await createNotification({
    recipient: employeeId,
    type: 'payroll_processed',
    title: 'Payroll Processed',
    message: 'Your payroll has been processed. Your salary will be credited soon.',
    relatedEntity: 'payroll',
    relatedEntityId: payrollId,
    actionUrl: `/payroll/payroll/${payrollId}`,
    priority: 'medium',
  });
}

export async function notifySystemAlert(userId, title, message) {
  await createNotification({
    recipient: userId,
    type: 'system_alert',
    title,
    message,
    priority: 'high',
  });
}
