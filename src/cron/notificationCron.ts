import schedule from 'node-schedule';
import { service as NotificationService } from '@services/notificationService';

const startNotificationCronJob = () => {
    schedule.scheduleJob('*/5 * * * *', async () => {
        await NotificationService.notifyPendingEvaluations();
    });
};

export default startNotificationCronJob;
