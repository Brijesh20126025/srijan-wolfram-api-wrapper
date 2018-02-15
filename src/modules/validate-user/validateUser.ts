import * as express from 'express';
import { jwtToken as secertKey } from '../config/config'
const jwt = require('jsonwebtoken');

export function validateUser(req: express.Request, res: express.Response, next) {
    if (!req) {
        res.send({ err: true, result: { message: 'Request empty', data: null } });
        return;
    }
    if (!req.headers || !req.headers.authorization) {
        res.send({ err: true, result: { message: 'Request authorization hearder not found', data: null } });
        return;
    }
    let jwtToken: string = req.headers.authorization;
    let user: any = null;
    try {
        user = jwt.verify(jwtToken, secertKey);
        console.log(JSON.stringify(user));
        next();
        return;
    } catch (err) {
        res.send({ err: true, result: { message: 'unable to validate Jwt token', data: null } });
        return;
    }
}