import AboutCard from "@/components/AboutCard"
import BookSessionButton from "@/components/BookSessionButton"

export default function About({}) {
  return (
    <div className="flex flex-col items-center">
      <AboutCard />
      <BookSessionButton title="Book a Session!" href="/" />
    </div>
  )
}
