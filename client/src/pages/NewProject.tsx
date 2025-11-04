import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Manager = { id: string; name: string };

export function NewProject() {
  const { sessionId } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [methodology, setMethodology] = useState<'PRINCE2' | 'PMI' | 'Hybrid' | 'Agile'>('Hybrid');
  const [managerId, setManagerId] = useState<string>('');
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    
    fetch('/api/managers', {
      headers: { Authorization: `Bearer ${sessionId}` },
    })
      .then(r => r.json())
      .then(data => {
        // Assicurati che sia sempre un array
        if (Array.isArray(data)) {
          setManagers(data);
        } else {
          setManagers([]);
        }
      })
      .catch(() => setManagers([]));
  }, [sessionId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          name,
          description,
          methodology,
          projectManagerId: managerId || undefined,
          stage: 'Initiation',
          statusRAG: 'Green',
          percentComplete: 0,
        })
      });

      if (res.ok) {
        alert('Progetto creato con successo!');
        navigate('/');
      } else {
        const error = await res.json();
        alert(`Errore: ${error.error || 'Errore durante la creazione'}`);
      }
    } catch (error) {
      alert('Errore durante la creazione del progetto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#111827' }}>
          Nuovo Progetto
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Crea un nuovo progetto nel portfolio
        </p>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
              Nome Progetto *
            </label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Es: Digital Transformation"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
              Descrizione
            </label>
            <textarea
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Descrizione del progetto..."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
              Metodologia
            </label>
            <select
              className="select"
              value={methodology}
              onChange={e => setMethodology(e.target.value as any)}
            >
              <option value="PRINCE2">PRINCE2</option>
              <option value="PMI">PMI</option>
              <option value="Hybrid">Ibrido</option>
              <option value="Agile">Agile</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
              Project Manager
            </label>
            <select
              className="select"
              value={managerId}
              onChange={e => setManagerId(e.target.value)}
            >
              <option value="">(non assegnato)</option>
              {Array.isArray(managers) && managers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creazione...' : 'Crea Progetto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

