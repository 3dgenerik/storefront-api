import { IUser } from '../interface';
import client from '../database';
import bcrypt from 'bcrypt';
import { SALT_ROUND } from '../config';
import { Store } from './utils/store';
import { randomUsers } from '../randomItems';

export class UsersStore extends Store {
    private readonly SQL_GET_ALL_USERS = 'SELECT * FROM users_table';
    private readonly SQL_IF_USER_EXIST =
        'SELECT * FROM users_table WHERE first_name = ($1) AND last_name = ($2)';
    private readonly SQL_GET_USER_BY_ID =
        'SELECT * FROM users_table WHERE id = ($1)';
    private readonly SQL_CREATE_USER =
        'INSERT INTO users_table (id, first_name, last_name, password) VALUES(COALESCE((SELECT MAX(id) FROM users_table), 0) + 1, $1, $2, $3) RETURNING *';
    private readonly SQL_CREATE_USER_FOR_TEST =
        'INSERT INTO users_table (id, first_name, last_name, password) VALUES($1, $2, $3, $4)';
    private readonly SQL_AUTH_USER =
        'SELECT * FROM users_table WHERE first_name = $1 AND last_name = $2';
    private readonly SQL_DELETE_ALL_USERS = 'DELETE FROM users_table';

    constructor() {
        super();
        //set sql query in parent class
        this.getItemByIdSqlQuery = this.SQL_GET_USER_BY_ID;
    }

    //create hash
    async passwordHash(password: string): Promise<string> {
        try {
            const hash = await bcrypt.hash(password, Number(SALT_ROUND));
            return hash;
        } catch (err) {
            throw new Error(`Cannot hash password: ${err}`);
        }
    }

    //compare password and hash
    async passwordHashCompare(
        password: string,
        hash: string,
    ): Promise<boolean> {
        try {
            const isMatch = await bcrypt.compare(password, hash);
            return isMatch;
        } catch (err) {
            throw new Error(`Cannot compare hash and password: ${err}`);
        }
    }

    //get all users - from parent class
    async getAllUsers(): Promise<IUser[]> {
        try {
            return await this.getAllItems<IUser>(this.SQL_GET_ALL_USERS);
        } catch (err) {
            throw new Error(`Cannot get all users: ${err}`);
        }
    }

    //if user exist
    async userExist(user: IUser): Promise<boolean> {
        try {
            const conn = await client.connect();
            const sql = this.SQL_IF_USER_EXIST;
            const result = await conn.query(sql, [
                user.first_name,
                user.last_name,
            ]);
            conn.release();
            const existingUser = result.rows[0];
            if (existingUser) return true;
            return false;
        } catch (err) {
            throw new Error(`Cannot perform action for user exist: ${err}`);
        }
    }

    //show user by id - from parent class
    async getUserById(id: number): Promise<IUser | null> {
        try {
            return await this.getItemById(id, this.SQL_GET_USER_BY_ID);
        } catch (err) {
            throw new Error(`Cannot get user: ${err}`);
        }
    }

    //create user
    async createUser(user: IUser): Promise<IUser | null> {
        try {
            if (await this.userExist(user)) {
                return null;
            }
            const conn = await client.connect();
            const hash = await this.passwordHash(user.password);
            const sql = this.SQL_CREATE_USER;
            const result = await conn.query(sql, [
                user.first_name,
                user.last_name,
                hash,
            ]);
            conn.release();
            return result.rows[0];
        } catch (err) {
            throw new Error(`Cannot create user: ${err}`);
        }
    }

    //create users list
    async createRandomUsers(): Promise<boolean> {
        try {
            const existingUsers = await this.getAllUsers();

            if (existingUsers.length !== 0) return false;

            const conn = await client.connect();
            for (const user of randomUsers) {
                const hash = await this.passwordHash(user.password);
                const sql = this.SQL_CREATE_USER_FOR_TEST;
                await conn.query(sql, [
                    user.id,
                    user.first_name,
                    user.last_name,
                    hash,
                ]);
            }
            conn.release();

            return true;
        } catch (err) {
            throw new Error(`Cannot create random users: ${err}`);
        }
    }

    async deleteAllUsers(): Promise<void> {
        try {
            await this.deleteAllItems(this.SQL_DELETE_ALL_USERS);
        } catch (err) {
            throw new Error(`Cannot delete all users: ${err}`);
        }
    }

    //user authorization
    async authUser(user: IUser): Promise<IUser | null> {
        try {
            if (!(await this.userExist(user))) return null;

            const conn = await client.connect();
            const sql = this.SQL_AUTH_USER;
            const result = await conn.query(sql, [
                user.first_name,
                user.last_name,
            ]);
            conn.release();

            const dbUser = result.rows[0] as IUser;

            if (
                !(await this.passwordHashCompare(
                    user.password,
                    dbUser.password,
                ))
            )
                return null;

            return dbUser;
        } catch (err) {
            throw new Error(`Cannot auth user: ${err}`);
        }
    }

    //delete user - from parent class
    // async deleteUserById(id: number): Promise<IUser | null> {
    //     return await this.deleteItemById(id, this.SQL_DELETE_USER);
    // }
}
