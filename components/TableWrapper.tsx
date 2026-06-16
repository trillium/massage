import { Box } from '@/components/ui/box'
const TableWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box className="w-full overflow-x-auto">
      <table>{children}</table>
    </Box>
  )
}

export default TableWrapper
