"use client"
import FAQCard from "@/components/FAQCard"
import BookSessionButton from "@/components/BookSessionButton"

export default function About({}) {
  return (
    <div className="flex flex-col items-center">
      <FAQCard />
      <BookSessionButton title="Book a Session!" href="/" />
    </div>
  )
}
