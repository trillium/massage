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
    <div className="mt-8 rounded border border-accent-300 bg-surface-200 p-4 dark:border-accent-600 dark:bg-surface-800">
      <h2 className="mb-4 text-xl font-bold text-accent-900 dark:text-accent-100">
        Lead Time Debug Information
      </h2>
      <pre className="overflow-auto rounded border border-accent-200 bg-surface-50 p-3 text-sm text-accent-900 dark:border-accent-700 dark:bg-surface-900 dark:text-accent-100">
        {JSON.stringify(leadTimeData, null, 2)}
      </pre>

      <h3 className="mt-6 mb-2 text-lg font-semibold text-accent-900 dark:text-accent-100">
        Full Debug Information
      </h3>
      <pre className="overflow-auto rounded border border-accent-200 bg-surface-50 p-3 text-sm text-accent-900 dark:border-accent-700 dark:bg-surface-900 dark:text-accent-100">
        {JSON.stringify(debug.intermediateResults, null, 2)}
      </pre>
    </div>
  )
}
