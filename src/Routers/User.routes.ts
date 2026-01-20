import { Router } from 'express'
import UserController from '../Controllers/User.controller'
import { auth } from "../Middlewares/Auth.middleware"
import ValidationMiddleware from '../Middlewares/Validation.middleware';
import { UserDto } from '../Validators/User.dto';

const router = Router({ mergeParams: true });

router.post('/signup', ValidationMiddleware(UserDto, 'body'), UserController.signup);


export default router;
