import dayjs from "./lib.ts";

export class SedapalService {
    private url: string;
    private token: string | null;

    constructor(token: string | null = null) {
        this.url = 'https://webapp16.sedapal.com.pe/OficinaComercialVirtual/api/'
        this.token = token;
    }

    async getToken() {
        const credentials = `username=OCV_Sedapal&password=OCV0109`;
        const response = await fetch(`${this.url}login?${credentials}`, {
            method: 'POST',
        });
        if (!response.ok) {
            return false
        }
        const result = await response.json();
        this.token = result.bRESP.token ?? null;
        return this.token != null;
    }

    async validateSupplyCode(supplyCode: string) {
        const response = await fetch(`${this.url}registro-usuario/valida-suministro`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': this.token as string
            },
            body: JSON.stringify(
                {
                    "nis_rad": supplyCode,
                    "auth_correo": "",
                    "flagChannel": "4",
                    "login_type": "nis"
                }
            )
        });

        if (!response.ok) {
            return false;
        }

        const result = await response.json();

        if (result) {
            return result.nRESP_SP ?? null === 1;
        }

    }

    async getReceipts(supplyCode: string) {
        const response = await fetch(`${this.url}recibos/lista-recibos-deudas-nis`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': this.token as string
            },
            body: JSON.stringify({ "nis_rad": parseInt(supplyCode), "page_num": 1, "page_size": 10 })
        });
        if (!response.ok) {
            return []
        }
        const result = await response.json();

        if (response) {
            return result.bRESP ?? [];
        }
    }

    getCurrentReceipt(receipts: any[], supplyCode: string) {
        for (const receipt of receipts) {
            const billDate = receipt.mes.split('-')
            const year = billDate.slice(0, 1).join('');
            const month = billDate.slice(1, 2).join('');

            const currentDate = dayjs.tz();

            if (parseInt(month) === parseInt(currentDate.format("M")) && parseInt(year) === parseInt(currentDate.format("YYYY"))) {
                return {
                    ...receipt,
                    nis_rad: parseInt(supplyCode)
                }
            }
        }
    }

    async downloadReceipt(currentReceipt: any) {
        const response = await fetch('https://webapp16.sedapal.com.pe/OficinaComercialVirtual/api/recibos/recibo-pdf', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': this.token as string
            },
            body: JSON.stringify(currentReceipt)
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();

        if (result) {
            const base64 = result.bRESP;
            if (!base64) {
                return null;
            }
            const buffer = Buffer.from(base64, 'base64');
            return buffer;
        }
    }
}