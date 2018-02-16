import { wolframAlpha } from './modules/srijan-Wolfram-Alpha-Api-wrapper/wolfram-alpha-api'
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import { appId } from './modules/config/config';
import { createJwtTokenForUser } from './modules/sign-up/signup';
import { callSrijanWolframWrapper } from './modules/helper-call-srijan-wrapper-wolfram-api/helper-caller';
import { validateUser } from './modules/validate-user/validateUser';
const cookieParser = require('cookie-parser');

let app: express.Express = express();
// new wolframAlpha(appId).query('how far is sun from earth', (err, res) => {
//     console.log(err);
//     console.log(res);
// });

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


app.use('/signUp', createJwtTokenForUser);

app.use('/search/:query', validateUser, callSrijanWolframWrapper);

app.get('/', (req, res) => {
    res.send({ err: false, message: 'Welcome to Srijan wolfram alpha api wrapper Please sign up for querying' });
    return;
})

app.post('/', (req, res) => {
    res.send({ err: false, message: 'Welcome to Srijan wolfram alpha api wrapper Please sign up for querying' });
    return
})

// Handle 404 
app.use((req, res, next) => {
    //This is our custom error message.
    // If raising error from within the app, we will have to set up error.status
    let err = {
        message: 'Not Found',
        status: 404
    };
    res.send(err);
    next(err);
    return;
});

export { app };
