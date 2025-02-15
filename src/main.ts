/* eslint-disable vue/no-reserved-component-names */
/* eslint-disable vue/multi-word-component-names */
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import simplifiedChinese from 'primelocale/zh-CN.json'
import App from './App.vue'
import i18n from './i18n'
import router from './router'

// styles
import './style.css'
import 'primeicons/primeicons.css'
import Preset from './preset'

// components from PrimeVue
import {
  AutoComplete,
  Button,
  ButtonGroup,
  Card,
  Column,
  ColumnGroup,
  ConfirmPopup,
  DataTable,
  DatePicker,
  Drawer,
  Dialog,
  InputGroup,
  InputGroupAddon,
  InputNumber,
  InputText,
  Menu,
  Message,
  MultiSelect,
  RadioButton,
  RadioButtonGroup,
  Row,
  Select,
  SelectButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Toast,
} from 'primevue'
import { Form, FormField } from '@primevue/forms'

const app = createApp(App)

// register primevue components
app.component('Form', Form)
app.component('FormField', FormField)
app.component('AutoComplete', AutoComplete)
app.component('Button', Button)
app.component('ButtonGroup', ButtonGroup)
app.component('Card', Card)
app.component('ConfirmPopup', ConfirmPopup)
app.component('Dialog', Dialog)
app.component('DataView', DataView)
app.component('DatePicker', DatePicker)
app.component('Drawer', Drawer)
app.component('InputText', InputText)
app.component('Message', Message)
app.component('Menu', Menu)
app.component('RadioButton', RadioButton)
app.component('RadioButtonGroup', RadioButtonGroup)
app.component('SelectButton', SelectButton)
app.component('Tag', Tag)
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
    theme: {
      preset: Preset,
      options: {
        darkModeSelector: '.dark',
      },
    },
    locale: simplifiedChinese['zh-CN'],
  })
  .use(ConfirmationService)
  .use(ToastService)
  .use(router)
  .use(i18n)
  .mount('#app')
