import { Request, Response } from 'express';
import { EmployeeController } from '../../src/controllers/employeeController';
import { repository as EmployeeRepository } from '../../src/repositories/employeeRepository';
import { repository as UserRepository } from '../../src/repositories/userRepository';
import { Messages } from '../../src/utils/messages';

jest.mock('../../src/repositories/employeeRepository');
jest.mock('../../src/repositories/userRepository');

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    controller = new EmployeeController();

    req = {};
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock, send: sendMock })) as any;
    res = { status: statusMock, json: jsonMock, send: sendMock } as Partial<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEmployees', () => {
    it('debería devolver la lista paginada de empleados', async () => {
      const mockEmployees = [{ id: '1', name: 'John Doe' }];
      (EmployeeRepository.findWithPagination as jest.Mock).mockResolvedValue(mockEmployees);
      (EmployeeRepository.countAll as jest.Mock).mockResolvedValue(1);

      req.query = { page: '1', limit: '10' };

      await controller.getAllEmployees(req as Request, res as Response);

      expect(EmployeeRepository.findWithPagination).toHaveBeenCalledWith(0, 10);
      expect(EmployeeRepository.countAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        totalPages: 1,
        totalEmployees: 1,
        employees: mockEmployees,
      });
    });
  });

  describe('getEmployeeById', () => {
    it('debería devolver el empleado cuando se encuentra', async () => {
      const mockEmployee = { id: '1', name: 'John Doe' };
      (EmployeeRepository.findById as jest.Mock).mockResolvedValue(mockEmployee);

      req.params = { id: '1' };

      await controller.getEmployeeById(req as Request, res as Response);

      expect(EmployeeRepository.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockEmployee);
    });

    it('debería devolver un error 404 cuando no se encuentra el empleado', async () => {
      (EmployeeRepository.findById as jest.Mock).mockResolvedValue(null);

      req.params = { id: '1' };

      await controller.getEmployeeById(req as Request, res as Response);

      expect(EmployeeRepository.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: Messages.EMPLOYEE_NOT_FOUND });
    });
  });

  describe('createEmployee', () => {
    it('debería crear un nuevo empleado si el usuario existe y el empleado no existe', async () => {
      const mockUser = { id: '1', name: 'John Doe' };
      const mockEmployee = { id: '2', userId: '1', position: 'Developer' };

      (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (EmployeeRepository.findByUserId as jest.Mock).mockResolvedValue(null);
      (EmployeeRepository.create as jest.Mock).mockResolvedValue(mockEmployee);

      req.body = {
        userId: '1',
        position: 'Developer',
        department: 'IT',
        salary: 60000,
        skills: ['Node.js'],
      };

      await controller.createEmployee(req as Request, res as Response);

      expect(UserRepository.findById).toHaveBeenCalledWith('1');
      expect(EmployeeRepository.findByUserId).toHaveBeenCalledWith('1');
      expect(EmployeeRepository.create).toHaveBeenCalledWith({
        userId: '1',
        position: 'Developer',
        department: 'IT',
        salary: 60000,
        skills: ['Node.js'],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        employee: mockEmployee,
        message: Messages.EMPLOYEE_CREATED_SUCCESS,
      });
    });

    it('debería devolver error 400 si el usuario no existe', async () => {
      (UserRepository.findById as jest.Mock).mockResolvedValue(null);

      req.body = { userId: '1' };

      await controller.createEmployee(req as Request, res as Response);

      expect(UserRepository.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: Messages.USER_NOT_FOUND });
    });
  });

  describe('updateEmployee', () => {
    it('debería actualizar el empleado si existe', async () => {
      const mockEmployee = { id: '2', userId: '1', position: 'Developer' };
      (EmployeeRepository.updateById as jest.Mock).mockResolvedValue(mockEmployee);

      req.params = { id: '2' };
      req.body = { position: 'Senior Developer', department: 'IT', salary: 70000, skills: ['Node.js', 'React'] };

      await controller.updateEmployee(req as Request, res as Response);

      expect(EmployeeRepository.updateById).toHaveBeenCalledWith('2', {
        position: 'Senior Developer',
        department: 'IT',
        salary: 70000,
        skills: ['Node.js', 'React']
      });
      expect(res.json).toHaveBeenCalledWith({
        employee: mockEmployee,
        message: Messages.EMPLOYEE_UPDATED_SUCCESS,
      });
    });

    it('debería devolver error 404 si el empleado no existe', async () => {
      (EmployeeRepository.updateById as jest.Mock).mockResolvedValue(null);

      req.params = { id: '2' };
      req.body = { position: 'Senior Developer', department: 'IT', salary: 70000, skills: ['Node.js', 'React'] };

      await controller.updateEmployee(req as Request, res as Response);

      expect(EmployeeRepository.updateById).toHaveBeenCalledWith('2', {
        position: 'Senior Developer',
        department: 'IT',
        salary: 70000,
        skills: ['Node.js', 'React']
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: Messages.EMPLOYEE_NOT_FOUND });
    });
  });

  describe('deleteEmployee', () => {
    it('debería eliminar el empleado si existe', async () => {
      (EmployeeRepository.deleteById as jest.Mock).mockResolvedValue({ id: '2' });

      req.params = { id: '2' };

      await controller.deleteEmployee(req as Request, res as Response);

      expect(EmployeeRepository.deleteById).toHaveBeenCalledWith('2');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('debería devolver error 404 si el empleado no existe', async () => {
      (EmployeeRepository.deleteById as jest.Mock).mockResolvedValue(null);

      req.params = { id: '2' };

      await controller.deleteEmployee(req as Request, res as Response);

      expect(EmployeeRepository.deleteById).toHaveBeenCalledWith('2');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: Messages.EMPLOYEE_NOT_FOUND });
    });
  });
});