from django.contrib import admin
from .models import Booking, Folio, FolioItem

admin.site.register(Booking)
admin.site.register(Folio)
admin.site.register(FolioItem)
