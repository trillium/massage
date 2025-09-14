# Refactor files:

- lib/email/messages/AdminAccessEmail.ts (admin email template for access requests)
- lib/email/messages/Approval.ts (email template for approvals)
- lib/email/messages/ClientRequestEmail.ts (email template for client requests)
- lib/email/messages/OnSiteRequestEmail.ts (email template for onsite requests)
- lib/email/messages/ReviewSubmission.ts (email template for review submissions)
- lib/email/messages/ReviewSubmissionEmail.ts (email template for review submissions)
- lib/email/messages/emailSegments/signature.ts (email signature segment used in outgoing emails)
- lib/messageTemplates/createApprovalUrl.test.ts (test for approval URL creation, used in outgoing messages)
- lib/messageTemplates/createApprovalUrl.ts (creates approval URLs for outgoing messages/emails)
- lib/messageTemplates/onsiteTemplates.ts (templates for onsite event messages)
- lib/messageTemplates/templates.ts (general message templates, including contact form and event summaries for outgoing use)
- lib/pushover/createTitle.ts (creates titles for push notifications sent out of the app)
- lib/pushover/index.ts (entry point for pushover functionality, used for sending push messages)
- lib/pushover/pushover.ts (core logic for sending push notifications out of the app)
- lib/templates/events.ts (event description templates, used in outgoing calendar events and emails)

## Actions

- Look at each file
- look at each function inside the files
- list that function back into this file
- categorize it into buckets
  - used by admin only
  - email to client
  - pushover message
  - any other misc
- bring that categorized data into this file and ask for further directions

## Categorized Functions

### Admin Email Templates

- AdminAccessEmail (from AdminAccessEmail.ts) - Sends admin access links to admin
- ApprovalEmail (from Approval.ts) - Sends approval requests to admin
- OnSiteRequestEmail (from OnSiteRequestEmail.ts) - Sends onsite requests to admin
- ReviewSubmission (from ReviewSubmission.ts) - Sends review submissions to admin
- ReviewSubmissionEmail (from ReviewSubmissionEmail.ts) - Sends review submissions to admin
- contactFormEmail (from templates.ts) - Generates contact form emails (sent to admin)

### Client Email Templates

- ClientRequestEmail (from ClientRequestEmail.ts) - Sends confirmation of client requests to client
- contactFormConfirmation (from templates.ts) - Sends confirmation after contact form submission to client

### Pushover Templates (nested in /admin)

- pushoverSendMesage (from pushover.ts) - Core function for sending push messages
- createTitle (from createTitle.ts) - Helper for push message titles

### Event Descriptions

- eventDescription (from events.ts) - Generates event descriptions (used in emails/events)
- eventSummary (from onsiteTemplates.ts) - Generates event summaries (used in onsite events)
- eventSummary (from templates.ts) - Generates event summaries (used in general events)
- eventDescription (from onsiteTemplates.ts) - Generates onsite event descriptions
- eventDescription (from templates.ts) - Generates general event descriptions
- createAdminAppointment (from events.ts) - Creates admin appointments
- adminAppointmentDescription (from events.ts) - Generates descriptions for admin appointments

### Any Other Misc

- createApprovalUrl (from createApprovalUrl.ts) - Creates approval URLs for admin use
- createAnchorTag (from signature.ts) - Utility for creating anchor tags in signatures
- Tests in createApprovalUrl.test.ts (describe, it) - Test functions for createApprovalUrl

## Proposed Folder Structure

Based on the categorized functions, here's a proposed migration from the current structure to a more organized one under `lib/messaging/`. This structure aligns with the buckets, improves separation of concerns, and makes it easier to find and maintain files.

```
lib/messaging/
├── email/
│   ├── admin/  # Admin Email Templates
│   │   ├── AdminAccessEmail.ts
│   │   ├── Approval.ts
│   │   ├── OnSiteRequestEmail.ts
│   │   ├── ReviewSubmission.ts
│   │   ├── ReviewSubmissionEmail.ts
│   │   └── contactFormEmail.ts  # Extracted from templates.ts
│   └── client/  # Client Email Templates
│       ├── ClientRequestEmail.ts
│       └── contactFormConfirmation.ts  # Extracted from templates.ts
├── push/
│   └── admin/  # Pushover Templates (nested in /admin)
│       ├── pushover.ts
│       └── createTitle.ts
├── templates/
│   ├── events/  # Event Descriptions
│   │   ├── eventDescription.ts  # From events.ts
│   │   ├── eventSummary.ts  # From templates.ts
│   │   ├── onsiteEventDescription.ts  # From onsiteTemplates.ts
│   │   ├── onsiteEventSummary.ts  # From onsiteTemplates.ts
│   │   ├── createAdminAppointment.ts  # From events.ts
│   │   └── adminAppointmentDescription.ts  # From events.ts
│   └── utilities/  # Any Other Misc
│       ├── createApprovalUrl.ts
│       ├── createAnchorTag.ts  # From signature.ts
│       └── createApprovalUrl.test.ts
└── utilities/  # Shared utilities
    └── signature.ts  # Moved from emailSegments, contains createAnchorTag
```

### Migration Notes

- **Extraction**: Functions like `contactFormEmail` and `contactFormConfirmation` need to be extracted from `templates.ts` into separate files in their respective buckets.
- **Renaming**: Some functions may need renaming for clarity (e.g., `onsiteEventDescription.ts` instead of merging into one file).
- **Imports**: Update all import statements to reflect new paths (e.g., `../email/admin/AdminAccessEmail`).
- **Utilities**: Moved createApprovalUrl and signature to `utilities/` folder for better organization.
- **Tests**: Keep tests alongside their source files (e.g., `createApprovalUrl.test.ts` with `createApprovalUrl.ts`).
- **Current Status**: Many files are already in `lib/messaging/`, so this is a refinement rather than a full move.

This structure provides clear buckets for admin vs. client, push notifications, events, and misc utilities.

## NEXT STEP

mv lib/email/messages/AdminAccessEmail.ts lib/messaging/email/admin/ &&
mv lib/email/messages/Approval.ts lib/messaging/email/admin/ &&
mv lib/email/messages/OnSiteRequestEmail.ts lib/messaging/email/admin/ &&
mv lib/email/messages/ReviewSubmission.ts lib/messaging/email/admin/ &&
mv lib/email/messages/ReviewSubmissionEmail.ts lib/messaging/email/admin/

mv lib/email/messages/ClientRequestEmail.ts lib/messaging/email/client/

mv lib/email/messages/ClientRequestEmail.ts lib/messaging/email/client/

mv lib/messageTemplates/createApprovalUrl.ts lib/messaging/utilities/ &&
mv lib/messageTemplates/createApprovalUrl.test.ts lib/messaging/utilities/

mv lib/email/messages/emailSegments/signature.ts lib/messaging/utilities/
