import { repository as EmployeeRepository } from '@repositories/employeeRepository';
import { repository as EvaluationRepository } from '@repositories/evaluationRepository';
import { repository as NotificationRepository } from '@repositories/notificationRepository';

export class NotificationService {
    async notifyPendingEvaluations() {

        const pendingEvaluations = await EvaluationRepository.findPendingEvaluations();
        for (const evaluation of pendingEvaluations) {
            const employee = await EmployeeRepository.findByIdWithoutPopulate(String(evaluation.employeeId));
            if (employee) {
                const message = `Tienes una evaluación pendiente para el período ${evaluation.period}.`;
                await NotificationRepository.createNotification(String(employee.userId), message);
                console.log(`Notificacion creada para el empleado con id: ${employee.userId} sobre la evaluacion con id: ${evaluation.id}`);
                evaluation.lastNotifiedAt = new Date();
                await evaluation.save();
            }
        }
    }
}

export const service = new NotificationService();

