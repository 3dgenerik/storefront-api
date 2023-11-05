import app from '../app';
import supertest from 'supertest';
import { AppRoutePath, token } from '../constants';
import { ICreatedUserOutput, IUser } from '../interface';
import { UsersStore } from '../models/usersStore';

const request = supertest(app);

describe('Testing user routes: ', () => {
    const usersStore = new UsersStore();

    const userNotExist: IUser = {
        first_name: 'John',
        last_name: 'Doe',
        password: 'john',
    };

    const userAlreadyExist: IUser = {
        first_name: 'Petar',
        last_name: 'Stojanovic',
        password: 'petar',
    };

    beforeAll(async () => {
        await usersStore.createRandomUsers();
    });

    it(`GET: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS} getAllusers() should return status 200, users.length > 0 [TOKEN REQUIRED]`, async () => {
        const result = await request
            .get(`${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}`)
            .set('Authorization', `Bearer ${token}`);

        const users = result.body as IUser[];

        expect(users.length).toBeGreaterThan(0);
        expect(result.status).toBe(200);
    });

    it(`GET: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}  should return status 401 without or wrong token [TOKEN REQUIRED]`, async () => {
        const result = await request.get(
            `${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}`,
        );
        expect(result.status).toBe(401);
    });

    it(`GET: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/current should return User object with id = 3 [TOKEN REQUIRED]`, async () => {
        const result = await request
            .get(
                `${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/current`,
            )
            .set('Authorization', `Bearer ${token}`);

        const currentUser = (await result.body) as IUser;

        expect(currentUser).toEqual({
            id: 3,
            first_name: 'Katarina',
            last_name: 'Popovic',
            password:
                '$2b$10$lNN4j.ktbQlECvJ99C/zFO1DpgqDkdMdRLcRDFyyIJm0fFhnrnrJe',
        });
    });

    it(`GET: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/current should return 401 without or wrong token [TOKEN REQUIRED]`, async () => {
        const result = await request.get(
            `${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/current`,
        );

        expect(result.status).toEqual(401);
    });

    it(`GET: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/1 should return user with id 1, first_name = 'Milena', last_name = 'Petrovic'  [TOKEN REQUIRED]`, async () => {
        const result = await request
            .get(`${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/1`)
            .set('Authorization', `Bearer ${token}`);

        const user = result.body as IUser;
        expect({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
        }).toEqual({
            id: 1,
            first_name: 'Milena',
            last_name: 'Petrovic',
        });
        expect(result.status).toBe(200);
    });

    it(`GET: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/1000000 should return status code 404. Error message 'User with id 1000000 not found.  [TOKEN REQUIRED]'`, async () => {
        const result = await request
            .get(
                `${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/1000000`,
            )
            .set('Authorization', `Bearer ${token}`);

        expect(result.text).toEqual('User with id 1000000 not found.');
        expect(result.status).toEqual(404);
    });

    it(`GET: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/1 should return status code 401 with missing or wrong token. [TOKEN REQUIRED]'`, async () => {
        const result = await request.get(
            `${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/1`,
        );

        expect(result.status).toEqual(401);
    });

    it(`POST: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/signup should be first_name: 'John', last_name: 'Doe' with status code 201`, async () => {
        const result = await request
            .post(
                `${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/signup`,
            )
            .send(userNotExist);
        const body = result.body as ICreatedUserOutput;
        const createdUser = body.output.user as IUser;
        expect({
            first_name: createdUser.first_name,
            last_name: createdUser.last_name,
        }).toEqual({ first_name: 'John', last_name: 'Doe' });
        expect(result.status).toBe(201);
    });

    it(`POST: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/signup should be status code 409 when user already exist. Error message: 'User ${userAlreadyExist.first_name} ${userAlreadyExist.last_name} already exist.'`, async () => {
        const result = await request
            .post(
                `${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/signup`,
            )
            .send(userAlreadyExist);
        expect(result.text).toEqual(
            `User ${userAlreadyExist.first_name} ${userAlreadyExist.last_name} already exist.`,
        );
        expect(result.status).toBe(409);
    });

    it(`POST: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/signin should be first_name: 'Petar', last_name: 'Stojanovic' with status code 200`, async () => {
        const result = await request
            .post(
                `${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/signin`,
            )
            .send(userAlreadyExist);
        const body = result.body as ICreatedUserOutput;
        const authUser = body.output.user as IUser;
        expect({ ...authUser, password: typeof authUser.password }).toEqual({
            id: 8,
            first_name: 'Petar',
            last_name: 'Stojanovic',
            password: 'string',
        });
        expect(result.status).toBe(200);
    });

    it(`POST: ${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/signin should be status code 404 when user not found. Error message: 'User not found. Please provide correct first name, last name and password'`, async () => {
        const newUser: IUser = {
            first_name: 'John',
            last_name: 'Fogerty',
            password: 'john',
        };
        const result = await request
            .post(
                `${AppRoutePath.PREFIX_ROUTE}${AppRoutePath.ENDPOINT_USERS}/signin`,
            )
            .send(newUser);
        expect(result.text).toEqual(
            'User not found. Please provide correct first name, last name and password',
        );
        expect(result.status).toBe(404);
    });

    afterAll(async () => {
        await usersStore.deleteAllUsers();
    });
});