import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://ktrzrzzoptmofqkvpvcy.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjAzZTAwNjA4LTE1NmUtNDk3ZS1iNzliLTM0ZTY4MmExZTg3NSJ9.eyJwcm9qZWN0SWQiOiJrdHJ6cnp6b3B0bW9mcWt2cHZjeSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc3NjE0MjczLCJleHAiOjIwOTI5NzQyNzMsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.A7r7g0tW2nvxT25h1qyU1uY8YlN9Gl0FzR6pfO2iW6Q';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };