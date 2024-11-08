import { Schema, model, Document } from 'mongoose';

interface INotification extends Document {
    userId: Schema.Types.ObjectId;
    message: string;
    createdAt: Date;
    read: boolean;
}

const notificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const Notification = model<INotification>('Notification', notificationSchema);

export { Notification, INotification };