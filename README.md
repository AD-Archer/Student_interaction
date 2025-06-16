# 🚀 Launchpad_Student_Form

A comprehensive student interaction tracking system with automated follow-up email scheduling for Launchpad Philly.

---

## 📦 Features
- Dual recipient selection for follow-up emails (student and staff)
- Immediate and scheduled email sending
- Automated daily cron job for scheduled emails
- Email tracking to prevent duplicates
- Gmail SMTP integration (with dev-mode console logging)
- Built-in AI assistant for summarization and insights
- Modern Next.js 15, Node 20 LTS, and pnpm 9.x stack

---

## ⚡ Quick Start

### 1. Clone the Repository
```bash
# Clone the repo and enter the directory
git clone <your-repo-url> Launchpad_Student_Form
cd Launchpad_Student_Form
```

### 2. Environment Configuration
Copy the example environment file and edit it with your credentials:
```bash
cp .env.example .env.local
# Edit .env.local with your Gmail SMTP and DB settings
```

**Gmail SMTP setup:**
- Enable 2-factor authentication on your Gmail account
- Generate an "App Password" from Google Account settings
- Use the App Password as `EMAIL_PASSWORD` in `.env.local`

---

## 🐳 Running with Docker (Recommended)

### 1. Build and Start the App and Database
```bash
docker compose up --build
```
- App: http://localhost:3000
- DB:  localhost:5432 (user: postgres, password: postgres, db: launchpad)

### 2. Database Migrations (if needed)
```bash
docker compose exec app pnpm prisma migrate deploy
```

### 3. Stopping Containers
```bash
docker compose down
```

### 4. Reseeding the Database
```bash
docker compose run --rm seed
```

**Notes:**
- The `.env` file at the project root is used for all secrets/configuration (not copied into the image, but loaded at runtime).
- If you change `.env` or seed data, run:
  ```bash
  docker compose down -v
  docker compose up
  ```
- For troubleshooting, check logs:
  ```bash
  docker compose logs seed
  ```

---

## ⏰ Running Scheduled Follow-Ups with Docker Cron

If you want Docker to manage the daily follow-up email job, use the built-in cron service:

1. Make sure the `cron` service is enabled in `docker-compose.yml` (already set up).
2. The cron container will run the follow-up script every day at 7am (container time).
3. Logs are written to `/var/log/cron.log` inside the container.

### To view cron logs:
```bash
docker compose exec cron tail -n 50 /var/log/cron.log
```

### To test the script manually in the container:
```bash
docker compose exec cron node /app/scripts/send-scheduled-followups-docker.js
```

**Note:**
- The cron job uses the same environment variables as the app (from `.env`).
- You can still run the script on your host with your system's cron if you prefer.

---

## 🖥️ Running Locally (Without Docker)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Database Migration & Generation
```bash
npx prisma db push
npx prisma generate
```

### 3. Start the App
```bash
pnpm dev
```
- App: http://localhost:3000

---

## 🛠️ System Components

### Frontend
- `app/create/components/FollowUpCard.tsx`: Dual checkbox UI for recipient selection
- `app/create/form.tsx`: Main form for follow-up data

### Backend
- `app/api/interactions/route.ts`: API for creating interactions
- `app/api/followup-cron/route.ts`: Cron endpoint for scheduled emails
- `scripts/send-scheduled-followups.js`: Node.js cron script for email automation
- `lib/email.ts`: Email utility with templates

### Database Schema (Prisma)
```sql
followUpRequired      BOOLEAN DEFAULT false
followUpDate          TEXT
followUpOverdue       BOOLEAN DEFAULT false  
followUpSent          BOOLEAN DEFAULT false
followUpStudent       BOOLEAN DEFAULT false
followUpStaff         BOOLEAN DEFAULT false
followUpStudentEmail  TEXT
followUpStaffEmail    TEXT
```

---

## 🔄 API Usage Examples

### Create Interaction with Follow-Up
```http
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

### Trigger Manual Email Send
```http
POST /api/followup-cron
// Returns: { "success": true, "sentCount": 5 }
```

---

## 🧪 Testing

### Development Mode
If email credentials aren't configured, emails are logged to the console:
```
[EMAIL] Would send follow-up to student <student@example.com> for interaction #123
[EMAIL] Subject: Scheduled Follow-up Reminder
[EMAIL] Content:
Hello John,
...
```

### Production Testing
Test email functionality with configured credentials:
```fish
curl -X POST http://localhost:3000/api/followup-cron
```

---

## 📝 Email Template

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

---

## 📸 Screenshots

### Desktop
- ![Analytics (Desktop)](/images/production_screenshots/finalanalytics.png)
- ![Dashboard (Desktop)](/images/production_screenshots/finaldashboard.png)
- ![AI Panel (Desktop)](/images/production_screenshots/final-ai-panel.png)
- ![Settings (Desktop)](/images/production_screenshots/finalsettings.png)
- ![Email (Desktop)](/images/production_screenshots/email.png)

### Mobile
- ![Analytics (Mobile)](/images/production_screenshots/mobile/mobile-analytics.png)
- ![Dashboard (Mobile)](/images/production_screenshots/mobile/mobile-dash.png)
- ![AI Insights (Mobile)](/images/production_screenshots/mobile/mobile-insights.png)
- ![Settings (Mobile)](/images/production_screenshots/mobile/mobile-settings.png)

---

## 🗂️ Reference & Links
- SQL Diagram: https://dbdiagram.io/d/682b4fb41227bdcb4effdfdb
- Wireframe: https://excalidraw.com/#json=LBfreDwmu2HOgaCv66uJ6,WVSCjOagw48yEX7IkCDiyA
- Notion Doc: https://www.notion.so/Launchpad-Form-1f860add3da980f2bd36c658a18d50db?pvs=4
- Project Board: https://github.com/users/AD-Archer/projects/18

---

## 📝 Notes for Developers
- The app expects environment variables for DB and email config. Copy `.env.example` to `.env.local` and edit as needed.
- For production, you can use the same Docker setup and provide production-ready environment variables.
- The Dockerfile uses Node 20 LTS and pnpm 9.x for best compatibility with the current codebase.
- If you need to customize the database, add more services, or have questions about deploying to cloud providers, reach out to the maintainer.

---

## 🗝️ Example .env Configuration

Below is a sample of the actual `.env` file used in production. **Never commit your real secrets to version control.**

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
VERCEL_OIDC_TOKEN="<your-vercel-oidc-token>"
PLAYLAB_API_KEY="sk-pl-EXAMPLE"
PLAYLAB_PROJECT_ID="projectid"
OPENAI_API_KEY='sk-EXAMPLE'
EMAIL_FROM="noreply@example.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_HOST="smtp.example.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
```

**Gmail Setup Notes:**
- Enable 2-factor authentication on your Gmail account
- Generate an "App Password" (not your regular password)
- Use that app password as `EMAIL_PASSWORD`
- [Google App Password Instructions](https://support.google.com/accounts/answer/185833)
