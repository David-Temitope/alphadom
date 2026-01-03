
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './integrations/supabase/client.ts'
import App from './App.tsx'
import './index.css'

// Force light mode only
const root = window.document.documentElement;
root.classList.remove('dark');
root.classList.add('light');

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);


async function testSupabase() {
  try {
    // Replace 'test' with a real table name
    const { data, error } = await supabase.from('profiles').select('*')

    if (error) {
      console.error('Supabase error:', error)
    } else {
      console.log('Supabase data:', data)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testSupabase()