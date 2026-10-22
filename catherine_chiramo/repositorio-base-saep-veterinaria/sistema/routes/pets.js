// ============================================================
// routes/pets.js
// ============================================================

import express from 'express';
import { criarCliente } from '../config/db.js';
import { verificarSessao } from '../middleware/auth-middleware.js';

const router = express.Router();

// ─────────────────────────────────────────
// POST /api/pets - Salva o novo pet no banco de dados (RF-18)
// ─────────────────────────────────────────
router.post('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    
    try {
        await client.connect();

        const { nome, especie, tutor_id } = req.body;

        // Valida se os campos obrigatórios foram preenchidos
        if (!nome || !especie || !tutor_id) {
            return res.status(400).json({ erro: 'Nome, espécie e tutor são obrigatórios.' });
        }

        // Insere o pet no banco de dados vinculando ao tutor_id
        const resultado = await client.query(
            'INSERT INTO pets (nome, especie, tutor_id) VALUES ($1, $2, $3) RETURNING *',
            [nome, especie, tutor_id]
        );

        // Retorna o pet recém-criado com status 201 (Criado com sucesso)
        return res.status(201).json(resultado.rows[0]);


        
    } catch (erro) {
        console.error('Erro ao salvar pet no banco:', erro);
        return res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

export default router;
