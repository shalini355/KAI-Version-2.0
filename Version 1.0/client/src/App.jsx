import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import { Activity, BookOpen, HeartPulse, LogOut, Menu, MessageCircle, NotebookPen, Phone, ShieldAlert, UserCheck, Wind, X } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from './api'
import { dailyAffirmation } from './affirmations'
import { WellnessExercisePage, WellnessLanding } from './components/WellnessToolkit'

const moods = [
  { value: 'low',    label: 'Low',    emoji: '😞', score: 1 },
  { value: 'uneasy', label: 'Uneasy', emoji: '😟', score: 2 },
  { value: 'okay',   label: 'Okay',   emoji: '😐', score: 3 },
  { value: 'good',   label: 'Good',   emoji: '🙂', score: 4 },
  { value: 'bright', label: 'Bright', emoji: '😄', score: 5 },
]
const moodByValue = Object.fromEntries(moods.map(m => [m.value, m]))

function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  useEffect(() => { api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => {}).finally(() => setChecking(false)) }, [])
  if (checking) return <div className="center-state">Loading your space...</div>
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/chat" replace /> : <SignInPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route element={<Protected user={user} onLogout={() => setUser(null)} />}>
        <Route index element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/breathing" element={<BreathingPage />} />
        <Route path="/wellness" element={<WellnessLanding />} />
        <Route path="/wellness/:slug" element={<WellnessExercisePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/chat' : '/login'} replace />} />
    </Routes>
  )
}

function Protected({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const logout = async () => { await api.post('/auth/logout').catch(() => {}); onLogout(); navigate('/login', { replace: true }) }
  if (!user) return <Navigate to="/login" replace />
  const links = [
    { to: '/chat',      label: 'Talk to Kai',      icon: MessageCircle },
    { to: '/mood',      label: 'Mood check-in',    icon: Activity },
    { to: '/journal',   label: 'Private journal',  icon: NotebookPen },
    { to: '/wellness',  label: 'Wellness toolkit', icon: Wind },
    { to: '/resources', label: 'Resources',        icon: ShieldAlert },
  ]
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/chat"><span className="brand-mark">K</span><span>Kai</span></Link>
        <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setOpen(!open)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={open ? 'nav open' : 'nav'}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to={to}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
          <button className="nav-link nav-logout" onClick={logout}><LogOut size={17} />Sign out</button>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer>Private by design. Kai is a wellness companion, not a medical professional.</footer>
    </div>
  )
}

function SignInPage() {
  const [searchParams] = useSearchParams()
  const failed = searchParams.get('error') === 'auth_failed'
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  return (
    <div className="auth-layout">
      <section className="auth-intro">
        <div className="brand"><span className="brand-mark">K</span><span>Kai</span></div>
        <p className="eyebrow">A quieter place to land</p>
        <h1>Make room for what you feel.</h1>
        <p>Kai offers a private, thoughtful space for reflection, gentle conversation, and everyday wellbeing.</p>
        <Link className="text-link" to="/resources">Need urgent support? Visit resources</Link>
      </section>
      <section className="auth-card">
        <p className="eyebrow">Your private space</p>
        <h2>Sign in to Kai</h2>
        <p className="muted">Continue your check-in when you are ready.</p>
        {failed && <div className="error-box" role="alert">Sign-in was unsuccessful. Please try again.</div>}
        <a className="primary-button oauth-button" href={`${apiBase}/auth/google`}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </a>
        <p className="muted" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>Kai uses Google Sign-In. No password is stored.</p>
      </section>
    </div>
  )
}

function Intro({ eyebrow, title, copy }) { return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy && <p className="intro-copy">{copy}</p>}</div></div> }

function ChatPage() {
  const [messages, setMessages] = useState([]); const [text, setText] = useState(''); const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false); const [error, setError] = useState(''); const navigate = useNavigate()
  useEffect(() => { api.get('/chat/history').then(({ data }) => setMessages(data.messages)).catch(() => setError('Your conversation could not be loaded.')).finally(() => setLoading(false)) }, [])
  const send = async (event) => {
    event.preventDefault();
    const message = text.trim();
    if (!message || sending) return;

    const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat`;
    setText('');
    setError('');

    const createdAt = new Date().toISOString();
    setMessages((current) => [...current, { role: 'user', content: message, createdAt }, { role: 'assistant', content: '', createdAt }]);
    setSending(true);

    try {
      console.info('[Chat] Sending request to:', apiUrl, { message });
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json',
        },
        body: JSON.stringify({ message }),
      });

      console.info('[Chat] Response received:', { status: response.status, type: response.headers.get('content-type') });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('[Chat] Server rejected request:', data);
        throw new Error(data.message || 'Kai is unavailable right now. Please try again.');
      }

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let reply = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunks = decoder.decode(value, { stream: true }).split('\n');
          for (const line of chunks) {
            if (!line.startsWith('data: ')) continue;

            try {
              const eventData = JSON.parse(line.slice(6));
              if (eventData.token) {
                reply += eventData.token;
                setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, content: reply } : item));
              }

              if (eventData.done && eventData.message) {
                reply = eventData.message;
                setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, content: reply } : item));
              }
            } catch (parseError) {
              console.warn('[Chat] Partial stream parse error:', parseError.message, line);
            }
          }
        }
      } else {
        const data = await response.json();
        setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, content: data.message } : item));
        if (data.crisis) navigate('/resources');
      }
    } catch (err) {
      console.error('[Chat] Request failed:', err);
      setMessages((current) => current.slice(0, -1));
      setError(err.message || 'Kai is unavailable right now. Please try again.');
    } finally {
      setSending(false);
    }
  };
  return <div className="page"><Intro eyebrow="Your check-in" title="Talk to Kai" copy="A private conversation for sorting through the day, one message at a time." /><section className="chat-panel"><div className="chat-messages" aria-live="polite">{loading ? <div className="empty-state">Loading your conversation...</div> : messages.length === 0 ? <div className="empty-state"><HeartPulse size={25} /><strong>Start wherever you are.</strong><span>Tell Kai what has been taking up space today.</span></div> : messages.map((message, index) => <div key={`${message.createdAt}-${index}`} className={`message-row ${message.role}`}><div className="message-bubble"><span>{message.content}</span><time>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></div></div>)}{sending && <div className="message-row assistant"><div className="message-bubble thinking">Kai is thinking...</div></div>}</div>{error && <div className="error-box chat-error" role="alert">{error}</div>}<form className="chat-form" onSubmit={send}><label className="sr-only" htmlFor="chat-message">Message Kai</label><textarea id="chat-message" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write what is on your mind..." rows="2" disabled={sending} /><button className="primary-button" disabled={sending || !text.trim()}>Send</button></form></section></div>
}

function MoodPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState('')
  const [note, setNote] = useState('')
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const load = (d) => {
    setLoading(true)
    api.get(`/moods?days=${d}`)
      .then(({ data }) => {
        setEntries(data.moods)
        const todayEntry = data.moods.find(e => e.date === today)
        if (todayEntry) { setSelected(todayEntry.mood); setNote(todayEntry.note || '') }
      })
      .catch(() => setErrorMsg('Mood entries could not be loaded.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(days) }, [days]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault()
    if (!selected || saving) return
    setSaving(true); setSuccessMsg(''); setErrorMsg('')
    try {
      await api.post('/moods', { mood: selected, note })
      setSuccessMsg('Today\'s check-in is saved.')
      load(days)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'That check-in could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const todayEntry = entries.find(e => e.date === today)
  const chartData = [...entries].reverse().map(entry => ({
    date: entry.date.slice(5),
    score: moodByValue[entry.mood]?.score || 0,
    mood: entry.mood,
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const { date, mood } = payload[0].payload
    const m = moodByValue[mood]
    return (
      <div className="mood-tooltip">
        <span className="mood-tooltip-date">{date}</span>
        <span>{m ? `${m.emoji} ${m.label}` : mood}</span>
      </div>
    )
  }

  return (
    <div className="page">
      <Intro eyebrow="Notice the pattern" title="Mood check-in" copy="A small daily pause can make patterns easier to see." />
      <div className="two-column">
        <form className="surface" onSubmit={submit}>
          <h2>How are you feeling today?</h2>
          {todayEntry && (
            <p className="form-message" style={{ marginBottom: 0 }}>
              You already checked in today — you can update it below.
            </p>
          )}
          <div className="mood-list">
            {moods.map(mood => (
              <button
                type="button"
                key={mood.value}
                className={selected === mood.value ? 'mood-option selected' : 'mood-option'}
                aria-label={`${mood.label} mood`}
                aria-pressed={selected === mood.value}
                onClick={() => setSelected(mood.value)}
              >
                <span className="mood-emoji" aria-hidden="true">{mood.emoji}</span>
                {mood.label}
              </button>
            ))}
          </div>
          <label>Optional note
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What is influencing your mood?" rows="4" />
          </label>
          {errorMsg && <div className="error-box" role="alert">{errorMsg}</div>}
          {successMsg && <p className="form-message" role="status">{successMsg}</p>}
          <button className="primary-button" disabled={!selected || saving}>
            {saving ? 'Saving...' : todayEntry ? 'Update check-in' : 'Save check-in'}
          </button>
        </form>

        <section className="surface">
          <div className="section-heading">
            <div><h2>Your recent pattern</h2><p className="muted">A simple view of your last {days} days.</p></div>
            <select value={days} onChange={e => setDays(Number(e.target.value))} aria-label="Trend range">
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
          {loading
            ? <div className="empty-state">Loading your mood history...</div>
            : entries.length === 0
              ? <div className="empty-state">No check-ins yet. Your first one starts the pattern.</div>
              : <div className="mood-chart">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="date" stroke="#66808a" />
                      <YAxis
                        domain={[0, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        stroke="#66808a"
                        tickFormatter={v => moodByValue[moods.find(m => m.score === v)?.value]?.emoji || v}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" fill="#3c8c83" name="Mood" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
          }
        </section>
      </div>
    </div>
  )
}

function JournalPage() {
  const [entries, setEntries] = useState([]); const [form, setForm] = useState({ title: '', content: '' }); const [editing, setEditing] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const load = () => { setLoading(true); api.get('/journal').then(({ data }) => setEntries(data.entries)).catch(() => setError('Your journal could not be loaded.')).finally(() => setLoading(false)) }; useEffect(load, [])
  const submit = async (e) => { e.preventDefault(); setError(''); try { if (editing) await api.put(`/journal/${editing}`, form); else await api.post('/journal', form); setForm({ title: '', content: '' }); setEditing(null); load() } catch (err) { setError(err.response?.data?.message || 'The entry could not be saved.') } }
  const remove = async (id) => { await api.delete(`/journal/${id}`); load() }
  return <div className="page"><Intro eyebrow="Put it into words" title="Private journal" copy="Your entries are only visible to your account." /><div className="two-column journal-layout"><form className="surface" onSubmit={submit}><h2>{editing ? 'Edit entry' : 'New entry'}</h2><label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="A few words to name this moment" /></label><label>Entry<textarea required rows="10" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write freely. There is no perfect way to begin." /></label>{error && <div className="error-box">{error}</div>}<div className="button-row"><button className="primary-button">{editing ? 'Update entry' : 'Save entry'}</button>{editing && <button type="button" className="secondary-button" onClick={() => { setEditing(null); setForm({ title: '', content: '' }) }}>Cancel</button>}</div></form><section className="entry-list">{loading ? <div className="empty-state">Loading your entries...</div> : entries.length === 0 ? <div className="surface empty-state"><BookOpen size={25} /><strong>Your journal is quiet for now.</strong><span>When you are ready, begin with one honest sentence.</span></div> : entries.map((entry) => <article className="journal-entry" key={entry._id}><div className="section-heading"><div><h2>{entry.title}</h2><time>{new Date(entry.updatedAt).toLocaleDateString()}</time></div><div className="button-row"><button className="text-button" onClick={() => { setEditing(entry._id); setForm({ title: entry.title, content: entry.content }) }}>Edit</button><button className="text-button danger" onClick={() => remove(entry._id)}>Delete</button></div></div><p>{entry.content}</p></article>)}</section></div></div>
}

function BreathingPage() { const phases = ['Inhale', 'Hold', 'Exhale', 'Hold']; const [running, setRunning] = useState(false); const [seconds, setSeconds] = useState(4); const [phase, setPhase] = useState(0); useEffect(() => { if (!running) return undefined; const timer = setInterval(() => setSeconds((current) => { if (current <= 1) { setPhase((value) => (value + 1) % 4); return 4 } return current - 1 }), 1000); return () => clearInterval(timer) }, [running]); return <div className="page"><Intro eyebrow="Return to your breath" title="Box breathing" copy="Four steady counts can give your attention somewhere kind to rest." /><div className="wellness-grid"><section className="breathing-surface"><div className={`breath-box phase-${phase}`}><span>{phases[phase]}</span><strong>{seconds}</strong></div><p className="breath-instruction">{running ? `${phases[phase]} gently for ${seconds} seconds` : 'Begin when you feel ready'}</p><button className="primary-button" onClick={() => setRunning(!running)}>{running ? 'Pause practice' : 'Begin practice'}</button></section><section className="surface affirmation"><p className="eyebrow">For today</p><h2>{dailyAffirmation()}</h2><p className="muted">Keep this close as a gentle thought, not a task.</p></section></div></div> }

function ResourcesPage() {
  return (
    <div className="page">
      <Intro
        eyebrow="Support beyond Kai"
        title="Resources"
        copy="If you may hurt yourself or are in immediate danger, contact emergency services now and stay with someone you trust."
      />

      <div className="resource-list">

        {/* ── Immediate support ── */}
        <section className="resource-block urgent" aria-labelledby="res-immediate">
          <div className="resource-block-icon"><ShieldAlert size={26} aria-hidden="true" /></div>
          <div className="resource-block-body">
            <h2 id="res-immediate">Immediate support</h2>
            <p className="resource-block-desc">Call now — all lines below are free and available 24/7 unless noted.</p>
            <ul className="helpline-list">
              <li>
                <Phone size={15} aria-hidden="true" />
                <span><strong>Emergency services</strong> — police, fire, ambulance</span>
                <a href="tel:112" className="helpline-number" aria-label="Call 112 for emergency services">112</a>
              </li>
              <li>
                <Phone size={15} aria-hidden="true" />
                <span><strong>Tele-MANAS</strong> — Govt. of India, 24/7, multilingual</span>
                <a href="tel:14416" className="helpline-number" aria-label="Call Tele-MANAS on 14416">14416</a>
              </li>
              <li>
                <Phone size={15} aria-hidden="true" />
                <span><strong>KIRAN Mental Health Helpline</strong> — Govt. of India, 24/7, toll-free</span>
                <a href="tel:18005990019" className="helpline-number" aria-label="Call KIRAN on 1800-599-0019">1800&#8209;599&#8209;0019</a>
              </li>
              <li>
                <Phone size={15} aria-hidden="true" />
                <span><strong>iCall</strong> — TISS, Mon–Sat 8 AM–10 PM</span>
                <a href="tel:9152987821" className="helpline-number" aria-label="Call iCall on 9152987821">9152987821</a>
              </li>
              <li>
                <Phone size={15} aria-hidden="true" />
                <span><strong>Vandrevala Foundation</strong> — 24/7</span>
                <a href="tel:18002662345" className="helpline-number" aria-label="Call Vandrevala Foundation on 1860-266-2345">1860&#8209;266&#8209;2345</a>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Professional support ── */}
        {/* <section className="resource-block" aria-labelledby="res-professional">
          <div className="resource-block-icon"><UserCheck size={26} aria-hidden="true" /></div>
          <div className="resource-block-body">
            <h2 id="res-professional">Professional support</h2>
            <p>A licensed counsellor, psychologist, psychiatrist, or doctor can help you find care that fits your situation.</p>
            <p className="resource-placeholder">College / institution support office: <strong>[ADD YOUR INSTITUTION&#39;S VERIFIED CONTACT]</strong></p>
          </div>
        </section> */}

        {/* ── Right now ── */}
        <section className="resource-block" aria-labelledby="res-now">
          <div className="resource-block-icon"><HeartPulse size={26} aria-hidden="true" /></div>
          <div className="resource-block-body">
            <h2 id="res-now">For the next few minutes</h2>
            <p>Move near another person, put distance between yourself and anything you could use to hurt yourself, and tell someone clearly that you need company.</p>
          </div>
        </section>

        <p className="resource-verified-note">
          Numbers verified as of 27 July 2025 — if any number does not connect, please try
          {' '}<a href="tel:112">112</a> or search for current mental health helplines in your area.
        </p>

      </div>
    </div>
  )
}

export default App
