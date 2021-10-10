import { SelfServiceLoginFlow, SuccessfulSelfServiceLoginWithoutBrowser } from "@ory/kratos-client";

export type SubmitLoginResult = {
  data?: SuccessfulSelfServiceLoginWithoutBrowser,
  flow?: SelfServiceLoginFlow,
  error?: Error
}