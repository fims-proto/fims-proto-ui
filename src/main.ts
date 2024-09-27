/* eslint-disable vue/no-reserved-component-names */
/* eslint-disable vue/multi-word-component-names */
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import simplifiedChinese from 'primelocale/zh-CN.json'

// @ts-expect-error TS7016
import Aura from './presets/aura'
import './style.css'
import 'primeicons/primeicons.css'

import AutoComplete from 'primevue/autocomplete'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ConfirmPopup from 'primevue/confirmpopup'
import Dialog from 'primevue/dialog'
import DataView from 'primevue/dataview'
import DatePicker from 'primevue/datepicker'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Toast from 'primevue/toast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'

const app = createApp(App)

// register primevue components
app.component('AutoComplete', AutoComplete)
app.component('Button', Button)
app.component('Card', Card)
app.component('ConfirmPopup', ConfirmPopup)
app.component('Dialog', Dialog)
app.component('DataView', DataView)
app.component('DatePicker', DatePicker)
app.component('InputText', InputText)
app.component('Menu', Menu)
app.component('Menubar', Menubar)
app.component('Toast', Toast)
app.component('InputGroup', InputGroup)
app.component('InputGroupAddon', InputGroupAddon)
app.component('InputNumber', InputNumber)
app.component('Tabs', Tabs)
app.component('TabList', TabList)
app.component('Tab', Tab)
app.component('TabPanels', TabPanels)
app.component('TabPanel', TabPanel)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('ColumnGroup', ColumnGroup)
app.component('Row', Row)
app.component('Select', Select)
app.component('MultiSelect', MultiSelect)

app
  .use(PrimeVue, {
    unstyled: true,
    pt: Aura,
    locale: simplifiedChinese['zh-CN'],
  })
  .use(ConfirmationService)
  .use(ToastService)
  .use(router)
  .use(i18n)
  .mount('#app')
