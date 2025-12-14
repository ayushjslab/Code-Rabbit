import { redirect } from 'next/navigation';
import { requireAuth } from '../module/auth/utils/auth-utils'

const Home = async () => {
  await requireAuth();
  return redirect(`/dashboard`)
}

export default Home