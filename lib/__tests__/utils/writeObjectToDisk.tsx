const fs = require('fs').promises

type WriteObjectToDiskProps = {
  data: Object
  filename: string
}

export async function writeObjectToDisk({ data, filename }: WriteObjectToDiskProps) {
  await fs.writeFile(`${filename}.json`, JSON.stringify(data, null, 2), 'utf-8')
}
