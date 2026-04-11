## ADDED Requirements

### Requirement: User registration with phone number
The system SHALL allow users to register using their phone number as the primary identifier. The system SHALL send an OTP to the provided phone number for verification. The system SHALL create a user account upon successful OTP verification.

#### Scenario: Successful registration with phone
- **WHEN** a new user provides a valid phone number and requests registration
- **THEN** the system sends an OTP to that phone number and upon correct OTP entry, creates a new user account

#### Scenario: Registration with already-registered phone
- **WHEN** a user attempts to register with a phone number that already has an account
- **THEN** the system SHALL reject the registration and inform the user that the phone number is already in use

### Requirement: User registration with social login
The system SHALL support registration and login via Google and Apple social login providers as secondary options.

#### Scenario: First-time social login
- **WHEN** a user authenticates via Google or Apple for the first time
- **THEN** the system SHALL create a new user account linked to that social identity

#### Scenario: Social login with existing account
- **WHEN** a user authenticates via social login and the email matches an existing account
- **THEN** the system SHALL link the social identity to the existing account

### Requirement: User login
The system SHALL allow registered users to log in via phone number + OTP or via linked social login provider.

#### Scenario: Login with phone OTP
- **WHEN** a registered user provides their phone number and correct OTP
- **THEN** the system SHALL issue an authenticated session with access and refresh tokens

#### Scenario: Login with invalid OTP
- **WHEN** a user provides an incorrect or expired OTP
- **THEN** the system SHALL reject the login attempt

### Requirement: Multi-device session support
The system SHALL allow a user to be logged in on multiple devices simultaneously. Each device SHALL maintain its own session.

#### Scenario: Login on second device
- **WHEN** a user logs in on a new device while already logged in on another
- **THEN** both sessions SHALL remain active and valid

### Requirement: User profile management
The system SHALL allow users to set and update their display name, profile photo, and date of birth.

#### Scenario: Update display name
- **WHEN** a user updates their display name
- **THEN** the new name SHALL be reflected across all families the user belongs to
