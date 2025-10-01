import React, { useState, useMemo } from 'react';
import type { Occurrence } from '../types';

interface OccurrenceFormProps {
    onSave: (data: { person: string; description: string }) => void;
}

// Removido React.FC
const OccurrenceForm = ({ onSave }: OccurrenceFormProps) => {
    const [person, setPerson] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!person.trim() || !description.trim()) {
            alert('Por favor, preencha ambos os campos.');
            return;
        }
        onSave({ person, description });
        setPerson('');
        setDescription('');
    };
    
    return (
        <form onSubmit={handleSubmit} className="card space-y-4" style={{padding: '1.5rem'}}>
            <h2>Registar Nova Ocorrência</h2>
            <div>
                <label htmlFor="person" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>Pessoa Envolvida</label>
                <input 
                    id="person" 
                    value={person} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPerson(e.target.value)} 
                    placeholder="Nome do cliente, funcionário, etc." 
                    className="form-input" 
                    required
                />
            </div>
            <div>
                <label htmlFor="description" style={{display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem'}}>Descrição do Evento</label>
                <textarea 
                    id="description"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    placeholder="Ex: Cliente João Silva levantou a viatura AA-00-BB após reparação."
                    rows={4}
                    className="form-textarea"
                    required
                ></textarea>
            </div>
            <div className="flex justify-end">
                <button type="submit" className="btn btn-primary">Guardar Ocorrência</button>
            </div>
        </form>
    );
};

interface OccurrencesPageProps {
    occurrences: Occurrence[];
    onSave: (occurrence: { person: string; description: string }) => void;
}

// Removido React.FC
const OccurrencesPage = ({ occurrences, onSave }: OccurrencesPageProps) => {
    
    const sortedOccurrences = useMemo(() => {
        return [...occurrences].sort((a: Occurrence, b: Occurrence) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [occurrences]);
    
    return (
        <div className="space-y-8">
            <h1>Registo de Ocorrências</h1>
            <OccurrenceForm onSave={onSave} />

            <div className="space-y-4">
                 <h2>Histórico de Ocorrências</h2>
                 {sortedOccurrences.length === 0 ? (
                    <p style={{color: 'var(--color-text-secondary)'}}>Nenhuma ocorrência registada.</p>
                 ) : (
                    <div className="card space-y-4" style={{padding: '1rem'}}>
                        {sortedOccurrences.map((occ: Occurrence) => (
                             <div key={occ.id} style={{borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1rem'}}>
                                <p style={{fontSize: '0.875rem', color: 'var(--color-text-tertiary)'}}>{new Date(occ.created_at).toLocaleString('pt-PT')}</p>
                                <p style={{fontWeight: 600}}><span style={{color: 'var(--color-primary)'}}>Pessoa:</span> {occ.person}</p>
                                <p style={{color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap'}}>{occ.description}</p>
                            </div>
                        ))}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default OccurrencesPage;