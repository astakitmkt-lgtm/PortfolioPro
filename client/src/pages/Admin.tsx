import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  isActive: boolean;
}

export function Admin() {
  const { sessionId, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ProjectManager' as 'Admin' | 'PortfolioManager' | 'ProjectManager' | 'Stakeholder',
    department: '',
  });

  useEffect(() => {
    if (sessionId && (user?.role === 'Admin' || user?.role === 'PortfolioManager')) {
      loadUsers();
    }
  }, [sessionId, user]);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/managers/users', {
        headers: { Authorization: `Bearer ${sessionId}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingUser
        ? `/api/auth/register` // Update would need a separate endpoint
        : '/api/auth/register';
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(editingUser ? 'Utente aggiornato!' : 'Utente creato!');
        resetForm();
        loadUsers();
      } else {
        const error = await res.json();
        alert(`Errore: ${error.error || 'Errore durante l\'operazione'}`);
      }
    } catch (error) {
      alert('Errore durante l\'operazione');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ProjectManager',
      department: '',
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      password: '',
      role: userToEdit.role as any,
      department: userToEdit.department || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;

    try {
      // Note: You might need to add a DELETE endpoint for users
      alert('Funzionalità di eliminazione da implementare');
    } catch (error) {
      alert('Errore durante l\'eliminazione');
    }
  };

  if (user?.role !== 'Admin' && user?.role !== 'PortfolioManager') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Accesso Negato</h2>
        <p>Non hai i permessi per accedere a questa pagina.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#111827' }}>
            Amministrazione
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Gestione Project Manager e Utenti
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Nuovo Utente
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              {editingUser ? 'Modifica Utente' : 'Nuovo Utente'}
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={resetForm}
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Nome *
              </label>
              <input
                className="input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Email *
              </label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Password {!editingUser && '*'}
              </label>
              <input
                type="password"
                className="input"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                placeholder={editingUser ? 'Lascia vuoto per non modificare' : ''}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Ruolo *
              </label>
              <select
                className="select"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                required
              >
                <option value="Admin">Admin</option>
                <option value="PortfolioManager">Portfolio Manager</option>
                <option value="ProjectManager">Project Manager</option>
                <option value="Stakeholder">Stakeholder</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Dipartimento
              </label>
              <input
                className="input"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="Es: IT, Marketing, Operations"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Annulla
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Salvataggio...' : editingUser ? 'Aggiorna' : 'Crea'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Lista Utenti</h3>
        </div>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Ruolo</th>
                <th>Dipartimento</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role === 'Admin' ? 'blue' : u.role === 'ProjectManager' ? 'green' : 'gray'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.department || '-'}</td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive ? 'Attivo' : 'Disattivato'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(u)}
                      >
                        Modifica
                      </button>
                      {u.role !== 'Admin' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDelete(u.id)}
                          style={{ background: '#fee2e2', color: '#991b1b' }}
                        >
                          Elimina
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


