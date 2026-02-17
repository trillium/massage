import { DebugInfoType } from '@/lib/componentTypes'

interface AdminDebugPanelProps {
  debug: DebugInfoType
}

export default function AdminDebugPanel({ debug }: AdminDebugPanelProps) {
  // Extract key lead time information
  const resolveOutputs = debug.intermediateResults?.resolveConfiguration?.outputs
  const resolvedConfig =
    resolveOutputs && !Array.isArray(resolveOutputs) ? resolveOutputs.configuration : undefined
  const leadTimeInfo = debug.intermediateResults?.calculateLeadTime
  const leadTimeOutputs =
    leadTimeInfo?.outputs && !Array.isArray(leadTimeInfo.outputs) ? leadTimeInfo.outputs : undefined

  const leadTimeData = {
    configurationLeadTime:
      resolvedConfig && typeof resolvedConfig === 'object' && 'leadTimeMinimum' in resolvedConfig
        ? (resolvedConfig as { leadTimeMinimum?: number }).leadTimeMinimum
        : undefined,
    defaultLeadTime: leadTimeInfo?.inputs?.defaultLeadTime,
    effectiveLeadTime: leadTimeOutputs?.effectiveLeadTime,
    functionInputs: debug.inputs,
  }

  return (
    <div className="mt-8 rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-600 dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
        Lead Time Debug Information
      </h2>
      <pre className="overflow-auto rounded border border-gray-200 bg-white p-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
        {JSON.stringify(leadTimeData, null, 2)}
      </pre>

      <h3 className="mt-6 mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Full Debug Information
      </h3>
      <pre className="overflow-auto rounded border border-gray-200 bg-white p-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
        {JSON.stringify(debug.intermediateResults, null, 2)}
      </pre>
    </div>
  )
}
