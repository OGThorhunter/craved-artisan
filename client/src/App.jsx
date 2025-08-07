import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Bug 6: Memory leak - useEffect without cleanup
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/users/1');
        const data = await response.json();
        setUsers([data]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // Missing cleanup function - can cause memory leaks
  }, []);

  // Bug 7: XSS vulnerability - directly rendering user input
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Fixed: Use textContent instead of innerHTML to prevent XSS
        const messageElement = document.getElementById('message');
        messageElement.textContent = result.message;
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bug 8: Insecure password handling - logging to console
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Security issue - logging sensitive data to console
    if (name === 'password') {
      console.log('Password entered:', value); // Should never log passwords
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Craved Artisan</h1>
      </header>
      
      <main>
        <section>
          <h2>User Registration</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          
          {/* XSS vulnerability target */}
          <div id="message"></div>
          
          {error && <div className="error">{error}</div>}
        </section>

        <section>
          <h2>Users</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul>
              {users.map(user => (
                <li key={user.id}>
                  {/* Fixed: Use regular text rendering instead of dangerouslySetInnerHTML */}
                  <span>{user.email}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;