import workspacesRoot from 'find-yarn-workspace-root'
import { config as dotenv } from 'dotenv'

export const workspaceDotenv = () => {
  const rootDirectory = workspacesRoot()
  dotenv({ path: `${rootDirectory}/.env` })
}

export function passByRef<Type>(arg: Type): {value: Type} {
  return {value: arg};
}