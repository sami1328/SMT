import TraineeDetailsClient from './TraineeDetailsClient'

export default function TraineeDetails({ params }: { params: { tid: string } }) {
  return <TraineeDetailsClient tid={params.tid} />
} 