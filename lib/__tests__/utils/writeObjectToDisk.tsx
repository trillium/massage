import fs from 'fs/promises'

type WriteObjectToDiskProps = {
  data: object
  filename: string
}

export async function writeObjectToDisk({ data, filename }: WriteObjectToDiskProps) {
  await fs.writeFile(`${filename}.json`, JSON.stringify(data, null, 2), 'utf-8')
}
