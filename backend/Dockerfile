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
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["python", "run.py"]
