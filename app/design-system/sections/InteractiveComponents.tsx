/* ds-ignore-file */ /* content-ok-file */
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Radio } from '@/components/ui/radio'
import { PeerRadio } from '@/components/ui/peer-radio'
import { H3 } from '@/components/ui/heading'
import { Stack } from '@/components/ui/stack'
import Link from '@/components/Link'
import { Section } from './shared'

export function InteractiveComponents() {
  return (
    <Section title="Interactive Components">
      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">Button</H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ Button }'} from @/components/ui/button
        </p>
        <Stack
          direction="row"
          wrap
          gap={3}
          className="rounded-lg border border-accent-200 p-4 dark:border-accent-700"
        >
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="default" size="sm">
            Small
          </Button>
          <Button variant="default" size="lg">
            Large
          </Button>
          <Button variant="default" disabled>
            Disabled
          </Button>
        </Stack>
      </div>

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">Input</H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ Input }'} from @/components/ui/input
        </p>
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-accent-200 p-4 dark:border-accent-700 md:grid-cols-2">
          <Input label="Label" placeholder="Placeholder text" />
          <Input label="With error" placeholder="Bad value" error="This field is required" />
          <Input placeholder="No label" />
          <Input placeholder="Disabled" disabled />
        </div>
      </div>

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
          Textarea
        </H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ Textarea }'} from @/components/ui/textarea
        </p>
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-accent-200 p-4 dark:border-accent-700 md:grid-cols-2">
          <Textarea label="Notes" placeholder="Enter notes..." />
          <Textarea label="With error" placeholder="..." error="Required" />
        </div>
      </div>

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">Select</H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ Select }'} from @/components/ui/select
        </p>
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-accent-200 p-4 dark:border-accent-700 md:grid-cols-2">
          <Select label="Duration">
            <option>60 min</option>
            <option>90 min</option>
            <option>120 min</option>
          </Select>
          <Select label="With error" error="Please select an option">
            <option value="">Choose...</option>
            <option>Option A</option>
            <option>Option B</option>
          </Select>
          <Select label="Disabled" disabled>
            <option>Unavailable</option>
          </Select>
          <Select>
            <option>No label</option>
          </Select>
        </div>
      </div>

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">Radio</H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ Radio }'} from @/components/ui/radio
        </p>
        <div className="space-y-3 rounded-lg border border-accent-200 p-4 dark:border-accent-700">
          <Radio id="radio-default" name="demo-radio" label="Default radio" value="default" />
          <Radio
            id="radio-checked"
            name="demo-radio"
            label="Checked"
            value="checked"
            defaultChecked
          />
          <Radio
            id="radio-error"
            name="demo-error"
            label="With error"
            value="error"
            error="Please select an option"
          />
          <Radio
            id="radio-disabled"
            name="demo-disabled"
            label="Disabled"
            value="disabled"
            disabled
          />
        </div>
      </div>

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
          PeerRadio
        </H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ PeerRadio }'} from @/components/ui/peer-radio
        </p>
        <div className="space-y-3 rounded-lg border border-accent-200 p-4 dark:border-accent-700">
          <p className="text-xs text-accent-500">
            Bare radio input for CSS peer patterns — no wrapper div. Pair with a sibling label
            driven by <code className="font-mono">peer-checked:</code> utilities.
          </p>
          <div className="flex items-center gap-2">
            <PeerRadio
              id="peer-radio-a"
              name="peer-demo"
              value="a"
              defaultChecked
              className="peer sr-only"
            />
            <label
              htmlFor="peer-radio-a"
              className="cursor-pointer rounded-full bg-accent-200 px-3 py-1 text-xs peer-checked:bg-primary-500 peer-checked:text-white dark:bg-accent-700"
            >
              Option A
            </label>
            <PeerRadio id="peer-radio-b" name="peer-demo" value="b" className="peer sr-only" />
            <label
              htmlFor="peer-radio-b"
              className="cursor-pointer rounded-full bg-accent-200 px-3 py-1 text-xs peer-checked:bg-primary-500 peer-checked:text-white dark:bg-accent-700"
            >
              Option B
            </label>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">Link</H3>
        <p className="mb-3 font-mono text-xs text-accent-400">import Link from @/components/Link</p>
        <div className="space-y-2 rounded-lg border border-accent-200 p-4 dark:border-accent-700">
          <Link
            href="/book"
            className="text-primary-600 underline hover:text-primary-700 dark:text-primary-400"
          >
            Book a session
          </Link>
        </div>
      </div>
    </Section>
  )
}
