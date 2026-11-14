#!/usr/bin/env python3
"""Converte sea-power-unit-database.xlsx em data/database.json.

Uso: python3 scripts/convert_xlsx.py <caminho/para/sea-power-unit-database.xlsx>
"""
import json
import sys
import os

import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "data", "database.json")


def main(xlsx_path):
    wb = openpyxl.load_workbook(xlsx_path, read_only=True, data_only=True)
    out = {}
    for ws in wb.worksheets:
        rows = list(ws.iter_rows(values_only=True))
        hdr_idx = next(i for i, r in enumerate(rows) if r[1] == "ID")
        headers = [h for h in rows[hdr_idx][1:] if h]
        records = []
        for r in rows[hdr_idx + 1:]:
            if r[1] is None:
                continue
            rec = {}
            for j, h in enumerate(headers):
                v = r[1 + j]
                if isinstance(v, float) and v == int(v):
                    v = int(v)
                rec[h] = v
            records.append(rec)
        out[ws.title] = {"headers": headers, "records": records}
        print(ws.title, len(records))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(out, f, ensure_ascii=False)
    print("escrito:", os.path.abspath(OUT))


if __name__ == "__main__":
    main(sys.argv[1])
