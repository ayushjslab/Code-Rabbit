import Logout from '../module/auth/components/logout';
import { requireAuth } from '../module/auth/utils/auth-utils'

const Home = async () => {
  await requireAuth();
  return (
    <div>
      <Logout>
        <button>logout</button>
      </Logout>
    </div>
  )
}

export default Home