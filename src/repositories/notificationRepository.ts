import { Notification, INotification } from '@models/notification';

export class NotificationRepository {

    public async createNotification(userId: string, message: string): Promise<INotification> {
        const notification = new Notification({
            userId,
            message
        });
        return await notification.save();
    }

    public async getNotificationsByUser(userId: string, onlyUnread: boolean = false): Promise<INotification[]> {
        const filter = { userId };
        if (onlyUnread) {
            filter['read'] = false;
        }
        return await Notification.find(filter).sort({ createdAt: -1 });
    }

    public async markAsRead(notificationId: string): Promise<INotification | null> {
        return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
    }

    public async deleteOldNotifications(days: number): Promise<void> {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() - days);
        await Notification.deleteMany({ createdAt: { $lt: expirationDate }, read: true });
    }
}

export const repository = new NotificationRepository();

