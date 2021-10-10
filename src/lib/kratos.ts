import { Configuration, V0alpha1Api } from '@ory/kratos-client'
import { KRATOS_URL } from '../config'

export const kratos = new V0alpha1Api(
  new Configuration({
    basePath: KRATOS_URL
  })
)