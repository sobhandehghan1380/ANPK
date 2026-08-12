const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Helper to convert any date string/timestamp into clean Jalali Persian Date string (e.g. ۱۴۰۴/۱۱/۱۸)
export function toJalaliDate(dateInput: any): string {
  if (!dateInput) return '۱۴۰۴/۱۱/۱۸';
  try {
    const str = String(dateInput);
    if (str.includes('۱۴۰') || str.includes('۱۳۹')) return str; // Already Jalali
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return String(dateInput);
  }
}

// ─────────────────────────────────────────────────────────────
// JWT Auth Helper — ارسال token در تمام درخواست‌های ادمین
// ─────────────────────────────────────────────────────────────
export function getAdminHeaders(): HeadersInit {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('anpk_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<any> {
  const headers = getAdminHeaders() as Record<string, string>;
  const reqHeaders: Record<string, string> = { ...headers, ...((options.headers as Record<string, string>) || {}) };

  // If sending FormData, do not force Content-Type to application/json
  // Let the browser automatically set it to multipart/form-data with boundary
  if (options.body instanceof FormData) {
    delete reqHeaders['Content-Type'];
  }
  options.headers = reqHeaders;

  const res = await fetch(url, options);

  // اگر token منقضی شده بود، به صفحه لاگین برگردان
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('anpk_admin_token');
    localStorage.removeItem('anpk_admin_refresh');
    localStorage.removeItem('anpk_admin_user');
    window.location.href = '/admin/login';
    return null;
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function adminFetchFormData(url: string, formData: FormData): Promise<any> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('anpk_admin_token') : null;
  const headers: any = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: formData,
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('anpk_admin_token');
    window.location.href = '/admin/login';
    return null;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// 1. Core API
export async function fetchHomeData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/core/home/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    return { company: 'شرکت ارشیا نگین پردازش کویر (ANPK)', uptime: '۹۹.۹٪', solutions_count: '۹+', products_count: 3 };
  }
}

// 2. Catalog API (Products & Solutions)
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/catalog/products/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    return [
      { id: 1, name: 'پلتفرم کلاس‌های آنلاین و وبینار آیرا (Aira)', slug: 'aira', category: 'وبینار WebRTC', status: 'دمو فعال' },
      { id: 2, name: 'سامانه CMMS تأسیسات نگار', slug: 'tasisat-negar', category: 'نگهداشت تأسیسات', status: 'فعال' },
      { id: 3, name: 'سامانه نیکی لینک (NikiLink)', slug: 'nikilink', category: 'مدیریت پیوندها', status: 'در حال توسعه' },
    ];
  }
}

export async function fetchSolutions() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/catalog/solutions/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    return [
      { id: 1, title: 'سلامت دیجیتال و پرونده الکترونیک', slug: 'digital-health', description: 'راهکار جامع پرونده الکترونیک سلامت' },
      { id: 2, title: 'نگهداشت تأسیسات و CMMS', slug: 'cmms-facility', description: 'مدیریت هوشمند تاسیسات بیمارستانی' },
    ];
  }
}

// 3. Projects API
export async function fetchProjects() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/projects/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    return [
      { id: 1, title: 'سامانه CMMS تأسیسات بیمارستان ولایت', organization: 'بیمارستان ولایت', progress: 85, phase: 'فاز ۳: استقرار بومی' },
      { id: 2, title: 'پلتفرم آموزش و وبینار دانشگاه علوم پزشکی', organization: 'دانشگاه علوم پزشکی', progress: 95, phase: 'فاز نهایی' },
    ];
  }
}

// 4. Articles API
export async function getHeroData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/core/home-overview/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function fetchArticles() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data.map((a: any) => ({
      ...a,
      date: toJalaliDate(a.date || a.created_at),
    }));
  } catch (error) {
    return [
      { id: 1, title: 'معماری پلتفرم‌های سلامت دیجیتال و استاندارد HL7 FHIR', slug: 'hl7-fhir-architecture', summary: 'بررسی نحوه تبادل امن داده‌ها', date: '۱۴۰۴/۱۱/۱۸' },
    ];
  }
}

export async function fetchArticleBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/${slug}/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return {
      ...data,
      date: toJalaliDate(data.date || data.created_at),
    };
  } catch (error) {
    return null;
  }
}

export async function getAdminOverview() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/overview/`, { cache: 'no-store' });
  } catch (error) {
    return null;
  }
}

export async function getAdminWallets() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/wallets/`, { cache: 'no-store' });
  } catch (error) {
    return [];
  }
}

export async function topUpClientWallet(clientId: number, amount: number, description: string) {
  try {
    const res = await adminFetch(`${API_BASE_URL}/api/admin/wallets/`, {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, amount, description })
    });
    return res;
  } catch (error) {
    return null;
  }
}

export async function getAdminTickets() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/tickets/`, { cache: 'no-store' });
  } catch (error) {
    return [];
  }
}

export async function updateTicketStatus(ticketId: number, status: string) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/tickets/`, {
      method: 'POST',
      body: JSON.stringify({ ticket_id: ticketId, status })
    });
  } catch (error) {
    return null;
  }
}

export async function getAdminProjects() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/projects/`, { cache: 'no-store' });
  } catch (error) {
    return [];
  }
}

export async function createAdminProject(clientId: number, title: string, contractNumber: string, phase: string, progress: number) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/projects/`, {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, title, contract_number: contractNumber, current_phase: phase, progress_percentage: progress })
    });
  } catch (error) {
    return null;
  }
}

export async function getAdminAILogs() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/ai-logs/`, { cache: 'no-store' });
  } catch (error) {
    return [];
  }
}

export async function getAdminSMSLogs() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/sms-logs/`, { cache: 'no-store' });
  } catch (error) {
    return [];
  }
}

export async function getAdminClients() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/clients/`);
  } catch (error) {
    return [];
  }
}

export async function createAdminClient(name: string, contactPerson: string, phone: string, userId?: number) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/clients/`, {
      method: 'POST',
      body: JSON.stringify({ name, contact_person: contactPerson, phone, user_id: userId })
    });
  } catch (error) {
    return null;
  }
}

export async function getAdminNodes() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/nodes/`, { cache: 'no-store' });
  } catch (error) {
    return [];
  }
}

export async function createAdminNode(name: string, statusLabel: string, uptime: string, latency: number) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/nodes/`, {
      method: 'POST',
      body: JSON.stringify({ name, status_label: statusLabel, uptime, latency })
    });
  } catch (error) {
    return null;
  }
}

export async function getAdminArticleCategories() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/article-categories/`, { cache: 'no-store' });
  } catch (error) {
    return [];
  }
}

export async function createAdminArticleCategory(name: string, slug: string, description: string) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/article-categories/`, {
      method: 'POST',
      body: JSON.stringify({ name, slug, description })
    });
  } catch (error) {
    return null;
  }
}

export async function getAdminArticles() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/articles/`, { cache: 'no-store' });
  } catch (error) {
    return [];
  }
}

export async function createAdminArticle(title: string, slug: string, summary: string, content: string) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/articles/`, {
      method: 'POST',
      body: JSON.stringify({ title, slug, summary, content })
    });
  } catch (error) {
    return null;
  }
}

export async function getAdminProductsList() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/products/`, { cache: 'no-store' });
  } catch (error) {
    return [];
  }
}

export async function createAdminProduct(name: string, slug: string, shortDescription: string, demoUrl: string) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/products/`, {
      method: 'POST',
      body: JSON.stringify({ name, slug, short_description: shortDescription, demo_url: demoUrl })
    });
  } catch (error) {
    return null;
  }
}

export async function getAdminServicesConfig() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/services-config/`, { cache: 'no-store' });
  } catch (error) {
    return null;
  }
}

export async function updateAdminServicesConfig(defaultModel: string, rate: number, senderLine: string) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/services-config/`, {
      method: 'POST',
      body: JSON.stringify({ default_model: defaultModel, wallet_rate_per_query: rate, sender_line: senderLine })
    });
  } catch (error) {
    return null;
  }
}

export async function manageAdminUser(data: any) {
  try { return await adminFetch(`${API_BASE_URL}/api/admin/users/`, { method: 'POST', body: JSON.stringify(data) }); } catch(e) { return null; }
}

export async function getAdminUsers() {
  try { return await adminFetch(`${API_BASE_URL}/api/admin/users/`, { cache: 'no-store' }); } catch(e) { return []; }
}

export async function createAdminUser(username: string, password?: string, role?: string, email?: string, first_name?: string, last_name?: string) {
  try { return await adminFetch(`${API_BASE_URL}/api/admin/users/`, { method: 'POST', body: JSON.stringify({ username, password, role, email, first_name, last_name }) }); } catch(e) { return null; }
}

export async function toggleAdminUserActive(userId: number) {
  try { return await adminFetch(`${API_BASE_URL}/api/admin/users/`, { method: 'POST', body: JSON.stringify({ action: 'toggle_active', id: userId }) }); } catch(e) { return null; }
}

export async function deleteAdminUser(userId: number) {
  try { return await adminFetch(`${API_BASE_URL}/api/admin/users/`, { method: 'DELETE', body: JSON.stringify({ id: userId }) }); } catch(e) { return null; }
}

export async function getAdminAnalytics() {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/analytics/`, { cache: 'no-store' });
  } catch (error) {
    return null;
  }
}

// 5. Contact API
export async function sendContactMessage(data: { name: string; phone: string; subject?: string; message?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/contact/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { message: 'پیام شما ثبت گردید.' };
  }
}

export async function fetchContactMessages() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/contact/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data.map((m: any) => ({
      ...m,
      date: toJalaliDate(m.date || m.created_at),
    }));
  } catch (error) {
    return [];
  }
}

// 6. Project Leads API (Form 4-Step)
export async function submitProjectLead(data: { company_name: string; contact_person: string; phone: string; service_type?: string; budget_range?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/leads/submit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { message: 'درخواست شما ثبت گردید.', id: 'LD-99' };
  }
}

export async function fetchProjectLeads() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/leads/submit/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data.map((l: any) => ({
      ...l,
      date: toJalaliDate(l.date || l.created_at),
    }));
  } catch (error) {
    return [];
  }
}

function getUserPhoneQueryParam() {
  if (typeof window !== 'undefined') {
    const phone = localStorage.getItem('anpk_user_phone');
    if (phone) return `?phone=${encodeURIComponent(phone)}`;
  }
  return '';
}

// 7. Portal API (Wallet, SMS, Tickets)
export async function getWalletDetails() {
  const query = getUserPhoneQueryParam();
  return fetch(`${API_BASE_URL}/api/portal/wallet/${query}`, { cache: 'no-store' }).then(res => res.json());
}

export async function chargeWallet(amount: number, description?: string) {
  const query = getUserPhoneQueryParam();
  return fetch(`${API_BASE_URL}/api/portal/wallet/${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, description }),
  }).then(res => res.json());
}

export async function getAIUsageLogs(projectId?: string | number) {
  let query = getUserPhoneQueryParam();
  if (projectId) {
    query += query ? `&project_id=${projectId}` : `?project_id=${projectId}`;
  }
  return fetch(`${API_BASE_URL}/api/portal/ai-usage/${query}`, { cache: 'no-store' }).then(res => res.json());
}

export async function getInvoices() {
  const query = getUserPhoneQueryParam();
  return fetch(`${API_BASE_URL}/api/portal/invoices/${query}`, { cache: 'no-store' }).then(res => res.json());
}

export async function getAPIKeys() {
  const query = getUserPhoneQueryParam();
  return fetch(`${API_BASE_URL}/api/portal/api-keys/${query}`, { cache: 'no-store' }).then(res => res.json());
}

export async function createAPIKey(name: string) {
  const query = getUserPhoneQueryParam();
  return fetch(`${API_BASE_URL}/api/portal/api-keys/${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }).then(res => res.json());
}

export async function fetchPortalOverview() {
  try {
    const query = getUserPhoneQueryParam();
    const res = await fetch(`${API_BASE_URL}/api/portal/overview/${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    return { wallet_balance: 0, sla_days_remaining: 0, status: 'success' };
  }
}

export async function getSMSLogs(projectId?: string | number) {
  let query = getUserPhoneQueryParam();
  if (projectId) {
    query += query ? `&project_id=${projectId}` : `?project_id=${projectId}`;
  }
  return fetchSMSLogs(query);
}

export async function sendOTP(phone: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/portal/auth/send-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return await res.json();
  } catch (error) {
    return { message: 'کد تایید پیامکی ارسال شد.', demo_code: '12345' };
  }
}

export async function verifyOTP(phone: string, code: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/portal/auth/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    return await res.json();
  } catch (error) {
    return { user: { name: 'بیمارستان ولایت', phone } };
  }
}

export async function fetchSMSLogs(queryParam?: string) {
  try {
    const query = queryParam || getUserPhoneQueryParam();
    const res = await fetch(`${API_BASE_URL}/api/portal/sms-logs/${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data.map((s: any) => ({
      ...s,
      date: toJalaliDate(s.date || s.sent_at),
    }));
  } catch (error) {
    return [];
  }
}

export async function sendTestSMS(recipient: string, text: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/portal/sms-logs/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, text }),
    });
    return await res.json();
  } catch (error) {
    return { status: 'delivered', cost: 75 };
  }
}

export async function fetchSupportTickets() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/portal/tickets/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function createSupportTicket(data: { client_name: string; subject: string; message: string; category?: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/portal/tickets/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return { id: 1, subject: data.subject, status: 'pending' };
  }
}

export async function getPortalOverview() {
  return fetchPortalOverview();
}

export async function getClientProjects() {
  try {
    const query = getUserPhoneQueryParam();
    const res = await fetch(`${API_BASE_URL}/api/projects/client/${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    return [];
  }
}

export async function getTickets() {
  return fetchSupportTickets();
}

export async function createTicket(ticketData: { client_name?: string; subject: string; message: string }) {
  return createSupportTicket(ticketData as any);
}

export async function generateProjectAPIKey(projectId: number, keyName: string) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/projects/`, {
      method: 'POST',
      body: JSON.stringify({ action: 'generate_key', project_id: projectId, key_name: keyName })
    });
  } catch (error) {
    return null;
  }
}

// === Finance & Billing ===
export async function getAdminPricingPlans() {
  try { return await adminFetch(`${API_BASE_URL}/api/admin/finance/plans/`, { cache: 'no-store' }); } catch(e) { return []; }
}
export async function manageAdminPricingPlan(data: any) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/finance/plans/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch(e) { return null; }
}

export async function getAdminSubscriptions() {
  try { return await adminFetch(`${API_BASE_URL}/api/admin/finance/subscriptions/`, { cache: 'no-store' }); } catch(e) { return { subscriptions: [], clients: [], plans: [] }; }
}
export async function manageAdminSubscription(data: any) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/finance/subscriptions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch(e) { return null; }
}

export async function getAdminInvoices() {
  try { return await adminFetch(`${API_BASE_URL}/api/admin/finance/invoices/`, { cache: 'no-store' }); } catch(e) { return { invoices: [], clients: [], subscriptions: [] }; }
}
export async function manageAdminInvoice(data: any) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/finance/invoices/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch(e) { return null; }
}

export async function manageAdminConvertLead(leadId: number) {
  try { return await adminFetch(`${API_BASE_URL}/api/admin/leads/convert/`, { method: 'POST', body: JSON.stringify({ lead_id: leadId }) }); } catch(e) { return null; }
}

export async function manageAdminProjectPhase(data: any) {
  if (data instanceof FormData) {
    data.append('action', 'update_phase');
    try { return await adminFetchFormData(`${API_BASE_URL}/api/admin/projects/`, data); } catch(e) { return null; }
  } else {
    try { return await adminFetch(`${API_BASE_URL}/api/admin/projects/`, { method: 'POST', body: JSON.stringify({...data, action: 'update_phase'}) }); } catch(e) { return null; }
  }
}

export async function getPortalTickets(phone: string) {
  try { return await adminFetch(`${API_BASE_URL}/api/portal/client/tickets/?phone=${phone}`, { cache: 'no-store' }); } catch(e) { return null; }
}
export async function managePortalTicket(data: any, phone: string) {
  try { return await adminFetch(`${API_BASE_URL}/api/portal/client/tickets/?phone=${phone}`, { method: 'POST', body: JSON.stringify(data) }); } catch(e) { return null; }
}

export async function getPortalInvoices(phone: string) {
  try { return await adminFetch(`${API_BASE_URL}/api/portal/client/invoices/?phone=${phone}`, { cache: 'no-store' }); } catch(e) { return null; }
}

export async function getAdminLeads() {
  try { return await adminFetch(`${API_BASE_URL}/api/leads/submit/`, { cache: 'no-store' }); } catch(e) { return []; }
}
export async function manageAdminLead(data: any) {
  try { return await adminFetch(`${API_BASE_URL}/api/leads/submit/`, { method: 'POST', body: JSON.stringify(data) }); } catch(e) { return null; }
}
export async function convertLeadToClient(leadId: number) {
  try { return await adminFetch(`${API_BASE_URL}/api/leads/convert/`, { method: 'POST', body: JSON.stringify({ lead_id: leadId }) }); } catch(e) { return null; }
}

export async function manageAdminTicket(data: any) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/tickets/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch(e) { return null; }
}

// --- IPG API ---
export async function requestPayment(invoiceId: number) {
  try { return await adminFetch(`${API_BASE_URL}/api/portal/client/finance/payment/request/`, { method: 'POST', body: JSON.stringify({ invoice_id: invoiceId }) }); } catch(e) { return null; }
}
export async function verifyPayment(invoiceId: number, authority: string, status: string) {
  try { return await adminFetch(`${API_BASE_URL}/api/portal/client/finance/payment/verify/`, { method: 'POST', body: JSON.stringify({ invoice_id: invoiceId, authority, status }) }); } catch(e) { return null; }
}


// --- CRM Leads & Auto-Convert ---
// Note: convertLeadToClient is already defined in api.ts

// --- Notifications & Tickets Reply ---
export async function getNotifications() {
  try { return await adminFetch(`${API_BASE_URL}/api/portal/client/notifications/`, { cache: 'no-store' }); } catch(e) { return []; }
}
export async function markNotificationRead(id: number) {
  try { return await adminFetch(`${API_BASE_URL}/api/portal/client/notifications/`, { method: 'POST', body: JSON.stringify({ id }) }); } catch(e) { return null; }
}
export async function replyTicket(ticketId: number, message: string) {
  try { return await adminFetch(`${API_BASE_URL}/api/portal/client/tickets/reply/`, { method: 'POST', body: JSON.stringify({ ticket_id: ticketId, message }) }); } catch(e) { return null; }
}
export async function adminReplyTicket(ticketId: number, message: string) {
  try { return await adminFetch(`${API_BASE_URL}/api/admin/tickets/reply/`, { method: 'POST', body: JSON.stringify({ ticket_id: ticketId, message }) }); } catch(e) { return null; }
}

export async function updateAdminItem(model: string, id: number, data: any) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/update-item/`, {
      method: 'POST',
      body: JSON.stringify({ model, id, ...data })
    });
  } catch (error) {
    return null;
  }
}

export async function deleteAdminItem(model: string, id: number) {
  try {
    return await adminFetch(`${API_BASE_URL}/api/admin/delete-item/`, {
      method: 'POST',
      body: JSON.stringify({ model, id })
    });
  } catch (error) {
    return null;
  }
}
