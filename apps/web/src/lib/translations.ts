import type { Locale } from './i18n';

/**
 * Default UI translations shipped with the app.
 * Admin overrides (saved as `text.{key}.{locale}` in settings) take priority,
 * but if nothing is set, these defaults are used so the site is always fully translated.
 *
 * Excluded from translation:
 *   - Game names (Mobile Legends, Free Fire, PUBG, …)
 *   - Brand / technical terms (KHQR, ABA, ACLEDA, Wing, Chip Mong, Visa, Bakong, Stripe, SSL, PCI-DSS, USD)
 *   - Item / currency names from DB (Diamonds, Genesis Crystals, UC)
 *   - Numbers, prices, currency symbols
 */
export const TRANSLATIONS: Record<string, Record<Locale, string>> = {
  // ── Hero / homepage ──────────────────────────────────────────────────────
  heroBadge:        { en: '✦ Limited · Diamond Friday',                                                   km: '✦ កំណត់ · ថ្ងៃសុក្រពេជ្រ' },
  heroTitle:        { en: 'Top up your favorite games in seconds.',                                       km: 'បញ្ចូលទឹកប្រាក់ហ្គេមដែលអ្នកចូលចិត្តក្នុងរយៈពេលប៉ុន្មានវិនាទី។' },
  heroSubtitle:     { en: 'Direct delivery or instant code redemption. KHQR, bank transfer, and cards accepted.', km: 'ដឹកជញ្ជូនផ្ទាល់ ឬប្តូរកូដភ្លាមៗ។ ទទួលយក KHQR ការផ្ទេរប្រាក់តាមធនាគារ និងកាត។' },
  heroStatGames:    { en: 'Games & services',                                                              km: 'ហ្គេម និងសេវាកម្ម' },
  heroStatDelivery: { en: 'Avg delivery',                                                                  km: 'ការដឹកជញ្ជូនជាមធ្យម' },
  heroStatRating:   { en: '50k+ reviews',                                                                  km: '50k+ ការវាយតម្លៃ' },

  // ── Mobile header / search ───────────────────────────────────────────────
  greeting:           { en: 'Hi, there 👋',                       km: 'សួស្តី 👋' },
  greetingPrompt:     { en: 'What are you topping up?',           km: 'តើអ្នកនឹងបញ្ចូលទឹកប្រាក់អ្វី?' },
  searchPlaceholder:  { en: 'Mobile Legends, Free Fire, Spotify…', km: 'Mobile Legends, Free Fire, Spotify…' },
  searchPlaceholderDesktop: { en: 'Search games, subscriptions, gift cards…', km: 'ស្វែងរកហ្គេម ការជាវ កាតអំណោយ…' },

  // ── Home / catalog ───────────────────────────────────────────────────────
  trending:    { en: 'Trending',     km: 'កំពុងពេញនិយម' },
  trendingNow: { en: 'Trending now', km: 'កំពុងពេញនិយមឥឡូវ' },
  resultsFor:  { en: 'Results for',  km: 'លទ្ធផលសម្រាប់' },
  itemsCount:  { en: 'items',        km: 'ធាតុ' },
  noMatches:   { en: 'No matches',   km: 'គ្មានលទ្ធផល' },
  categoryAll: { en: 'All',          km: 'ទាំងអស់' },

  // ── Top nav (desktop) ────────────────────────────────────────────────────
  browse:     { en: 'Browse',     km: 'រុករក' },
  promotions: { en: 'Promotions', km: 'ការផ្តល់ជូន' },
  help:       { en: 'Help',       km: 'ជំនួយ' },
  admin:      { en: '⚙️ Admin',  km: '⚙️ អ្នកគ្រប់គ្រង' },

  // ── Bottom tabs (mobile) ─────────────────────────────────────────────────
  tabHome:    { en: 'Home',    km: 'ដើម' },
  tabDeals:   { en: 'Deals',   km: 'ការផ្តល់ជូន' },
  tabOrders:  { en: 'Orders',  km: 'ការបញ្ជាទិញ' },
  tabAccount: { en: 'Account', km: 'គណនី' },

  // ── Common buttons / actions ─────────────────────────────────────────────
  signIn:        { en: 'Sign in',         km: 'ចូល' },
  signOut:       { en: 'Sign out',        km: 'ចេញ' },
  createAccount: { en: 'Create account',  km: 'បង្កើតគណនី' },
  signingIn:     { en: 'Signing in…',     km: 'កំពុងចូល…' },
  creating:      { en: 'Creating…',       km: 'កំពុងបង្កើត…' },
  signInToAccount:  { en: 'Sign in to your Top-up account',    km: 'ចូលទៅក្នុងគណនី Top-up របស់អ្នក' },
  registerSubtitle: { en: 'Start topping up in 30 seconds',    km: 'ចាប់ផ្តើមបញ្ចូលទឹកប្រាក់ក្នុង 30 វិនាទី' },
  emailOrPhone:  { en: 'Email or phone',  km: 'អ៊ីមែល ឬលេខទូរស័ព្ទ' },
  email:         { en: 'Email',           km: 'អ៊ីមែល' },
  password:      { en: 'Password',        km: 'ពាក្យសម្ងាត់' },
  fullName:      { en: 'Full name',       km: 'ឈ្មោះពេញ' },
  phone:         { en: 'Phone',           km: 'លេខទូរស័ព្ទ' },
  phoneOptional: { en: 'Phone (optional)',km: 'លេខទូរស័ព្ទ (ស្រេចចិត្ត)' },
  passwordHint:  { en: '8+ characters',   km: '8+ តួអក្សរ' },
  alreadyHaveAccount: { en: 'Already have an account?', km: 'មានគណនីរួចហើយ?' },
  noAccountYet:  { en: "Don't have an account?",        km: 'មិនទាន់មានគណនី?' },
  save:          { en: 'Save',            km: 'រក្សាទុក' },
  saving:        { en: 'Saving…',         km: 'កំពុងរក្សាទុក…' },
  processing:    { en: 'Processing…',     km: 'កំពុងដំណើរការ…' },
  cancel:        { en: 'Cancel',          km: 'បោះបង់' },
  confirm:       { en: 'Confirm',         km: 'បញ្ជាក់' },
  close:         { en: 'Close',           km: 'បិទ' },
  copy:          { en: 'Copy',            km: 'ចម្លង' },
  copied:        { en: 'Copied!',         km: 'បានចម្លង!' },
  share:         { en: '↗ Share',         km: '↗ ចែករំលែក' },
  shared:        { en: '✓ Shared!',       km: '✓ បានចែករំលែក!' },
  saveImage:     { en: '⬇ Save',          km: '⬇ រក្សាទុក' },
  open:          { en: 'Open',            km: 'បើក' },
  please:        { en: 'Please',          km: 'សូម' },
  at:            { en: 'at',              km: 'នៅ' },

  // ── Detail page (product) ────────────────────────────────────────────────
  directTopup:         { en: 'Direct top-up',                                       km: 'បញ្ចូលទឹកប្រាក់ផ្ទាល់' },
  directTopupSub:      { en: 'Sent to your account',                                km: 'ផ្ញើទៅគណនីរបស់អ្នក' },
  getACode:            { en: 'Get a code',                                          km: 'ទទួលកូដ' },
  redeemInGame:        { en: 'Redeem in-game',                                      km: 'ប្តូរក្នុងហ្គេម' },
  gameUserId:          { en: 'Game User ID',                                        km: 'លេខសម្គាល់អ្នកប្រើហ្គេម' },
  zoneLabel:           { en: 'Zone',                                                km: 'តំបន់' },
  zoneIdLabel:         { en: 'Zone ID',                                             km: 'លេខតំបន់' },
  voucherCode:         { en: 'Voucher code',                                        km: 'កូដវ៉ោឆឺរ' },
  account:             { en: 'Account',                                             km: 'គណនី' },
  popular:             { en: 'Popular',                                             km: 'ពេញនិយម' },
  best:                { en: 'Best',                                                km: 'ល្អបំផុត' },
  verified:            { en: 'Verified:',                                           km: 'បានផ្ទៀងផ្ទាត់៖' },
  verifying:           { en: 'Verifying account…',                                  km: 'កំពុងផ្ទៀងផ្ទាត់គណនី…' },
  accountNotFound:     { en: 'Account not found. Check ID & Zone.',                 km: 'រកមិនឃើញគណនី។ ពិនិត្យលេខសម្គាល់ និងតំបន់។' },
  username:            { en: 'Username',                                            km: 'ឈ្មោះអ្នកប្រើ' },
  codeDeliveryNotice:  { en: 'ℹ Redeem code delivered after payment.',              km: 'ℹ កូដនឹងផ្ញើបន្ទាប់ពីបង់ប្រាក់។' },
  choose:              { en: 'Choose',                                              km: 'ជ្រើសរើស' },
  paymentMethod:       { en: '💳 Payment method',                                  km: '💳 វិធីបង់ប្រាក់' },
  directBankLabel:     { en: 'Direct Bank',                                         km: 'ផ្ទេរធនាគារផ្ទាល់' },
  visaMastercard:      { en: 'Visa / Mastercard',                                   km: 'Visa / Mastercard' },
  creditOrDebitCard:   { en: 'Credit or debit card',                                km: 'កាតឥណទាន ឬឥណពន្ធ' },
  scanWithCambodianBank:{ en: 'Scan with any Cambodian bank app',                    km: 'ស្កេនជាមួយកម្មវិធីធនាគារកម្ពុជាណាមួយ' },
  selectPackageAbove:  { en: 'Select a package above',                              km: 'ជ្រើសរើសកញ្ចប់ខាងលើ' },
  diamondsDirectInfo:  { en: 'Diamonds sent directly to your account.',             km: 'ផ្ញើតាមផ្ទាល់ទៅគណនីរបស់អ្នក។' },
  codeDeliveryInfo:    { en: 'Redeem code delivered after payment.',                km: 'កូដនឹងផ្ញើបន្ទាប់ពីបង់ប្រាក់។' },
  gameUserIdHint:      { en: 'Profile → User ID inside the game',                   km: 'ប្រវត្តិរូប → លេខសម្គាល់ក្នុងហ្គេម' },
  khqrReadyTap:        { en: 'KHQR ready — tap to view & pay',                      km: 'KHQR រួចរាល់ — ចុចដើម្បីមើល និងបង់ប្រាក់' },
  safeBadge:           { en: '🛡 SSL · PCI-DSS · Money-back guarantee',             km: '🛡 SSL · PCI-DSS · ធានាប្រាក់ត្រឡប់' },

  // ── Pay buttons ──────────────────────────────────────────────────────────
  payWithKhqr:    { en: '⬛ Pay with KHQR',  km: '⬛ បង់ដោយ KHQR' },
  payWithBank:    { en: '🏦 Pay with Bank',  km: '🏦 បង់ដោយធនាគារ' },
  payNow:         { en: '🔒 Pay now',        km: '🔒 បង់ឥឡូវនេះ' },
  iVePaidKhqr:    { en: "⬛ I've paid via KHQR", km: '⬛ ខ្ញុំបានបង់ដោយ KHQR' },
  continueToBank: { en: '🏦 Continue to',    km: '🏦 បន្តទៅ' },
  payWithCard:    { en: '🔒 Pay',            km: '🔒 បង់' },

  // ── Payment / KHQR dialogs ───────────────────────────────────────────────
  scanToPay:           { en: 'Scan to pay',                       km: 'ស្កេនដើម្បីបង់' },
  expires:             { en: 'Expires',                           km: 'ផុតកំណត់' },
  expiresIn:           { en: 'Expires in',                        km: 'ផុតកំណត់ក្នុង' },
  scanKhqrApp:         { en: 'Scan with any KHQR app',            km: 'ស្កេនជាមួយកម្មវិធី KHQR ណាមួយ' },
  pickYourBank:        { en: 'Pick your bank',                    km: 'ជ្រើសរើសធនាគាររបស់អ្នក' },
  bankRedirectNotice:  { en: "ℹ You'll be redirected to",         km: 'ℹ អ្នកនឹងត្រូវបានបញ្ជូនទៅ' },
  toConfirm:           { en: 'to confirm',                        km: 'ដើម្បីបញ្ជាក់' },
  youSave:             { en: '🏷 You save',                       km: '🏷 អ្នកបានសន្សំ' },
  savedShort:          { en: '🏷 Saved',                          km: '🏷 បានសន្សំ' },
  including:           { en: 'incl.',                             km: 'រួម' },
  fee:                 { en: 'fee',                               km: 'ថ្លៃសេវា' },
  sslPciBadge:         { en: 'SSL · PCI-DSS',                     km: 'SSL · PCI-DSS' },
  moneyBackGuarantee:  { en: 'Money-back guarantee',              km: 'ធានាប្រាក់ត្រឡប់' },
  choosePayment:       { en: 'Choose payment',                    km: 'ជ្រើសរើសវិធីបង់' },
  cardSecurityNotice:  { en: '🔒 Secured by 3-D Secure 2.0. Card details never touch our servers.', km: '🔒 ការពារដោយ 3-D Secure 2.0។ ព័ត៌មានកាតមិនត្រូវបានរក្សាទុកនៅឡើយទេ។' },
  cardNumber:          { en: 'Card number',                       km: 'លេខកាត' },
  cardholder:          { en: 'Cardholder',                        km: 'ម្ចាស់កាត' },
  expiry:              { en: 'Expiry',                            km: 'កាលបរិច្ឆេទផុតកំណត់' },
  cvc:                 { en: 'CVC',                               km: 'CVC' },
  waitingForPayment:   { en: 'Waiting for payment…',              km: 'កំពុងរង់ចាំការបង់ប្រាក់…' },
  waiting:             { en: 'Waiting…',                          km: 'កំពុងរង់ចាំ…' },
  verifyingPayment:    { en: 'Verifying payment…',                km: 'កំពុងផ្ទៀងផ្ទាត់ការបង់ប្រាក់…' },
  iHavePaidConfirm:    { en: '✓ I have paid — confirm',           km: '✓ ខ្ញុំបានបង់ប្រាក់ — បញ្ជាក់' },
  clickAfterPaid:      { en: '🛡 Click after completing payment in your banking app', km: '🛡 ចុចបន្ទាប់ពីបញ្ចប់ការបង់ប្រាក់ក្នុងកម្មវិធីធនាគារ' },
  khqrInstructions:    { en: 'Open ABA · ACLEDA · Wing · Chip Mong or any KHQR app, scan this code, then enter', km: 'បើក ABA · ACLEDA · Wing · Chip Mong ឬកម្មវិធី KHQR ណាមួយ ស្កេនកូដនេះ បន្ទាប់មកបញ្ចូល' },
  asTheAmount:         { en: 'as the amount.',                    km: 'ជាចំនួនទឹកប្រាក់។' },
  openBankingScan:     { en: 'Open your banking app and scan',    km: 'បើកកម្មវិធីធនាគាររបស់អ្នក និងស្កេន' },
  shareQr:             { en: '↗ Share QR',                        km: '↗ ចែករំលែក QR' },
  saveImageLong:       { en: '⬇ Save image',                      km: '⬇ រក្សាទុករូបភាព' },
  simulateScan:        { en: '🧪 Simulate scan',                  km: '🧪 ក្លែងធ្វើស្កេន' },
  simulateAction:      { en: '🧪 Simulate',                       km: '🧪 ក្លែងធ្វើ' },
  enterLabel:          { en: '💡 Enter',                          km: '💡 បញ្ចូល' },
  transferAmountHint:  { en: 'USD as the transfer amount in your banking app.', km: 'USD ជាចំនួនផ្ទេរក្នុងកម្មវិធីធនាគាររបស់អ្នក។' },

  // ── Success / order page ─────────────────────────────────────────────────
  awaitingPayment:      { en: 'Awaiting payment',     km: 'កំពុងរង់ចាំការបង់ប្រាក់' },
  paymentReceived:      { en: 'Payment received',     km: 'បានទទួលការបង់ប្រាក់' },
  delivering:           { en: 'Delivering…',          km: 'កំពុងដឹកជញ្ជូន…' },
  delivered:            { en: 'Delivered',            km: 'បានដឹកជញ្ជូន' },
  failed:               { en: 'Failed',               km: 'បានបរាជ័យ' },
  refunded:             { en: 'Refunded',             km: 'បានសងវិញ' },
  yourRedeemCode:       { en: 'Your redeem code',     km: 'កូដប្តូររបស់អ្នក' },
  copyCode:             { en: 'Copy code',            km: 'ចម្លងកូដ' },
  redeemCodeHowTo:      { en: '→ Top-up center → Redeem code.', km: '→ មជ្ឈមណ្ឌលបញ្ចូលទឹកប្រាក់ → ប្តូរកូដ។' },
  codeGenerationFailed: { en: 'Code generation failed. Contact support.', km: 'ការបង្កើតកូដបានបរាជ័យ។ ទាក់ទងផ្នែកជំនួយ។' },
  generatingCode:       { en: 'Generating your code…', km: 'កំពុងបង្កើតកូដរបស់អ្នក…' },
  directDelivery:       { en: 'Direct delivery',       km: 'ការដឹកជញ្ជូនផ្ទាល់' },
  toId:                 { en: '→ ID',                  km: '→ លេខសម្គាល់' },
  zonePrefix:           { en: '· Zone',                km: '· តំបន់' },
  deliveryInProgress:   { en: 'Delivery in progress…', km: 'ការដឹកជញ្ជូនកំពុងដំណើរការ…' },
  deliveredConfirm:     { en: '✓ delivered',           km: '✓ បានដឹកជញ្ជូន' },
  deliveryFailedRefund: { en: '✕ Delivery failed — refund initiated', km: '✕ ការដឹកជញ្ជូនបានបរាជ័យ — កំពុងសងវិញ' },
  allDone:              { en: 'All done!',             km: 'រួចរាល់ទាំងអស់!' },
  paymentSuccessful:    { en: 'Payment successful',    km: 'ការបង់ប្រាក់ជោគជ័យ' },
  paymentFailed:        { en: 'Payment failed',        km: 'ការបង់ប្រាក់បរាជ័យ' },
  order:                { en: 'Order',                 km: 'ការបញ្ជាទិញ' },
  receipt:              { en: 'Receipt',               km: 'វិក័យបត្រ' },
  item:                 { en: 'Item',                  km: 'ធាតុ' },
  packageLabel:         { en: 'Package',               km: 'កញ្ចប់' },
  method:               { en: 'Method',                km: 'វិធីសាស្ត្រ' },
  serviceFee:           { en: 'Service fee',           km: 'ថ្លៃសេវា' },
  paid:                 { en: 'Paid',                  km: 'បានបង់' },
  receiptEmailNotice:   { en: '🧾 A receipt was sent to your email.', km: '🧾 វិក័យបត្រត្រូវបានផ្ញើទៅអ៊ីមែលរបស់អ្នក។' },
  allOrders:            { en: 'All orders',            km: 'ការបញ្ជាទិញទាំងអស់' },
  topUpAgain:           { en: 'Top up again',          km: 'បញ្ចូលទឹកប្រាក់ម្តងទៀត' },
  viewAllOrders:        { en: 'View all orders',       km: 'មើលការបញ្ជាទិញទាំងអស់' },

  // ── Account / orders ─────────────────────────────────────────────────────
  notSignedIn:        { en: "You're not signed in.",                            km: 'អ្នកមិនទាន់បានចូល។' },
  toViewOrders:       { en: 'to view orders.',                                  km: 'ដើម្បីមើលការបញ្ជាទិញ។' },
  orderHistory:       { en: 'Order history',                                    km: 'ប្រវត្តិការបញ្ជាទិញ' },
  viewPastTopups:     { en: 'View past top-ups',                                km: 'មើលការបញ្ចូលទឹកប្រាក់ពីមុន' },
  savedGameIds:       { en: 'Saved Game IDs',                                   km: 'លេខសម្គាល់ហ្គេមដែលបានរក្សាទុក' },
  quickFillCheckout:  { en: 'Quick fill on checkout',                           km: 'បំពេញរហ័សពេលទូទាត់' },
  appearance:         { en: 'Appearance',                                       km: 'រូបរាង' },
  brandColor:         { en: 'Brand color',                                      km: 'ពណ៌ម៉ាក' },
  brandColorHint:     { en: 'Applies to buttons & accents',                     km: 'អនុវត្តលើប៊ូតុង និងការសង្កត់' },
  darkMode:           { en: 'Dark mode',                                        km: 'របៀបងងឹត' },
  darkModeHint:       { en: 'Switch between light and dark',                    km: 'ប្តូររវាងភ្លឺ និងងងឹត' },
  quickPresets:       { en: 'Quick presets',                                    km: 'ការកំណត់ជាមុនរហ័ស' },
  noOrdersYet:        { en: 'No orders yet',                                    km: 'មិនទាន់មានការបញ្ជាទិញនៅឡើយ' },
  topUpToGetStarted:  { en: 'Top up a game or service to get started.',         km: 'បញ្ចូលទឹកប្រាក់ហ្គេម ឬសេវាកម្មដើម្បីចាប់ផ្តើម។' },
  browseCatalog:      { en: 'Browse catalog',                                   km: 'រុករកកាតាឡុក' },
  noSavedIds:         { en: 'No saved IDs yet',                                 km: 'មិនទាន់មានលេខសម្គាល់ដែលបានរក្សាទុក' },
  autoSaveIds:        { en: 'Your Game IDs are saved automatically when you complete a direct top-up.', km: 'លេខសម្គាល់ហ្គេមរបស់អ្នកត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ នៅពេលអ្នកបញ្ចប់ការបញ្ចូលទឹកប្រាក់ផ្ទាល់។' },
  topUpAGame:         { en: 'Top up a game',                                    km: 'បញ្ចូលទឹកប្រាក់ហ្គេម' },
};

/** Get the bundled default for a key in the requested locale (with EN fallback). */
export function getDefault(key: string, locale: Locale): string | undefined {
  const entry = TRANSLATIONS[key];
  if (!entry) return undefined;
  return entry[locale] ?? entry.en;
}

export const TRANSLATABLE_KEYS = Object.keys(TRANSLATIONS);
