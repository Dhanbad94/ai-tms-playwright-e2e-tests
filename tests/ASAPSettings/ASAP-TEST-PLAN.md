# ASAP Mode - Comprehensive Test Automation Plan

## Overview

This document outlines the complete test automation plan for **ASAP Mode** in TrackMyShuttle application. Tests are organized by Settings tabs and follow Playwright best practices.

**Test Organization**: `tests/ASAP/`
**Page Objects**: `pages/ASAP/`
**Environment**: Staging (https://staging.trackmyshuttle.com)
**Organization**: Automated OD ASAP (Tracking ID: ODASAP)

---

## Test Tags Reference

| Tag | Description |
|-----|-------------|
| `@smoke` | Critical path tests, run frequently |
| `@regression` | Full regression suite |
| `@manager` | Tests requiring Manager role |
| `@operator` | Tests requiring Operator role |
| `@asap` | ASAP mode specific tests |
| `@settings` | Settings page tests |
| `@crud` | Create/Read/Update/Delete operations |
| `@negative` | Negative/error scenario tests |
| `@accessibility` | Accessibility compliance tests |
| `@performance` | Performance measurement tests |

---

## 1. Settings Base Navigation Tests

**File**: `settings-navigation.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| SN-001 | Verify all 10 settings tabs are visible | `@smoke @manager @settings` | P0 | Verify Organization, User Management, Operation Settings, Operation Hours, Rider App, Driver App, Live display, Alerts, Escalations, Pricing Setup tabs |
| SN-002 | Navigate to each tab and verify URL hash | `@regression @manager @settings` | P1 | Click each tab and verify URL hash changes correctly |
| SN-003 | Verify tab active state on click | `@regression @manager @settings` | P1 | Verify aria-expanded="true" when tab is active |
| SN-004 | Verify tab panel content loads | `@regression @manager @settings` | P1 | Each tab should display corresponding content panel |
| SN-005 | Verify settings page loads within threshold | `@performance @settings` | P2 | Settings page should load within 5 seconds |
| SN-006 | Verify keyboard navigation between tabs | `@accessibility @settings` | P2 | Arrow keys should navigate between tabs |

---

## 2. Organization Settings Tests

**File**: `organization-settings.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| OS-001 | Verify Organization Settings page loads | `@smoke @manager @settings` | P0 | Page heading and Primary Organization heading visible |
| OS-002 | Verify organization name display | `@smoke @manager @settings` | P0 | "Automated OD ASAP" should be displayed |
| OS-003 | Verify organization address display | `@regression @manager @settings` | P1 | Full address visible |
| OS-004 | Verify tracking ID display | `@smoke @manager @settings` | P0 | "Tracking ID: ODASAP" should be visible |
| OS-005 | Verify timezone display | `@regression @manager @settings` | P1 | Timezone information visible |
| OS-006 | Verify phone number display | `@regression @manager @settings` | P1 | Organization phone visible |
| OS-007 | Verify map is visible | `@smoke @manager @settings` | P0 | Google Map region should be visible |
| OS-008 | Verify map zoom controls | `@regression @manager @settings` | P1 | Zoom in/out buttons functional |
| OS-009 | Verify map type switch (Map/Satellite) | `@regression @manager @settings` | P1 | Toggle between map views |
| OS-010 | Verify edit organization button exists | `@regression @manager @settings` | P1 | Edit button should be visible |

---

## 3. User Management Tests

**File**: `user-management.spec.ts`

### 3.1 Read Operations

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| UM-R001 | Verify User Management page loads | `@smoke @manager @settings` | P0 | Page heading and users table visible |
| UM-R002 | Verify users table headers | `@regression @manager @settings` | P1 | Name, Email, Role, Phone, Last Login, Status, Action columns |
| UM-R003 | Verify existing users displayed | `@smoke @manager @settings` | P0 | Manager and Operator users visible |
| UM-R004 | Verify user search functionality | `@regression @manager @settings @crud` | P1 | Search by name/email filters results |
| UM-R005 | Verify user role display | `@regression @manager @settings` | P1 | MANAGER/OPERATOR roles displayed correctly |
| UM-R006 | Verify user status display | `@regression @manager @settings` | P1 | Active/Inactive status visible |
| UM-R007 | Verify table sorting by Name | `@regression @manager @settings` | P2 | Click header sorts ascending/descending |
| UM-R008 | Verify table sorting by Role | `@regression @manager @settings` | P2 | Click header sorts ascending/descending |
| UM-R009 | Verify table sorting by Last Login | `@regression @manager @settings` | P2 | Click header sorts ascending/descending |
| UM-R010 | Verify table sorting by Status | `@regression @manager @settings` | P2 | Click header sorts ascending/descending |

### 3.2 Create Operations

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| UM-C001 | Verify Add User button is visible | `@smoke @manager @settings @crud` | P0 | ADD USER button enabled |
| UM-C002 | Verify Add User dialog opens | `@smoke @manager @settings @crud` | P0 | Dialog with role and email fields |
| UM-C003 | Verify role dropdown options | `@regression @manager @settings @crud` | P1 | Manager, Operator, Driver options available |
| UM-C004 | Verify Continue button disabled without email | `@regression @manager @settings @crud @negative` | P1 | Button disabled until valid email |
| UM-C005 | Verify Step 2 form fields | `@regression @manager @settings @crud` | P1 | First Name, Last Name, Phone, "Also add as Driver" visible |
| UM-C006 | Add new Manager user | `@regression @manager @settings @crud` | P1 | Complete flow - create Manager |
| UM-C007 | Add new Operator user | `@regression @manager @settings @crud` | P1 | Complete flow - create Operator |
| UM-C008 | Add new Driver user | `@regression @manager @settings @crud` | P1 | Complete flow - create Driver |
| UM-C009 | Add user with "Also add as Driver" option | `@regression @manager @settings @crud` | P1 | Checkbox should create dual role |
| UM-C010 | Verify Cancel button closes dialog | `@regression @manager @settings @crud` | P2 | Dialog closes without saving |
| UM-C011 | Verify duplicate email validation | `@regression @manager @settings @crud @negative` | P1 | Error for existing email |
| UM-C012 | Verify invalid email format validation | `@regression @manager @settings @crud @negative` | P1 | Error for invalid email |
| UM-C013 | Verify required field validation | `@regression @manager @settings @crud @negative` | P1 | All required fields show errors |

### 3.3 Update Operations

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| UM-U001 | Verify action menu opens on click | `@smoke @manager @settings @crud` | P0 | Edit, Reset Password, Delete options visible |
| UM-U002 | Verify Edit dialog opens | `@smoke @manager @settings @crud` | P0 | Dialog with pre-filled user data |
| UM-U003 | Verify Edit form displays current values | `@regression @manager @settings @crud` | P1 | Role, Name, Email, Phone pre-populated |
| UM-U004 | Update user first name | `@regression @manager @settings @crud` | P1 | Save and verify change |
| UM-U005 | Update user last name | `@regression @manager @settings @crud` | P1 | Save and verify change |
| UM-U006 | Update user phone number | `@regression @manager @settings @crud` | P1 | Save and verify change |
| UM-U007 | Update user role | `@regression @manager @settings @crud` | P1 | Change role and verify |
| UM-U008 | Toggle "Also add as Driver" | `@regression @manager @settings @crud` | P1 | Enable/disable driver role |
| UM-U009 | Verify Update button saves changes | `@regression @manager @settings @crud` | P1 | Changes persist after save |
| UM-U010 | Verify close button discards changes | `@regression @manager @settings @crud` | P2 | No changes saved on close |

### 3.4 Delete Operations

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| UM-D001 | Verify Delete option in action menu | `@regression @manager @settings @crud` | P1 | Delete link visible |
| UM-D002 | Verify Delete button in Edit dialog | `@regression @manager @settings @crud` | P1 | Delete button visible |
| UM-D003 | Delete user via action menu | `@regression @manager @settings @crud` | P1 | User removed from table |
| UM-D004 | Delete user via Edit dialog | `@regression @manager @settings @crud` | P1 | User removed from table |
| UM-D005 | Verify delete confirmation dialog | `@regression @manager @settings @crud` | P1 | Confirmation required before delete |

### 3.5 Password Reset

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| UM-P001 | Verify Reset Password option in menu | `@regression @manager @settings` | P1 | Reset Operator App Password visible |
| UM-P002 | Reset user password | `@regression @manager @settings` | P1 | Password reset flow |

---

## 4. Operation Settings Tests

**File**: `operation-settings.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| OPS-001 | Verify Operation Settings page loads | `@smoke @manager @settings @asap` | P0 | Page heading visible |
| OPS-002 | Verify all 5 accordion sections visible | `@smoke @manager @settings @asap` | P0 | Pick-up Time, Pick-up Stops, Ride Sharing, Driver Assignment, Shuttle Capacity |
| OPS-003 | Verify Pick-up Time section expands | `@regression @manager @settings @asap` | P1 | Click expands section |
| OPS-004 | Verify ASAP Pickup is default selected | `@smoke @manager @settings @asap` | P0 | ASAP option checked by default |
| OPS-005 | Verify Future Pickup option exists | `@regression @manager @settings @asap` | P1 | Future Pickup radio visible |
| OPS-006 | Verify Both ASAP & Future option exists | `@regression @manager @settings @asap` | P1 | Both option radio visible |
| OPS-007 | Verify Pick-up Stops section | `@regression @manager @settings @asap` | P1 | Pre-Defined Stops options visible |
| OPS-008 | Verify Service Area link | `@regression @manager @settings @asap` | P1 | Add Service Area link functional |
| OPS-009 | Verify Shared Rides option selected | `@smoke @manager @settings @asap` | P0 | Shared Rides default for ASAP |
| OPS-010 | Verify Private Rides option exists | `@regression @manager @settings @asap` | P1 | Private Rides radio visible |
| OPS-011 | Verify Operator Assignment option | `@regression @manager @settings @asap` | P1 | Operator Assignment radio visible |
| OPS-012 | Verify Driver Self-Assignment option | `@regression @manager @settings @asap` | P1 | Self-Assignment radio visible |
| OPS-013 | Verify Static Capacity selected | `@smoke @manager @settings @asap` | P0 | Static Capacity default |
| OPS-014 | Verify Dynamic Capacity option | `@regression @manager @settings @asap` | P1 | Dynamic Fleet-Based option visible |
| OPS-015 | Verify Max Riders input | `@regression @manager @settings @asap` | P1 | Input field for max riders |
| OPS-016 | Update Max Riders value | `@regression @manager @settings @asap` | P1 | Change value and verify |

---

## 5. Operation Hours Tests

**File**: `operation-hours.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| OH-001 | Verify Operation Hours page loads | `@smoke @manager @settings @asap` | P0 | Page heading visible |
| OH-002 | Verify Run 24/7 option visible | `@smoke @manager @settings @asap` | P0 | Radio button with description |
| OH-003 | Verify Custom Hours option visible | `@smoke @manager @settings @asap` | P0 | Radio button with description |
| OH-004 | Verify Run 24/7 is default for ASAP | `@smoke @manager @settings @asap` | P0 | Run 24/7 checked by default |
| OH-005 | Verify option descriptions | `@regression @manager @settings @asap` | P1 | Descriptions match expected text |
| OH-006 | Select Custom Hours option | `@regression @manager @settings @asap` | P1 | Switch to custom hours |
| OH-007 | Verify custom schedule appears | `@regression @manager @settings @asap` | P1 | Day/time configuration visible |

---

## 6. Rider App Settings Tests

**File**: `rider-app-settings.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| RA-001 | Verify Rider App Settings page loads | `@smoke @manager @settings` | P0 | Page heading and description visible |
| RA-002 | Verify all accordion sections visible | `@smoke @manager @settings` | P0 | Enable Rider App, Cover Page, Contact Settings, Share Access, Cancellation |
| RA-003 | Verify Enable Rider App checkbox | `@smoke @manager @settings` | P0 | Checkbox to enable/disable |
| RA-004 | Verify Configure Cover Page section | `@regression @manager @settings` | P1 | Organization logo, name, custom note option |
| RA-005 | Verify Show Custom Note checkbox | `@regression @manager @settings` | P1 | Toggle custom note visibility |
| RA-006 | Verify Contact Settings section | `@regression @manager @settings` | P1 | Map theme, call option, phone number |
| RA-007 | Verify Show Call Option checkbox | `@regression @manager @settings` | P1 | Toggle call option |
| RA-008 | Update contact phone number | `@regression @manager @settings` | P1 | Change and save phone |
| RA-009 | Verify Share Rider App Access section | `@smoke @manager @settings` | P0 | Tracking code, link, QR code options |
| RA-010 | Verify Tracking ID displayed | `@smoke @manager @settings` | P0 | ODASAP tracking ID visible |
| RA-011 | Verify tracking link URL | `@regression @manager @settings` | P1 | Correct URL format |
| RA-012 | Verify Copy Link functionality | `@regression @manager @settings` | P1 | Link copied to clipboard |
| RA-013 | Verify QR Code display | `@regression @manager @settings` | P1 | QR code visible and scannable |
| RA-014 | Verify Voicemail Script section | `@regression @manager @settings` | P1 | Script text visible |
| RA-015 | Verify QR Signage download options | `@regression @manager @settings` | P1 | 8.5x11 and 4x6 PDF options |
| RA-016 | Verify Ride Cancellation section | `@regression @manager @settings` | P1 | Cancellation reasons visible |
| RA-017 | Verify default cancellation reasons | `@regression @manager @settings` | P1 | Pre-defined reasons checked |
| RA-018 | Verify custom cancellation reason | `@regression @manager @settings` | P1 | Add custom reason option |

---

## 7. Driver App Settings Tests

**File**: `driver-app-settings.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| DA-001 | Verify Driver App page loads | `@smoke @manager @settings` | P0 | Page heading visible |
| DA-002 | Verify all accordion sections visible | `@smoke @manager @settings` | P0 | Introduction, Smart Tablet, Download App, Notification Settings |
| DA-003 | Verify Introduction section content | `@regression @manager @settings` | P1 | Intro text and add drivers link |
| DA-004 | Verify "click here" link for adding drivers | `@regression @manager @settings` | P1 | Link navigates to User Management |
| DA-005 | Verify Smart Tablet section | `@regression @manager @settings` | P1 | Tablet information visible |
| DA-006 | Verify Download App section | `@smoke @manager @settings` | P0 | Android and iOS download options |
| DA-007 | Verify Google Play Store link | `@regression @manager @settings` | P1 | App store image visible |
| DA-008 | Verify Apple App Store link | `@regression @manager @settings` | P1 | App store image visible |
| DA-009 | Verify Quick Start Guide English PDF | `@regression @manager @settings` | P1 | Download link functional |
| DA-010 | Verify Quick Start Guide Spanish PDF | `@regression @manager @settings` | P1 | Download link functional |
| DA-011 | Verify Notification Settings section | `@regression @manager @settings` | P1 | SMS notification option |
| DA-012 | Toggle SMS notification setting | `@regression @manager @settings` | P1 | Enable/disable SMS dispatch notifications |

---

## 8. Live Display Settings Tests

**File**: `live-display-settings.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| LD-001 | Verify Live Display Settings page loads | `@smoke @manager @settings` | P0 | Page heading visible |
| LD-002 | Verify section heading | `@regression @manager @settings` | P1 | "Stop & Device Specific Live Displays" heading |
| LD-003 | Verify section description | `@regression @manager @settings` | P1 | Description text visible |
| LD-004 | Verify warning message | `@regression @manager @settings` | P1 | Browser compatibility warning |
| LD-005 | Verify Create Live Display button | `@smoke @manager @settings` | P0 | Button visible and enabled |
| LD-006 | Click Create Live Display button | `@regression @manager @settings` | P1 | Opens creation dialog/form |

---

## 9. Alerts Settings Tests

**File**: `alerts-settings.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| AL-001 | Verify Alert Settings page loads | `@smoke @manager @settings` | P0 | Page heading visible |
| AL-002 | Verify User notification section | `@smoke @manager @settings` | P0 | "User(s) to be notified" heading |
| AL-003 | Verify user search input | `@regression @manager @settings` | P1 | Search and Select User input |
| AL-004 | Verify already added users display | `@regression @manager @settings` | P1 | Added users with remove option |
| AL-005 | Verify alerts table headers | `@regression @manager @settings` | P1 | Notifications, Get Email, Get SMS columns |
| AL-006 | Verify Geolocation section | `@smoke @manager @settings` | P0 | Geolocation heading visible |
| AL-007 | Verify Geofence Alert section | `@regression @manager @settings` | P1 | Geofence Alert with radius input |
| AL-008 | Verify default geofence radius | `@regression @manager @settings` | P1 | Default value (10 miles) |
| AL-009 | Update geofence radius | `@regression @manager @settings` | P1 | Change radius value |
| AL-010 | Toggle Email notification | `@regression @manager @settings` | P1 | Enable/disable email alerts |
| AL-011 | Toggle SMS notification | `@regression @manager @settings` | P1 | Enable/disable SMS alerts |
| AL-012 | Add user to notification list | `@regression @manager @settings @crud` | P1 | Search and add user |
| AL-013 | Remove user from notification list | `@regression @manager @settings @crud` | P1 | Click remove button |

---

## 10. Escalations Settings Tests

**File**: `escalations-settings.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| ES-001 | Verify Escalation Settings page loads | `@smoke @manager @settings` | P0 | Page heading and description |
| ES-002 | Verify Ride Request escalation section | `@smoke @manager @settings` | P0 | "Notify when Ride Request not addressed" option |
| ES-003 | Verify Trip Not Started section | `@smoke @manager @settings` | P0 | "Notify when Trip not started" option |
| ES-004 | Toggle Ride Request notification | `@regression @manager @settings` | P1 | Enable/disable checkbox |
| ES-005 | Toggle Trip Not Started notification | `@regression @manager @settings` | P1 | Enable/disable checkbox |
| ES-006 | Verify See Example link | `@regression @manager @settings` | P1 | Opens example dialog |
| ES-007 | Verify escalation configuration UI | `@regression @manager @settings` | P1 | After, Select Action, To fields |
| ES-008 | Verify Add More button | `@regression @manager @settings` | P1 | Add additional escalation rules |
| ES-009 | Verify user dropdown options | `@regression @manager @settings` | P1 | Available users for notification |
| ES-010 | Configure escalation rule | `@regression @manager @settings` | P1 | Set minutes, action, recipient |

---

## 11. Pricing Setup Tests

**File**: `pricing-setup.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| PS-001 | Verify Pricing Setup page loads | `@smoke @manager @settings` | P0 | Page heading and description |
| PS-002 | Verify Payout Account Setup section | `@smoke @manager @settings` | P0 | Stripe KYC setup heading |
| PS-003 | Verify Start Setup button | `@regression @manager @settings` | P1 | Button visible and enabled |
| PS-004 | Verify Enable Payment section | `@regression @manager @settings` | P1 | Enable Payment in Rider App |
| PS-005 | Verify payment checkbox disabled | `@regression @manager @settings` | P1 | Disabled until Stripe setup |
| PS-006 | Verify Configure Pricing section | `@regression @manager @settings` | P1 | Standard Pricing Model heading |
| PS-007 | Verify currency display | `@regression @manager @settings` | P1 | USD currency shown |
| PS-008 | Verify Cancellation & Refund section | `@regression @manager @settings` | P1 | Cancellation rules option |
| PS-009 | Verify cancellation checkbox disabled | `@regression @manager @settings` | P1 | Disabled until Stripe setup |
| PS-010 | Verify Payout Setup required messages | `@regression @manager @settings` | P1 | "Please complete Payout Account Setup" messages |

---

## 12. Cross-Tab & Integration Tests

**File**: `settings-integration.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| INT-001 | Navigate through all tabs sequentially | `@smoke @manager @settings` | P0 | All tabs accessible |
| INT-002 | Verify URL hash persistence on refresh | `@regression @manager @settings` | P1 | Tab state maintained after refresh |
| INT-003 | Verify settings persist after logout/login | `@regression @manager @settings` | P1 | Changes saved to database |
| INT-004 | Driver App link navigates to User Management | `@regression @manager @settings` | P1 | Cross-tab navigation |
| INT-005 | Service Area link navigates to Stops | `@regression @manager @settings` | P1 | Cross-page navigation |

---

## 13. Role-Based Access Tests

**File**: `settings-rbac.spec.ts`

### Test Cases

| ID | Test Name | Tags | Priority | Description |
|----|-----------|------|----------|-------------|
| RBAC-001 | Manager can access all settings tabs | `@smoke @manager @settings` | P0 | Full access verification |
| RBAC-002 | Manager can modify all settings | `@regression @manager @settings` | P1 | Edit permissions |
| RBAC-003 | Operator cannot access settings | `@smoke @operator @settings @negative` | P0 | Settings gear not visible or restricted |
| RBAC-004 | Manager can add/edit/delete users | `@regression @manager @settings @crud` | P1 | Full CRUD permissions |

---

## Test Execution Strategy

### Smoke Tests (P0)
Run on every commit/PR:
```bash
npx playwright test --grep "@smoke @asap"
```

### Regression Tests (All)
Run nightly or before release:
```bash
npx playwright test --grep "@asap"
```

### Settings-specific Tests
```bash
npx playwright test --grep "@settings @asap"
```

### CRUD Tests
```bash
npx playwright test --grep "@crud @asap"
```

---

## Test Data Requirements

### Users for Testing
| Role | Email | Purpose |
|------|-------|---------|
| Manager | automated.manager@trackmyshuttle.com | Main test user |
| Operator | automated.operator@trackmyshuttle.com | RBAC testing |
| Test User | test.user.{timestamp}@example.com | CRUD operations |

### Test Data Cleanup
- Created test users should be deleted after test completion
- Use `afterEach` or `afterAll` hooks for cleanup
- Use unique timestamps for test data to avoid conflicts

---

## File Structure

```
tests/ASAP/
├── settings-navigation.spec.ts
├── organization-settings.spec.ts
├── user-management.spec.ts
├── operation-settings.spec.ts
├── operation-hours.spec.ts
├── rider-app-settings.spec.ts
├── driver-app-settings.spec.ts
├── live-display-settings.spec.ts
├── alerts-settings.spec.ts
├── escalations-settings.spec.ts
├── pricing-setup.spec.ts
├── settings-integration.spec.ts
├── settings-rbac.spec.ts
└── fixtures/
    └── test-data.ts
```

---

## Summary

| Category | Test Count |
|----------|------------|
| Settings Navigation | 6 |
| Organization Settings | 10 |
| User Management | 30 |
| Operation Settings | 16 |
| Operation Hours | 7 |
| Rider App Settings | 18 |
| Driver App Settings | 12 |
| Live Display Settings | 6 |
| Alerts Settings | 13 |
| Escalations Settings | 10 |
| Pricing Setup | 10 |
| Integration Tests | 5 |
| RBAC Tests | 4 |
| **Total** | **147** |

### Priority Distribution
- **P0 (Critical)**: 25 tests
- **P1 (High)**: 100 tests
- **P2 (Medium)**: 22 tests
