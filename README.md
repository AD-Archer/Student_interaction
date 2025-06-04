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

## SQL Diagram
- https://dbdiagram.io/d/682b4fb41227bdcb4effdfdb

## Wireframe
- https://excalidraw.com/#json=LBfreDwmu2HOgaCv66uJ6,WVSCjOagw48yEX7IkCDiyA

## Document
- https://www.notion.so/Launchpad-Form-1f860add3da980f2bd36c658a18d50db?pvs=4

## Project Board
- https://github.com/users/AD-Archer/projects/18
