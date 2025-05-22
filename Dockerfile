FROM python:3.11

WORKDIR /workspace

# Install common data science packages
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy your workspace
COPY . .

# Start jupyter or just keep container running
CMD ["jupyter", "lab", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root"]