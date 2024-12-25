import * as yaml from "js-yaml"

export function replaceLeadingSpacesWithUnderscores(str: string) {
  return str.replace(/^( +)/gm, (match) => '_'.repeat(match.length));
}

export function replaceLeadingUnderscoresWithSpaces(str: string) {
  return str.replace(/^(_+)/gm, (match) => ' '.repeat(match.length));
}


export function dumpData(obj: Record<string, any>): string {
  const yamlStr = yaml.dump(obj, {
  });
  const outStr = replaceLeadingSpacesWithUnderscores(yamlStr)
  return outStr;
}

export function loadData(str: string): object {
  let processedStr = str;
  try {
    processedStr = processedStr.replace(/<br>/g, '\n');
    processedStr = processedStr.replace(/<pre>/g, '\n');
    processedStr = processedStr.replace(/<[^>]*>/g, '');
    processedStr = replaceLeadingUnderscoresWithSpaces(processedStr);
  } catch (e) {
    console.error(e);
    console.error(str);
  }
  return yaml.load(processedStr) as object;
}