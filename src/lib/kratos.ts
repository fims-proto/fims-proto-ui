import { Configuration, FrontendApi } from '@ory/kratos-client'
import { KRATOS_URL } from '../config'

export const kratos = new FrontendApi(
  new Configuration({
    basePath: KRATOS_URL,
    baseOptions: {
      withCredentials: true,
    },
  })
)
