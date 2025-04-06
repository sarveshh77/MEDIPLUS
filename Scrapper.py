from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def fetch_doctor_details(doctor_name, reg_no):
    try:
        # Setup WebDriver
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument("--start-maximized")  # Maximize browser
        driver = webdriver.Chrome(options=chrome_options)

        # Open the NMC website
        driver.get("https://www.nmc.org.in/information-desk/indian-medical-register/")

        # Wait for the page to load
        wait = WebDriverWait(driver, 15)

        # Ensure the form is loaded
        wait.until(EC.presence_of_element_located((By.ID, "advance_form")))

        # Enter the doctor's name
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "doctorName")))
        doctor_name_field = driver.find_element(By.ID, "doctorName")
        doctor_name_field.clear()
        doctor_name_field.send_keys(doctor_name)
        print("Entered doctor name:", doctor_name)

        reg_no_field = driver.find_element(By.ID, "doctorRegdNo")
        reg_no_field.clear()
        reg_no_field.send_keys(reg_no)  # Enter registration number
        print("Entered Registration no.:", reg_no)

        # Submit the form
        submit_button = driver.find_element(By.ID, "doctor_advance_Details")
        wait.until(EC.element_to_be_clickable(submit_button))
        time.sleep(1)
        submit_button.click()
        print("Form submitted.")

        time.sleep(5)

        # Wait for the results table to load
        try:
            wait.until(EC.visibility_of_element_located((By.ID, "doct_info5")))
            print("Results table loaded.")
        except Exception as e:
            print("Failed to load results table:", e)
            driver.quit()
            return None

        try:
            # Extract data from the table
            results_table = driver.find_element(By.ID, "doct_info5")
            rows = results_table.find_elements(By.TAG_NAME, "tr")
            data = []

            # Loop through the rows and extract data
            for row in rows:
                # Locate columns in the row
                columns = row.find_elements(By.TAG_NAME, "td")
                if columns:  # Skip header row
                    row_data = [col.text for col in columns]
                    data.append(row_data)

            # Print the extracted data
            if data:
                print("Extracted data:")
                for row in data:
                    print(row)
            else:
                print("No data found in the table.")

        except Exception as e:
            print("Failed to extract data from the table:", e)
            driver.quit()
            return None

        if data:
            driver.quit()
            return data[0]  # Return the first matched result
        else:
            driver.quit()
            return "Doctor not found"

    except Exception as e:
        print("An error occurred while fetching doctor details:", e)
        driver.quit()
        return None