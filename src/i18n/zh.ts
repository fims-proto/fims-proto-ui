export default {

  lang: {
    en: 'English',
    zh: '中文',
  },

  common: {
    greeting: '你好~ {0} {1}',
    emptyContent: '什么也没有',
    description: '描述',
    year: '年',
    month: '月',
  },

  action: {
    create: '新建',
    saveAndNew: '保存并新增',
    save: '保存',
    submit: '提交',
    close: '关闭',
  },

  user: {
    email: 'E-Mail',
    password: '密码',
    firstname: '名字',
    lastname: '姓氏',
    emailInputPlaceholder: '请输入 E-Mail 地址',
    passwordInputPlaceholder: '请输入密码',
    firstnameInputPlaceholder: '请输入名字',
    lastnameInputPlaceholder: '请输入姓氏',
    login: '登入',
    logout: '登出',
  },

  profile: {
    title: "更新资料",
    subtitle: "支持用户资料和密码的更新",
    updateProfile: '更新资料',
    updatePassword: '更新密码',
  },

  sob: {
    title: '账套',
    subtitle: '一个账套对应企业的一个分部, 或是子公司',
    name: '公司名称',
    baseCurrency: '本位币',
    startingPeriod: '启用期间',
    accountCodeLength: '科目级次编码长度',
    selectSob: '请选择工作账套',
    manageSob: '账套管理',
    current: '当前',
    creation: {
      title: '新建账套'
    },
    detail: {
      basic: '基本信息',
      accounts: '科目设置'
    }
  },

  voucher: {
    title: '凭证',
    summary: '摘要',
    account: '会计科目',
    debit: '借方金额',
    credit: '贷方金额',
    total: '合计',
    type: '记账凭证',
    attachmentQuantity: '附单据',
    attachmentQuantityUnit: '张',
    transactionTime: '交易日期: {0}',
    creator: '制单人: {lastName}{firstName}',
    creation: {
      title: '新建凭证'
    }
  },

  ledger: {
    title: '账簿',
    periodUnselected: '未选择财务周期',
    createPeriod: '创建账期',
    accountTitle: '科目',
    accountNumber: '科目编号',
    openingBalance: '期初余额',
    endingBalance: '期末余额',
    debit: '借',
    credit: '贷'
  }
}