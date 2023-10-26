import { NextFunction, Request, Response } from 'express';
import { AppRoutePath } from '../../../constants';
import { CustomError } from '../../../errors/customError';
import { UsersStore } from '../../../models/usersStore';
import { get, controller } from '../../decorators';

@controller(AppRoutePath.PREFIX_ROUTE)
class GetAllUsers {
    @get(AppRoutePath.ENDPOINT_USERS)
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const store = new UsersStore();
            const users = await store.getAllUsers();
            res.send(users);
        } catch (err) {
            if (err instanceof CustomError) next(err);
            next(new CustomError(`${err}`, 422));
        }
    }
}
