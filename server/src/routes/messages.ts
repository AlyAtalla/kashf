import { Router } from 'express'
import prisma from '../prisma'

const router = Router()

// Create a message: { fromId, toId, content }
router.post('/', async (req, res) => {
  const { fromId, toId, content } = req.body
  if (!fromId || !toId || !content) return res.status(400).json({ error: 'missing fields' })
  try {
    const msg = await prisma.message.create({ data: { fromId, toId, content } })
    res.json(msg)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

// Get conversation between two users (a and b)
router.get('/conversation/:a/:b', async (req, res) => {
  const { a, b } = req.params
  try {
    const msgs = await prisma.message.findMany({
      where: {
        OR: [
          { fromId: a, toId: b },
          { fromId: b, toId: a }
        ]
      },
      orderBy: { createdAt: 'asc' }
    })
    res.json(msgs)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

export default router
