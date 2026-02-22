import { Router } from 'express'
import prisma from '../prisma'

const router = Router()

// Create appointment: { patientId, professionalId, scheduledAt }
router.post('/', async (req, res) => {
  const { patientId, professionalId, scheduledAt } = req.body
  if (!patientId || !professionalId || !scheduledAt) return res.status(400).json({ error: 'missing fields' })
  try {
    // detect dummy/test accounts by email domain used in seeds
    const prof = await prisma.user.findUnique({ where: { id: professionalId }, include: { profile: true } })
    if (!prof) return res.status(404).json({ error: 'professional not found' })
    const email = prof.email || ''
    if (email.endsWith('@kashf.com')) {
      return res.status(400).json({ dummy: true, message: 'Cannot book a dummy/test account' })
    }

    const scheduled = new Date(scheduledAt)
    const appt = await prisma.appointment.create({ data: { patientId, professionalId, scheduledAt: scheduled } })
    res.json(appt)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

export default router
