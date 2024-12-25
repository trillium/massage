import Image from "./Image"
// import SocialIcon from '@/components/social-icons'
import siteMetadata from "@/data/siteMetadata"
import SocialIcon from "@/components/social-icons"
import Link from "next/link"

const AuthorCard = () => {
  const {
    author,
    avatar,
    occupation,
    company,
    email,
    twitter,
    linkedin,
    github,
    location,
    instagram,
  } = siteMetadata
  return (
    <div>
      <div className="flex flex-row items-center justify-center space-x-2 pb-2">
        {avatar && (
          <div className="pr-2 xl:pr-4">
            <Image
              src={avatar}
              alt="avatar"
              width={224}
              height={224}
              className="h-48 w-48 min-w-48 rounded-full md:h-52 md:w-52 border-2 border-primary-400"
            />
          </div>
        )}
        <div>
          <h3 className="pb-2 pt-4 text-2xl font-bold leading-8 tracking-tight sm:text-3xl md:text-4xl">
            {author}
          </h3>
          <div className="md:text-md text-base text-gray-500 dark:text-gray-400">
            {occupation}
          </div>
          <div className="md:text-md text-base text-gray-500 dark:text-gray-400">
            {company}
          </div>
          <div className="md:text-md text-base text-gray-500 dark:text-gray-400">
            {location}
          </div>
          <div className="flex space-x-3 pt-6">
            <SocialIcon kind="mail" href={`mailto:${email}`} />
            <SocialIcon kind="instagram" href={instagram} />
          </div>
        </div>
      </div>
      <div className="flex max-w-full flex-col items-center justify-center">
        <div className="prose max-w-full pb-8 pt-10 dark:prose-invert xl:text-xl">
          <p className="py-2 text-justify">
            Trillium is a seasoned massage therapist with over a decade of
            experience, based in Los Angeles. Specializing in combining
            relaxation and pain relief techniques, Trillium provides you with
            effective massage therapy from the comfort of your own home. With
            with more than 3,000 in-home massage therapy sessions, Trillium has
            maintained a{" "}
            <Link
              className="font-bold text-primary-500 dark:text-primary-400 underline-offset-0 hover:underline hover:scale-105 transition-transform duration-300"
              href={"/reviews"}>
              4.9-star rating
            </Link>
            , reflecting the quality and care he puts into his work.
          </p>

          <p className="py-2 text-justify">
            In addition to massage services, Trillium offer Couple&#39;s Massage
            Workshops upon request. These workshops focus on simple,
            comfortable, effective ways to provide massage.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthorCard
