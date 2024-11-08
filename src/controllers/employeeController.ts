import { Request, Response } from 'express';
import { repository as EmployeeRepository } from '@repositories/employeeRepository';
import { repository as UserRepository } from '@repositories/userRepository';
import { Messages } from '@utils/messages';

export class EmployeeController {

    public async getAllEmployees(req: Request, res: Response): Promise<Response> {
        try {

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const skip = (page - 1) * limit;

            const employees = await EmployeeRepository.findWithPagination(skip, limit);
            const totalEmployees = await EmployeeRepository.countAll();
            const totalPages = Math.ceil(totalEmployees / limit);

            return res.json({
                page,
                limit,
                totalPages,
                totalEmployees,
                employees,
            });

        } catch (error) {
            throw error;
        }
    }

    public async getEmployeeById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const employee = await EmployeeRepository.findById(id);
            if (!employee) {
                return res.status(404).json({ message: Messages.EMPLOYEE_NOT_FOUND });
            }
            return res.json(employee);
        } catch (error) {
            throw error;
        }
    }

    public async createEmployee(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, position, department, salary, skills } = req.body;

            const user = await UserRepository.findById(userId);
            if (!user) {
                return res.status(400).json({ message: Messages.USER_NOT_FOUND });
            }

            const existingEmployee = await EmployeeRepository.findByUserId(userId);
            if (existingEmployee) {
                return res.status(400).json({ message: Messages.EMPLOYEE_ALREADY_EXISTS });
            }

            const employee = await EmployeeRepository.create({
                userId,
                position,
                department,
                salary,
                skills,
            });

            return res.status(201).json({ employee, message: Messages.EMPLOYEE_CREATED_SUCCESS });
        } catch (error) {
            throw error;
        }
    }

    public async updateEmployee(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { position, department, salary, skills } = req.body;

            const employee = await EmployeeRepository.updateById(id, {
                position,
                department,
                salary,
                skills,
            });

            if (!employee) {
                return res.status(404).json({ message: Messages.EMPLOYEE_NOT_FOUND });
            }

            return res.json({ employee, message: Messages.EMPLOYEE_UPDATED_SUCCESS });
        } catch (error) {
            throw error;
        }
    }

    public async deleteEmployee(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const employee = await EmployeeRepository.deleteById(id);
            if (!employee) {
                return res.status(404).json({ message: Messages.EMPLOYEE_NOT_FOUND });
            }
            return res.status(204).send();
        } catch (error) {
            throw error;
        }
    }
}

export const controller = new EmployeeController();
