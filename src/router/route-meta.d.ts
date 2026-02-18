import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Default size for the list panel (percentage 1-100) */
    listPanelSize?: number
    /** Default size for the main panel (percentage 1-100) */
    mainPanelSize?: number
  }
}
