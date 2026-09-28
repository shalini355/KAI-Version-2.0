import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif', padding: '2rem', background: '#eef6f3' }}>
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <p style={{ color: '#3c8c83', fontWeight: 700, letterSpacing: '.1em', fontSize: '.75rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Something went wrong</p>
            <h1 style={{ color: '#183b46', fontSize: '1.5rem', marginBottom: '1rem' }}>Kai ran into a problem</h1>
            <p style={{ color: '#66808a', lineHeight: 1.6, marginBottom: '1.5rem' }}>Try refreshing the page. If the problem persists, please contact support.</p>
            <pre style={{ background: '#fff', border: '1px solid #cfe2df', padding: '1rem', fontSize: '.78rem', color: '#834242', textAlign: 'left', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{this.state.error.message}</pre>
            <button onClick={() => window.location.reload()} style={{ marginTop: '1.5rem', padding: '10px 20px', background: '#246b78', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Reload page</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
