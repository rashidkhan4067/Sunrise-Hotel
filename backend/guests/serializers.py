from rest_framework import serializers
from .models import Guest


class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = '__all__'

    def validate_document_number(self, value):
        value_clean = value.strip()
        queryset = Guest.objects.filter(document_number__iexact=value_clean)
        
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("A guest with this document number (CNIC/Passport) is already registered.")
        return value_clean

    def validate_email(self, value):
        if value:
            value_clean = value.strip().lower()
            queryset = Guest.objects.filter(email__iexact=value_clean)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("A guest with this email address is already registered.")
            return value_clean
        return value
