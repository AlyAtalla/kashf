import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import prisma from '../prisma'

const router = Router()

router.post('/register', async (req, res) => {
  const { email, password, role } = req.body
  if (!email || !password || !role) return res.status(400).json({ error: 'missing fields' })
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hash, role: role.toUpperCase() }
    })
    res.status(201).json({ id: user.id, email: user.email, role: user.role })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: '1h'
    })
    res.json({ token })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

export default router
