from django.urls import path, include
from . import views
from blog import views as blog_views

# Custom Admin Site
from django.contrib import admin
admin.site.site_header = "سامانه مدیریت و فرماندهی ارشیا نگین پردازش کویر (ANPK Admin Center)"
admin.site.site_title = "پنل ادمین ارشیا نگین"
admin.site.index_title = "داشبورد مدیریت ارشد ANPK"

urlpatterns = [
    # Django Admin
    # ============================================
    # ADMIN API - دسترسی فقط با JWT ادمین
    # ============================================
    path('admin/token/', views.admin_token_obtain, name='admin_token_obtain'),
    path('admin/token/refresh/', views.admin_token_refresh, name='admin_token_refresh'),
    path('admin/comments/', blog_views.admin_comments, name='admin_comments'),
    path('admin/overview/', views.admin_overview, name='admin_overview'),
    path('admin/analytics/', views.admin_analytics, name='admin_analytics'),
    path('admin/upload/', views.admin_file_upload, name='admin_file_upload'),
    
    # Admin - Blog Management
    path('admin/articles/', views.admin_articles, name='admin_articles'),
    path('admin/article-categories/', views.admin_article_categories, name='admin_article_categories'),
    path('admin/article-tags/', views.admin_article_tags, name='admin_article_tags'),
    path('admin/blog-analytics/', views.admin_blog_analytics, name='admin_blog_analytics'),
    path('admin/scheduled-publish/', views.admin_scheduled_publish, name='admin_scheduled_publish'),
    
    # Admin - CRM & Clients
    path('admin/clients/', views.admin_clients, name='admin_clients'),
    # Leads are managed via /api/leads/submit/ (POST for CRUD, GET for list)
    path('admin/leads/convert/', views.admin_convert_lead, name='admin_leads_convert'),
    
    # Admin - Finance
    path('admin/finance/plans/', views.admin_pricing_plans, name='admin_pricing_plans'),
    path('admin/finance/subscriptions/', views.admin_subscriptions, name='admin_subscriptions'),
    path('admin/finance/invoices/', views.admin_invoices, name='admin_invoices'),
    path('admin/wallets/', views.admin_wallets, name='admin_wallets'),
    path('admin/wallet-transactions/', views.admin_wallet_transactions, name='admin_wallet_transactions'),
    path('admin/sla-contracts/', views.admin_sla_contracts, name='admin_sla_contracts'),
    
    # Admin - Projects
    path('admin/projects/', views.admin_projects, name='admin_projects'),
    path('admin/portfolio-projects/', views.admin_portfolio_projects, name='admin_portfolio_projects'),
    path('admin/project-metadata/', views.admin_project_metadata, name='admin_project_metadata'),
    
    # Admin - Products & Catalog
    path('admin/products/', views.admin_products, name='admin_products'),
    path('admin/product-categories/', views.admin_product_categories, name='admin_product_categories'),
    path('admin/product-features/', views.admin_product_features, name='admin_product_features'),
    path('admin/solutions/', views.admin_solutions, name='admin_solutions'),
    
    # Admin - Support & Tickets
    path('admin/tickets/', views.admin_tickets, name='admin_tickets'),
    path('admin/messages/', views.admin_messages, name='admin_messages'),
    
    # Admin - System & Users
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/nodes/', views.admin_nodes, name='admin_nodes'),
    path('admin/services-config/', views.admin_services_config, name='admin_services_config'),
    path('admin/ai-logs/', views.admin_ai_logs, name='admin_ai_logs'),
    path('admin/sms-logs/', views.admin_sms_logs, name='admin_sms_logs'),
    path('admin/otp-logs/', views.admin_otp_logs, name='admin_otp_logs'),
    path('admin/site-settings/', views.admin_site_settings, name='admin_site_settings'),
    
    # Admin - Generic Actions
    path('admin/delete-item/', views.admin_delete_item, name='admin_delete_item'),
    path('admin/update-item/', views.admin_update_item, name='admin_update_item'),
    
    # ============================================
    # CLIENT PORTAL API - دسترسی با OTP یا JWT مشتری
    # ============================================
    path('portal/auth/send-otp/', views.send_otp, name='send_otp'),
    path('portal/auth/verify-otp/', views.verify_otp, name='verify_otp'),
    path('portal/overview/', views.portal_overview, name='portal_overview'),
    path('portal/wallet/', views.wallet_details, name='wallet_details'),
    path('portal/ai-usage/', views.ai_usage_logs, name='ai_usage_logs'),
    path('portal/invoices/', views.invoices_list, name='invoices_list'),
    path('portal/api-keys/', views.api_keys_list, name='api_keys_list'),
    path('portal/sms-logs/', views.sms_logs_list, name='sms_logs_list'),
    path('portal/client/tickets/', views.tickets_list, name='tickets_list'),
    path('portal/client/tickets/reply/', views.reply_ticket, name='reply_ticket'),
    path('portal/client/notifications/', views.notifications_list, name='notifications_list'),
]
