import express, { type Express, type Request, type Response } from 'express';
import { SedapalService } from './sedapal.service.ts';
import { CaliddaService } from './calidda.service.ts';
import dotenv from 'dotenv';
dotenv.config();
const app: Express = express();
app.use(express.json());


function validateToken(req: Request, res: Response, next: Function) {
    if (!req.headers['x-api-key'] || req.headers['x-api-key'] !== process.env.API_KEY) {
        return res.status(401).send({
            message: 'Unauthorized',
            status: 401
        });
    }

    next();
};

app.get('/', validateToken, (req: Request, res: Response) => {
    res.send({
        message: 'API Recibos',
        status: 200
    });
});


app.get('/recibo/sedapal/:supplyCode', validateToken, async (req: Request, res: Response) => {
    const supplyCode = req.params.supplyCode as string;
    const sedapal = new SedapalService();

    // obtener el token
    const tokenObtained = await sedapal.getToken();

    if (!tokenObtained) {
        return res.status(401).send({
            message: 'No se pudo obtener el token de Sedapal',
            status: 401
        });
    }

    // consultar los recibos
    const receipts = await sedapal.getReceipts(supplyCode);

    // filtrar recibo del mes
    const currentReceipt = await sedapal.getCurrentReceipt(receipts, supplyCode);

    if (!currentReceipt) {
        return res.status(404).send({
            message: 'No se encontro el recibo del mes actual',
            status: 404
        });
    }

    // descargar el recibo
    const pdfBuffer = await sedapal.downloadReceipt(currentReceipt);
    if (!pdfBuffer) {
        return res.status(404).send({
            message: 'No se pudo descargar el recibo del mes actual',
            status: 404
        });
    }

    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', `attachment; filename=sedapal_${currentReceipt.f_fact}.pdf`);
    res.send(pdfBuffer);

});

app.post('/recibo/calidda/:supplyCode', validateToken, async (req: Request, res: Response) => {
    const supplyCode = req.params.supplyCode as string;
    const calidda = new CaliddaService();

    const body = req.body;
    // descargar el recibo de calidda
    const pdfBuffer = await calidda.getReceipt(supplyCode, body.documentNumber, body.documentType);

    if (!pdfBuffer) {
        return res.status(404).send({
            message: 'No se pudo descargar el recibo de Calidda',
            status: 404
        });
    }

    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', `attachment; filename=recibo.pdf`);
    res.send(pdfBuffer);
});

app.listen(3000);