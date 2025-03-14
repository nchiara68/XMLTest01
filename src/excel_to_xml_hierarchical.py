from datetime import datetime  # Import for date formatting
import pandas as pd
import os
import xml.etree.ElementTree as ET
from xml.dom.minidom import parseString  # For pretty XML formatting

# Function to create XML elements dynamically based on column names
def create_nested_element(root, path, value):
    parts = path.split('_')  # Split by "_" to detect hierarchy
    current_element = root

    for part in parts:
        found_element = current_element.find(part)
        if found_element is None:
            found_element = ET.SubElement(current_element, part)
        current_element = found_element

    # Assign value to the deepest element
    current_element.text = str(value) if pd.notna(value) else ""

# Function to create hierarchical XML from DataFrame row
# Modified function to create hierarchical XML with custom filename format
def create_xml_from_row(row, output_folder, index):
    root = ET.Element("FatturaElettronica")

    # Extract specific fields for filename
    name_field = row.get('FatturaElettronicaHeader_CedentePrestatore_DatiAnagrafici_Anagrafica_Denominazione', 'UnknownName')
    date_field = row.get('FatturaElettronicaBody_DatiGenerali_DatiGeneraliDocumento_Data', 'UnknownDate')

    # Clean values to ensure valid filenames
    safe_name = str(name_field).replace(" ", "_").replace("/", "-").replace(":", "-")

    # Format date to remove time component
    try:
        date_obj = datetime.strptime(str(date_field), "%Y-%m-%d %H:%M:%S")
        safe_date = date_obj.strftime("%Y-%m-%d")  # Format without time
    except ValueError:
        safe_date = str(date_field)  # Use as-is if format is already correct

    for col, value in row.items():
        create_nested_element(root, col, value)

    # Pretty XML formatting
    xml_str = ET.tostring(root, encoding='utf-8')
    pretty_xml = parseString(xml_str).toprettyxml(indent="  ")

    # Save each XML file with new filename format
    xml_file = os.path.join(output_folder, f"Invoice_{index + 1}_{safe_name}-{safe_date}.xml")
    with open(xml_file, "w", encoding='utf-8') as f:
        f.write(pretty_xml)

    print(f"✅ XML file created: {xml_file}")

# Function to clean the XML_TEST folder before generating new files
def clean_folder(folder_path):
    if os.path.exists(folder_path):
        for file in os.listdir(folder_path):
            if file.endswith(".xml"):
                os.remove(os.path.join(folder_path, file))
        print(f"🧹 All previous XML files deleted from '{folder_path}'")

# Main function to read Excel and generate XML files
def excel_to_xml(excel_file, output_folder):
    # Clean the folder before generating new files
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    else:
        clean_folder(output_folder)

    # Load Excel data
    df = pd.read_excel(excel_file)

    # Generate XML files for each row
    for index, row in df.iterrows():
        create_xml_from_row(row, output_folder, index)

    print(f"🎯 All XML files successfully generated in: {output_folder}")

# Execution
if __name__ == "__main__":
    EXCEL_FILE = "XML_Target.xlsx"
    OUTPUT_FOLDER = "XML_TEST"

    excel_to_xml(EXCEL_FILE, OUTPUT_FOLDER)
