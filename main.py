import os
import subprocess
import sys

os.execvp("bash", ["bash", os.path.join(os.path.dirname(os.path.abspath(__file__)), "start.sh")])
