import { Configuration, IdentityApi } from '@ory/kratos-client'
import { KRATOS_URL } from '../config'

export const kratos = new IdentityApi(
  new Configuration({
    basePath: KRATOS_URL,
    baseOptions: {
      withCredentials: true,
    },
  })
)
