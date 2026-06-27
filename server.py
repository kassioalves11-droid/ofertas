from flask import Flask
from flask import send_from_directory

import os


app = Flask(__name__)


# ======================================
# ADMIN
# ======================================

@app.route("/")
def home():

    return send_from_directory(
        ".", "admin.html"
    )


# ======================================
# ARQUIVOS
# ======================================

@app.route("/<path:path>")
def arquivos(path):

    return send_from_directory(
        ".", path
    )


# ======================================
# VIDEOS
# ======================================

@app.route("/videos/<path:nome>")
def videos(nome):

    return send_from_directory(
        "videos",
        nome
    )


# ======================================
# START
# ======================================

app.run(

    debug=True,

    host="0.0.0.0",

    port=5000
)