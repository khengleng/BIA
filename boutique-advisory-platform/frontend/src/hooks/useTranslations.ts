'use client'

import { useState, useEffect } from 'react'

// Inline translations to avoid Turbopack HMR issues with JSON imports
const translations = {
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      submit: "Submit",
      back: "Back",
      next: "Next",
      previous: "Previous",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      actions: "Actions",
      status: "Status",
      createdAt: "Created At",
      updatedAt: "Updated At"
    },
    navigation: {
      dashboard: "Dashboard",
      smes: "SMEs",
      investors: "Investors",
      deals: "Deals",
      advisory: "Advisory",
      reports: "Reports",
      settings: "Settings",
      profile: "Profile",
      logout: "Logout"
    },
    auth: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      firstName: "First Name",
      lastName: "Last Name",
      forgotPassword: "Forgot Password?",
      rememberMe: "Remember Me",
      loginSuccess: "Login successful",
      loginError: "Login failed",
      registerSuccess: "Registration successful",
      registerError: "Registration failed"
    },
    home: {
      hero: {
        title: "Bridging",
        sme: "SMEs",
        and: "and",
        investors: "Investors",
        description: "A comprehensive platform connecting Small and Medium Enterprises with qualified investors, featuring advanced DID integration, multi-tenant architecture, and professional advisory services.",
        getStarted: "Get Started",
        viewDemo: "View Demo"
      },
      features: {
        sme: {
          title: "SME Platform",
          description: "Connect SMEs with investors through our comprehensive platform"
        },
        investor: {
          title: "Investor Portal",
          description: "Find and invest in verified SMEs with transparent processes"
        },
        advisory: {
          title: "Advisory Services",
          description: "Professional advisory services for investment readiness"
        },
        security: {
          title: "Security & Compliance",
          description: "Multi-tenant architecture with DID-based authentication"
        },
        analytics: {
          title: "Analytics & Reporting",
          description: "Comprehensive dashboards and performance tracking"
        }
      }
    }
  },
  km: {
    common: {
      loading: "កំពុងផ្ទុក...",
      error: "កំហុស",
      success: "ជោគជ័យ",
      save: "រក្សាទុក",
      cancel: "បោះបង់",
      delete: "លុប",
      edit: "កែប្រែ",
      view: "មើល",
      submit: "ដាក់ស្នើ",
      back: "ត្រឡប់",
      next: "បន្ទាប់",
      previous: "មុន",
      search: "ស្វែងរក",
      filter: "ត្រង",
      sort: "តម្រៀប",
      actions: "សកម្មភាព",
      status: "ស្ថានភាព",
      createdAt: "បង្កើតនៅថ្ងៃទី",
      updatedAt: "ធ្វើបច្ចុប្បន្នភាពនៅថ្ងៃទី"
    },
    navigation: {
      dashboard: "ផ្ទាំងគ្រប់គ្រង",
      smes: "សហគ្រាសតូចនិងមធ្យម",
      investors: "អ្នកវិនិយោគ",
      deals: "កិច្ចព្រមព្រៀង",
      advisory: "ណែនាំ",
      reports: "របាយការណ៍",
      settings: "ការកំណត់",
      profile: "ប្រវត្តិរូប",
      logout: "ចាកចេញ"
    },
    auth: {
      login: "ចូល",
      register: "ចុះឈ្មោះ",
      email: "អ៊ីមែល",
      password: "ពាក្យសម្ងាត់",
      confirmPassword: "បញ្ជាក់ពាក្យសម្ងាត់",
      firstName: "ឈ្មោះ",
      lastName: "នាមត្រកូល",
      forgotPassword: "ភ្លេចពាក្យសម្ងាត់?",
      rememberMe: "ចងចាំខ្ញុំ",
      loginSuccess: "ចូលបានជោគជ័យ",
      loginError: "ចូលបរាជ័យ",
      registerSuccess: "ចុះឈ្មោះបានជោគជ័យ",
      registerError: "ចុះឈ្មោះបរាជ័យ"
    },
    home: {
      hero: {
        title: "ការតភ្ជាប់",
        sme: "សហគ្រាសតូចនិងមធ្យម",
        and: "និង",
        investors: "អ្នកវិនិយោគ",
        description: "វេទិកាប្រកបដោយភាពទូលំទូលសម្រាប់ភ្ជាប់សហគ្រាសតូចនិងមធ្យមជាមួយអ្នកវិនិយោគដែលមានលក្ខណៈសម្បត្តិ ដែលមានការតភ្ជាប់ DID កម្រិតខ្ពស់ នីតិវិធីអតិថិជនច្រើន និងសេវាកម្មណែនាំវិជ្ជាជីវៈ។",
        getStarted: "ចាប់ផ្តើម",
        viewDemo: "មើលឧទាហរណ៍"
      },
      features: {
        sme: {
          title: "វេទិកាសហគ្រាសតូចនិងមធ្យម",
          description: "ភ្ជាប់សហគ្រាសតូចនិងមធ្យមជាមួយអ្នកវិនិយោគតាមរយៈវេទិកាប្រកបដោយភាពទូលំទូលរបស់យើង"
        },
        investor: {
          title: "វិបផតថលអ្នកវិនិយោគ",
          description: "ស្វែងរកនិងវិនិយោគក្នុងសហគ្រាសតូចនិងមធ្យមដែលបានផ្ទៀងផ្ទាត់ជាមួយនីតិវិធីភាពថ្លា"
        },
        advisory: {
          title: "សេវាកម្មណែនាំ",
          description: "សេវាកម្មណែនាំវិជ្ជាជីវៈសម្រាប់ការត្រៀមខ្លួនវិនិយោគ"
        },
        security: {
          title: "សុវត្ថិភាព និងការអនុលោមតាម",
          description: "នីតិវិធីអតិថិជនច្រើនជាមួយការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ៍ផ្អែកលើ DID"
        },
        analytics: {
          title: "ការវិភាគ និងរបាយការណ៍",
          description: "ផ្ទាំងគ្រប់គ្រងប្រកបដោយភាពទូលំទូល និងការតាមដានដំណើរការ"
        }
      }
    }
  },
  zh: {
    common: {
      loading: "加载中...",
      error: "错误",
      success: "成功",
      save: "保存",
      cancel: "取消",
      delete: "删除",
      edit: "编辑",
      view: "查看",
      submit: "提交",
      back: "返回",
      next: "下一步",
      previous: "上一步",
      search: "搜索",
      filter: "筛选",
      sort: "排序",
      actions: "操作",
      status: "状态",
      createdAt: "创建时间",
      updatedAt: "更新时间"
    },
    navigation: {
      dashboard: "仪表板",
      smes: "中小企业",
      investors: "投资者",
      deals: "交易",
      advisory: "咨询",
      reports: "报告",
      settings: "设置",
      profile: "个人资料",
      logout: "退出登录"
    },
    auth: {
      login: "登录",
      register: "注册",
      email: "邮箱",
      password: "密码",
      confirmPassword: "确认密码",
      firstName: "名字",
      lastName: "姓氏",
      forgotPassword: "忘记密码？",
      rememberMe: "记住我",
      loginSuccess: "登录成功",
      loginError: "登录失败",
      registerSuccess: "注册成功",
      registerError: "注册失败"
    },
    home: {
      hero: {
        title: "连接",
        sme: "中小企业",
        and: "和",
        investors: "投资者",
        description: "一个连接中小企业和合格投资者的综合平台，具有先进的DID集成、多租户架构和专业咨询服务。",
        getStarted: "开始使用",
        viewDemo: "查看演示"
      },
      features: {
        sme: {
          title: "中小企业平台",
          description: "通过我们的综合平台连接中小企业和投资者"
        },
        investor: {
          title: "投资者门户",
          description: "通过透明流程寻找和投资经过验证的中小企业"
        },
        advisory: {
          title: "咨询服务",
          description: "投资准备的专业咨询服务"
        },
        security: {
          title: "安全和合规",
          description: "具有基于DID身份验证的多租户架构"
        },
        analytics: {
          title: "分析和报告",
          description: "综合仪表板和性能跟踪"
        }
      }
    }
  }
}

export function useTranslations() {
  const [currentLanguage, setCurrentLanguage] = useState('en')

  useEffect(() => {
    // Get language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en'
    setCurrentLanguage(savedLanguage)

    // Listen for language changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleLanguageChange = (e: CustomEvent<any>) => {
      setCurrentLanguage(e.detail.language)
    }

    window.addEventListener('languageChanged', handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener)
    }
  }, [])

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.')
    let value = translations[currentLanguage as keyof typeof translations]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value = (value as any)[k]
      } else {
        return fallback || key
      }
    }

    return (value as unknown as string) || fallback || key
  }

  return { t, currentLanguage }
}
