# Formik + Zod Integration Guide

## Overview

**Formik** and **Zod** are a powerful combination for building type-safe, validated forms in React:

- **Formik**: Handles form state management, user interactions, and submission
- **Zod**: Provides schema validation and TypeScript type generation
- **zod-formik-adapter**: Bridges the two libraries seamlessly

## Key Benefits

### 1. **Type Safety**

```typescript
const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18),
})

type UserFormData = z.infer<typeof UserSchema> // Automatic TypeScript types!
```

### 2. **Schema Reusability**

Use the same schema for:

- Frontend form validation
- Backend API validation
- Database validation
- Testing

### 3. **Real-time Validation**

- Validate on change/blur
- Show errors immediately
- Prevent invalid submissions

### 4. **Rich Validation Rules**

```typescript
const AdvancedSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^[\+]?[(]?[\d\s\-\(\)]{10,}$/, 'Invalid phone'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
```

## Basic Setup

### 1. Install Dependencies

```bash
pnpm add formik zod zod-formik-adapter
```

### 2. Create Schema

```typescript
import { z } from 'zod'

const ContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number required'),
})

type ContactFormData = z.infer<typeof ContactSchema>
```

### 3. Use with Formik

```typescript
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { toFormikValidationSchema } from 'zod-formik-adapter'

function ContactForm() {
  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      }}
      validationSchema={toFormikValidationSchema(ContactSchema)}
      onSubmit={(values) => {
        // values is fully typed as ContactFormData
        console.log(values)
      }}
    >
      <Form>
        <Field name="firstName" />
        <ErrorMessage name="firstName" />

        <Field name="email" type="email" />
        <ErrorMessage name="email" />

        <button type="submit">Submit</button>
      </Form>
    </Formik>
  )
}
```

## Advanced Patterns

### Conditional Validation

```typescript
const OrderSchema = z
  .object({
    shippingMethod: z.enum(['pickup', 'delivery']),
    address: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.shippingMethod === 'delivery' && !data.address) {
        return false
      }
      return true
    },
    {
      message: 'Address is required for delivery',
      path: ['address'],
    }
  )
```

### Async Validation

```typescript
const emailExistsValidation = z
  .string()
  .email()
  .refine(
    async (email) => {
      const response = await fetch(`/api/check-email?email=${email}`)
      const { exists } = await response.json()
      return !exists
    },
    { message: 'Email already exists' }
  )
```

### Nested Objects

```typescript
const UserSchema = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{5}$/),
  }),
  preferences: z.object({
    newsletter: z.boolean(),
    notifications: z.boolean(),
  }),
})
```

## Integration with Existing Components

When integrating with existing form components that don't support error props:

```typescript
<Formik
  validationSchema={toFormikValidationSchema(schema)}
  // ... other props
>
  {({ values, errors, touched, setFieldValue }) => (
    <Form>
      {/* Use existing component */}
      <MyExistingField
        value={values.fieldName}
        onChange={(e) => setFieldValue('fieldName', e.target.value)}
      />

      {/* Display errors separately */}
      {touched.fieldName && errors.fieldName && (
        <div className="text-red-600 text-sm mt-1">
          {errors.fieldName}
        </div>
      )}
    </Form>
  )}
</Formik>
```

## Performance Tips

### 1. Memoize Schemas

```typescript
const validationSchema = useMemo(() => toFormikValidationSchema(ContactSchema), [])
```

### 2. Optimize Validation Timing

```typescript
<Formik
  validateOnChange={true}    // Validate while typing
  validateOnBlur={true}      // Validate when leaving field
  validateOnMount={false}    // Don't validate initially
>
```

### 3. Lazy Validation

```typescript
const ExpensiveSchema = z.lazy(() =>
  z.object({
    // Complex validation logic here
  })
)
```

## Error Handling Best Practices

### 1. User-Friendly Messages

```typescript
const schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})
```

### 2. Error Summary Component

```typescript
function FormErrorSummary({ errors, touched }) {
  const errorList = Object.entries(errors)
    .filter(([key]) => touched[key])
    .map(([key, message]) => ({ field: key, message }))

  if (errorList.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
      <h3 className="text-red-800 font-medium">Please fix the following errors:</h3>
      <ul className="list-disc list-inside text-red-700 text-sm mt-2">
        {errorList.map(({ field, message }) => (
          <li key={field}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
```

## Testing

### Unit Testing Schemas

```typescript
describe('ContactSchema', () => {
  it('should validate correct data', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234567',
    }

    expect(() => ContactSchema.parse(validData)).not.toThrow()
  })

  it('should reject invalid email', () => {
    const invalidData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
      phone: '555-1234567',
    }

    expect(() => ContactSchema.parse(invalidData)).toThrow()
  })
})
```

### Integration Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

test('form shows validation errors', async () => {
  render(<ContactForm />)

  const submitButton = screen.getByRole('button', { name: /submit/i })
  fireEvent.click(submitButton)

  await waitFor(() => {
    expect(screen.getByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Invalid email address')).toBeInTheDocument()
  })
})
```

## Comparison with Other Solutions

| Feature          | Formik + Zod | React Hook Form + Yup | Plain React State |
| ---------------- | ------------ | --------------------- | ----------------- |
| Type Safety      | ✅ Excellent | ✅ Good               | ❌ Manual         |
| Bundle Size      | Medium       | Small                 | Smallest          |
| Learning Curve   | Medium       | Medium                | Low               |
| Validation Power | ✅ Excellent | ✅ Good               | ❌ Manual         |
| Performance      | Good         | ✅ Excellent          | Good              |
| Community        | ✅ Large     | ✅ Large              | N/A               |

## Conclusion

Formik + Zod provides an excellent balance of developer experience, type safety, and validation power. The combination is particularly valuable for:

- Large forms with complex validation rules
- Applications requiring consistent validation across frontend/backend
- Teams prioritizing type safety and maintainability
- Projects where validation rules change frequently

The `zod-formik-adapter` makes integration seamless, allowing you to leverage both libraries' strengths while maintaining clean, maintainable code.
