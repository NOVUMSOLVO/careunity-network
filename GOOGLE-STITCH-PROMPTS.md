# Google Stitch UI Generation Prompts for CareUnity

## 🌐 **Web Application UI Prompt**

```
Create a modern, professional web application UI for CareUnity - a comprehensive care management platform for healthcare providers. Design a responsive dashboard interface with the following specifications:

**Application Overview:**
CareUnity is a next-generation care management system that combines AI-powered scheduling, person-centered care, voice documentation, and intelligent insights for healthcare organizations.

**Core Design Requirements:**
- Modern, clean healthcare-focused design language
- Professional color scheme: Primary blues (#1976d2, #667eea), secondary greens (#388e3c), accent colors for alerts (orange #f57c00, red #d32f2f)
- Responsive layout that works on desktop, tablet, and mobile
- Accessibility-compliant (WCAG 2.1 AA)
- Material Design principles with healthcare-specific adaptations

**Main Dashboard Layout:**
1. **Header Section:**
   - CareUnity logo with hospital icon 🏥
   - Navigation menu: Dashboard, Service Users, Staff, Scheduling, Care Plans, Reports, Settings
   - User profile dropdown with notifications badge
   - Voice command toggle button with microphone icon
   - Real-time clock and system status indicator

2. **Key Metrics Cards (4-column grid):**
   - Total Service Users (248) with people icon
   - Active Staff (89) with group icon
   - Today's Visits (156) with clock icon
   - CQC Compliance (96.8%) with security icon
   - Each card should have gradient backgrounds and hover effects

3. **Main Content Area with Tabs:**
   - System Overview tab with health metrics and KPIs
   - Core Modules tab with interactive module cards
   - Service Users tab with user profiles and risk indicators
   - Staff Management tab with status tracking
   - Recent Activity tab with real-time updates

4. **Module Cards (3-column grid):**
   - Care Coordinator Dashboard (blue theme, dashboard icon)
   - Person-Centered Care Hub (red theme, heart icon)
   - Caregiver Companion (green theme, microphone icon)
   - AI Scheduling Engine (orange theme, robot icon)
   - Intelligent Insights Engine (purple theme, analytics icon)
   - Each card shows features as chips and has a launch button

5. **Feature Highlights Section:**
   - Voice-First Interface with microphone icon
   - AI-Powered Insights with brain/analytics icon
   - Enterprise Security with shield icon
   - Person-Centered Care with heart icon

6. **Footer:**
   - Call-to-action buttons: Launch Full System, Contact Sales, Request Demo
   - Company branding and feature tagline

**Interactive Elements:**
- Hover effects on cards with subtle elevation
- Progress bars for metrics and compliance
- Status indicators with color coding (green=good, orange=warning, red=alert)
- Notification badges and alerts
- Responsive navigation that collapses on mobile
- Voice activation visual feedback

**Data Visualization:**
- Progress bars for completion rates and compliance
- Status chips with color coding for risk levels and staff status
- Real-time activity feed with timestamps
- Interactive charts for system health metrics

**Typography:**
- Primary font: Roboto or similar modern sans-serif
- Hierarchy: H1 for main title, H2 for section headers, H3 for card titles
- Body text should be readable and professional

**Accessibility Features:**
- High contrast ratios for text
- Focus indicators for keyboard navigation
- Screen reader compatible structure
- Alternative text for icons and images

Generate a complete, pixel-perfect web interface that embodies modern healthcare technology while maintaining professional credibility and ease of use.
```

## 📱 **Mobile Application UI Prompt**

```
Design a mobile-first UI for CareUnity Mobile - a comprehensive care management app for healthcare professionals on-the-go. Create a native mobile interface optimized for smartphones and tablets.

**Application Context:**
CareUnity Mobile is the companion app for healthcare workers, featuring voice-first documentation, offline capabilities, biometric authentication, and real-time care coordination.

**Mobile Design Specifications:**
- Native mobile design patterns (iOS/Android compatible)
- Touch-optimized interface with minimum 44px touch targets
- Gesture-friendly navigation and interactions
- Dark mode and light mode support
- Offline-first design with sync indicators
- Healthcare-appropriate color scheme with high contrast

**Main Mobile Interface Structure:**

1. **Authentication Screen:**
   - CareUnity logo and branding
   - Biometric authentication options (fingerprint, face ID)
   - Traditional login fallback
   - "Remember device" toggle
   - Offline mode indicator

2. **Bottom Navigation (5 tabs):**
   - 🏠 Home (dashboard overview)
   - 👥 Clients (service users list)
   - 📅 Schedule (today's visits)
   - 🎤 Voice (documentation)
   - 👤 Profile (settings & sync)

3. **Home Dashboard (Mobile):**
   - Compact header with user avatar and notifications
   - Quick stats cards (2x2 grid): Today's visits, Pending tasks, Messages, Alerts
   - Voice command button (prominent, center-bottom)
   - Recent activity stream
   - Quick actions: Start visit, Emergency contact, Sync data

4. **Service Users List:**
   - Search bar with voice search option
   - Filter chips: Risk level, Location, Visit status
   - User cards with:
     - Profile photo placeholder
     - Name, age, condition
     - Risk level indicator (color-coded)
     - Next visit time
     - Quick actions: Call, Navigate, View care plan
   - Swipe actions for common tasks

5. **Visit Scheduling:**
   - Calendar view (day/week toggle)
   - Visit cards with:
     - Client name and photo
     - Address with map integration
     - Estimated travel time
     - Visit type and duration
     - Status indicators
   - Route optimization suggestions
   - Offline map download option

6. **Voice Documentation Interface:**
   - Large, prominent record button
   - Waveform visualization during recording
   - Voice-to-text preview
   - Quick templates and shortcuts
   - Hands-free mode with voice commands
   - Auto-save and sync indicators

7. **Client Detail View:**
   - Photo and basic info header
   - Tabbed content: Care plan, History, Notes, Medications
   - Emergency contacts (quick dial)
   - Family portal access
   - Document camera for photos
   - Offline data availability indicator

8. **Profile & Settings:**
   - User profile with photo
   - Sync status and last update time
   - Offline data management
   - Voice settings and calibration
   - Notification preferences
   - Security settings (biometric, PIN)
   - Help and support

**Mobile-Specific Features:**
- Pull-to-refresh on lists
- Swipe gestures for navigation and actions
- Haptic feedback for confirmations
- Voice activation with "Hey CareUnity" wake word
- Camera integration for documentation
- GPS integration for location services
- Push notifications for urgent alerts
- Offline mode with sync queue

**Touch Interactions:**
- Large, finger-friendly buttons (minimum 44px)
- Swipe actions on list items
- Long-press for context menus
- Pinch-to-zoom on documents and images
- Drag-and-drop for scheduling

**Visual Design Elements:**
- Card-based layout with rounded corners
- Subtle shadows and elevation
- Color-coded status indicators
- Progress indicators for sync and uploads
- Loading states and skeleton screens
- Empty states with helpful illustrations

**Responsive Considerations:**
- Adapts to different screen sizes (phone to tablet)
- Landscape mode support for tablets
- One-handed operation optimization
- Thumb-zone placement for primary actions

**Accessibility Features:**
- VoiceOver/TalkBack support
- Dynamic text sizing
- High contrast mode
- Voice control integration
- Reduced motion options

**Performance Indicators:**
- Network status indicator
- Sync progress and status
- Battery optimization notices
- Data usage monitoring

Create a mobile interface that prioritizes ease of use during care visits, supports offline work, and integrates seamlessly with voice commands while maintaining the professional healthcare aesthetic.
```

## 🎯 **Specialized Component Prompts**

### **Care Coordinator Dashboard Prompt**
```
Design a sophisticated care coordinator dashboard interface for CareUnity that serves as the operational command center for healthcare administrators.

**Layout Requirements:**
- Split-screen layout: Left sidebar (30%) for quick actions, Main area (70%) for detailed views
- Real-time data updates with live indicators
- Drag-and-drop scheduling interface
- Multi-level filtering and search capabilities

**Key Components:**
1. **Staff Allocation Panel:**
   - Interactive staff cards with availability status
   - Drag-and-drop assignment to visits
   - Skill matching indicators
   - Travel time calculations

2. **Visit Management Grid:**
   - Kanban-style columns: Scheduled, In Progress, Completed, Issues
   - Color-coded priority levels
   - Client risk indicators
   - Real-time status updates

3. **AI Insights Panel:**
   - Predictive scheduling recommendations
   - Efficiency optimization suggestions
   - Risk alerts and notifications
   - Performance metrics dashboard

4. **Communication Hub:**
   - Team chat integration
   - Emergency alert system
   - Family portal notifications
   - System announcements

Design with healthcare operations expertise, emphasizing efficiency, clarity, and real-time decision making.
```

### **Voice Documentation Interface Prompt**
```
Create an innovative voice-first documentation interface for CareUnity that revolutionizes how healthcare workers record patient interactions.

**Core Features:**
- Large, prominent voice activation button with pulsing animation
- Real-time speech-to-text with confidence indicators
- Voice command shortcuts for common actions
- Hands-free operation with voice navigation

**Interface Elements:**
1. **Recording Interface:**
   - Waveform visualization during recording
   - Noise cancellation indicator
   - Recording timer and file size
   - Auto-pause detection for interruptions

2. **Text Processing:**
   - Live transcription with medical terminology recognition
   - Auto-formatting for care notes structure
   - Confidence scoring for transcribed text
   - Quick edit suggestions and corrections

3. **Smart Templates:**
   - Voice-activated care plan templates
   - Medical terminology shortcuts
   - Structured data extraction (medications, symptoms, etc.)
   - Auto-categorization of note types

4. **Review and Approval:**
   - Text editing with voice commands
   - Medical spell-check and validation
   - Digital signature integration
   - Automatic backup and sync

Design for hands-free operation during patient care, with medical-grade accuracy and compliance features.
```

### **Mobile Care Visit Interface Prompt**
```
Design a streamlined mobile interface specifically for healthcare workers during active patient visits, optimized for one-handed operation and quick data entry.

**Visit Flow Interface:**
1. **Pre-Visit Preparation:**
   - Client overview with key information
   - Care plan quick reference
   - Previous visit notes summary
   - Emergency contacts and medical alerts

2. **During Visit Documentation:**
   - Quick action buttons for common tasks
   - Voice note recording with one-tap start
   - Photo documentation with auto-tagging
   - Vital signs entry with smart validation

3. **Task Completion:**
   - Checklist interface with swipe-to-complete
   - Medication administration logging
   - Care plan progress updates
   - Next visit scheduling

4. **Post-Visit Summary:**
   - Auto-generated visit summary
   - Family communication options
   - Handover notes for next caregiver
   - Quality assurance checklist

**Mobile Optimizations:**
- Large touch targets for gloved hands
- High contrast for outdoor visibility
- Offline-first with smart sync
- Battery optimization features
- Quick emergency access

Design for real-world care environments with focus on speed, accuracy, and patient safety.
```

## 🎨 **Design System Specifications**

### **Color Palette:**
- **Primary Blue**: #1976d2 (trust, professionalism)
- **Secondary Blue**: #667eea (modern, tech-forward)
- **Success Green**: #388e3c (positive outcomes, completion)
- **Warning Orange**: #f57c00 (attention, moderate alerts)
- **Error Red**: #d32f2f (urgent, critical alerts)
- **Neutral Gray**: #757575 (secondary text, borders)
- **Background**: #f5f5f5 (light mode), #121212 (dark mode)

### **Typography Scale:**
- **H1**: 32px, Bold (Main titles)
- **H2**: 24px, Semi-bold (Section headers)
- **H3**: 20px, Medium (Card titles)
- **Body**: 16px, Regular (Main content)
- **Caption**: 14px, Regular (Secondary info)
- **Button**: 16px, Medium (Action text)

### **Spacing System:**
- **Base unit**: 8px
- **Small**: 8px, **Medium**: 16px, **Large**: 24px, **XL**: 32px
- **Component padding**: 16px
- **Card margins**: 24px
- **Section spacing**: 32px

### **Component Library:**
- **Cards**: Rounded corners (8px), subtle shadow, hover elevation
- **Buttons**: Primary (filled), Secondary (outlined), Text (minimal)
- **Form inputs**: Consistent height (48px), clear focus states
- **Navigation**: Consistent spacing, active state indicators
- **Status indicators**: Color-coded chips with icons
- **Progress bars**: Rounded, animated, with percentage labels

Use these specifications to ensure consistency across all CareUnity interfaces while maintaining the professional healthcare aesthetic and optimal user experience.
