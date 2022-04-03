import os

from flask import Flask
from flask import render_template, send_from_directory

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False # 日本語を使えるようにする

@app.route("/")
def api_main():
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static/img'), 'favicon.ico', )

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=8000)