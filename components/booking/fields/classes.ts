// Comprehensive field classes store for booking form components
const fieldClasses = {
  // Container and layout classes
  row: 'row focus-within:ring-primary-400 relative grid grid-cols-1 gap-x-2 px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none only:rounded-md focus-within:z-10 focus-within:ring-2',
  rowDiv: 'w-full grid grid-cols-1 gap-y-2',
  rowDivFlex: 'w-full flex space-x-2 flex-col',
  flexRow: 'flex space-x-2',
  flexRowWithMargin: 'mt-2 flex space-x-2',
  flexHalfWidth: 'w-1/2',

  // Label classes
  label: 'block text-sm font-medium text-gray-900 dark:text-gray-100',

  // Base input styles (without focus ring - add focus separately)
  inputBase:
    'mb-1 block w-full rounded-sm border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 sm:text-base sm:leading-6 dark:text-gray-100',
  input:
    'mb-1 block w-full rounded-sm border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-base sm:leading-6 dark:text-gray-100',
  inputReadOnly: 'select-none bg-gray-300 dark:bg-gray-900 dark:text-gray-500',

  // Focus styles - can be applied conditionally
  focusNormal: 'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
  focusReadOnly: 'focus:ring-2 focus:ring-gray-600 focus:border-gray-400',

  // TextArea styles
  textarea:
    'mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-gray-100',

  // Select styles
  select:
    'mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 dark:text-gray-100',

  // Radio button styles
  radio: 'text-primary-600 focus:ring-primary-400 h-4 w-4 border-gray-300',
  radioLabel: 'ml-1.5 block text-sm leading-6 text-gray-800 dark:text-gray-100',
  radioContainer: 'flex items-center',

  // Payment method specific
  paymentTitle: 'text-sm font-medium',
  paymentFieldset: 'mt-2',
  paymentOptions: 'space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4',
  paymentHint: 'pl-4 text-sm text-gray-500 dark:text-gray-300',
}

export { fieldClasses }
