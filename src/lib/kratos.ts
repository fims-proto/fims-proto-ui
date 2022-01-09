import { Configuration, V0alpha2Api } from '@ory/kratos-client'
import { KRATOS_URL } from '../config'

export const kratos = new V0alpha2Api(
  new Configuration({
    basePath: KRATOS_URL,
    baseOptions: {
      withCredentials: true
    }
  })
)