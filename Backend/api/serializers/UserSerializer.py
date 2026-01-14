"""Serializer pour UserModel"""

from rest_framework import serializers
from api.models.UserModel import UserModel




class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs"""

    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = UserModel
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'telephone', 'role', 'role_display', 'actif', 'date_joined', 'derniere_connexion', 'password']
        read_only_fields = ['date_joined']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = UserModel(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


