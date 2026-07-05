import logging
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from apps.products.models import Product, Category
from django.utils import timezone

logger = logging.getLogger(__name__)

class GoogleSheetsService:
    @staticmethod
    def get_credentials_for_user(user) -> Credentials:
        """Construct OAuth2 credentials for a user from database tokens"""
        if not user.google_access_token:
            raise ValueError("User has not authorized Google Account")
        return Credentials(
            token=user.google_access_token,
            refresh_token=user.google_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=user.google_id,
        )

    @staticmethod
    def sync_sheet(config) -> dict:
        """Fetch rows from Google Sheets, map to products, and upsert"""
        user = config.user
        spreadsheet_id = config.spreadsheet_id
        range_name = f"'{config.sheet_name}'!A1:Z1000"

        try:
            # Build Sheets service
            creds = GoogleSheetsService.get_credentials_for_user(user)
            service = build('sheets', 'v4', credentials=creds)
            
            result = service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            rows = result.get('values', [])
            if not rows:
                return {'success': False, 'message': 'No data found in sheet'}

            headers = [h.strip().lower().replace(' ', '_') for h in rows[0]]
            
            required_fields = {'name', 'sku'}
            if not required_fields.issubset(set(headers)):
                return {'success': False, 'message': f'Sheet headers must include: {", ".join(required_fields)}'}

            imported = 0
            company = config.company
            
            for i, row in enumerate(rows[1:]):
                # Pad row values to match headers length
                row = row + [None] * (len(headers) - len(row))
                row_dict = dict(zip(headers, row))
                
                name = row_dict.get('name')
                sku = row_dict.get('sku')
                
                if not name or not sku:
                    continue
                
                barcode = row_dict.get('barcode', sku)
                barcode_format = row_dict.get('barcode_format', 'CODE128')
                price = row_dict.get('price')
                stock = row_dict.get('stock', 0)
                location = row_dict.get('location', '')
                manufacturer = row_dict.get('manufacturer', '')
                description = row_dict.get('description', '')
                category_name = row_dict.get('category')
                
                # Exclude invalid float/int conversion errors
                try:
                    price = float(price) if price else None
                except ValueError:
                    price = None
                    
                try:
                    stock = int(stock) if stock else 0
                except ValueError:
                    stock = 0
                
                category = None
                if category_name:
                    category, _ = Category.objects.get_or_create(name=category_name, company=company)

                Product.objects.update_or_create(
                    company=company,
                    sku=sku,
                    defaults={
                        'name': name,
                        'barcode': barcode,
                        'barcode_format': barcode_format,
                        'price': price,
                        'stock': stock,
                        'location': location,
                        'manufacturer': manufacturer,
                        'description': description,
                        'category': category,
                        'sheet_id': spreadsheet_id,
                        'sheet_row': i + 2,
                        'last_synced_at': timezone.now(),
                        'created_by': user
                    }
                )
                imported += 1

            config.last_sync_status = 'success'
            config.last_sync_message = f"Successfully synced {imported} products."
            config.last_synced_at = timezone.now()
            config.save()
            
            return {'success': True, 'imported': imported}
            
        except Exception as e:
            logger.error(f"Error syncing Google Sheet {spreadsheet_id}: {e}")
            config.last_sync_status = 'failed'
            config.last_sync_message = str(e)
            config.save()
            return {'success': False, 'message': str(e)}
