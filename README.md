# Launchpad_Student_Form

A comprehensive student interaction tracking system with automated follow-up email scheduling for Launchpad Philly.

## 📧 Follow-Up Email System

This application includes a complete automated follow-up email system that allows staff to schedule and send follow-up emails to both students and staff members.

### ✨ Features

- **Dual Recipient Selection**: Select both student and staff recipients with individual email inputs
- **Immediate & Scheduled Emails**: Send emails immediately for today/past dates, or schedule for future dates
- **Automated Scheduling**: Cron job automatically sends scheduled emails daily
- **Email Tracking**: Prevents duplicate emails by tracking sent status
- **Gmail SMTP Integration**: Professional email sending via Gmail SMTP
- **Development Mode**: Console logging when email credentials aren't configured

### 🎯 How It Works

1. **Form Submission**: Staff selects recipients (student/staff) with checkboxes and enters email addresses
2. **Immediate Processing**: If follow-up date is today or past, emails are sent immediately
3. **Future Scheduling**: If follow-up date is in the future, emails are stored for scheduled sending
4. **Daily Cron Job**: Server runs daily cron job to send all scheduled emails for that day
5. **Status Tracking**: System marks emails as sent to prevent duplicates

### 🛠️ Setup Instructions

#### 1. Database Migration
```bash
cd /Users/archer/projects/node/Launchpad_Student_Form
npx prisma db push
npx prisma generate
```

#### 2. Environment Configuration
Copy the example environment file and configure your Gmail SMTP settings:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Gmail credentials:
```env
# Email Configuration for Gmail SMTP
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_FROM="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

**Important**: For Gmail, you need:
- 2-factor authentication enabled on your Gmail account
- An "App Password" (not your regular password) generated from Google Account settings
- Use the App Password as `EMAIL_PASSWORD`

#### 3. Production Deployment (DigitalOcean)

Set up the daily cron job on your server:
```bash
# Edit crontab
crontab -e

# Add this line to run daily at 7 AM
0 7 * * * /usr/bin/node /path/to/your/scripts/send-scheduled-followups.js
```

Alternatively, you can call the API endpoint from your server's cron:
```bash
# Daily at 7 AM via API call
0 7 * * * curl -X POST https://your-domain.com/api/followup-cron
```

### 📁 System Components

#### Frontend Components
- **`FollowUpCard.tsx`**: UI component with dual checkboxes for recipient selection
- **`form.tsx`**: Main form handling follow-up data submission

#### Backend Components
- **`/api/interactions/route.ts`**: API for creating interactions with follow-up data
- **`/api/followup-cron/route.ts`**: Cron endpoint for scheduled email sending
- **`/scripts/send-scheduled-followups.js`**: Node.js cron script for email automation
- **`/lib/email.ts`**: Email utility with professional templates

#### Database Schema
```sql
-- New follow-up fields in Interaction table
followUpRequired      BOOLEAN DEFAULT false
followUpDate          TEXT
followUpOverdue       BOOLEAN DEFAULT false  
followUpSent          BOOLEAN DEFAULT false
followUpStudent       BOOLEAN DEFAULT false
followUpStaff         BOOLEAN DEFAULT false
followUpStudentEmail  TEXT
followUpStaffEmail    TEXT
```

### 🔄 API Usage

#### Create Interaction with Follow-Up
```javascript
POST /api/interactions
{
  "studentName": "John Doe",
  "studentId": "0001",
  "type": "Coaching",
  "reason": "Academic Support",
  "notes": "Student needs help with math",
  "followUp": {
    "required": true,
    "student": true,
    "staff": true,
    "date": "2025-06-10",
    "studentEmail": "student@example.com",
    "staffEmail": "staff@example.com"
  }
}
```

#### Trigger Manual Email Send
```javascript
POST /api/followup-cron
// Returns: { "success": true, "sentCount": 5 }
```

### 🧪 Testing

#### Development Mode
When email credentials aren't configured, the system logs emails to console:
```
[EMAIL] Would send follow-up to student <student@example.com> for interaction #123
[EMAIL] Subject: Scheduled Follow-up Reminder
[EMAIL] Content:
Hello John,

This is a reminder for your scheduled follow-up.
...
```

#### Production Testing
Test email functionality with configured credentials:
```bash
# Call the cron endpoint to test
curl -X POST https://your-domain.com/api/followup-cron
```

### 📝 Email Template

The system sends professional emails with this format:
```
Subject: Scheduled Follow-up Reminder

Hello [Name],

This is a reminder for your scheduled follow-up.

Session Details:
- Student: John Doe
- Program: foundations
- Type: Coaching  
- Reason: Academic Support
- Notes: Student needs help with math
- Follow-up Date: 2025-06-10

Best regards,
Launchpad Student Services
```

### 🚀 Benefits

- **No More Missed Follow-Ups**: Automated system ensures follow-ups are never forgotten
- **Flexible Recipients**: Send to students, staff, or both as needed
- **Professional Communication**: Consistent, professional email templates
- **Easy Management**: Simple checkbox interface replaces confusing popup menus
- **Reliable Delivery**: Gmail SMTP ensures high deliverability rates
- **Development Friendly**: Console logging for testing without sending emails

---

## 📸 Final Site Screenshots


### Desktop
- **finalanalytics.png** ![Analytics (Desktop)](/images/production_screenshots/finalanalytics.png)
- **finaldashboard.png** ![Dashboard (Desktop)](/images/production_screenshots/finaldashboard.png)
- **final-ai-panel.png** ![AI Panel (Desktop)](/images/production_screenshots/final-ai-panel.png)
- **finalsettings.png** ![Settings (Desktop)](/images/production_screenshots/finalsettings.png)
- **email.png** ![Email (Desktop)](/images/production_screenshots/email.png)

### Mobile
- **mobile-analytics.png** ![Analytics (Mobile)](/images/production_screenshots/mobile/mobile-analytics.png)
- **mobile-dash.png** ![Dashboard (Mobile)](/images/production_screenshots/mobile/mobile-dash.png)
- **mobile-insights.png** ![AI Insights (Mobile)](/images/production_screenshots/mobile/mobile-insights.png)
- **mobile-settings.png** ![Settings (Mobile)](/images/production_screenshots/mobile/mobile-settings.png)

## SQL Diagram
- https://dbdiagram.io/d/682b4fb41227bdcb4effdfdb

## Wireframe
- https://excalidraw.com/#json=LBfreDwmu2HOgaCv66uJ6,WVSCjOagw48yEX7IkCDiyA

## Document
- https://www.notion.so/Launchpad-Form-1f860add3da980f2bd36c658a18d50db?pvs=4

## Project Board
- https://github.com/users/AD-Archer/projects/18

# Docker & Containerization

I've added Docker support for this project to make it portable and easy to run in any environment. Here are the steps and context for using Docker with this app:

## Files Added
- **Dockerfile**: Builds and runs the Next.js app using pnpm and multi-stage builds for a small, production-ready image.
- **.dockerignore**: Prevents unnecessary files (like node_modules, .env, build artifacts) from being copied into the Docker image.
- **docker-compose.yml**: Runs the app and a PostgreSQL database together for local development or production. The app expects environment variables (see .env.example) for DB and email config.

## Usage

### 1. Build and Run with Docker Compose
```fish
# Build and start the app and database
cd /Users/archer/projects/node/Launchpad_Student_Form
docker compose up --build
```

- The app will be available at http://localhost:3000
- The database will be available at localhost:5432 (user: postgres, password: postgres, db: launchpad)

### 2. Running Database Migrations
You may need to run migrations inside the container:
```fish
docker compose exec app pnpm prisma migrate deploy
```

### 3. Stopping Containers
```fish
docker compose down
```

## Docker Compose Workflow (Environment & Seeding)

- The `.env` file at the project root is used for all secrets and configuration (including Playlab API key, database URL, email, etc). It is **not** copied into the image, but is loaded at runtime by Docker Compose.
- When you run `docker compose up`, the following happens:
  1. The `db` service (PostgreSQL) starts first.
  2. The `seed` service runs `pnpm db:seed` to populate the database with initial data (see `prisma/seed.ts`). This only runs once per `up`.
  3. The `app` service (Next.js) starts **after** the database is seeded, with all environment variables from `.env` available.
- If you change your `.env` or seed data, you may need to run `docker compose down -v` to reset the database and then `docker compose up` again.

### Troubleshooting
- If the app cannot read environment variables (e.g., Playlab API key, database URL), ensure `.env` exists at the project root and is not empty. Docker Compose must be run from the project root.
- If the database is empty, check the logs for the `seed` service: `docker compose logs seed`.
- To reseed the database, run: `docker compose run --rm seed` (this will only work if the database is running).

## Notes
- The app expects environment variables for DB and email config. Copy `.env.example` to `.env.local` and edit as needed.
- For production, you can use the same Docker setup and provide production-ready environment variables.
- The Dockerfile uses Node 20 LTS and pnpm 9.x for best compatibility with the current codebase.

---

If you need to customize the database, add more services, or have questions about deploying to cloud providers, let me know!
