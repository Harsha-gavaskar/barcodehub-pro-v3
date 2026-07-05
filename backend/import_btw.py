import os
import shutil

def import_btw_templates():
    print("Starting import of BarTender templates...")
    
    # Import inside function to ensure django.setup() has run
    from apps.users.models import User, Company
    from apps.labels.models import LabelTemplate

    # 1. Get company and user
    try:
        company = Company.objects.first()
        user = User.objects.filter(role='admin').first()
        if not company or not user:
            print("Database has not been seeded yet. Run seed_data command first.")
            return
    except Exception as e:
        print(f"Error accessing DB: {e}")
        return

    # 2. Define files
    files = [
        "Document2",
        "Document3",
        "Document4",
        "LPG 2BY6.lnk"
    ]
    
    workspace_dir = os.path.join(os.path.dirname(__file__), "..")
    media_dir = os.path.join(os.path.dirname(__file__), "media", "label_thumbnails")
    os.makedirs(media_dir, exist_ok=True)
    
    for f_base in files:
        btw_filename = f"{f_base}.btw"
        png_filename = f"{f_base}.png"
        
        btw_path = os.path.join(workspace_dir, btw_filename)
        png_path = os.path.join(workspace_dir, png_filename)
        
        if not os.path.exists(btw_path):
            print(f"File not found: {btw_path}")
            continue
            
        print(f"Processing template: {f_base}")
        
        width = 400
        height = 100
        
        canvas_json = {
          "width": width,
          "height": height,
          "elements": [
            { "id": "1", "type": "text", "text": f"IMPORT: {f_base}", "x": 20, "y": 15, "fontSize": 14, "fontWeight": "bold", "color": "#000000" },
            { "id": "2", "type": "barcode", "value": "BH-IMPORT-12345", "format": "CODE128", "x": 20, "y": 40, "width": 360, "height": 45, "displayValue": True }
          ]
        }
        
        # Create record
        tmpl, created = LabelTemplate.objects.update_or_create(
            company=company,
            name=f_base,
            defaults={
                'description': f"Imported from BarTender BTW template ({btw_filename}). Standard TSC TTP-244 Pro print layout.",
                'canvas_json': canvas_json,
                'width': width,
                'height': height,
                'background_color': '#ffffff',
                'category': 'BarTender Import',
                'created_by': user
            }
        )
        
        # If preview PNG exists, copy to media and link it
        if os.path.exists(png_path):
            dest_png = os.path.join(media_dir, png_filename)
            shutil.copy2(png_path, dest_png)
            tmpl.thumbnail = f"label_thumbnails/{png_filename}"
            tmpl.save()
            print(f"Linked thumbnail: {tmpl.thumbnail}")
            
        action = "Created" if created else "Updated"
        print(f"Successfully {action} template record: {tmpl.name}")

if __name__ == "__main__":
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    django.setup()
    import_btw_templates()
