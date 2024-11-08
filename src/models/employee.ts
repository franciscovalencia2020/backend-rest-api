import { Schema, model, Document } from 'mongoose';

interface IEmployee extends Document {
  userId: Schema.Types.ObjectId;
  position: string;
  department: string;
  hireDate: Date;
  salary: number;
  skills: string[];
}

const employeeSchema = new Schema<IEmployee>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  hireDate: { type: Date, default: Date.now },
  salary: { type: Number, required: true },
  skills: [{ type: String }]
});

const Employee = model<IEmployee>('Employee', employeeSchema);

export { Employee, IEmployee };
