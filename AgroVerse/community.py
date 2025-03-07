import os
import subprocess
from flask import Flask, render_template

app = Flask(__name__)

# Environment variables
NPM_START_COMMAND = os.getenv("NPM_START_COMMAND", "npm run start")  # Default npm command
NPM_DIR = os.getenv("NPM_DIR", "./")  # Default directory where package.json is located

@app.route("/")
def index():
    return render_template("community.html")

def start_npm():
    """Start the npm process."""
    try:
        print("Starting npm...")
        subprocess.Popen(
            NPM_START_COMMAND,
            cwd=NPM_DIR,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print("npm started successfully.")
    except Exception as e:
        print(f"Failed to start npm: {e}")

if __name__ == "__main__":
    # Start the npm process
    start_npm()

    # Start the Flask server on port 5004
    app.run(debug=True, port=5004)
