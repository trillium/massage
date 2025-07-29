# Adding New Properties to the Massage Booking System

This document outlines all the places where new properties need to be added to maintain functionality across the application.

## Core Type Definition

### 1. **SlugConfigurationType** in `lib/types.ts`

- **Purpose**: Main configuration type for booking slugs
- **Location**: Lines ~245-265 in `lib/types.ts`
- **Example**:

```typescript
export type SlugConfigurationType = {
  bookingSlug: string | string[] | null
  type: SlugType
  title: string | null
  text: string | null
  location: string | null
  locationIsReadOnly?: boolean
  eventContainer: string | null
  promoEndDate?: string | null
  price: PricingType | null
  discount: DiscountType | null
  leadTimeMinimum: number | null
  instantConfirm?: boolean
  acceptingPayment?: boolean
  allowedDurations: AllowedDurationsType | null
  // NEW PROPERTY GOES HERE
}
```

## Redux State Management

### 2. **Initial State** in `redux/slices/configSlice.ts`

- **Purpose**: Default values for the configuration
- **Location**: Lines 7-21 in `redux/slices/configSlice.ts`
- **Action Required**: Add default value for new property
- **Example**:

```typescript
export const initialState: SlugConfigurationType = {
  type: null,
  bookingSlug: null,
  price: DEFAULT_PRICING,
  // ... existing properties
  newProperty: null, // ADD DEFAULT VALUE
}
```

### 3. **Redux Actions** in `redux/slices/configSlice.ts`

- **Purpose**: Actions to update the new property in Redux state
- **Location**: Lines 27-80 in `redux/slices/configSlice.ts`
- **Action Required**: Add setter action for new property
- **Example**:

```typescript
reducers: {
  // ... existing actions
  setNewProperty: (state, action: PayloadAction<NewPropertyType>) => {
    state.newProperty = action.payload
  },
}
```

### 4. **Export Actions** in `redux/slices/configSlice.ts`

- **Purpose**: Make the new action available for import
- **Location**: Lines 70-82 in `redux/slices/configSlice.ts`
- **Action Required**: Export the new action
- **Example**:

```typescript
export const {
  setBookingSlug,
  setPrice,
  // ... existing exports
  setNewProperty, // ADD NEW ACTION EXPORT
} = configSlice.actions
```

## Schema Validation (if applicable to forms)

### 5. **Zod Schema** in `lib/schema.ts`

- **Purpose**: Runtime validation for form data
- **Location**: Various schemas in `lib/schema.ts`
- **Action Required**: Add validation for new property if it's user-input
- **Example**:

```typescript
const BaseRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  // ... existing fields
  newProperty: z.string().optional(), // ADD VALIDATION
})
```

## Configuration Processing

### 6. **createPageConfiguration** in `lib/slugConfigurations/createPageConfiguration.tsx`

- **Purpose**: Processes configuration data for pages
- **Location**: Throughout the file, especially where `configuration` is used
- **Action Required**: Handle new property in configuration processing logic
- **Example**: Check if new property affects page behavior

### 7. **fetchSlugConfigurationData** (if stored externally)

- **Purpose**: Fetches configuration data from external source
- **Action Required**: Ensure new property is included in fetched data
- **Note**: Location depends on your data source implementation

## Frontend Components (if UI is needed)

### 8. **Form Components** (if property is user-editable)

- **Purpose**: Allow users to input/edit the new property
- **Locations**:
  - `components/booking/BookingForm.tsx`
  - Any admin/configuration forms
- **Action Required**: Add form fields and validation

### 9. **Display Components** (if property affects UI)

- **Purpose**: Show or use the new property in the interface
- **Locations**: Various components that use configuration
- **Action Required**: Update components to handle new property

## API Endpoints (if applicable)

### 10. **API Routes** in `app/api/`

- **Purpose**: Handle new property in server-side logic
- **Action Required**: Update endpoints that process configuration data
- **Example**: Update validation and processing in API routes

## Database/Data Storage (if applicable)

### 11. **Data Migration**

- **Purpose**: Update existing data to include new property
- **Action Required**:
  - Add migration scripts if using a database
  - Update static configuration files
  - Ensure backward compatibility

## Testing

### 12. **Type Tests**

- **Purpose**: Ensure type safety with new property
- **Action Required**: Add tests that verify new property works correctly
- **Locations**: Any test files that use `SlugConfigurationType`

## Documentation

### 13. **Type Documentation**

- **Purpose**: Document the new property's purpose and usage
- **Action Required**: Add JSDoc comments explaining the new property

## Checklist for Adding a New Property

- [ ] Add to `SlugConfigurationType` in `lib/types.ts`
- [ ] Update `initialState` in `redux/slices/configSlice.ts`
- [ ] Add Redux action in `configSlice.ts`
- [ ] Export new action in `configSlice.ts`
- [ ] Add Zod validation in `lib/schema.ts` (if user input)
- [ ] Update `createPageConfiguration.tsx` (if affects page logic)
- [ ] Add form fields (if user-editable)
- [ ] Update display components (if affects UI)
- [ ] Update API routes (if server-side processing needed)
- [ ] Add data migration (if persistent storage)
- [ ] Add tests
- [ ] Update documentation

## Notes

- **Optional vs Required**: Decide if the new property should be optional (`?:`) or required
- **Default Values**: Choose appropriate default values for the `initialState`
- **Type Safety**: Ensure all TypeScript types are properly updated
- **Backward Compatibility**: Consider how existing configurations will handle the new property
- **Performance**: Consider if the new property affects performance (e.g., large objects, expensive computations)

## Common Pitfalls

1. **Forgetting Redux Actions**: New properties won't be updatable without Redux actions
2. **Missing Default Values**: Undefined properties can cause runtime errors
3. **Type Mismatches**: Ensure all type definitions match across files
4. **Validation Gaps**: User input should always have proper validation
5. **Migration Issues**: Existing data may not have the new property
