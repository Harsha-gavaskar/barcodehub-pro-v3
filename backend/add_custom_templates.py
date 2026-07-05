import os

def create_templates():
    print("Creating customized templates...")
    from apps.users.models import User, Company
    from apps.labels.models import LabelTemplate

    company = Company.objects.first()
    user = User.objects.filter(role='admin').first()
    if not company or not user:
        print("Database not seeded yet. Please seed first.")
        return

    # Clear old imported ones to avoid duplicates
    LabelTemplate.objects.filter(category='BarTender Import').delete()

    # Template 1: 6-Row Vertical Barcode
    # Large horizontal label, vertical barcode on the left, details on the right
    t1_canvas = {
        "width": 600,
        "height": 120,
        "elements": [
            { "id": "bc", "type": "barcode", "value": "12345678", "format": "CODE128", "x": 10, "y": 10, "width": 80, "height": 100, "rotate": 270, "displayValue": False },
            { "id": "code", "type": "text", "text": "SQPR2 ZCOC ZYO BN", "x": 110, "y": 15, "fontSize": 15, "fontWeight": "bold" },
            { "id": "desc", "type": "text", "text": "RACK SQUARE PIPE", "x": 110, "y": 45, "fontSize": 15, "fontWeight": "bold" },
            { "id": "specs", "type": "text", "text": "16X16 1905g #ZS", "x": 110, "y": 75, "fontSize": 15, "fontWeight": "bold" },
            { "id": "price", "type": "text", "text": "₹1320/-", "x": 420, "y": 40, "fontSize": 32, "fontWeight": "extrabold" }
        ]
      }
    t1 = LabelTemplate.objects.create(
        company=company,
        name="Template 1: 6-Row Vertical Barcode",
        description="6 labels per sheet. Rotated barcode on left, large price on right.",
        canvas_json=t1_canvas,
        width=600,
        height=120,
        background_color="#ffffff",
        category="BarTender Import",
        created_by=user
    )
    print("Created Template 1")

    # Template 2: 8-Label Grid (2x4)
    # Standard barcode on top, code, desc, and price aligned horizontally
    t2_canvas = {
        "width": 220,
        "height": 120,
        "elements": [
            { "id": "bc", "type": "barcode", "value": "12345678", "format": "CODE128", "x": 10, "y": 10, "width": 200, "height": 35, "displayValue": False },
            { "id": "code", "type": "text", "text": "CTZ9 MINI CITIZEN 9", "x": 10, "y": 55, "fontSize": 11, "fontWeight": "bold" },
            { "id": "desc", "type": "text", "text": "kZCOY C. BM No.9", "x": 10, "y": 75, "fontSize": 11, "fontWeight": "bold" },
            { "id": "price", "type": "text", "text": "₹ 20.00", "x": 10, "y": 95, "fontSize": 16, "fontWeight": "extrabold" },
            { "id": "hash", "type": "text", "text": "#ZS", "x": 160, "y": 95, "fontSize": 12, "fontWeight": "bold" }
        ]
    }
    t2 = LabelTemplate.objects.create(
        company=company,
        name="Template 2: 8-Label Grid (2x4)",
        description="8 labels per sheet. Barcode at the top, details at the bottom.",
        canvas_json=t2_canvas,
        width=220,
        height=120,
        background_color="#ffffff",
        category="BarTender Import",
        created_by=user
    )
    print("Created Template 2")

    # Template 3: 12-Label Grid with Vertical Price
    # 3x4 layout. Barcode on top, details on left, price rotated vertically on right
    t3_canvas = {
        "width": 220,
        "height": 100,
        "elements": [
            { "id": "bc", "type": "barcode", "value": "12345678", "format": "CODE128", "x": 10, "y": 10, "width": 190, "height": 30, "displayValue": False },
            { "id": "code", "type": "text", "text": "DCF3 MINI SPOON", "x": 10, "y": 50, "fontSize": 11, "fontWeight": "bold" },
            { "id": "desc", "type": "text", "text": "ZCOC CS BNPDz 1+1#F", "x": 10, "y": 70, "fontSize": 10, "fontWeight": "medium" },
            { "id": "price", "type": "text", "text": "₹ 57.0", "x": 195, "y": 50, "fontSize": 14, "fontWeight": "bold", "rotate": 270 }
        ]
    }
    t3 = LabelTemplate.objects.create(
        company=company,
        name="Template 3: 12-Label Grid (3x4)",
        description="12 labels per sheet. Rotated price on the right edge.",
        canvas_json=t3_canvas,
        width=220,
        height=100,
        background_color="#ffffff",
        category="BarTender Import",
        created_by=user
    )
    print("Created Template 3")

    # Template 4: 6-Label Horizontal Grid (3x2)
    # Barcode on left, text details on right
    t4_canvas = {
        "width": 400,
        "height": 120,
        "elements": [
            { "id": "bc", "type": "barcode", "value": "12345678", "format": "CODE128", "x": 10, "y": 20, "width": 150, "height": 80, "displayValue": False },
            { "id": "code", "type": "text", "text": "ZCOC LS UM #ZO", "x": 175, "y": 25, "fontSize": 14, "fontWeight": "bold" },
            { "id": "desc", "type": "text", "text": "89042 SUPPORT GTOP (HEAVY)", "x": 175, "y": 55, "fontSize": 12, "fontWeight": "bold" },
            { "id": "price", "type": "text", "text": "₹ 189.00", "x": 175, "y": 80, "fontSize": 18, "fontWeight": "extrabold" }
        ]
    }
    t4 = LabelTemplate.objects.create(
        company=company,
        name="Template 4: 6-Label Grid (3x2)",
        description="6 labels per sheet. Side-by-side barcode and text layout.",
        canvas_json=t4_canvas,
        width=400,
        height=120,
        background_color="#ffffff",
        category="BarTender Import",
        created_by=user
    )
    print("Created Template 4")

if __name__ == "__main__":
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()
    create_templates()
