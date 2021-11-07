# Vue 3 + Typescript + Vite

This template should help get you started developing with Vue 3 and Typescript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can enable Volar's `.vue` type support plugin by running `Volar: Switch TS Plugin on/off` from VSCode command palette.

# fims-proto-ui
## Local dev steps:
1. in fims-proto-ms folder, start postgres with `docker compose up -build`
2. in fims-proto-ms folder, start fims backend service with `go run cmd/main.go`, running at port `5002`
3. in [fims-iap-dev](https://github.com/fims-proto/fims-iap-dev) folder, start ory/oathkeeper with `docker compose up -build`, running at port `4455`
4. in fims-proto-ui folder, start vite in 'dev' mode with `npm run dev`, running at port `5001`
5. Open [`http://127.0.0.1:4455/ui/`](http://127.0.0.1:4455/ui/), ready to go :)

为了开发环境的简单便捷，目前 local dev 环境暂不引入权鉴 (ory/kratos).   

## Frontend
Port `5001` is used in local dev environment: `http://127.0.0.1:5001`.  

## Backend
Port `4455` is exposed by ory/oathkeeper as reverse proxy, acting as single entry point.  
To access:
- fims backend API, use `http://127.0.0.1:4455/fims/**`
- fims frontend, use `http://127.0.0.1:4455/ui/**`

## Swagger UI
After starting fims-proto-ms, visit [`http://127.0.0.1:4455/fims/swagger/index.html`](http://127.0.0.1:4455/fims/swagger/index.html).  

## Postman test
Import [postman collection](https://github.com/fims-proto/fims-proto-ms/tree/master/pm_collection) into Postman app
