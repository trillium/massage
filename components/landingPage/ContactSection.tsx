import CachedTileMap from '@/components/CachedTileMap'
import ContactForm from '@/components/ContactForm'
import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { createContactUrl } from '@/lib/helpers'
import Link from '@/components/Link'

export default function ContactSection() {
  return (
    <section className="dark:bg-grey-950 flex w-full flex-col items-center">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl dark:text-white">
          Contact Us
        </h2>
        <div className="flex flex-col gap-6 rounded-lg bg-white px-4 py-8 shadow sm:px-8 dark:bg-gray-800 dark:shadow-lg">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <ContactForm />
            <div className="flex flex-col justify-center space-y-4">
              <h2 className="text-center text-3xl font-bold md:text-4xl dark:text-white">
                Trillium Massage
              </h2>
              <CachedTileMap
                latitude={33.99}
                longitude={-118.4}
                zoom={10}
                className="border-primary-500"
                style={{ width: '100%', height: '400px' }}
                showMarker={false}
              />
              <div>
                <div className="flex items-center gap-4">
                  <FaMapMarkerAlt className="text-primary-600 dark:text-primary-400 h-6 w-6" />
                  <span className="dark:text-gray-200">Serving the LA Metro Area</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-primary-600 dark:text-primary-400 h-6 w-6" />
                <Link href={createContactUrl(`Informational Callback Request`)} classes="">
                  <span className="dark:text-gray-200">Have questions? Request a call!</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
