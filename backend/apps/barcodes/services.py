import io
import base64
import logging

logger = logging.getLogger(__name__)

class BarcodeService:
    @staticmethod
    def generate_barcode(value: str, fmt: str, **options) -> dict:
        """Generate barcode in SVG and PNG formats"""
        result = {'value': value, 'format': fmt, 'svg': None, 'png_base64': None}
        try:
            if fmt == 'QR':
                import qrcode
                from qrcode.image.svg import SvgFillImage
                img = qrcode.make(value, error_correction=qrcode.constants.ERROR_CORRECT_H)
                png_buffer = io.BytesIO()
                img.save(png_buffer, format='PNG')
                result['png_base64'] = base64.b64encode(png_buffer.getvalue()).decode()
                
                # SVG QR
                svg_img = qrcode.make(value, image_factory=SvgFillImage)
                svg_buffer = io.BytesIO()
                svg_img.save(svg_buffer)
                result['svg'] = svg_buffer.getvalue().decode('utf-8')
            else:
                import barcode as python_barcode
                from barcode.writer import SVGWriter, ImageWriter
                
                FORMAT_MAP = {
                    'CODE128': 'code128',
                    'CODE39': 'code39',
                    'EAN13': 'ean13',
                    'EAN8': 'ean8',
                    'UPC': 'upca',
                }
                bc_format = FORMAT_MAP.get(fmt, 'code128')
                bc_class = python_barcode.get_barcode_class(bc_format)
                
                # SVG
                svg_buffer = io.BytesIO()
                bc_class(value, writer=SVGWriter()).write(svg_buffer)
                result['svg'] = svg_buffer.getvalue().decode('utf-8')
                
                # PNG
                png_buffer = io.BytesIO()
                bc_class(value, writer=ImageWriter()).write(png_buffer)
                result['png_base64'] = base64.b64encode(png_buffer.getvalue()).decode()
        except Exception as e:
            logger.error(f'Barcode generation error: {e}')
            result['error'] = str(e)
        return result

    @staticmethod
    def generate_batch(items: list, fmt: str) -> list:
        """Generate multiple barcodes"""
        return [BarcodeService.generate_barcode(item['value'], fmt, label=item.get('label', '')) for item in items]
