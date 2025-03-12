import { readdirSync, readFileSync } from 'fs';
import { parseStringPromise } from 'xml2js';
import * as XLSX from 'xlsx';
import path from 'path';

interface InvoiceEntry {
    Number: string;
    Date: string;
    ClientName: string;
    ClientTaxCode: string;
    TotalAmount: number;
}

async function parseInvoiceXML(filePath: string): Promise<InvoiceEntry | null> {
    const xmlContent = readFileSync(filePath, 'utf-8');
    const parsedData = await parseStringPromise(xmlContent);

    const header = parsedData['ns2:FatturaElettronica'].FatturaElettronicaHeader[0];
    const body = parsedData['ns2:FatturaElettronica'].FatturaElettronicaBody[0];
    const documentData = body.DatiGenerali[0].DatiGeneraliDocumento[0];

    return {
        Number: documentData.Numero[0],
        Date: documentData.Data[0],
        ClientName: header.CessionarioCommittente[0].DatiAnagrafici[0].Anagrafica[0].Nome[0],
        ClientTaxCode: header.CessionarioCommittente[0].DatiAnagrafici[0].CodiceFiscale[0],
        TotalAmount: parseFloat(documentData.ImportoTotaleDocumento[0])
    };
}

async function generateExcelFromXML(folderPath: string, outputPath: string) {
    const files = readdirSync(folderPath).filter(file => file.endsWith('.xml'));

    const invoices: InvoiceEntry[] = [];

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const invoiceData = await parseInvoiceXML(filePath);
        if (invoiceData) {
            invoices.push(invoiceData);
        }
    }

    const worksheet = XLSX.utils.json_to_sheet(invoices);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

    XLSX.writeFile(workbook, outputPath);
    console.log(`Excel file created successfully at: ${outputPath}`);
}

const folderPath = path.join(__dirname, 'XMLFiles');
const outputPath = path.join(__dirname, 'Invoices.xlsx');

generateExcelFromXML(folderPath, outputPath);
