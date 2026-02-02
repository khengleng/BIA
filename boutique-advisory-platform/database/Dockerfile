# Custom PostgreSQL Image for Boutique Advisory Platform
FROM postgres:15-alpine

# Use environment variables for initialization
# These can be overridden at runtime
ENV POSTGRES_USER=bia_user
ENV POSTGRES_PASSWORD=bia_secret_password
ENV POSTGRES_DB=bia_development

# Optional: Add custom configuration
# COPY postgresql.conf /etc/postgresql/postgresql.conf
# CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]

# Optional: Add initialization scripts
# Any .sh or .sql scripts in this directory are executed on container start
# COPY init.sql /docker-entrypoint-initdb.d/

# Healthcheck to ensure database is ready
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} || exit 1

EXPOSE 5432
