from django.urls import path
from . import views
from blog import views as blog_views

urlpatterns = [
    path('admin/comments/', blog_views.admin_comments, name='admin_comments'),
    path('overview/', views.portal_overview, name='portal_overview'),
    path('wallet/', views.wallet_details, name='wallet_details'),
    path('ai-usage/', views.ai_usage_logs, name='ai_usage_logs'),
    path('invoices/', views.invoices_list, name='invoices_list'),
    path('api-keys/', views.api_keys_list, name='api_keys_list'),
    path('sms-logs/', views.sms_logs_list, name='sms_logs_list'),
    path('auth/send-otp/', views.send_otp, name='send_otp'),
    path('auth/verify-otp/', views.verify_otp, name='verify_otp'),
    path('client/tickets/', views.tickets_list, name='tickets_list'),
    path('client/tickets/reply/', views.reply_ticket, name='reply_ticket'),
    path('client/notifications/', views.notifications_list, name='notifications_list'),
    # Admin JWT Auth
    path('admin/token/', views.admin_token_obtain, name='admin_token_obtain'),
    path('admin/token/refresh/', views.admin_token_refresh, name='admin_token_refresh'),
    # Admin Core
    path('admin/overview/', views.admin_overview, name='admin_overview'),
    path('admin/wallets/', views.admin_wallets, name='admin_wallets'),
    path('admin/tickets/', views.admin_tickets, name='admin_tickets'),
    path('admin/projects/', views.admin_projects, name='admin_projects'),
    path('admin/ai-logs/', views.admin_ai_logs, name='admin_ai_logs'),
    path('admin/sms-logs/', views.admin_sms_logs, name='admin_sms_logs'),
    path('admin/clients/', views.admin_clients, name='admin_clients'),
    path('admin/nodes/', views.admin_nodes, name='admin_nodes'),
    path('admin/articles/', views.admin_articles, name='admin_articles'),
    path('admin/article-categories/', views.admin_article_categories, name='admin_article_categories'),
    path('admin/products/', views.admin_products, name='admin_products'),
    path('admin/services-config/', views.admin_services_config, name='admin_services_config'),
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/delete-item/', views.admin_delete_item, name='admin_delete_item'),
    path('admin/update-item/', views.admin_update_item, name='admin_update_item'),
    path('admin/analytics/', views.admin_analytics, name='admin_analytics'),
    # Admin Missing (مطابق Django Admin Panel)
    path('admin/sla-contracts/', views.admin_sla_contracts, name='admin_sla_contracts'),
    path('admin/wallet-transactions/', views.admin_wallet_transactions, name='admin_wallet_transactions'),
    path('admin/otp-logs/', views.admin_otp_logs, name='admin_otp_logs'),
    
    path('admin/finance/plans/', views.admin_pricing_plans, name='admin_pricing_plans'),
    path('admin/finance/subscriptions/', views.admin_subscriptions, name='admin_subscriptions'),
    path('admin/finance/invoices/', views.admin_invoices, name='admin_invoices'),

    path('admin/solutions/', views.admin_solutions, name='admin_solutions'),
    path('admin/portfolio-projects/', views.admin_portfolio_projects, name='admin_portfolio_projects'),
    path('admin/product-categories/', views.admin_product_categories, name='admin_product_categories'),
    path('admin/product-features/', views.admin_product_features, name='admin_product_features'),
    path('admin/messages/', views.admin_messages, name='admin_messages'),
    path('admin/site-settings/', views.admin_site_settings, name='admin_site_settings'),
    path('admin/project-metadata/', views.admin_project_metadata, name='admin_project_metadata'),
]

