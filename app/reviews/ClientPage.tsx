import ReviewCard from 'components/ReviewCard/ReviewCard'
import BookSessionButton from 'components/BookSessionButton'

export default function About() {
  return (
    <div className="flex flex-col items-center">
      <ReviewCard />
      <BookSessionButton title="Book a Session!" href="/book" />
    </div>
  )
}
