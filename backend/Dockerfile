FROM python:3.10-slim

# Install system dependencies for pyodbc and SQL Server
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    unixodbc \
    unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# Add Microsoft SQL Server ODBC Driver 18
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list | sed "s|deb |deb [signed-by=/usr/share/keyrings/microsoft-prod.gpg] |" > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["python", "run.py"]
