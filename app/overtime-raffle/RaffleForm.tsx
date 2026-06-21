'use client'

import { useReduxFormData } from '@/redux/hooks'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { RAFFLE_INTEREST_OPTIONS } from '@/lib/schema'
import raffleData from '@/data/raffle.json'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TextBase } from '@/components/ui/text'
import {
  type RaffleFormProps,
  type FormValues,
  validate,
  inputClasses,
  labelClasses,
  checkboxClasses,
} from './raffleFormUtils'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'
import { useRaffleForm } from '@/components/raffle/useRaffleForm'

const formText = raffleData.overtime

export default function RaffleForm({ raffleId, raffleName }: RaffleFormProps) {
  const formData = useReduxFormData()
  const { submitError, lookupMessage, lookupEntry, handleSubmit } = useRaffleForm({
    raffleId,
    raffleName,
    confirmedPath: '/overtime-raffle/entered',
    messages: {
      welcomeBackMessage: formText.welcomeBackMessage,
      errorGeneric: formText.errorGeneric,
      errorNetwork: formText.errorNetwork,
    },
    lookupContext: 'overtime-raffle-lookup',
  })

  return (
    <Stack
      className="border-white-500 focus-within:border-primary-500 w-full space-y-4 rounded-lg border-2 bg-surface-50 p-6 shadow-md dark:bg-surface-900"
      direction="col"
      align="center"
    >
      <Formik<FormValues>
        initialValues={{
          name: [formData?.firstName, formData?.lastName].filter(Boolean).join(' '),
          email: formData?.email ?? '',
          phone: formData?.phone ?? '',
          zip_code: '',
          interested_in: formData?.raffleInterests ?? [],
        }}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="w-full space-y-6">
            <Box>
              <label htmlFor="name" className={labelClasses}>
                {formText.nameLabel}{' '}
                <span className="text-primary-500">{formText.requiredAsterisk}</span>
              </label>
              <Field
                type="text"
                id="name"
                name="name"
                className={inputClasses}
                placeholder={formText.namePlaceholder}
                disabled={isSubmitting}
              />
              <Box className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
                <ErrorMessage name="name" />
              </Box>
            </Box>

            <Box>
              <label htmlFor="email" className={labelClasses}>
                {formText.emailLabel}{' '}
                <span className="text-primary-500">{formText.requiredAsterisk}</span>
              </label>
              <Field
                type="email"
                id="email"
                name="email"
                className={inputClasses}
                placeholder={formText.emailPlaceholder}
                disabled={isSubmitting}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  lookupEntry(e.target.value, setFieldValue)
                }}
              />
              <Box className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
                <ErrorMessage name="email" />
              </Box>
              {lookupMessage && (
                <Box className="mt-1 text-sm text-primary-600 dark:text-primary-400">
                  {lookupMessage}
                </Box>
              )}
            </Box>

            <Box>
              <label htmlFor="phone" className={labelClasses}>
                {formText.phoneLabel}{' '}
                <span className="text-primary-500">{formText.requiredAsterisk}</span>
              </label>
              <Field
                type="tel"
                id="phone"
                name="phone"
                className={inputClasses}
                placeholder={formText.phonePlaceholder}
                disabled={isSubmitting}
              />
              <Box className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
                <ErrorMessage name="phone" />
              </Box>
            </Box>

            <Box>
              <label htmlFor="zip_code" className={labelClasses}>
                {formText.zipCodeLabel}{' '}
                <span className="text-primary-500">{formText.requiredAsterisk}</span>
              </label>
              <Field
                type="text"
                id="zip_code"
                name="zip_code"
                className={inputClasses}
                placeholder={formText.zipCodePlaceholder}
                disabled={isSubmitting}
                maxLength={10}
              />
              <Box className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
                <ErrorMessage name="zip_code" />
              </Box>
            </Box>

            <Box>
              <TextBase className={labelClasses}>
                {formText.interestedLabel}{' '}
                <span className="text-primary-500">{formText.requiredAsterisk}</span>
              </TextBase>
              <Box className="space-y-2">
                {RAFFLE_INTEREST_OPTIONS.map(({ value, label }) => (
                  <Stack direction="row" align="center" key={value}>
                    <Input
                      type="checkbox"
                      id={`interested-${value}`}
                      className={checkboxClasses}
                      checked={values.interested_in.includes(value)}
                      disabled={isSubmitting}
                      onChange={() => {
                        const next = values.interested_in.includes(value)
                          ? values.interested_in.filter((v) => v !== value)
                          : [...values.interested_in, value]
                        setFieldValue('interested_in', next)
                      }}
                    />
                    <label
                      htmlFor={`interested-${value}`}
                      className="ms-2 font-medium text-accent-800 dark:text-accent-100"
                    >
                      {label}
                    </label>
                  </Stack>
                ))}
              </Box>
              <Box className="mt-1 min-h-5 text-sm text-amber-500 dark:text-amber-400">
                <ErrorMessage name="interested_in" />
              </Box>
            </Box>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 border-primary-500 rounded border-2 px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-surface-400"
            >
              {isSubmitting ? formText.enterButtonSubmitting : formText.enterButtonDefault}
            </Button>
            <Box>
              {submitError && (
                <Box className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                  {submitError}
                </Box>
              )}
            </Box>
          </Form>
        )}
      </Formik>
    </Stack>
  )
}
