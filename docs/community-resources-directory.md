# Community Resources Directory

## Overview

The Community Resources Directory is a comprehensive feature within the CareUnity platform that enables care professionals to discover, evaluate, and make referrals to a wide range of community-based support services and resources. This directory serves as a bridge between formal healthcare services and community support networks, helping to address the holistic needs of service users.

## Key Features

### Resource Discovery

- **Searchable Directory**: A searchable, filterable list of community resources.
- **Category-based Filtering**: Resources categorized by service type (healthcare, housing, food, etc.) for easy navigation.
- **Map View**: Geospatial visualization of resources to find services based on location.

### Resource Details

- **Comprehensive Information**: Detailed profiles for each resource including:
  - Contact information and opening hours
  - Service area and accessibility features
  - Eligibility criteria and costs
  - Available languages and specialized services
- **Multi-tab Interface**: Organized information across Details, Reviews, and Referral Info tabs.

### Referral Management

- **Integrated Referral Process**: Make direct referrals to resources from within the platform.
- **Service User Selection**: Link referrals to specific service users in the system.
- **Follow-up Tracking**: Schedule and track follow-up dates for referrals.
- **Referral History**: View and manage past referrals for each service user.

### Community Feedback

- **Rating System**: Five-star rating system to evaluate resource quality.
- **Detailed Reviews**: Review functionality allowing care professionals to share experiences.
- **Helpful Indicators**: Mark reviews as helpful to highlight valuable feedback.

## User Experience

### For Care Professionals

1. **Discover Resources**: Search and filter to find appropriate support services.
2. **Evaluate Options**: Review detailed information and community feedback to assess suitability.
3. **Make Referrals**: Create formal referrals directly within the platform.
4. **Track Outcomes**: Follow up on referrals and document outcomes.

### For Service Users (via Care Professionals)

1. **Personalized Recommendations**: Receive tailored resource recommendations based on needs.
2. **Streamlined Access**: Simplified access to services through formal referral process.
3. **Coordinated Support**: Better coordination between formal care and community support.

## Technical Implementation

The Community Resources Directory is built using:

- **React Components**: Modular component design for maintainability and reusability.
- **TanStack Query**: For efficient data fetching and state management.
- **Shadcn UI Components**: For a consistent and accessible user interface.
- **PostgreSQL Database**: For storing resource and referral data.
- **Responsive Design**: Works across desktop, tablet, and mobile devices.

## Key Components

1. **ResourceDirectory**: Main container component that handles search, filtering, and view switching.
2. **ResourceDetailView**: Displays comprehensive information about a selected resource.
3. **ResourceReferralForm**: Form component for creating referrals to resources.
4. **ResourceReviewList**: Displays and manages reviews for a resource.
5. **ResourceMapView**: Provides a geospatial view of resources.

## Future Enhancements

- **Advanced Geolocation**: Enhanced map features with routing and distance calculations.
- **Outcome Tracking**: Detailed tracking of referral outcomes and success rates.
- **Resource Verification**: Process for verifying and updating resource information.
- **API Integration**: Connect with external resource directories for expanded listings.
- **Service User Portal**: Allow service users to browse approved resources directly.

## Benefits to Care Management

- **Holistic Care**: Addresses wider determinants of health and wellbeing beyond clinical needs.
- **Efficiency**: Reduces time spent researching and coordinating community resources.
- **Evidence Base**: Builds institutional knowledge about effective community partners.
- **Coordination**: Improves coordination between formal and informal care networks.
- **Person-Centered Approach**: Supports tailored care planning that incorporates community resources.