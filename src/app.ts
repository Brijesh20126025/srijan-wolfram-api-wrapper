import { wolframAlpha } from './srijan-Wolfram-Alpha-Api/wolfram-alpha-api'
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import cookieParser = require('cookie-parser'); 

app.use(logger('dev'));
app.use(bodyParser.json({
    limit: '500mb'
    // parameterLimit: 1000000
}));
// app.use(express.session());
let data: any = {
    limit: '500mb',
    parameterLimit: 1000000,
    // making this consistent with app server
    extended: true
};
app.use(bodyParser.urlencoded(data));
app.use(cookieParser());


app.use('/', )


export default app;
