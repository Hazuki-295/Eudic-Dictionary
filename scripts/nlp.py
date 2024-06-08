from flask import Flask, request, render_template
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException

app = Flask(__name__)

def load_javascript_from_file(file_path):
    with open(file_path, 'r') as file:
        return file.read()

js_code = load_javascript_from_file('spacy.js')
default_input = 'The quick brown fox jumped over the lazy dog.'

def initialize_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("window-size=1920,1080")
    return webdriver.Chrome(options=chrome_options)

class BaseDriver:
    def __init__(self, url):
        self.driver = initialize_driver()
        self.driver.get(url)

    def wait_for_element(self, by, value, timeout=10):
        WebDriverWait(self.driver, timeout).until(EC.presence_of_element_located((by, value)))

    def execute_js(self, script):
        return self.driver.execute_script(script)

class spaCyDriver(BaseDriver):
    def __init__(self):
        super().__init__('https://demos.explosion.ai/displacy')
        
        # Execute the JavaScript code
        self.driver.execute_script(js_code)
        
        self.checkbox = self.driver.find_element(By.ID, "cph")
        self.text_box = self.driver.find_element(By.ID, "text")
        self.submit_button = self.driver.find_element(By.CSS_SELECTOR, ".d-input__wrapper .d-button")

    def click_and_wait_for_svg_change(self, timeout=5):
        svg_locator = "section .d-scroller > div > svg"
        try:
            initial_svg = self.driver.find_element(By.CSS_SELECTOR, svg_locator).get_attribute("outerHTML")
            self.submit_button.click()
            WebDriverWait(self.driver, timeout).until(
                lambda driver: driver.find_element(By.CSS_SELECTOR, svg_locator).get_attribute("outerHTML") != initial_svg
            )
        except NoSuchElementException:
            print("SVG element or submit button not found.")
        except TimeoutException:
            print("Timeout waiting for SVG to change.")
    
    def process_input(self, input_data):
        self.text_box.clear()
        self.text_box.send_keys(input_data)
        
        results = {}
        
        # Dependency (Merge Phrases)
        if not self.checkbox.is_selected():
            self.checkbox.click()
        self.click_and_wait_for_svg_change()
        results['deps-merged'] = ('Dependency (Merge Phrases)', self.execute_js('return extractHTML();'))
        
        # Dependency
        if self.checkbox.is_selected():
            self.checkbox.click()
        self.click_and_wait_for_svg_change()
        results['deps'] = ('Dependency', self.execute_js('return extractHTML();'))
        
        return results

class CoreNLPDriver(BaseDriver):
    def __init__(self):
        super().__init__('https://corenlp.run/')
        
        # Annotators select
        self.driver.find_element(By.CSS_SELECTOR, '[data-option-array-index="2"]').click()
        self.driver.find_element(By.CLASS_NAME, 'chosen-choices').click()
        self.driver.find_element(By.CSS_SELECTOR, '[data-option-array-index="4"]').click()
        
        self.text_box = self.driver.find_element(By.ID, 'text')
        self.submit_button = self.driver.find_element(By.ID, "submit")

    def process_input(self, input_data):
        self.text_box.clear()
        self.text_box.send_keys(input_data)
        self.submit_button.click()
        
        # Wait for the response to be generated
        self.driver.implicitly_wait(2)
        annotators = {'pos': 'Part-of-Speech', 'deps': 'Basic Dependencies', 'deps2': 'Enhanced++ Dependencies', 'parse': 'Constituency Parse'}
        
        results = {}
        for key, label in annotators.items():
            try:
                element = self.driver.find_element(By.ID, key)
                outer_html = element.get_attribute('outerHTML')
                results[key] = (label, outer_html)
            except Exception as e:
                results[key] = (label, f"Error: {e}")
        return results

def process_request(driver, route, template, input_data):
    if not input_data:
        input_data = default_input
    results = driver.process_input(input_data)
    return render_template(template, results=results)

@app.route('/spaCy', methods=['GET', 'POST'])
def spacy_request():
    input_data = request.data.decode()
    return process_request(spacy_driver, '/spaCy', 'spacy_results.html', input_data)

@app.route('/CoreNLP', methods=['GET', 'POST'])
def core_nlp_request():
    input_data = request.data.decode()
    return process_request(core_nlp_driver, '/CoreNLP', 'corenlp_results.html', input_data)

if __name__ == '__main__':
    spacy_driver = spaCyDriver()
    core_nlp_driver = CoreNLPDriver()
    app.run(debug=True, use_reloader=False)