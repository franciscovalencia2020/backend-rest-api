module.exports = {

    moduleNameMapper: {
        '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@models/(.*)$': '<rootDir>/src/models/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@validators/(.*)$': '<rootDir>/src/validators/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
        '^@cron/(.*)$': '<rootDir>/src/cron/$1',
    },

    preset: 'ts-jest',
    testEnvironment: 'node',
    modulePaths: ['<rootDir>'],
}