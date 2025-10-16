"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// POST /api/tasks – vytvoření nové úlohy
const createTask = async (req, res) => {
    try {
        const { title, userId, time, repeatDays } = req.body;
        if (!title || !userId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const newTask = await prisma.task.create({
            data: {
                title,
                userId,
                dueTime: time ? new Date(time) : undefined,
                repeatDays,
                completedAt: null,
            },
        });
        res.status(201).json(newTask);
    }
    catch (err) {
        console.error('❌ Error creating task:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// PATCH /api/tasks/:id/complete – toggle dokončení úlohy
const toggleComplete = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        const today = new Date().toISOString().split('T')[0];
        const wasCompleted = task.completedAt !== null;
        const isRepeat = task.repeatDays && task.repeatDays.length > 0;
        const completedDate = task.completedAt?.toISOString().split('T')[0];
        const alreadyCompletedToday = completedDate === today;
        const shouldUncomplete = wasCompleted && isRepeat && alreadyCompletedToday;
        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                completedAt: shouldUncomplete ? null : new Date(),
            },
        });
        const shouldAddXp = !wasCompleted || (isRepeat && !alreadyCompletedToday);
        if (shouldAddXp) {
            await prisma.user.update({
                where: { id: task.userId },
                data: { xp: { increment: 10 } },
            });
        }
        res.status(200).json(updatedTask);
    }
    catch (err) {
        console.error('❌ Error toggling task complete:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// GET /api/tasks/:userId – získej všechny úlohy daného uživatele
const getTasks = async (req, res) => {
    try {
        const { userId } = req.params;
        const tasks = await prisma.task.findMany({
            where: { userId },
        });
        res.status(200).json(tasks);
    }
    catch (err) {
        console.error('❌ Error fetching tasks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// DELETE /api/tasks/:id – smaž úlohu
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({
            where: { id },
        });
        res.status(204).end(); // No content
    }
    catch (err) {
        console.error('❌ Error deleting task:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Mount endpoints
router.post('/tasks', createTask);
router.patch('/tasks/:id/complete', toggleComplete);
router.get('/tasks/:userId', getTasks);
router.delete('/tasks/:id', deleteTask);
exports.default = router;
