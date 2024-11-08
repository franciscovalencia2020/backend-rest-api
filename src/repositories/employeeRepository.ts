import { Employee, IEmployee } from '@models/employee';

export class EmployeeRepository {

    public async create(employeeData: Partial<IEmployee>): Promise<IEmployee> {
        const employee = new Employee(employeeData);
        return await employee.save();
    }

    public async findById(id: string): Promise<IEmployee | null> {
        return await Employee.findById(id).populate('userId', 'name email role');
    }

    public async findByIdWithoutPopulate(id: string): Promise<IEmployee | null> {
        return await Employee.findById(id);
    }


    public async findAll(): Promise<IEmployee[]> {
        return await Employee.find().populate('userId', 'name email role');
    }

    public async updateById(id: string, employeeData: Partial<IEmployee>): Promise<IEmployee | null> {
        return await Employee.findByIdAndUpdate(id, employeeData, { new: true }).populate('userId', 'name email role');
    }

    public async deleteById(id: string): Promise<IEmployee | null> {
        return await Employee.findByIdAndDelete(id);
    }

    public async findByDepartment(department: string): Promise<IEmployee[]> {
        return await Employee.find({ department }).populate('userId', 'name email role');
    }

    public async findByUserRole(role: string): Promise<IEmployee[]> {
        return await Employee.find().populate({
            path: 'userId',
            match: { role },
            select: 'name email role',
        });
    }

    public async findByUserId(userId: string): Promise<IEmployee | null> {
        return await Employee.findOne({ userId });
    }

    public async findWithPagination(skip: number, limit: number): Promise<IEmployee[]> {
        return Employee.find()
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email role');
    }

    public async countAll(): Promise<number> {
        return Employee.countDocuments();
    }
}

export const repository = new EmployeeRepository();