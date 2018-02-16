import * as express from 'express';
import { appId } from '../config/config'
import { wolframAlpha } from '../srijan-Wolfram-Alpha-Api-wrapper/wolfram-alpha-api';

export async function callSrijanWolframWrapper(req: express.Request, res: express.Response, next) {
    if (!req) {
        res.send({ err: true, result: { message: 'Request empty', data: null } });
        return;
    }
    let AppId: string = process.env.appId ? process.env.appId : appId;
    try {
        let wfapi = new wolframAlpha(AppId);
        let queryToSearch: string = req.params.query;
        let queryRes: { err: any, result: any } = await wfapi.query(queryToSearch);
        if (queryRes.err) {
            console.error("Error while call wolfram core API");
            console.log(JSON.stringify(queryRes.err));
            res.send({ err: true, result: { message: 'while calling wolfram core API try after some times!!!', data: null } });
            return;
        }
        if (typeof queryRes.result === 'object') {
            let xmlResult: any = queryRes.result.xmlResult;
            let jsonResult: any = queryRes.result.jsonResult;
            // res.write({
            //     err: false,
            //     result: {
            //         message: 'Successfully got the data',
            //         data: { xmlResult: xmlResult }
            //     }
            // })
            // res.write({
            //     err: false,
            //     result: {
            //         message: 'Successfully got the data',
            //         data: { jsonResult: jsonResult }
            //     }
            // })
            // res.end();
            res.send({
                err: false,
                result: {
                    message: 'Success',
                    data: { xmlResult: xmlResult, jsonResult: jsonResult }
                }
            });
            return;
        }
        else {
            res.send({ err: false, result: 'could not found data' });
            return;
        }
    } catch (ex) {
        console.error('Excepton while creting the object of srijan wolfram api wraper');
        console.log(JSON.stringify(ex));
        res.send({ err: true, result: { message: 'Error while calling srijan wolfram api wraper try later!!!', data: null } });
        return;
    }
}