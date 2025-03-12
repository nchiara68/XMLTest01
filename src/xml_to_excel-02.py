import xml.etree.ElementTree as ET
import pandas as pd

# Recursive function to extract all XML data
def extract_all_data(element, parent_key="", data={}):
    for child in element:
        key = f"{parent_key}_{child.tag}" if parent_key else child.tag

        # If element has children, recursively extract data
        if list(child):
            extract_all_data(child, key, data)
        else:
            data[key] = child.text.strip() if child.text else ""
    return data

# Function to extract data from the uploaded XML file
def extract_data_from_invoice(xml_file):
    tree = ET.parse(xml_file)
    root = tree.getroot()

    # Dictionary to store extracted data
    data = {}
    extract_all_data(root, data=data)
    return data

# Main function to process and save to Excel
def process_xml_to_excel(xml_file, excel_output):
    try:
        data = extract_data_from_invoice(xml_file)
        df = pd.DataFrame([data])  # Convert data into a DataFrame
        df.to_excel(excel_output, index=False)
        print(f"✅ Data successfully saved in: {excel_output}")
    except Exception as e:
        print(f"❗ Error processing XML file: {e}")

# Execute the script
if __name__ == "__main__":
    XML_FILE = "Invoice_1.xml"        # XML file to read
    EXCEL_OUTPUT = "XMLList.xlsx"   # Excel output file

    process_xml_to_excel(XML_FILE, EXCEL_OUTPUT)
