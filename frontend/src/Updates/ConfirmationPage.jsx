import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ConfirmationPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Attempt to find booking by confirmation code via server endpoint if you have one.
      // Fallback: just display the entered code as a confirmation preview.
      // Example: await axios.get(`http://localhost:9000/bookingByCode/${code}`)

      setTimeout(() => {
        setResult({ found: true, code });
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      setResult({ found: false });
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>← Back</button>

      <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #eee' }}>
        <h2>Enter Confirmation Code</h2>
        <p>Paste your confirmation code (e.g., LIFT-XXXXXX) to view/update your booking.</p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Confirmation Code
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="LIFT-ABC123"
              style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ddd' }}
            />
          </label>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="submit" style={{ padding: '10px 14px', background: '#2f6feb', color: '#fff', border: 'none', borderRadius: 6 }}>
              {loading ? 'Checking…' : 'Lookup'}
            </button>
            <button type="button" onClick={() => setCode('')} style={{ padding: '10px 14px', borderRadius: 6 }}>
              Clear
            </button>
          </div>
        </form>

        {result && (
          <div style={{ marginTop: 16 }}>
            {result.found ? (
              <div>
                <p>Confirmation <strong>{result.code}</strong> found.</p>
                <p>You can contact support or check your bookings in your profile.</p>
              </div>
            ) : (
              <p>Code not found. Please verify and try again.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
