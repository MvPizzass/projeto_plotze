// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Supabase
const supabaseUrl = 'https://qrbntqufdwgoaukfbmqg.supabase.co/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYm50cXVmZHdnb2F1a2ZibXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc1NDEsImV4cCI6MjA4MDAxMzU0MX0.f_3saXS2yCCpY6huYsqzN9le9_urUcT8wjqgnlLg3eU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middlewares
app.use(cors()); // Permite que o frontend acesse o backend
app.use(express.json());

// --- ROTAS ---

// 1. Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password, name } = req.body;
    
    // Busca usuário no banco
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // Nota: Em prod, compare hash de senha!
        .eq('name', name)
        .single();

    if (error || !data) {
        return res.status(401).json({ success: false, message: 'Dados incorretos (Verifique Nome, Email e Senha)' });
    }

    res.json({ success: true, user: { email: data.email, id: data.id, name: data.name } });
});

// 2. Listar Pacientes
app.get('/api/patients', async (req, res) => {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('id', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 3. Criar Paciente
app.post('/api/patients', async (req, res) => {
    const { name, cpf, triage_status } = req.body;
    
    const { data, error } = await supabase
        .from('patients')
        .insert([{ name, cpf, triage_status }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 4. Buscar Paciente por ID (para edição)
app.get('/api/patients/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 5. Atualizar Paciente
app.put('/api/patients/:id', async (req, res) => {
    const { id } = req.params;
    const { name, cpf, triage_status } = req.body;

    const { data, error } = await supabase
        .from('patients')
        .update({ name, cpf, triage_status })
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 6. Deletar Paciente
app.delete('/api/patients/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Deletado com sucesso' });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});