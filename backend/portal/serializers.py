from rest_framework import serializers
from accounts.models import Organization as ClientOrganization

from billing.models import WalletTransaction
from integrations.models import SMSLog
from support.models import SupportTicket

class ClientOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientOrganization
        fields = '__all__'

class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = '__all__'

class SMSLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSLog
        fields = '__all__'

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = '__all__'
