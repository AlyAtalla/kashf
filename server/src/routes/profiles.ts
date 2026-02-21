import { Router } from 'express'
import prisma from '../prisma'

const router = Router()

// Create or update a profile. Expects { userId, name?, bio?, specialization?, location? }
router.post('/', async (req, res) => {
  const { userId, name, bio, specialization, location } = req.body
  if (!userId) return res.status(400).json({ error: 'userId is required' })
  try {
    const profile = await prisma.profile.upsert({
      where: { userId },
      create: { userId, name, bio, specialization, location },
      update: { name, bio, specialization, location }
    })
    res.json(profile)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

// Get profile by profile id
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, role: true } } }
    })
    if (!profile) return res.status(404).json({ error: 'not found' })
    res.json(profile)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

// Search professionals and profiles
router.get('/', async (req, res) => {
  const q = (req.query.q as string) || ''
  const specialization = (req.query.specialization as string) || ''
  const location = (req.query.location as string) || ''
  const role = (req.query.role as string) || 'PROFESSIONAL'
  const page = parseInt((req.query.page as string) || '1', 10)
  const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100)
  const skip = (Math.max(page, 1) - 1) * limit

  try {
    const where: any = { role }

    const profileFilters: any = {}
    if (specialization) profileFilters.specialization = { contains: specialization, mode: 'insensitive' }
    if (location) profileFilters.location = { contains: location, mode: 'insensitive' }
    if (q) profileFilters.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { bio: { contains: q, mode: 'insensitive' } }
    ]

    if (Object.keys(profileFilters).length > 0) {
      where.profile = { is: profileFilters }
    }

    if (q) {
      // also search email
      where.OR = where.OR || []
      where.OR.push({ email: { contains: q, mode: 'insensitive' } })
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { profile: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ])

    res.json({ total, page, limit, results: users })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

export default router
