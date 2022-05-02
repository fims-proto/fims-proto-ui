import { useSobStore } from '../store/sob'

const sobStore = useSobStore()

export default (route: any) => {
  const sobId = route.params['sobId'] as string
  const foundSob = sobStore.state.sobs.find(sob => sob.id === sobId)
  if (!foundSob) {
    throw new Error('sobResolver, sob not found')
  }
  return {
    sob: foundSob,
    periodId: route.params['periodId'] as string
  }
}