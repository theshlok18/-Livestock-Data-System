from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_connection
import os, io
from datetime import datetime

# ── Export helpers ────────────────────────────────────────────────────────────

EXPORT_COLUMNS = [
    ('tag_no',               'Tag No'),
    ('record_date',          'Record Date'),
    ('animal_type',          'Animal Type'),
    ('breed',                'Breed'),
    ('age',                  'Age'),
    ('owner_name',           'Owner Name'),
    ('village',              'Village'),
    ('contact',              'Contact'),
    ('milk_per_day',         'Milk Per Day (L)'),
    ('fat',                  'Fat %'),
    ('snf',                  'SNF %'),
    ('rate',                 'Rate (₹/L)'),
    ('feeding',              'Feeding Details'),
    ('expenses',             'Expenses (₹)'),
    ('health_status',        'Health Status'),
    ('vaccination',          'Vaccination'),
    ('deworming',            'Deworming'),
    ('pregnancy_status',     'Pregnancy Status'),
    ('lactation_no',         'Lactation No'),
    ('dry_date',             'Dry Date'),
    ('calving_date',         'Calving Date'),
    ('calf_tag',             'Calf Tag'),
    ('calf_sex',             'Calf Sex'),
    ('body_weight',          'Body Weight (kg)'),
    ('body_condition_score', 'Body Condition Score'),
    ('notes',                'Notes'),
    ('is_draft',             'Status'),
    ('officer_name',         'Field Officer'),
    ('created_at',           'Created At'),
]

def _fetch_records_with_animal(conn, tag_no=None, record_id=None):
    if record_id:
        rows = conn.execute('''
            SELECT mr.*, a.animal_type, a.breed, a.age, a.owner_name, a.village, a.contact,
                   u.full_name as officer_name
            FROM monthly_records mr
            JOIN animals a ON mr.tag_no = a.tag_no
            LEFT JOIN users u ON mr.created_by = u.id
            WHERE mr.id = ?
        ''', (record_id,)).fetchall()
    else:
        rows = conn.execute('''
            SELECT mr.*, a.animal_type, a.breed, a.age, a.owner_name, a.village, a.contact,
                   u.full_name as officer_name
            FROM monthly_records mr
            JOIN animals a ON mr.tag_no = a.tag_no
            LEFT JOIN users u ON mr.created_by = u.id
            WHERE mr.tag_no = ?
            ORDER BY mr.record_date DESC
        ''', (tag_no,)).fetchall()
    return [dict(r) for r in rows]


def _build_pdf(records, title):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.platypus import (SimpleDocTemplate, Table, TableStyle,
                                    Paragraph, Spacer, HRFlowable, KeepTogether)
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    GREEN       = colors.HexColor('#065f46')
    GREEN_LIGHT = colors.HexColor('#d1fae5')
    GREEN_MID   = colors.HexColor('#059669')
    BLUE_LIGHT  = colors.HexColor('#dbeafe')
    BLUE_HDR    = colors.HexColor('#1d4ed8')
    ROSE_LIGHT  = colors.HexColor('#ffe4e6')
    ROSE_HDR    = colors.HexColor('#be123c')
    AMBER_LIGHT = colors.HexColor('#fef3c7')
    AMBER_HDR   = colors.HexColor('#b45309')
    PURPLE_LIGHT= colors.HexColor('#ede9fe')
    PURPLE_HDR  = colors.HexColor('#7c3aed')
    SLATE_LIGHT = colors.HexColor('#f1f5f9')
    SLATE_HDR   = colors.HexColor('#475569')
    BORDER      = colors.HexColor('#cbd5e1')
    LABEL_BG    = colors.HexColor('#f8fafc')
    TEXT        = colors.HexColor('#1e293b')
    SUBTEXT     = colors.HexColor('#64748b')

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            topMargin=12*mm, bottomMargin=12*mm,
                            leftMargin=14*mm, rightMargin=14*mm)

    # ── Styles ────────────────────────────────────────────────────────────────
    styles = getSampleStyleSheet()
    def ps(name, **kw):
        return ParagraphStyle(name, parent=styles['Normal'], **kw)

    S = {
        'doc_title': ps('dt', fontSize=15, fontName='Helvetica-Bold',
                        textColor=GREEN, spaceAfter=1*mm, alignment=TA_CENTER),
        'doc_sub':   ps('ds', fontSize=8, textColor=SUBTEXT,
                        spaceAfter=0, alignment=TA_CENTER),
        'sec_hdr':   ps('sh', fontSize=8, fontName='Helvetica-Bold',
                        textColor=colors.white),
        'label':     ps('lb', fontSize=8, fontName='Helvetica-Bold',
                        textColor=SUBTEXT),
        'value':     ps('vl', fontSize=9, fontName='Helvetica',
                        textColor=TEXT),
        'rec_title': ps('rt', fontSize=10, fontName='Helvetica-Bold',
                        textColor=GREEN, spaceBefore=4*mm, spaceAfter=1*mm),
        'footer':    ps('ft', fontSize=7, textColor=SUBTEXT, alignment=TA_CENTER),
    }

    # ── Section definitions ───────────────────────────────────────────────────
    SECTIONS = [
        ('🏷  Animal Identification', GREEN, GREEN_LIGHT, [
            ('Tag No',       'tag_no'),
            ('Animal Type',  'animal_type'),
            ('Breed',        'breed'),
            ('Age',          'age'),
            ('Owner Name',   'owner_name'),
            ('Village',      'village'),
            ('Contact',      'contact'),
        ]),
        ('📊  Monthly Production', BLUE_HDR, BLUE_LIGHT, [
            ('Record Date',     'record_date'),
            ('Milk Per Day (L)','milk_per_day'),
            ('Fat %',           'fat'),
            ('SNF %',           'snf'),
            ('Rate (₹/L)',      'rate'),
            ('Feeding Details', 'feeding'),
            ('Expenses (₹)',    'expenses'),
        ]),
        ('🏥  Health & Breeding', ROSE_HDR, ROSE_LIGHT, [
            ('Health Status',    'health_status'),
            ('Vaccination',      'vaccination'),
            ('Deworming',        'deworming'),
            ('Pregnancy Status', 'pregnancy_status'),
            ('Lactation No',     'lactation_no'),
            ('Dry Date',         'dry_date'),
            ('Calving Date',     'calving_date'),
        ]),
        ('🐮  Calf Details', AMBER_HDR, AMBER_LIGHT, [
            ('Calf Tag No', 'calf_tag'),
            ('Calf Sex',    'calf_sex'),
        ]),
        ('⚖  Body Measurements', PURPLE_HDR, PURPLE_LIGHT, [
            ('Body Weight (kg)',    'body_weight'),
            ('Body Condition Score','body_condition_score'),
        ]),
        ('📝  Remarks', SLATE_HDR, SLATE_LIGHT, [
            ('Notes / Observations', 'notes'),
        ]),
    ]

    def make_section(sec_label, hdr_color, bg_color, fields, rec):
        """Build one section as a list of flowables."""
        # Section header bar
        hdr_table = Table(
            [[Paragraph(sec_label, S['sec_hdr'])]],
            colWidths=[182*mm]
        )
        hdr_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), hdr_color),
            ('PADDING',    (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))

        # Fields in 2-column grid (label | value | label | value)
        rows = []
        pairs = [(label, rec.get(key, '') or '') for label, key in fields]
        for i in range(0, len(pairs), 2):
            left  = pairs[i]
            right = pairs[i+1] if i+1 < len(pairs) else ('', '')
            rows.append([
                Paragraph(left[0],  S['label']),
                Paragraph(str(left[1]),  S['value']),
                Paragraph(right[0], S['label']),
                Paragraph(str(right[1]), S['value']),
            ])

        # If notes section (single wide field)
        if len(fields) == 1:
            rows = [[
                Paragraph(fields[0][0], S['label']),
                Paragraph(str(rec.get(fields[0][1], '') or ''), S['value']),
            ]]
            col_w = [35*mm, 147*mm]
        else:
            col_w = [35*mm, 56*mm, 35*mm, 56*mm]

        body_table = Table(rows, colWidths=col_w)
        body_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('BACKGROUND', (0,0), (0,-1), LABEL_BG),
            ('BACKGROUND', (2,0), (2,-1), LABEL_BG),
            ('GRID',       (0,0), (-1,-1), 0.5, BORDER),
            ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING',   (0,0), (-1,-1), 6),
            ('RIGHTPADDING',  (0,0), (-1,-1), 6),
        ]))

        return [hdr_table, body_table]

    # ── Build elements ────────────────────────────────────────────────────────
    elements = []

    # Document header
    elements.append(Paragraph("Livestock Animal Data Digitization System", S['doc_title']))
    elements.append(Paragraph("Government of India — Animal Husbandry Department", S['doc_sub']))
    elements.append(Paragraph(
        f"Generated: {datetime.now().strftime('%d %b %Y  %H:%M')}  |  {title}",
        S['doc_sub']
    ))
    elements.append(Spacer(1, 4*mm))
    elements.append(HRFlowable(width='100%', thickness=1.5, color=GREEN))
    elements.append(Spacer(1, 3*mm))

    for idx, rec in enumerate(records):
        block = []

        # Record number heading (only for multi-record exports)
        if len(records) > 1:
            block.append(Paragraph(
                f"Record {idx+1}  —  {rec.get('record_date','')}  |  "
                f"Tag: {rec.get('tag_no','')}  |  "
                f"{'DRAFT' if rec.get('is_draft') else 'Submitted'}",
                S['rec_title']
            ))

        for sec_label, hdr_color, bg_color, fields in SECTIONS:
            block.extend(make_section(sec_label, hdr_color, bg_color, fields, rec))
            block.append(Spacer(1, 1.5*mm))

        # Signature footer per record
        sig_data = [['Field Officer Signature: _______________________',
                      'Stamp & Date: ___________________']]
        sig_table = Table(sig_data, colWidths=[91*mm, 91*mm])
        sig_table.setStyle(TableStyle([
            ('FONTSIZE',  (0,0), (-1,-1), 8),
            ('TEXTCOLOR', (0,0), (-1,-1), SUBTEXT),
            ('TOPPADDING',(0,0), (-1,-1), 6),
        ]))
        block.append(sig_table)

        if idx < len(records) - 1:
            block.append(Spacer(1, 6*mm))
            block.append(HRFlowable(width='100%', thickness=0.5,
                                    color=BORDER, dash=(4,4)))
            block.append(Spacer(1, 4*mm))

        elements.append(KeepTogether(block))

    doc.build(elements)
    buf.seek(0)
    return buf


def _build_excel(records, title):
    import xlsxwriter
    buf = io.BytesIO()
    wb  = xlsxwriter.Workbook(buf, {'in_memory': True})
    ws  = wb.add_worksheet('Records')

    # ── Formats ───────────────────────────────────────────────────────────────
    title_fmt = wb.add_format({
        'bold': True, 'font_size': 14, 'font_color': '#065f46',
        'font_name': 'Calibri'
    })
    sub_fmt = wb.add_format({
        'font_size': 9, 'font_color': '#64748b', 'italic': True,
        'font_name': 'Calibri'
    })
    hdr_fmt = wb.add_format({
        'bold': True, 'bg_color': '#065f46', 'font_color': '#ffffff',
        'border': 1, 'border_color': '#047857',
        'text_wrap': False, 'valign': 'vcenter', 'align': 'center',
        'font_size': 10, 'font_name': 'Calibri'
    })
    even_fmt = wb.add_format({
        'bg_color': '#f0fdf4', 'border': 1, 'border_color': '#d1fae5',
        'font_size': 10, 'valign': 'vcenter', 'align': 'left',
        'text_wrap': False, 'font_name': 'Calibri'
    })
    odd_fmt = wb.add_format({
        'bg_color': '#ffffff', 'border': 1, 'border_color': '#e2e8f0',
        'font_size': 10, 'valign': 'vcenter', 'align': 'left',
        'text_wrap': False, 'font_name': 'Calibri'
    })
    tag_fmt = wb.add_format({
        'bg_color': '#ecfdf5', 'border': 1, 'border_color': '#6ee7b7',
        'font_size': 10, 'valign': 'vcenter', 'align': 'center',
        'bold': True, 'font_color': '#065f46', 'font_name': 'Courier New'
    })
    tag_fmt_odd = wb.add_format({
        'bg_color': '#ffffff', 'border': 1, 'border_color': '#e2e8f0',
        'font_size': 10, 'valign': 'vcenter', 'align': 'center',
        'bold': True, 'font_color': '#065f46', 'font_name': 'Courier New'
    })
    status_done = wb.add_format({
        'bg_color': '#d1fae5', 'font_color': '#065f46', 'bold': True,
        'border': 1, 'border_color': '#6ee7b7', 'align': 'center',
        'valign': 'vcenter', 'font_size': 10, 'font_name': 'Calibri'
    })
    status_draft = wb.add_format({
        'bg_color': '#fef3c7', 'font_color': '#92400e', 'bold': True,
        'border': 1, 'border_color': '#fcd34d', 'align': 'center',
        'valign': 'vcenter', 'font_size': 10, 'font_name': 'Calibri'
    })
    num_fmt = wb.add_format({
        'bg_color': '#f0fdf4', 'border': 1, 'border_color': '#d1fae5',
        'font_size': 10, 'valign': 'vcenter', 'align': 'right',
        'num_format': '0.00', 'font_name': 'Calibri'
    })
    num_fmt_odd = wb.add_format({
        'bg_color': '#ffffff', 'border': 1, 'border_color': '#e2e8f0',
        'font_size': 10, 'valign': 'vcenter', 'align': 'right',
        'num_format': '0.00', 'font_name': 'Calibri'
    })

    # ── Title block ───────────────────────────────────────────────────────────
    ws.set_row(0, 22)
    ws.set_row(1, 16)
    ws.set_row(2, 14)
    ws.set_row(3, 6)   # spacer

    num_cols = len(EXPORT_COLUMNS)
    ws.merge_range(0, 0, 0, min(num_cols - 1, 10),
                   'Livestock Animal Data Digitization System', title_fmt)
    ws.merge_range(1, 0, 1, min(num_cols - 1, 10), title, sub_fmt)
    ws.write(2, 0, f'Generated: {datetime.now().strftime("%d %b %Y  %H:%M")}', sub_fmt)

    # ── Header row (row index 4) ───────────────────────────────────────────────
    HDR_ROW = 4
    ws.set_row(HDR_ROW, 20)
    for col_idx, (_, label) in enumerate(EXPORT_COLUMNS):
        ws.write(HDR_ROW, col_idx, label, hdr_fmt)

    # ── Track max content width per column ────────────────────────────────────
    # Start with header label lengths
    col_widths = [len(label) for _, label in EXPORT_COLUMNS]

    # Numeric fields that should right-align
    NUMERIC_KEYS = {'milk_per_day', 'fat', 'snf', 'rate', 'expenses',
                    'body_weight', 'lactation_no'}

    # ── Data rows (start at row 5) ────────────────────────────────────────────
    DATA_START = 5
    for row_idx, rec in enumerate(records):
        is_even = row_idx % 2 == 0
        ws.set_row(DATA_START + row_idx, 18)

        for col_idx, (key, _) in enumerate(EXPORT_COLUMNS):
            val = rec.get(key, '')

            # Format value
            if key == 'is_draft':
                display = 'Draft' if val else 'Submitted'
                fmt = status_draft if val else status_done
                ws.write(DATA_START + row_idx, col_idx, display, fmt)
            elif key == 'tag_no':
                display = str(val) if val is not None else ''
                ws.write(DATA_START + row_idx, col_idx, display,
                         tag_fmt if is_even else tag_fmt_odd)
            elif key in NUMERIC_KEYS and val not in (None, ''):
                try:
                    ws.write_number(DATA_START + row_idx, col_idx, float(val),
                                    num_fmt if is_even else num_fmt_odd)
                    display = str(val)
                except (ValueError, TypeError):
                    display = str(val) if val is not None else ''
                    ws.write(DATA_START + row_idx, col_idx, display,
                             even_fmt if is_even else odd_fmt)
            else:
                display = str(val) if val is not None else ''
                ws.write(DATA_START + row_idx, col_idx, display,
                         even_fmt if is_even else odd_fmt)

            # Track max width
            col_widths[col_idx] = max(col_widths[col_idx], len(str(display)))

    # ── Set column widths based on content (with min/max bounds) ─────────────
    for col_idx, width in enumerate(col_widths):
        # Add padding, clamp between 8 and 40
        ws.set_column(col_idx, col_idx, min(max(width + 3, 8), 40))

    # ── Freeze header + enable autofilter ─────────────────────────────────────
    ws.freeze_panes(DATA_START, 0)
    ws.autofilter(HDR_ROW, 0, HDR_ROW + len(records), num_cols - 1)

    # ── Sheet settings ────────────────────────────────────────────────────────
    ws.set_zoom(100)
    ws.set_paper(9)          # A4
    ws.fit_to_pages(1, 0)    # fit width to 1 page when printing
    ws.set_landscape()
    ws.set_print_scale(75)
    ws.repeat_rows(HDR_ROW, HDR_ROW)  # repeat header on each printed page

    wb.close()
    buf.seek(0)
    return buf

api_bp = Blueprint('api', __name__)

def row_to_dict(row):
    return dict(row) if row else None

# ── Animal ────────────────────────────────────────────────────────────────────

@api_bp.route('/animal/<tag_no>', methods=['GET'])
@jwt_required()
def get_animal(tag_no):
    try:
        conn = get_connection()
        animal = conn.execute('SELECT * FROM animals WHERE tag_no = ?', (tag_no,)).fetchone()
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    if not animal:
        return jsonify({'found': False}), 404

    return jsonify({'found': True, 'animal': row_to_dict(animal)}), 200


@api_bp.route('/animal', methods=['POST'])
@jwt_required()
def create_animal():
    is_multipart = request.content_type and 'multipart' in request.content_type
    data = request.form.to_dict() if is_multipart else (request.get_json() or {})

    tag_no = data.get('tag_no', '').strip()
    if not tag_no:
        return jsonify({'error': 'Tag number is required'}), 400

    image_path = None
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename:
            upload_dir = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_dir, exist_ok=True)
            ext = file.filename.rsplit('.', 1)[-1].lower()
            filename = f"{tag_no}_{int(datetime.now().timestamp())}.{ext}"
            file.save(os.path.join(upload_dir, filename))
            image_path = filename

    try:
        conn = get_connection()
        existing = conn.execute('SELECT id FROM animals WHERE tag_no = ?', (tag_no,)).fetchone()
        if existing:
            conn.execute('''
                UPDATE animals SET animal_type=?, breed=?, age=?, owner_name=?, village=?, contact=?,
                mobile_no=?, aadhar_no=?,
                image_path=COALESCE(?, image_path) WHERE tag_no=?
            ''', (data.get('animal_type'), data.get('breed'), data.get('age'),
                  data.get('owner_name'), data.get('village'), data.get('contact'),
                  data.get('mobile_no'), data.get('aadhar_no'),
                  image_path, tag_no))
        else:
            conn.execute('''
                INSERT INTO animals (tag_no, animal_type, breed, age, owner_name, village, contact, mobile_no, aadhar_no, image_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (tag_no, data.get('animal_type'), data.get('breed'), data.get('age'),
                  data.get('owner_name'), data.get('village'), data.get('contact'),
                  data.get('mobile_no'), data.get('aadhar_no'), image_path))
        conn.commit()
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'message': 'Animal saved', 'tag_no': tag_no}), 201


# ── Monthly Records ───────────────────────────────────────────────────────────

@api_bp.route('/record', methods=['POST'])
@jwt_required()
def create_record():
    import json as _json
    data = request.get_json() or {}
    tag_no = data.get('tag_no', '').strip()
    if not tag_no:
        return jsonify({'error': 'Tag number is required'}), 400

    user_id = get_jwt_identity()

    feeding_data = data.get('feeding_data', [])
    feeding_data_str = _json.dumps(feeding_data) if isinstance(feeding_data, list) else '[]'

    expenses = data.get('expenses')
    if not expenses and feeding_data:
        expenses = sum(float(r.get('amount', 0)) for r in feeding_data if r.get('amount'))

    try:
        conn = get_connection()
        if not conn.execute('SELECT id FROM animals WHERE tag_no = ?', (tag_no,)).fetchone():
            conn.close()
            return jsonify({'error': 'Animal not found. Save animal first.'}), 404

        cur = conn.execute('''
            INSERT INTO monthly_records (
                tag_no, record_date, milk_per_day, fat, snf, rate, feeding, expenses,
                health_status, vaccination, deworming, pregnancy_status, pregnancy_month,
                lactation_no, dry_date, calving_date, calf_tag, calf_sex,
                body_weight, body_condition_score, notes,
                mobile_no, aadhar_no,
                milk_increase, milk_increase_value, challenge_feeding,
                feeding_data, is_draft, created_by
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', (
            tag_no,
            data.get('record_date') or datetime.now().strftime('%Y-%m-%d'),
            data.get('milk_per_day'), data.get('fat'), data.get('snf'), data.get('rate'),
            data.get('feeding'), expenses,
            data.get('health_status'), data.get('vaccination'), data.get('deworming'),
            data.get('pregnancy_status'), data.get('pregnancy_month') or None,
            data.get('lactation_no'),
            data.get('dry_date') or None, data.get('calving_date') or None,
            data.get('calf_tag'), data.get('calf_sex'),
            data.get('body_weight'), data.get('body_condition_score'),
            data.get('notes'),
            data.get('mobile_no'), data.get('aadhar_no'),
            data.get('milk_increase'), data.get('milk_increase_value') or None,
            data.get('challenge_feeding') or None,
            feeding_data_str,
            1 if data.get('is_draft') else 0, user_id
        ))
        conn.commit()
        record_id = cur.lastrowid
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'message': 'Record saved', 'id': record_id}), 201


@api_bp.route('/record/<int:record_id>', methods=['PUT'])
@jwt_required()
def update_record(record_id):
    import json as _json
    data = request.get_json() or {}
    user_id = get_jwt_identity()

    feeding_data = data.get('feeding_data', [])
    feeding_data_str = _json.dumps(feeding_data) if isinstance(feeding_data, list) else '[]'

    expenses = data.get('expenses')
    if not expenses and feeding_data:
        expenses = sum(float(r.get('amount', 0)) for r in feeding_data if r.get('amount'))

    try:
        conn = get_connection()
        conn.execute('''
            UPDATE monthly_records SET
                record_date=?, milk_per_day=?, fat=?, snf=?, rate=?, feeding=?, expenses=?,
                health_status=?, vaccination=?, deworming=?, pregnancy_status=?, pregnancy_month=?,
                lactation_no=?, dry_date=?, calving_date=?, calf_tag=?, calf_sex=?,
                body_weight=?, body_condition_score=?, notes=?,
                mobile_no=?, aadhar_no=?,
                milk_increase=?, milk_increase_value=?, challenge_feeding=?,
                feeding_data=?, is_draft=?
            WHERE id=? AND created_by=?
        ''', (
            data.get('record_date'), data.get('milk_per_day'), data.get('fat'),
            data.get('snf'), data.get('rate'), data.get('feeding'), expenses,
            data.get('health_status'), data.get('vaccination'), data.get('deworming'),
            data.get('pregnancy_status'), data.get('pregnancy_month') or None,
            data.get('lactation_no'),
            data.get('dry_date') or None, data.get('calving_date') or None,
            data.get('calf_tag'), data.get('calf_sex'),
            data.get('body_weight'), data.get('body_condition_score'),
            data.get('notes'),
            data.get('mobile_no'), data.get('aadhar_no'),
            data.get('milk_increase'), data.get('milk_increase_value') or None,
            data.get('challenge_feeding') or None,
            feeding_data_str, 1 if data.get('is_draft') else 0,
            record_id, user_id
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'message': 'Record updated'}), 200


@api_bp.route('/records/<tag_no>', methods=['GET'])
@jwt_required()
def get_records(tag_no):
    import json as _json
    try:
        conn = get_connection()
        rows = conn.execute('''
            SELECT mr.*, u.full_name as officer_name
            FROM monthly_records mr
            LEFT JOIN users u ON mr.created_by = u.id
            WHERE mr.tag_no = ?
            ORDER BY mr.record_date DESC
        ''', (tag_no,)).fetchall()
        conn.close()
        records = []
        for r in rows:
            rec = dict(r)
            # Parse feeding_data JSON string back to list
            raw = rec.get('feeding_data', '[]') or '[]'
            try:
                rec['feeding_data'] = _json.loads(raw)
            except Exception:
                rec['feeding_data'] = []
            records.append(rec)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'records': records}), 200


@api_bp.route('/record/<int:record_id>/pdf', methods=['GET'])
@jwt_required()
def export_pdf(record_id):
    try:
        conn = get_connection()
        row = conn.execute('''
            SELECT mr.*, a.animal_type, a.breed, a.age, a.owner_name, a.village, a.contact
            FROM monthly_records mr
            JOIN animals a ON mr.tag_no = a.tag_no
            WHERE mr.id = ?
        ''', (record_id,)).fetchone()
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    if not row:
        return jsonify({'error': 'Record not found'}), 404

    record = dict(row)

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=30, bottomMargin=30)
        styles = getSampleStyleSheet()
        elements = [
            Paragraph("Livestock Animal Monthly Record", styles['Title']),
            Spacer(1, 12)
        ]

        fields = [
            ['Tag No', str(record.get('tag_no', '')), 'Date', str(record.get('record_date', ''))],
            ['Animal Type', str(record.get('animal_type', '')), 'Breed', str(record.get('breed', ''))],
            ['Age', str(record.get('age', '')), 'Owner', str(record.get('owner_name', ''))],
            ['Village', str(record.get('village', '')), 'Contact', str(record.get('contact', ''))],
            ['Milk/Day (L)', str(record.get('milk_per_day', '')), 'Fat %', str(record.get('fat', ''))],
            ['SNF %', str(record.get('snf', '')), 'Rate (₹/L)', str(record.get('rate', ''))],
            ['Feeding', str(record.get('feeding', '')), 'Expenses (₹)', str(record.get('expenses', ''))],
            ['Health Status', str(record.get('health_status', '')), 'Vaccination', str(record.get('vaccination', ''))],
            ['Pregnancy', str(record.get('pregnancy_status', '')), 'Lactation No', str(record.get('lactation_no', ''))],
            ['Body Weight', str(record.get('body_weight', '')), 'BCS', str(record.get('body_condition_score', ''))],
            ['Notes', str(record.get('notes', '')), '', ''],
        ]

        table = Table(fields, colWidths=[110, 150, 110, 150])
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('BACKGROUND', (2, 0), (2, -1), colors.lightgrey),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(table)
        doc.build(elements)
        buffer.seek(0)

        return send_file(buffer, mimetype='application/pdf', as_attachment=True,
                         download_name=f"record_{record['tag_no']}_{record['record_date']}.pdf")
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/record/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(record_id):
    user_id = get_jwt_identity()
    try:
        conn = get_connection()
        conn.execute('DELETE FROM monthly_records WHERE id = ?', (record_id,))
        conn.commit()
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'Record deleted'}), 200


@api_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        conn = get_connection()
        animals = conn.execute('SELECT COUNT(*) as c FROM animals').fetchone()['c']
        records = conn.execute('SELECT COUNT(*) as c FROM monthly_records WHERE is_draft = 0').fetchone()['c']
        drafts  = conn.execute('SELECT COUNT(*) as c FROM monthly_records WHERE is_draft = 1').fetchone()['c']
        recent  = conn.execute('''
            SELECT mr.id, mr.tag_no, mr.record_date, mr.milk_per_day, mr.health_status,
                   mr.is_draft, a.animal_type
            FROM monthly_records mr
            LEFT JOIN animals a ON mr.tag_no = a.tag_no
            ORDER BY mr.created_at DESC LIMIT 10
        ''').fetchall()
        conn.close()
        return jsonify({
            'stats': {'animals': animals, 'records': records, 'drafts': drafts},
            'recent': [dict(r) for r in recent]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Export endpoints ──────────────────────────────────────────────────────────

@api_bp.route('/export/record/<int:record_id>/pdf', methods=['GET'])
@jwt_required()
def export_record_pdf(record_id):
    try:
        conn = get_connection()
        records = _fetch_records_with_animal(conn, record_id=record_id)
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    if not records:
        return jsonify({'error': 'Record not found'}), 404
    rec = records[0]
    buf = _build_pdf(records, f"Tag: {rec.get('tag_no')} | Date: {rec.get('record_date')}")
    return send_file(buf, mimetype='application/pdf', as_attachment=True,
                     download_name=f"record_{rec.get('tag_no')}_{rec.get('record_date')}.pdf")


@api_bp.route('/export/record/<int:record_id>/excel', methods=['GET'])
@jwt_required()
def export_record_excel(record_id):
    try:
        conn = get_connection()
        records = _fetch_records_with_animal(conn, record_id=record_id)
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    if not records:
        return jsonify({'error': 'Record not found'}), 404
    rec = records[0]
    buf = _build_excel(records, f"Tag: {rec.get('tag_no')} | Date: {rec.get('record_date')}")
    return send_file(buf,
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     as_attachment=True,
                     download_name=f"record_{rec.get('tag_no')}_{rec.get('record_date')}.xlsx")


@api_bp.route('/export/animal/<tag_no>/pdf', methods=['GET'])
@jwt_required()
def export_animal_pdf(tag_no):
    try:
        conn = get_connection()
        records = _fetch_records_with_animal(conn, tag_no=tag_no)
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    if not records:
        return jsonify({'error': 'No records found'}), 404
    buf = _build_pdf(records, f"Full History — Tag: {tag_no} ({len(records)} records)")
    return send_file(buf, mimetype='application/pdf', as_attachment=True,
                     download_name=f"history_{tag_no}.pdf")


@api_bp.route('/export/animal/<tag_no>/excel', methods=['GET'])
@jwt_required()
def export_animal_excel(tag_no):
    try:
        conn = get_connection()
        records = _fetch_records_with_animal(conn, tag_no=tag_no)
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    if not records:
        return jsonify({'error': 'No records found'}), 404
    buf = _build_excel(records, f"Full History — Tag: {tag_no} ({len(records)} records)")
    return send_file(buf,
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     as_attachment=True,
                     download_name=f"history_{tag_no}.xlsx")


@api_bp.route('/profile/change-password', methods=['POST'])
@jwt_required()
def change_password():
    import bcrypt as _bcrypt
    data = request.get_json() or {}
    user_id = get_jwt_identity()
    current = data.get('current_password', '').strip()
    new_pw  = data.get('new_password', '').strip()

    if not current or not new_pw:
        return jsonify({'error': 'Both fields are required'}), 400
    if len(new_pw) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400

    try:
        conn = get_connection()
        user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        if not user:
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        if not _bcrypt.checkpw(current.encode(), user['password_hash'].encode()):
            conn.close()
            return jsonify({'error': 'Current password is incorrect'}), 401
        new_hash = _bcrypt.hashpw(new_pw.encode(), _bcrypt.gensalt()).decode()
        conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', (new_hash, user_id))
        conn.commit()
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'message': 'Password changed successfully'}), 200


@api_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    try:
        conn = get_connection()
        user = conn.execute('SELECT id, username, full_name, role, created_at FROM users WHERE id = ?', (user_id,)).fetchone()
        conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': dict(user)}), 200


@api_bp.route('/uploads/<filename>', methods=['GET'])
@jwt_required()
def get_image(filename):
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'Not found'}), 404
    return send_file(filepath)
