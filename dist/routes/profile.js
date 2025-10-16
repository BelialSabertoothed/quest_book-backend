"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// GET /api/profile/:id – získej profil uživatele
router.get('/profile/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { tasks: true },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error('❌ Error fetching profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/profile/avatar – aktualizuj avatar
router.post('/profile/avatar', async (req, res) => {
    const { id, avatarIndex } = req.body;
    if (!id || typeof avatarIndex !== 'number') {
        res.status(400).json({ error: 'Invalid request body' });
        return;
    }
    try {
        const updated = await prisma.user.update({
            where: { id },
            data: { avatarIndex },
        });
        res.status(200).json({ success: true, user: updated });
    }
    catch (err) {
        console.error('❌ Error updating avatar:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/profile/create – vytvoř nového uživatele
router.post('/profile/create', async (req, res) => {
    const { name, avatarIndex } = req.body;
    if (!name || typeof avatarIndex !== 'number') {
        res.status(400).json({ error: 'Invalid name or avatarIndex' });
        return;
    }
    try {
        const newUser = await prisma.user.create({
            data: {
                name,
                avatarIndex,
                xp: 0,
                level: 1,
                hydrationProgress: 0,
                medicationProgress: 0,
                achievements: undefined,
                cards: undefined,
            },
        });
        res.status(201).json(newUser);
    }
    catch (err) {
        console.error('❌ Error creating user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
