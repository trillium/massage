import Image from 'next/image'
import ContactForm from '@/components/ContactForm'
import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'

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
              <div className="border-primary-500 flex w-full items-center justify-center rounded border-2 bg-gray-200 text-center text-gray-500">
                <Image
                  src="/static/images/service-area.jpg"
                  alt="Los Angeles map"
                  width={600}
                  height={400}
                  className="rounded object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <FaMapMarkerAlt className="text-primary-600 dark:text-primary-400 h-6 w-6" />
                  <span className="dark:text-gray-200">Serving the LA Metro Area</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-primary-600 dark:text-primary-400 h-6 w-6" />
                <span className="dark:text-gray-200">Have questions? Request a call!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
