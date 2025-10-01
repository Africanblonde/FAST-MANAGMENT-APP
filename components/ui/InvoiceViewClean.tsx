import React, { useState } from 'react';
import type { Invoice, Client, Vehicle, LayoutSettings, InvoiceItem } from '../../types';
import { formatCurrency, getInvoiceStatusAndBalance } from '../../utils/helpers';
import ActionButton from './ActionButton';
import { IconPrint, IconInvoice } from '../icons';
import { generateInvoicePdf } from '../../services/invoicePdfService';

type DocumentType = 'Factura' | 'Factura Pró-forma' | 'Cotação' | 'Factura Recibo';

interface InvoiceViewCleanProps {
    invoice: Invoice;
    client?: Client;
    vehicle?: Vehicle;
    layoutSettings: LayoutSettings;
    logoUrl: string | null;
    isCollectionInvoice: boolean;
    onClose: () => void;
}

const InvoiceViewClean: React.FC<InvoiceViewCleanProps> = ({ 
    invoice, 
    client, 
    vehicle, 
    layoutSettings, 
    logoUrl, 
    isCollectionInvoice, 
    onClose 
}: InvoiceViewCleanProps) => {
    
    const getDocumentType = (): DocumentType => {
        if (isCollectionInvoice) return 'Factura Recibo';
        const { totalPaid } = getInvoiceStatusAndBalance(invoice);
        if (totalPaid > 0) return 'Factura';
        return 'Cotação';
    };
    
    const [documentType, setDocumentType] = useState<DocumentType>(getDocumentType());
    
    const { balance, totalPaid } = getInvoiceStatusAndBalance(invoice);
    
    const servicosItems = invoice.items.filter((item: InvoiceItem) => item.type === 'service');
    const pecasItems = invoice.items.filter((item: InvoiceItem) => item.type === 'part' || item.type === 'custom');
    
    const subtotalServicos = servicosItems.reduce((sum: number, item: InvoiceItem) => sum + (item.quantity * item.unitPrice), 0);
    const subtotalPecas = pecasItems.reduce((sum: number, item: InvoiceItem) => sum + (item.quantity * item.unitPrice), 0);
    
    const getDocumentTitle = () => {
        switch (documentType) {
            case 'Factura': return layoutSettings.invoiceTitle || 'FACTURA';
            case 'Factura Pró-forma': return 'FACTURA PRÓ-FORMA';
            case 'Cotação': return layoutSettings.quotationTitle || 'COTAÇÃO';
            case 'Factura Recibo': return layoutSettings.collectionInvoiceTitle || 'FACTURA RECIBO';
            default: return 'DOCUMENTO';
        }
    };

    const discountAmount = invoice.discountType === 'percentage'
        ? (invoice.subtotal * ((invoice.discount || 0) / 100))
        : (invoice.discount || 0);

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleGeneratePdf = async () => {
        setIsGeneratingPdf(true);
        try {
            await generateInvoicePdf(invoice, client, vehicle, layoutSettings, logoUrl, isCollectionInvoice);
        } catch (error) {
            console.error('Erro inesperado:', error);
            alert('Erro inesperado ao gerar PDF.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="printable-container">
            <style>{`
                .printable-container { background-color: #e9ecef; padding: 2rem; }
                .printable-area {
                    width: 210mm;
                    min-height: 297mm;
                    margin: auto;
                    padding: 20mm;
                    background: white;
                    box-shadow: 0 0 15px rgba(0,0,0,.1);
                    color: #343a40;
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    font-size: 10pt;
                    position: relative;
                }
                .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .invoice-table thead { background-color: #343a40; color: white; }
                .invoice-table th, .invoice-table td { padding: 10px 12px; border: 1px solid #dee2e6; text-align: left; vertical-align: top; }
                .invoice-table td { background-color: #fff; }
                .invoice-table tbody tr:nth-child(even) td { background-color: #f8f9fa; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
            `}</style>
            <div className="flex justify-between items-center mb-4 no-print">
                <div className="flex items-center gap-4">
                    <label htmlFor="docType" className="font-semibold text-text-primary">Tipo:</label>
                    <select 
                        id="docType" 
                        value={documentType} 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDocumentType(e.target.value as DocumentType)} 
                        className="form-select"
                    >
                        <option value="Cotação">Cotação</option>
                        <option value="Factura Pró-forma">Factura Pró-forma</option>
                        <option value="Factura">Factura</option>
                        <option value="Factura Recibo">Factura Recibo</option>
                    </select>
                </div>
                <div className="flex gap-2">
                     <ActionButton onClick={() => window.print()} variant="secondary" icon={<IconPrint className="w-4 h-4" />} children="Imprimir" />
                    <ActionButton onClick={handleGeneratePdf} icon={<IconInvoice className="w-4 h-4" />} children={isGeneratingPdf ? 'A gerar...' : 'Baixar PDF'} />
                </div>
            </div>

            <div className="printable-area">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #dee2e6', paddingBottom: '20px', marginBottom: '30px' }}>
                    <div>
                        {logoUrl ? <img src={logoUrl} alt="Logo" style={{ maxHeight: '60px', marginBottom: '10px' }} /> : <h1 style={{ fontSize: '22pt', fontWeight: 'bold', color: '#0d6efd' }}>{layoutSettings.companyName}</h1>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#212529', marginBottom: '5px' }}>{getDocumentTitle()}</h2>
                        <p style={{ fontSize: '11pt', fontWeight: '600' }}>#{invoice.display_id || invoice.id}</p>
                        <p style={{ fontSize: '10pt', color: '#6c757d' }}>Data: {new Date(invoice.issueDate).toLocaleDateString('pt-PT')}</p>
                    </div>
                </header>

                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    <div>
                        <h3 style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#6c757d', marginBottom: '8px' }}>Nossa Empresa</h3>
                        <p><strong>{layoutSettings.companyName}</strong></p>
                        <p>{layoutSettings.footerAddress}</p>
                        <p>{layoutSettings.footerContact}</p>
                        <p>NUIT: {layoutSettings.footerNuit}</p>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#6c757d', marginBottom: '8px' }}>Facturado a</h3>
                        <p><strong>{client ? `${client.firstName} ${client.lastName}`.trim() : 'N/A'}</strong></p>
                        <p>Contacto: {client?.contact || 'N/A'}</p>
                        {vehicle && <p>Matrícula: <strong>{vehicle.licensePlate}</strong> ({vehicle.model})</p>}
                    </div>
                </section>
                
                {pecasItems.length > 0 && (
                    <section style={{ marginTop: '20px' }}>
                        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px', color: '#0d6efd' }}>Peças & Fornecimentos</h3>
                        <table className="invoice-table">
                             <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th className="text-center">Qtd.</th>
                                    <th className="text-right">Preço Unit.</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pecasItems.map((item: InvoiceItem) => (
                                    <tr key={item.id}>
                                        <td>{item.description}</td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                                        <td className="text-right font-bold">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={3} className="text-right font-bold" style={{border: 'none', background: '#f8f9fa'}}>Subtotal Peças:</td>
                                    <td className="text-right font-bold" style={{border: '1px solid #dee2e6', background: '#f8f9fa'}}>{formatCurrency(subtotalPecas)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                )}
                
                {servicosItems.length > 0 && (
                    <section>
                        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px', color: '#0d6efd' }}>Serviços Prestados</h3>
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th className="text-center">Qtd.</th>
                                    <th className="text-right">Preço Unit.</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servicosItems.map((item: InvoiceItem) => (
                                    <tr key={item.id}>
                                        <td>{item.description}</td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                                        <td className="text-right font-bold">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={3} className="text-right font-bold" style={{border: 'none', background: '#f8f9fa'}}>Subtotal Serviços:</td>
                                    <td className="text-right font-bold" style={{border: '1px solid #dee2e6', background: '#f8f9fa'}}>{formatCurrency(subtotalServicos)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                )}

                <section style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                    <div style={{ width: '50%' }}>
                        <table style={{ width: '100%' }}>
                            <tbody>
                                <tr><td style={{ padding: '5px' }}>Subtotal:</td><td className="text-right" style={{ padding: '5px' }}>{formatCurrency(invoice.subtotal)}</td></tr>
                                {discountAmount > 0 && <tr><td style={{ padding: '5px' }}>Desconto:</td><td className="text-right" style={{ padding: '5px' }}>-{formatCurrency(discountAmount)}</td></tr>}
                                {invoice.taxApplied && <tr><td style={{ padding: '5px' }}>{layoutSettings.taxName} ({layoutSettings.taxRate}%):</td><td className="text-right" style={{ padding: '5px' }}>{formatCurrency(invoice.taxAmount)}</td></tr>}
                                <tr style={{ fontWeight: 'bold', fontSize: '14pt', borderTop: '2px solid #343a40' }}><td style={{ padding: '10px 5px' }}>Total:</td><td className="text-right" style={{ padding: '10px 5px' }}>{formatCurrency(invoice.total)}</td></tr>
                                {totalPaid > 0 && <>
                                    <tr><td style={{ padding: '5px', color: '#198754' }}>Pago:</td><td className="text-right" style={{ padding: '5px', color: '#198754' }}>{formatCurrency(totalPaid)}</td></tr>
                                    <tr style={{ fontWeight: 'bold' }}><td style={{ padding: '5px' }}>Saldo:</td><td className="text-right" style={{ padding: '5px', color: balance > 0 ? '#dc3545' : '#198754' }}>{formatCurrency(balance)}</td></tr>
                                </>}
                            </tbody>
                        </table>
                    </div>
                </section>

                {invoice.description && <section style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '5px' }}>Observações</h3>
                    <p style={{ fontSize: '9pt', color: '#6c757d' }}>{invoice.description}</p>
                </section>}

                <footer style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', textAlign: 'center', fontSize: '9pt', color: '#6c757d', borderTop: '1px solid #dee2e6', paddingTop: '10px' }}>
                    <p>{layoutSettings.footerMessage}</p>
                </footer>
            </div>
        </div>
    );
};

export default InvoiceViewClean;