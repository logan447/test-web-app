# Provider Profile Enhancement - Database Migration Notes

## Overview
This document outlines all database schema changes made during the 10-sprint Provider Profile Form enhancement project (Sprints 1-10).

## Database Migration Commands

**Important:** Run these migrations in order after ensuring your database is accessible.

```bash
# Sprint 1: Profile Completeness Tracking (no schema changes)
# No migration needed - uses existing fields

# Sprint 2: Photo & Media Upload System (no schema changes)
# No migration needed - uses existing `photos` and `coverPhoto` fields

# Sprint 3: Detailed Services & Care Types
npx prisma migrate dev --name add_detailed_services_fields

# Sprint 4: Pricing Structure & Transparency
npx prisma migrate dev --name add_pricing_structure_fields

# Sprint 5: Amenities & Features Enhancement
npx prisma migrate dev --name add_amenities_features_fields

# Sprint 6: Staff Information & Credentials
npx prisma migrate dev --name add_staff_information_enhancements

# Sprint 7: Certifications, Licensing & Awards
npx prisma migrate dev --name add_certifications_licensing_enhancements

# Sprint 8: Specialty Programs & Policies
npx prisma migrate dev --name add_specialty_programs_policies

# Sprint 9: About Us, Meet the Team & Virtual Tours
npx prisma migrate dev --name add_about_us_team_virtual_tours

# Sprint 10: Polish, UX & Accessibility (no schema changes)
# No migration needed - only UI/UX improvements
```

## Alternative: Single Migration

If you prefer to run all schema changes in a single migration:

```bash
npx prisma migrate dev --name comprehensive_provider_profile_enhancements
```

## Schema Changes by Sprint

### Sprint 3: Detailed Services & Care Types
Added to `Provider` model:
- `detailedMedicalServices` (String[])
- `detailedPersonalCareServices` (String[])
- `detailedDailyLivingServices` (String[])
- `detailedMemoryCareServices` (String[])
- `detailedSocialRecServices` (String[])

### Sprint 4: Pricing Structure & Transparency
Added to `Provider` model:
- `privateRoomMin` (Int?)
- `privateRoomMax` (Int?)
- `semiPrivateRoomMin` (Int?)
- `semiPrivateRoomMax` (Int?)
- `includedServices` (String[])
- `additionalServicesJson` (String?)
- `communityFee` (Int?)
- `securityDeposit` (Int?)
- `applicationFee` (Int?)
- `acceptsFinancialAssistance` (Boolean)
- `financialAssistanceTypes` (String[])
- `offersPaymentPlans` (Boolean)
- `paymentPlanDetails` (String?)

### Sprint 5: Amenities & Features Enhancement
Added to `Provider` model:
- `safetySecurityFeatures` (String[])
- `medicalAmenities` (String[])

### Sprint 6: Staff Information & Credentials
Added to `Provider` model:
- `daytimeStaffRatio` (String?)
- `eveningStaffRatio` (String?)
- `nightStaffRatio` (String?)
- `staffCredentials` (String[])
- `staffTrainingDescription` (String?)
- `hasOnCallPhysician` (Boolean)
- `hasPharmacyPartnership` (Boolean)

### Sprint 7: Certifications, Licensing & Awards
Added to `Provider` model:
- `certificateUrls` (String[])
- `accreditations` (String[])
- `awardsJson` (String?)

### Sprint 8: Specialty Programs & Policies
Added to `Provider` model:
- `specialtyProgramsJson` (String?)
- `petPolicy` (String?)
- `petPolicyDetails` (String?)
- `visitorPolicy` (String?)
- `smokingPolicy` (String?)
- `hasTrialPeriod` (Boolean)
- `trialPeriodDuration` (String?)

### Sprint 9: About Us, Meet the Team & Virtual Tours
Added to `Provider` model:
- `establishedYear` (String?)
- `facilityHistory` (String?)
- `missionStatement` (String?)
- `whatMakesUsUnique` (String?)
- `teamMembersJson` (String?)
- `virtualTourUrl` (String?)
- `virtualTourType` (String?)
- `brochureUrl` (String?)
- `floorPlanUrls` (String[])

## Total New Fields Added
- **47 new fields** added to the `Provider` model across 7 sprints
- **Backward compatible** - all new fields are nullable or have default values
- **Legacy fields preserved** - existing fields maintained for backward compatibility

## Data Migration Considerations

### JSON Fields
Several fields store complex data as JSON strings:
- `additionalServicesJson` - Array of additional services with pricing
- `awardsJson` - Array of awards with name, year, description
- `specialtyProgramsJson` - Array of specialty programs with details
- `teamMembersJson` - Array of team members with profiles

Example structure:
```typescript
// awardsJson
[
  {
    name: "Best Senior Care Facility 2025",
    year: "2025",
    description: "Awarded by Senior Living Association"
  }
]

// teamMembersJson
[
  {
    id: "team-123",
    role: "executive_director",
    name: "Sarah Johnson, RN",
    photoUrl: "https://...",
    bio: "Sarah has been our Executive Director..."
  }
]
```

### Backward Compatibility
The implementation maintains backward compatibility by:
1. Keeping all legacy fields (e.g., `staffToResidentRatio`, `priceMin`, `priceMax`)
2. Making all new fields optional (nullable) or with default values
3. Synchronizing both new and legacy state in the UI
4. Submitting both new and legacy data in API calls

### Migration Safety
All migrations are safe to run on existing databases:
- No data loss - all existing fields preserved
- No breaking changes - all new fields optional
- No constraints - fields can be null or empty
- Rollback friendly - can safely roll back if needed

## Testing Recommendations

After running migrations:
1. Verify schema applied: `npx prisma db pull`
2. Check data integrity: Query a few Provider records
3. Test the UI: Load provider profile page
4. Test form submission: Create/update a provider profile
5. Verify new fields persist: Check database after save

## Rollback Instructions

If you need to rollback migrations:

```bash
# View migration history
npx prisma migrate status

# Rollback to a specific migration
npx prisma migrate resolve --rolled-back <migration-name>

# OR manually revert in database and update schema.prisma
```

## API Endpoints Affected

The following API endpoints were updated to handle new fields:
- `GET /api/providers/me` - Returns provider with all new fields
- `PATCH /api/providers/[id]` - Accepts and saves all new fields
- `POST /api/providers/me` - Creates provider with all new fields

## Performance Considerations

- **Text fields** for long content (facilityHistory, whatMakesUsUnique, etc.) - consider adding full-text search indexes if needed
- **Array fields** with many items - PostgreSQL handles array fields efficiently up to reasonable sizes
- **JSON fields** - indexed by field, not content; consider extracting to separate tables if complex queries needed

## Next Steps

1. **Run migrations** in development environment first
2. **Test thoroughly** with sample data
3. **Backup database** before running in production
4. **Run migrations** in staging
5. **Deploy to production** after validation

## Support

For questions or issues:
- Review Prisma schema: `/prisma/schema.prisma`
- Check API routes: `/app/api/providers/`
- Review UI implementation: `/app/dashboard/provider-profile/page.tsx`
