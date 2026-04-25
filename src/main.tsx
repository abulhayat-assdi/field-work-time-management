import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function Root() {
  if (!supabaseUrl || supabaseUrl.trim() === '') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-orange-100 p-8 text-center">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Missing Environment Variables</h1>
          <p className="text-slate-600 mb-6 text-sm">
            You deployed this site to Vercel, but forgot to add the Supabase environment variables. Because of this, it shows a "failed to fetch" error and gets stuck.
          </p>
          <div className="bg-slate-100 p-4 rounded-xl text-left overflow-auto text-xs text-slate-700 font-mono mb-6 space-y-2">
            <p className="font-bold">Please go to Vercel Dashboard -&gt; Settings -&gt; Environment Variables and add:</p>
            <p>1. <span className="text-brand-blue font-bold">VITE_SUPABASE_URL</span></p>
            <p>2. <span className="text-brand-blue font-bold">VITE_SUPABASE_ANON_KEY</span></p>
          </div>
          <p className="text-xs text-slate-500">After adding them, redeploy your app on Vercel.</p>
        </div>
      </div>
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </StrictMode>,
);
