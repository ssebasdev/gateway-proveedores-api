export class CaliddaService {
    async getReceipt(supplyCode: string, documentNumber: string, documentType: 'PE2' | 'PE1') {
        const currentDate = new Date();

        const response = await fetch('https://generadorrecibos.calidda.com.pe/Back/api/ReceiptView/GetPdfForRecibos', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                "clientCode": supplyCode,
                "numberDocument": documentNumber,
                "typeDocument": documentType,
                "month": currentDate.getMonth(),
                "year": currentDate.getFullYear(),
                "captcha": ""
            })
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();

        if (result) {
            const base64 = result.data;
            if (!base64) {
                return null;
            }
            const pdfBuffer = Buffer.from(base64, 'base64');
            return pdfBuffer;
        }
    }
}