import { Request, Response } from 'express';
import { repository as EvaluationRepository } from '@repositories/evaluationRepository';
import { repository as EmployeeRepository } from '@repositories/employeeRepository';
import { Messages } from '@utils/messages';
import { IUser } from '@models/user';
import { IEvaluation } from '@models/evaluation';

export class ReportController {

    public async getReportByEmployee(req: Request, res: Response): Promise<Response> {
        try {
            const { id: employeeId } = req.params;

            const employee = await EmployeeRepository.findById(employeeId);
            if (!employee) {
                return res.status(404).json({ message: Messages.EMPLOYEE_NOT_FOUND });
            }
            const user = Object(employee.userId) as IUser;
            const evaluations = await EvaluationRepository.findByEmployeeId(employeeId);

            const totalEvaluations = evaluations.length;
            const pendingEvaluations = evaluations.filter(e => e.status === 'pending').length;
            const inProgressEvaluations = evaluations.filter(e => e.status === 'in-progress').length;
            const completedEvaluations = evaluations.filter(e => e.status === 'completed').length;
            const totalScore = evaluations.reduce((acc, e) => acc + (e.totalScore || 0), 0);

            const report = {
                employee: {
                    name: user.name,
                    position: employee.position,
                    department: employee.department,
                },
                evaluations,
                stats: {
                    totalEvaluations,
                    pendingEvaluations,
                    inProgressEvaluations,
                    completedEvaluations,
                    totalScore,
                },
                generatedAt: new Date().toISOString(),
            };

            return res.status(200).json(report);
        } catch (error) {
            throw error;
        }
    }

    public async getReportByDepartment(req: Request, res: Response): Promise<Response> {
        try {
            const { department } = req.params;

            const employees = await EmployeeRepository.findByDepartment(department);
            if (employees.length === 0) {
                return res.status(404).json({ message: Messages.NO_EMPLOYEES_FOUND_IN_DEPARTMENT });
            }

            const departmentEvaluations: IEvaluation[] = [];

            for (const employee of employees) {
                const evaluations = await EvaluationRepository.findByEmployeeId(String(employee._id));
                departmentEvaluations.push(...evaluations);
            }

            const totalEvaluations = departmentEvaluations.length;
            const pendingEvaluations = departmentEvaluations.filter(e => e.status === 'pending').length;
            const inProgressEvaluations = departmentEvaluations.filter(e => e.status === 'in-progress').length;
            const completedEvaluations = departmentEvaluations.filter(e => e.status === 'completed').length;
            const totalScore = departmentEvaluations.reduce((acc, e) => acc + (e.totalScore || 0), 0);

            const report = {
                department,
                employees: employees.map(emp => ({
                    name: Object(emp.userId).name,
                    position: emp.position,
                    userId: emp.userId,
                })),
                evaluations: departmentEvaluations,
                stats: {
                    totalEvaluations,
                    pendingEvaluations,
                    inProgressEvaluations,
                    completedEvaluations,
                    totalScore,
                },
                generatedAt: new Date().toISOString(),
            };

            return res.status(200).json(report);
        } catch (error) {
            throw error;
        }
    }
}

export const reportController = new ReportController();
