// ============================================================
// routes/tutores.js
// ============================================================

import express from 'express';
import { criarCliente } from '../config/db.js';
import { criptografarCPF, descriptografarCPF } from '../utils/crypto-utils.js';

const router = express.Router();

// ------------------------------------------------------------
// GET /api/tutores - Listar e buscar tutores (RF-12 e RF-14)
// ------------------------------------------------------------
router.get('/', async (req, res) => {
    const { busca } = req.query;
    const client = criarCliente();

    try {
        await client.connect();
        let query = 'SELECT * FROM tutores';
        let params = [];

        if (busca) {
            query += ' WHERE nome ILIKE $1';
            params.push(`%${busca}%`);
        }

        query += ' ORDER BY id DESC';
        const resultado = await client.query(query, params);

        // Descriptografa o CPF de cada tutor antes de enviar ao front-end
        const tutores = resultado.rows.map(tutor => ({
            ...tutor,
            cpf: descriptografarCPF(tutor.cpf)
        }));

        res.json(tutores);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ------------------------------------------------------------
// POST /api/tutores - Cadastrar novo tutor (RF-15)
// ------------------------------------------------------------
router.post('/', async (req, res) => {
    const { nome, cpf, telefone } = req.body;

    if (!nome || !cpf || !telefone) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    const client = criarCliente();
    try {
        await client.connect();
        
        // Criptografa o CPF antes de salvar no banco
        const cpfCriptografado = criptografarCPF(cpf);

        const resultado = await client.query(
            'INSERT INTO tutores (nome, cpf, telefone) VALUES ($1, $2, $3) RETURNING *',
            [nome, cpfCriptografado, telefone]
        );

        const tutorCriado = resultado.rows[0];
        tutorCriado.cpf = descriptografarCPF(tutorCriado.cpf);

        res.status(201).json(tutorCriado);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ------------------------------------------------------------
// PUT /api/tutores/:id - Atualizar tutor existente (RF-17)
// ------------------------------------------------------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, cpf, telefone } = req.body;

    if (!nome || !cpf || !telefone) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    const client = criarCliente();
    try {
        await client.connect();

        // Criptografa o CPF antes de atualizar no banco
        const cpfCriptografado = criptografarCPF(cpf);

        const resultado = await client.query(
            'UPDATE tutores SET nome = $1, cpf = $2, telefone = $3 WHERE id = $4 RETURNING *',
            [nome, cpfCriptografado, telefone, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        const tutorAtualizado = resultado.rows[0];
        tutorAtualizado.cpf = descriptografarCPF(tutorAtualizado.cpf);

        res.json(tutorAtualizado);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ------------------------------------------------------------
// DELETE /api/tutores/:id - Excluir tutor (RF-13)
// ------------------------------------------------------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const client = criarCliente();

    try {
        await client.connect();
        const resultado = await client.query('DELETE FROM tutores WHERE id = $1 RETURNING *', [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        res.json({ mensagem: 'Tutor excluído com sucesso.' });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

export default router;
