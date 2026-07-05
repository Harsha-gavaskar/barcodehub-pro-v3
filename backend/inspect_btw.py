import os

def extract_png_from_btw(filepath):
    print(f"Extracting PNG from {filepath}...")
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
        
        # PNG signature
        png_sig = b'\x89PNG\r\n\x1a\n'
        start_idx = content.find(png_sig)
        
        if start_idx == -1:
            print("No PNG signature found.")
            return False
            
        # Find end of PNG (IEND chunk)
        # The IEND chunk is 4 bytes length (00 00 00 00), 4 bytes "IEND" (49 45 4E 44), 4 bytes CRC (AE 42 60 82)
        iend_sig = b'IEND'
        iend_idx = content.find(iend_sig, start_idx)
        
        if iend_idx == -1:
            print("No IEND chunk found.")
            return False
            
        # PNG ends 4 bytes after IEND (for CRC)
        end_idx = iend_idx + 8
        png_data = content[start_idx:end_idx]
        
        out_name = os.path.basename(filepath).replace('.btw', '.png')
        out_path = os.path.join(os.path.dirname(filepath), out_name)
        
        with open(out_path, 'wb') as out_f:
            out_f.write(png_data)
            
        print(f"Successfully extracted PNG to {out_path} (Size: {len(png_data)} bytes)")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    files = [
        "../Document2.btw",
        "../Document3.btw",
        "../Document4.btw",
        "../LPG 2BY6.lnk.btw"
    ]
    for fn in files:
        path = os.path.join(os.path.dirname(__file__), fn)
        if os.path.exists(path):
            extract_png_from_btw(path)
