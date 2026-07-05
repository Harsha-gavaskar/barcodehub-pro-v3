from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User, Company, Branch
from apps.products.models import Product, Category
from apps.printers.models import Printer, PrintJob
from apps.analytics.models import DailyPrintSnapshot
from apps.barcodes.models import Barcode
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Seeds database with demo users, companies, products, and printers for development'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # 1. Company
        company, _ = Company.objects.get_or_create(
            name='BarcodeHub Industries',
            defaults={'plan': 'pro', 'max_users': 15, 'max_products': 5000}
        )
        
        # 2. Branches
        hq, _ = Branch.objects.get_or_create(company=company, name='HQ', defaults={'city': 'New York', 'country': 'USA'})
        wh, _ = Branch.objects.get_or_create(company=company, name='Warehouse', defaults={'city': 'Chicago', 'country': 'USA'})
        
        # 3. Users
        admin, created = User.objects.get_or_create(
            email='alex@barcodehub.pro',
            defaults={
                'first_name': 'Alex',
                'last_name': 'Johnson',
                'role': 'admin',
                'company': company,
                'branch': hq,
                'is_staff': True,
                'is_superuser': True,
                'is_email_verified': True,
            }
        )
        if created:
            admin.set_password('admin12345')
            admin.save()
            
        operator, created = User.objects.get_or_create(
            email='mike@barcodehub.pro',
            defaults={
                'first_name': 'Mike',
                'last_name': 'Davis',
                'role': 'operator',
                'company': company,
                'branch': wh,
                'is_email_verified': True,
            }
        )
        if created:
            operator.set_password('operator12345')
            operator.save()

        # 4. Categories
        elec, _ = Category.objects.get_or_create(company=company, name='Electronics')
        office, _ = Category.objects.get_or_create(company=company, name='Office Supplies')
        furniture, _ = Category.objects.get_or_create(company=company, name='Furniture')
        
        # 5. Products
        demo_products = [
            {'name': 'Wireless Mouse Pro', 'sku': 'MS-PRO-01', 'barcode': 'BH-001234', 'price': 49.99, 'stock': 120, 'cat': elec, 'loc': 'Aisle 4, Shelf B', 'man': 'Logitech'},
            {'name': 'USB-C Hub 7-in-1', 'sku': 'HUB-C7-02', 'barcode': 'BH-005678', 'price': 34.99, 'stock': 85, 'cat': elec, 'loc': 'Aisle 2, Shelf A', 'man': 'Anker'},
            {'name': 'Mechanical Keyboard', 'sku': 'KB-MECH-03', 'barcode': 'BH-009012', 'price': 89.99, 'stock': 40, 'cat': elec, 'loc': 'Aisle 4, Shelf C', 'man': 'Keychron'},
            {'name': 'Monitor Arm Dual', 'sku': 'ARM-DUAL-04', 'barcode': 'BH-003456', 'price': 129.99, 'stock': 8, 'cat': furniture, 'loc': 'Aisle 12, Shelf D', 'man': 'Ergotron'},
            {'name': 'Webcam 4K Ultra', 'sku': 'CAM-4K-05', 'barcode': 'BH-007890', 'price': 199.99, 'stock': 0, 'cat': elec, 'loc': 'Aisle 3, Shelf B', 'man': 'Sony'},
            {'name': 'LED Desk Lamp', 'sku': 'LAMP-LED-06', 'barcode': 'BH-002143', 'price': 29.99, 'stock': 5, 'cat': office, 'loc': 'Aisle 1, Shelf E', 'man': 'BenQ'},
            {'name': 'Mouse Pad XXL', 'sku': 'PAD-XXL-07', 'barcode': 'BH-006587', 'price': 19.99, 'stock': 230, 'cat': office, 'loc': 'Aisle 1, Shelf B', 'man': 'SteelSeries'},
            {'name': 'Ergonomic Desk Chair', 'sku': 'CH-ERGO-08', 'barcode': 'BH-004321', 'price': 349.99, 'stock': 12, 'cat': furniture, 'loc': 'Aisle 10, Shelf A', 'man': 'Steelcase'},
            {'name': 'Active Noise Cancelling Headphones', 'sku': 'HP-ANC-09', 'barcode': 'BH-008765', 'price': 249.99, 'stock': 65, 'cat': elec, 'loc': 'Aisle 3, Shelf C', 'man': 'Bose'},
            {'name': 'Portable SSD 2TB', 'sku': 'SSD-2TB-10', 'barcode': 'BH-005432', 'price': 159.99, 'stock': 95, 'cat': elec, 'loc': 'Aisle 2, Shelf B', 'man': 'Samsung'},
            {'name': 'Smart Power Strip', 'sku': 'STRIP-SMART-11', 'barcode': 'BH-009876', 'price': 24.99, 'stock': 150, 'cat': elec, 'loc': 'Aisle 1, Shelf C', 'man': 'TP-Link'},
            {'name': 'Filing Cabinet 3-Drawer', 'sku': 'CAB-3DR-12', 'barcode': 'BH-001098', 'price': 119.99, 'stock': 4, 'cat': furniture, 'loc': 'Aisle 15, Shelf B', 'man': 'HON'},
        ]
        
        for dp in demo_products:
            p, _ = Product.objects.update_or_create(
                company=company,
                sku=dp['sku'],
                defaults={
                    'name': dp['name'],
                    'barcode': dp['barcode'],
                    'barcode_format': 'CODE128',
                    'price': Decimal(str(dp['price'])),
                    'stock': dp['stock'],
                    'category': dp['cat'],
                    'location': dp['loc'],
                    'manufacturer': dp['man'],
                    'created_by': admin,
                }
            )
            # Create a barcode record
            Barcode.objects.get_or_create(
                product=p,
                generated_by=admin,
                defaults={
                    'value': p.barcode,
                    'format': p.barcode_format,
                }
            )

        # 6. Printers
        p1, _ = Printer.objects.get_or_create(company=company, name='HP LaserJet Pro', defaults={'printer_type': 'laser', 'status': 'online', 'location': 'Office A'})
        p2, _ = Printer.objects.get_or_create(company=company, name='Zebra ZD420', defaults={'printer_type': 'thermal', 'status': 'online', 'location': 'Warehouse'})
        p3, _ = Printer.objects.get_or_create(company=company, name='Epson LX-350', defaults={'printer_type': 'dot_matrix', 'status': 'offline', 'location': 'Storage'})
        p4, _ = Printer.objects.get_or_create(company=company, name='Canon PIXMA', defaults={'printer_type': 'inkjet', 'status': 'busy', 'location': 'Office B'})
        
        # 7. Print Jobs
        PrintJob.objects.get_or_create(title='Wireless Mouse Pro (×50)', defaults={'created_by': admin, 'printer': p1, 'quantity': 50, 'paper_size': 'a4', 'status': 'done', 'pages': 6})
        PrintJob.objects.get_or_create(title='USB-C Hub (×25)', defaults={'created_by': operator, 'printer': p2, 'quantity': 25, 'paper_size': '4x6', 'status': 'printing', 'pages': 3})
        PrintJob.objects.get_or_create(title='Mechanical Keyboard (×10)', defaults={'created_by': admin, 'printer': p1, 'quantity': 10, 'paper_size': 'a4', 'status': 'queued', 'pages': 2})
        PrintJob.objects.get_or_create(title='Monitor Arm (×8)', defaults={'created_by': admin, 'printer': p2, 'quantity': 8, 'paper_size': '2x1', 'status': 'failed', 'pages': 1})
        
        # 8. Daily Snapshots (last 30 days of data)
        today = timezone.now().date()
        for i in range(30):
            d = today - timezone.timedelta(days=i)
            DailyPrintSnapshot.objects.update_or_create(
                company=company,
                date=d,
                defaults={
                    'generated_count': random.randint(200, 800),
                    'printed_count': random.randint(180, 750),
                    'failed_count': random.randint(0, 15),
                }
            )
            
        self.stdout.write(self.style.SUCCESS('Successfully seeded development data!'))
        self.stdout.write(self.style.SUCCESS('Admin credentials: alex@barcodehub.pro / admin12345'))
        self.stdout.write(self.style.SUCCESS('Operator credentials: mike@barcodehub.pro / operator12345'))
