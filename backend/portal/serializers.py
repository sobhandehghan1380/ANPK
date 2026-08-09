from rest_framework import serializers
from .models import ClientOrganization, WalletTransaction, SMSLog, SupportTicket

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
