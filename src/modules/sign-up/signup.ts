import * as express from 'express';
import { jwtToken } from '../config/config';
const jwt = require('jsonwebtoken');

export function createJwtTokenForUser(req: express.Request, res: express.Response, next: Function) {
    if (!req || !req.body) {
        res.send({ err: new Error('Please provide the user name & passwd'), result: { message: 'request body not found' } });
        return;
    }
    let userName: string = req.body.userName;
    let password: string = req.body.password;
    if (!userName || !password) {
        res.send({ err: true, result: { message: 'faliled to get the user name & pwd' } });
        return;
    }
    let data: string = userName + '_' + password;
    let token: any = jwt.sign({ data: data }, jwtToken, { expiresIn: '1h' });
    res.send({ err: false, result: { message: 'Please use this token for subsequent request', token: token } });
    next();
    return;
}