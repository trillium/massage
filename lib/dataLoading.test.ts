import { describe, it, expect } from 'vitest'
import { dumpData, loadData, replaceLeadingUnderscoresWithSpaces } from './dataLoading'
import yaml from 'js-yaml'

describe('dataLoading tests', () => {
  describe('dumpData', () => {
    it('should return YAML string that contains underscores when objects are nested', () => {
      const obj = {
        key1: 'value1',
        key2: 'value2',
        nested: { nest1: { nest2: '2 nested' } },
      }
      const yamlString = yaml.dump(obj)
      const dumpStr = dumpData(obj)
      const replaceStr = replaceLeadingUnderscoresWithSpaces(dumpStr)
      expect(dumpStr).toContain('_')
      expect(replaceStr).toBe(yamlString)
    })

    it('should parse this string', () => {
      const obj = {
        allowedDurations: [15, 30],
        pricing: 120,
        eventContainer: 'foo_EVENT__',
      }
      const dumpStr = dumpData(obj)
      const yamlString = yaml.dump(obj)
      const replaceStr = replaceLeadingUnderscoresWithSpaces(dumpStr)
      expect(replaceStr).toBe(yamlString)
    })
  })

  describe('loadData', () => {
    it('should encode and decode successfully', () => {
      const obj = {
        key1: 'value1',
        key2: 'value2',
        nested: { nest1: { nest2: '2 nested' } },
      }
      const dumpStr = dumpData(obj)
      const loadObj = loadData(dumpStr)
      const expectedObj = {
        key1: 'value1',
        key2: 'value2',
        nested: { nest1: { nest2: '2 nested' } },
      }
      expect(loadObj).toEqual(expectedObj)
    })
    it('should drop xml tags', () => {
      const xmlStr =
        "<pre><u></u><u></u><pre><u></u><u></u><pre><u></u><u></u><pre>eventName: mr_pasadena<br>eventContainerString: mr_pasadena__EVENT__<br>allowedDurations:<br>__- 15<br>__- 30<br>pricing:<br>__'15': 30<br>__'30': 60<br></pre></pre></pre></pre>"
      const loadObj = loadData(xmlStr)
      const expectedObj = {
        eventName: 'mr_pasadena',
        eventContainerString: 'mr_pasadena__EVENT__',
        allowedDurations: [15, 30],
        pricing: {
          '15': 30,
          '30': 60,
        },
      }
      expect(loadObj).toEqual(expectedObj)
    })

    it('should parse this yaml 1', () => {
      const testYaml = `<pre><pre>eventBaseString: __EVENT__<br>eventContainerString: spiteless__EVENT__<br>allowedDurations:<br>__- 15<br>__- 30<br>__- 45<br>__- 60<br>eventName: spiteless<br>pricing:<br>__\'15\': 30<br>__\'30\': 60<br>__\'45\': 90<br>__\'60\': 120</pre><pre>description: Chair Massage Day :)<br></pre><pre><span>paymentOptions: Individuals pays their own session</span><br></pre><pre>leadTime: 0<br></pre></pre>`
      const loadObj = loadData(testYaml)
      const outObj = {
        eventBaseString: '__EVENT__',
        eventContainerString: 'spiteless__EVENT__',
        allowedDurations: [15, 30, 45, 60],
        eventName: 'spiteless',
        pricing: { '15': 30, '30': 60, '45': 90, '60': 120 },
        description: 'Chair Massage Day :)',
        paymentOptions: 'Individuals pays their own session',
        leadTime: 0,
      }
      expect(loadObj).toEqual(outObj)
    })
    it('should parse this yaml 2', () => {
      const testYaml = `firstName: Spiteless<br>lastName: A<br>email: <a href="mailto:spiteless%2Btest@gmail.com" target="_blank">spiteless+test@gmail.com</a><br>start: \'2024-10-06T12:30:00-07:00\'<br>end: \'2024-10-06T14:30:00-07:00\'<br>timeZone: America/Los_Angeles<br>location: some_city<br>duration: \'120\'<br>price: \'280\'<br>phone: 555-444-3333<br>paymentMethod: cash<br>eventBaseString: __EVENT__<br>eventContainerString: spiteless__EVENT__<br>allowedDurations:<br>__- 15<br>__- 30<br>__- 45<br>__- 60<br>eventName: spiteless<br>pricing:<br>__\'15\': 30<br>__\'30\': 60<br>__\'45\': 90<br>__\'60\': 120<br>paymentOptions: Individuals pays their own session<br>leadTime: 0<br>requestId: 5a0fa0073c6194e3a08110f9808ead23b8cc0dc9aad3f1ab72b359b9ae014c6d<br>summary: spiteless__EVENT__CONTAINER__`
      const loadObj = loadData(testYaml)
      const outObj = {
        firstName: 'Spiteless',
        lastName: 'A',
        email: 'spiteless+test@gmail.com',
        start: '2024-10-06T12:30:00-07:00',
        end: '2024-10-06T14:30:00-07:00',
        timeZone: 'America/Los_Angeles',
        location: 'some_city',
        duration: '120',
        price: '280',
        phone: '555-444-3333',
        paymentMethod: 'cash',
        eventBaseString: '__EVENT__',
        eventContainerString: 'spiteless__EVENT__',
        allowedDurations: [15, 30, 45, 60],
        eventName: 'spiteless',
        pricing: { '15': 30, '30': 60, '45': 90, '60': 120 },
        paymentOptions: 'Individuals pays their own session',
        leadTime: 0,
        requestId: '5a0fa0073c6194e3a08110f9808ead23b8cc0dc9aad3f1ab72b359b9ae014c6d',
        summary: 'spiteless__EVENT__CONTAINER__',
      }
      expect(loadObj).toEqual(outObj)
    })

    it('should parse this yaml 3', () => {
      const testYaml = `firstName: Spiteless
lastName: A
email: spiteless+test@gmail.com
start: '2024-10-06T12:30:00-07:00'
end: '2024-10-06T14:30:00-07:00'
timeZone: America/Los_Angeles
location: some_city
duration: '120'
price: '280'
phone: 555-444-3333
paymentMethod: cash
eventBaseString: __EVENT__
eventContainerString: spiteless__EVENT__
allowedDurations:
__- 15
__- 30
__- 45
__- 60
eventName: spiteless
pricing:
__'15': 30
__'30': 60
__'45': 90
__'60': 120
paymentOptions: Individuals pays their own session
leadTime: 0
requestId: 5a0fa0073c6194e3a08110f9808ead23b8cc0dc9aad3f1ab72b359b9ae014c6d
summary: spiteless__EVENT__CONTAINER__`
      const loadObj = loadData(testYaml)
      const outObj = {
        firstName: 'Spiteless',

        lastName: 'A',
        email: 'spiteless+test@gmail.com',
        start: '2024-10-06T12:30:00-07:00',
        end: '2024-10-06T14:30:00-07:00',
        timeZone: 'America/Los_Angeles',
        location: 'some_city',
        duration: '120',
        price: '280',
        phone: '555-444-3333',
        paymentMethod: 'cash',
        eventBaseString: '__EVENT__',
        eventContainerString: 'spiteless__EVENT__',
        allowedDurations: [15, 30, 45, 60],
        eventName: 'spiteless',
        pricing: { 15: 30, 30: 60, 45: 90, 60: 120 },
        paymentOptions: 'Individuals pays their own session',
        leadTime: 0,
        requestId: '5a0fa0073c6194e3a08110f9808ead23b8cc0dc9aad3f1ab72b359b9ae014c6d',
        summary: 'spiteless__EVENT__CONTAINER__',
      }
      expect(loadObj).toEqual(outObj)
    })
  })

  describe('edge cases and error handling', () => {
    it('dumpData should handle empty object and array', () => {
      expect(dumpData({})).toBe('{}\n')
      expect(dumpData([])).toBe('[]\n')
    })

    it('loadData should handle empty string', () => {
      expect(loadData('')).toBeUndefined()
    })

    it('dumpData and loadData should handle empty object and array roundtrip', () => {
      expect(loadData(dumpData({}))).toEqual({})
      expect(loadData(dumpData([]))).toEqual([])
    })

    it('loadData should handle malformed YAML gracefully', () => {
      const badYaml = 'key: value\n  - badIndent'
      expect(() => loadData(badYaml)).not.toThrow()
    })

    it('replaceLeadingUnderscoresWithSpaces should handle edge cases', () => {
      expect(replaceLeadingUnderscoresWithSpaces('___foo')).toBe('   foo')
      expect(replaceLeadingUnderscoresWithSpaces('no_underscores')).toBe('no_underscores')
      expect(replaceLeadingUnderscoresWithSpaces('')).toBe('')
    })

    it('loadData should handle non-string input and trigger catch block', () => {
      expect(() => loadData({} as unknown as string)).not.toThrow()
      // Should return undefined or null depending on yaml.load behavior
    })
  })
})
