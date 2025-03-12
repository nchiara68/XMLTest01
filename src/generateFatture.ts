import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

interface InvoiceData {
    id: string;
    date: string;
    number: string;
    totalAmount: number;
    clientName: string;
    clientTaxCode: string;
    clientAddress: string;
    clientCity: string;
    clientProvince: string;
    clientPostalCode: string;
}

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function generateFakeInvoiceData(): InvoiceData {
    const clients = ["Mario Rossi", "Laura Bianchi", "Giovanni Verdi", "Anna Neri", "Elena Gialli"];
    const taxCodes = ["RSSMRA80A01H501Z", "BNCLRA80B01F205Z", "VRDGNN85C03F205Z", "NRANNA95D04F205Z", "GLNLEN97E05F205Z"];
    const addresses = ["Via Roma 10", "Piazza Italia 5", "Corso Buenos Aires 23", "Via Montenapoleone 15", "Viale Europa 34"];
    const cities = ["Milano", "Roma", "Napoli", "Torino", "Bologna"];
    const provinces = ["MI", "RM", "NA", "TO", "BO"];
    const postalCodes = ["20121", "00100", "80100", "10100", "40100"];

    const randomIndex = Math.floor(Math.random() * clients.length);

    return {
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0],
        number: `00${randomIndex + 1}/2025`,
        totalAmount: parseFloat((Math.random() * 500 + 50).toFixed(2)),
        clientName: getRandomElement(clients),
        clientTaxCode: getRandomElement(taxCodes),
        clientAddress: getRandomElement(addresses),
        clientCity: getRandomElement(cities),
        clientProvince: getRandomElement(provinces),
        clientPostalCode: getRandomElement(postalCodes)
    };
}

function generateInvoiceXML(invoice: InvoiceData): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ns2:FatturaElettronica xmlns:ns2="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2"
                       versione="1.2.2"
                       xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
    <FatturaElettronicaHeader>
        <DatiTrasmissione>
            <IdTrasmittente>
                <IdPaese>IT</IdPaese>
                <IdCodice>09876543210</IdCodice>
            </IdTrasmittente>
            <ProgressivoInvio>${invoice.id}</ProgressivoInvio>
            <FormatoTrasmissione>FPR12</FormatoTrasmissione>
            <CodiceDestinatario>DEF5678</CodiceDestinatario>
        </DatiTrasmissione>
        <CedentePrestatore>
            <DatiAnagrafici>
                <IdFiscaleIVA>
                    <IdPaese>IT</IdPaese>
                    <IdCodice>09876543210</IdCodice>
                </IdFiscaleIVA>
                <Anagrafica>
                    <Denominazione>XYZ Consulting Srl</Denominazione>
                </Anagrafica>
            </DatiAnagrafici>
            <Sede>
                <Indirizzo>Corso Venezia 45</Indirizzo>
                <CAP>20121</CAP>
                <Comune>Milano</Comune>
                <Provincia>MI</Provincia>
                <Nazione>IT</Nazione>
            </Sede>
        </CedentePrestatore>
        <CessionarioCommittente>
            <DatiAnagrafici>
                <CodiceFiscale>${invoice.clientTaxCode}</CodiceFiscale>
                <Anagrafica>
                    <Nome>${invoice.clientName}</Nome>
                </Anagrafica>
            </DatiAnagrafici>
            <Sede>
                <Indirizzo>${invoice.clientAddress}</Indirizzo>
                <CAP>${invoice.clientPostalCode}</CAP>
                <Comune>${invoice.clientCity}</Comune>
                <Provincia>${invoice.clientProvince}</Provincia>
                <Nazione>IT</Nazione>
            </Sede>
        </CessionarioCommittente>
    </FatturaElettronicaHeader>

    <FatturaElettronicaBody>
        <DatiGenerali>
            <DatiGeneraliDocumento>
                <TipoDocumento>TD01</TipoDocumento>
                <Divisa>EUR</Divisa>
                <Data>${invoice.date}</Data>
                <Numero>${invoice.number}</Numero>
                <ImportoTotaleDocumento>${invoice.totalAmount}</ImportoTotaleDocumento>
            </DatiGeneraliDocumento>
        </DatiGenerali>
    </FatturaElettronicaBody>
</ns2:FatturaElettronica>`;
}

function generateInvoices(count: number): void {
    const folderPath = path.join(__dirname, 'XMLFiles');
    if (!existsSync(folderPath)) {
        mkdirSync(folderPath);
    }

    for (let i = 0; i < count; i++) {
        const invoice = generateFakeInvoiceData();
        const xmlContent = generateInvoiceXML(invoice);
        const filePath = path.join(folderPath, `invoice_${Math.random().toString(36).substring(2, 14)}.xml`);
        
        writeFileSync(filePath, xmlContent); // <--- FIXED: Aggiunto il salvataggio dei file
        console.log(`Generated invoice: ${filePath}`);
    }
}


const invoiceCount = parseInt(process.argv[2], 10) || 5; // Default to 5 if no value is passed
generateInvoices(invoiceCount);
