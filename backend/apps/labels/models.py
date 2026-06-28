import uuid
from django.db import models
from apps.users.models import User, Company

class LabelTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True, related_name='label_templates')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='label_templates')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    canvas_json = models.JSONField(default=dict)
    thumbnail = models.ImageField(upload_to='label_thumbnails/', blank=True, null=True)
    width = models.IntegerField(default=400)
    height = models.IntegerField(default=200)
    background_color = models.CharField(max_length=7, default='#ffffff')
    is_default = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    category = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'label_templates'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
