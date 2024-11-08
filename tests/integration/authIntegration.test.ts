import request from 'supertest';
import app from '../../src/index';
import mongoose from 'mongoose';
import { repository as UserRepository } from '../../src/repositories/userRepository';
import { service as HashingService } from '../../src/services/hashingService';
import config from '../../src/config/config';

describe('AuthController - Integration Tests', () => {
    beforeAll(async () => {
        await mongoose.connection.close();
        await mongoose.connect(`${config.dbUri}/${config.dbTestName}`);
    });

    afterEach(async () => {
        await UserRepository.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/auth/register', () => {
        it('debería registrar un nuevo usuario correctamente', async () => {
            const newUser = {
                name: 'John Doe',
                email: 'johndoe11test@example.com',
                password: 'Password*123',
                role: 'empleado'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('userId');
            expect(response.body).toHaveProperty('message', 'Usuario registrado exitosamente');
        });

        it('debería retornar un error si el usuario ya existe', async () => {
            await UserRepository.saveUser({
                name: 'Jane Doe',
                email: 'johndoe11test@example.com',
                password: 'Password*123',
                role: 'empleado'
            });

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Jane Doe',
                    email: 'johndoe11test@example.com',
                    password: 'Password*123',
                    role: 'empleado'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'El usuario ya existe');
        });
    });

    describe('POST /api/auth/login', () => {
        it('debería iniciar sesión correctamente y devolver un token', async () => {
            const userCredentials = {
                email: 'janedoe@example.com',
                password: 'password123'
            };

            const hashedPassword = await HashingService.hashPassword(userCredentials.password);
            await UserRepository.saveUser({
                name: 'Jane Doe',
                email: userCredentials.email,
                password: hashedPassword,
                role: 'empleado'
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send(userCredentials);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        it('debería retornar un error si las credenciales son incorrectas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Credenciales no válidas');
        });
    });
});
