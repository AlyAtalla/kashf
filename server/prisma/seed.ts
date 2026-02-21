import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']

function getAvatarDataUri(name: string, color: string) {
  // Simple SVG avatar with initials and background color
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${color}"/>
      <text x="100" y="110" font-size="80" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">
        ${initials}
      </text>
    </svg>
  `.trim()
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

async function main() {
  // Clear existing data
  await prisma.appointment.deleteMany({})
  await prisma.message.deleteMany({})
  await prisma.profile.deleteMany({})
  await prisma.user.deleteMany({})

  const professionals = [
    { name: 'Dr. Sarah Johnson', specialization: 'Clinical Psychology', location: 'New York, NY' },
    { name: 'Dr. Michael Chen', specialization: 'Psychiatry', location: 'San Francisco, CA' },
    { name: 'Dr. Emma Williams', specialization: 'Psychotherapy', location: 'Boston, MA' },
    { name: 'Dr. James Martinez', specialization: 'Cognitive Behavioral Therapy', location: 'Austin, TX' },
    { name: 'Dr. Lisa Anderson', specialization: 'Family Therapy', location: 'Seattle, WA' },
    { name: 'Dr. Robert Taylor', specialization: 'Counseling', location: 'Denver, CO' }
  ]

  for (let i = 0; i < professionals.length; i++) {
    const prof = professionals[i]
    const email = `prof${i + 1}@kashf.com`
    const password = await bcrypt.hash('password123', 10)
    const color = AVATAR_COLORS[i % AVATAR_COLORS.length]

    const user = await prisma.user.create({
      data: {
        email,
        password,
        role: 'PROFESSIONAL'
      }
    })

    await prisma.profile.create({
      data: {
        userId: user.id,
        name: prof.name,
        specialization: prof.specialization,
        location: prof.location,
        bio: `Experienced ${prof.specialization.toLowerCase()} professional dedicated to helping patients achieve mental wellness.`,
        avatarUrl: getAvatarDataUri(prof.name, color)
      }
    })
  }

  // Create a couple of patient accounts
  const patients = [
    { name: 'John Doe', email: 'patient1@kashf.com' },
    { name: 'Jane Smith', email: 'patient2@kashf.com' }
  ]

  for (const pat of patients) {
    const password = await bcrypt.hash('password123', 10)
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

    const user = await prisma.user.create({
      data: {
        email: pat.email,
        password,
        role: 'PATIENT'
      }
    })

    await prisma.profile.create({
      data: {
        userId: user.id,
        name: pat.name,
        bio: 'Looking for professional mental health support.',
        avatarUrl: getAvatarDataUri(pat.name, color)
      }
    })
  }

  console.log('✓ Seed completed: 6 professionals and 2 patients created')
  console.log('Test credentials: email: prof1@kashf.com, password: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
