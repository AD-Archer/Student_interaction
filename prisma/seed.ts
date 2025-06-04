// Database seeder to populate initial data
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create staff users with hashed passwords
  const staffMembers = [
    {
      email: "barbara@launchpad.org",
      firstName: "Barbara",
      lastName: "Cicalese",
      role: "Senior Counselor",
      permissions: ["read", "write", "admin"],
    },
    {
      email: "tahir@launchpad.org", 
      firstName: "Tahir",
      lastName: "Lee",
      role: "Workforce Coordinator",
      permissions: ["read", "write", "admin"],
    },
    {
      email: "charles@launchpad.org",
      firstName: "Charles",
      lastName: "Mitchell", 
      role: "Program Manager",
      permissions: ["read", "write"],
    }
  ]

  console.log('Creating staff users...')
  for (const staff of staffMembers) {
    const hashedPassword = await bcrypt.hash('staff123', 10)
    
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: {
        ...staff,
        password: hashedPassword,
        status: 'active',
      }
    })
  }

  // Create students
  const students = [
    { id: "0001", firstName: "Micheal", lastName: "Newman", program: "foundations" },
    { id: "0002", firstName: "Amira", lastName: "Wilson", program: "101" },
    { id: "0003", firstName: "Koleona", lastName: "Chrek", program: "lightspeed" },
    { id: "0004", firstName: "Zaire", lastName: "DeBose", program: "liftoff" },
  ]

  console.log('Creating students...')
  for (const student of students) {
    await prisma.student.upsert({
      where: { id: student.id },
      update: {},
      create: student
    })
  }

  // Create sample interactions
  const staff1 = await prisma.user.findUnique({ where: { email: "tahir@launchpad.org" } })
  const staff2 = await prisma.user.findUnique({ where: { email: "barbara@launchpad.org" } })
  const staff3 = await prisma.user.findUnique({ where: { email: "charles@launchpad.org" } })

  if (staff1 && staff2 && staff3) {
    const interactions = [
      {
        studentId: "0001",
        studentFirstName: "Micheal",
        studentLastName: "Newman",
        program: "foundations",
        type: "Coaching",
        reason: "Interview preparation and confidence building",
        notes: "Worked on interview techniques, body language, and answering common questions. Student showed improvement in confidence levels.",
        date: "2024-12-12",
        time: "10:30 AM",
        staffMember: "Tahir Lee",
        staffMemberId: staff1.id,
        status: "completed",
        followUpRequired: true,
        followUpDate: "2024-12-20",
        followUpOverdue: false,
        aiSummary: "Student received coaching on interview preparation with focus on confidence building and professional presentation.",
      },
      {
        studentId: "0002", 
        studentFirstName: "Amira",
        studentLastName: "Johnson",
        program: "101",
        type: "Academic Support",
        reason: "Course planning assistance",
        notes: "Reviewed current course load, discussed upcoming semester options, identified areas needing additional support.",
        date: "2024-12-11",
        time: "2:15 PM", 
        staffMember: "Barbara Cicalese",
        staffMemberId: staff2.id,
        status: "completed",
        followUpRequired: true,
        followUpDate: "2024-12-18",
        followUpOverdue: false,
        aiSummary: "Academic planning session focused on course selection and identifying support needs for upcoming semester.",
      },
      {
        studentId: "0003",
        studentFirstName: "Koleona",
        studentLastName: "Smith", 
        program: "lightspeed",
        type: "Career Counseling",
        reason: "Industry networking and job search strategies",
        notes: "Discussed networking strategies, updated LinkedIn profile, identified target companies and roles in tech industry.",
        date: "2024-12-10",
        time: "1:45 PM",
        staffMember: "Charles Mitchell",
        staffMemberId: staff3.id,
        status: "completed", 
        followUpRequired: false,
        followUpDate: null,
        followUpOverdue: false,
        aiSummary: "Career counseling session covering networking strategies and job search planning for tech industry positions.",
      }
    ]

    console.log('Creating sample interactions...')
    for (const interaction of interactions) {
      await prisma.interaction.create({
        data: interaction
      })
    }
  }

  // Create system settings
  console.log('Creating system settings...')
  await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {
      autoBackup: true,
      aiSummaries: true,
      dataRetention: "2years",
      sessionTimeout: "8hours",
      fromName: "Launchpad Student Services",
      fromEmail: "noreply.lp.studentform@gmail.com",
      bccAdmin: false,
      adminEmail: "admin@launchpadphilly.org",
      templates: [
        {
          id: "student-followup",
          name: "Student Follow-up",
          subject: "Follow-up: {{interactionType}} Session",
          body: `Hi {{studentName}},

I hope you're doing well! This is a follow-up from our {{interactionType}} session on {{sessionDate}}.

**Session Summary:**
{{notes}}

**Next Steps:**
We have scheduled a follow-up for {{followUpDate}}. Please let me know if you have any questions or if you need to reschedule.

Best regards,
{{staffName}}
{{staffEmail}}`,
          variables: ["studentName", "interactionType", "sessionDate", "notes", "followUpDate", "staffName", "staffEmail"]
        }
      ]
    },
    create: {
      id: 1,
      autoBackup: true,
      aiSummaries: true,
      dataRetention: "2years",
      sessionTimeout: "8hours",
      fromName: "Launchpad Student Services",
      fromEmail: "noreply.lp.studentform@gmail.com",
      bccAdmin: false,
      adminEmail: "admin@launchpadphilly.org",
      templates: [
        {
          id: "student-followup",
          name: "Student Follow-up",
          subject: "Follow-up: {{interactionType}} Session",
          body: `Hi {{studentName}},

I hope you're doing well! This is a follow-up from our {{interactionType}} session on {{sessionDate}}.

**Session Summary:**
{{notes}}

**Next Steps:**
We have scheduled a follow-up for {{followUpDate}}. Please let me know if you have any questions or if you need to reschedule.

Best regards,
{{staffName}}
{{staffEmail}}`,
          variables: ["studentName", "interactionType", "sessionDate", "notes", "followUpDate", "staffName", "staffEmail"]
        }
      ]
    }
  })

  // Add default email templates
  console.log('Adding default email templates...');
  const defaultTemplates = [
    {
      name: "student-followup",
      subject: "Follow-up with {{studentName}}",
      body: "Hello {{studentName}},\n\nWe wanted to follow up on your recent session. Please let us know if you have any questions.\n\nBest regards,\nLaunchpad Team",
    },
    {
      name: "welcome-email",
      subject: "Welcome to Launchpad, {{studentName}}!",
      body: "Hi {{studentName}},\n\nWelcome to the Launchpad program! We're excited to have you on board.\n\nBest,\nThe Launchpad Team",
    },
  ];

  await prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {
      templates: defaultTemplates,
    },
    create: {
      id: 1,
      autoBackup: true,
      aiSummaries: true,
      dataRetention: "2years",
      sessionTimeout: "8hours",
      templates: defaultTemplates,
    },
  });

  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
