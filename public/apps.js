// Every Wareef system shown on the landing page. To add a service, add one entry here.
// `url` may be overridden at deploy time by the server (see /config.js): TEAM_URL, AZWO_URL, ...
// status: 'live' (opens) | 'soon' (shown, not clickable)

export const APPS = [
  {
    id: 'team',
    name: 'فريق وريف',
    en: 'WAREEF TEAM',
    tagline: 'إدارة الفريق والعمليات اليومية',
    description: 'بصمة حضور وانصراف محمية من التلاعب، وخصومات وسلف ومسيّر رواتب، وتسجيل يومي للطلبات والشحنات والمرتجعات، وتذاكر لملاحظات الموظفين وإنجازاتهم.',
    features: ['حضور وانصراف وتأخير', 'كشف التلاعب', 'الخصومات والسلف', 'الطلبات حسب القناة', 'تقرير يومي وتصدير'],
    icon: 'img/logo-mark.png',
    status: 'live',
    url: '',
    env: 'TEAM_URL',
  },
  {
    id: 'azwo',
    name: 'عزو',
    en: 'AZWO',
    tagline: 'الإسناد التسويقي الموحّد',
    description: 'يأخذ مبيعات المتجر الحقيقية مصدراً وحيداً للحقيقة، ويوزّع كل بيعة مرة واحدة على المنصات الإعلانية، ويضعها جنب ما تدّعيه كل منصة.',
    features: ['الحقيقة مقابل ادعاء المنصات', 'ROAS الحقيقي', '6 نماذج إسناد', 'رحلة العميل عبر الأجهزة', 'المزيج التسويقي'],
    icon: 'img/azwo-mark.svg',
    status: 'live',
    url: 'https://azwo-production.up.railway.app/app',
    env: 'AZWO_URL',
  },
  {
    id: 'next',
    name: 'خدمات قادمة',
    en: 'COMING SOON',
    tagline: 'المنظومة تكبر',
    description: 'أنظمة جديدة تنضم هنا تباعاً، بنفس الهوية ونفس الدخول السهل.',
    features: [],
    icon: '',
    status: 'soon',
    url: '',
  },
];
